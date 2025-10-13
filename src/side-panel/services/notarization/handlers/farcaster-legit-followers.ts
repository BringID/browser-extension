import { NotarizationBase } from '../notarization-base';
import { RequestRecorder } from '../../requests-recorder';
import { Request } from '../../../common/types';
import { TLSNotary } from '../../tlsn';
import { Commit } from 'tlsn-js';
import { parse, Pointers, Mapping } from 'json-source-map';

export class NotarizationFarcasterLegitFollowers extends NotarizationBase {
  // Configure target usernames to check for (easily add more here)
  private readonly TARGET_USERNAMES = [
    'vitalik.eth', // THE vitalik
    'v', // Varun Srinivasan (Farcaster co-founder)
    'dwr.eth', // Dan Romero (Farcaster co-founder)
    'jessepollak', // Jesse Pollak (Base)
    'balajis.eth', // Balaji Srinivasan
  ];
  
  private userFid: number | null = null;
  private username: string | null = null;
  private currentTabId: number | null = null;
  private foundUsername: string | null = null;
  
  // First recorder: only for onboarding-state
  requestRecorder: RequestRecorder = new RequestRecorder(
    [
      {
        method: 'GET',
        urlPattern: 'https://client.farcaster.xyz/v2/onboarding-state',
      },
    ],
    this.onOnboardingStateCaptured.bind(this),
  );
  
  // Second recorder: for followers (started after we get FID)
  private followersRecorder: RequestRecorder | null = null;

  public async onStart(): Promise<void> {
    console.log('[Farcaster] onStart called');
    
    this.requestRecorder.start();
    console.log('[Farcaster] Listening for onboarding-state...');

    const tab = await chrome.tabs.create({ url: 'https://farcaster.xyz' });
    this.currentTabId = tab.id || null;
    console.log('[Farcaster] Tab created with ID:', this.currentTabId);

    this.currentStep = 1;
    if (this.currentStepUpdateCallback)
      this.currentStepUpdateCallback(this.currentStep);
  }

  private async onOnboardingStateCaptured(log: Array<Request>) {
    console.log('[Farcaster] ✅ Onboarding-state captured!', log[0].url);
    
    // Extract auth header from the captured request
    const authHeader = log[0].headers['Authorization'] || log[0].headers['authorization'];
    
    if (!authHeader) {
      this.result(new Error('No Authorization header found in captured request'));
      return;
    }
    
    console.log('[Farcaster] Found auth header, fetching FID...');
    
    try {
      if (!this.currentTabId) {
        this.result(new Error('No tab ID available'));
        return;
      }
      
      // Use the auth header from the captured request
      const results = await chrome.scripting.executeScript({
        target: { tabId: this.currentTabId },
        args: [authHeader],
        func: async (auth: string) => {
          console.log('[executeScript] Fetching with auth...');
          const response = await fetch('https://client.farcaster.xyz/v2/onboarding-state', {
            headers: {
              'Authorization': auth
            }
          });
          console.log('[executeScript] Response status:', response.status);
          const data = await response.json();
          console.log('[executeScript] Response data:', data);
          return {
            fid: data?.result?.state?.user?.fid,
            username: data?.result?.state?.user?.username,
          };
        },
      });
      
      console.log('[Farcaster] executeScript results:', results);
      
      if (!results || results.length === 0 || !results[0].result) {
        this.result(new Error('Failed to execute script to get FID'));
        return;
      }
      
      const { fid, username } = results[0].result;
      this.userFid = fid;
      this.username = username;
      
      console.log(`[Farcaster] Extracted FID: ${this.userFid}, username: ${this.username}`);
      
      if (!this.userFid || !this.username) {
        this.result(new Error('Could not extract FID and username from page'));
        return;
      }
      
      // Now start listening for followers requests
      console.log('[Farcaster] Starting followers recorder...');
      this.followersRecorder = new RequestRecorder(
        [
          {
            method: 'GET',
            urlPattern: 'https://client.farcaster.xyz/v2/followers*',
          },
        ],
        this.onFollowersCaptured.bind(this),
      );
      this.followersRecorder.start();
      
      // Fetch followers directly from side panel (no auth needed for this endpoint!)
      console.log(`[Farcaster] Starting to fetch followers for FID ${this.userFid}...`);
      await this.fetchFollowersUntilTarget(this.userFid);
      
    } catch (err) {
      console.error('[Farcaster] Error processing onboarding-state:', err);
      this.result(err as Error);
    }
  }
  
  private async fetchFollowersUntilTarget(userFid: number, cursor: string | null = null): Promise<void> {
    try {
      const url = cursor 
        ? `https://client.farcaster.xyz/v2/followers?fid=${userFid}&limit=100&cursor=${cursor}`
        : `https://client.farcaster.xyz/v2/followers?fid=${userFid}&limit=100`;
      
      console.log(`[Farcaster] Fetching followers from: ${url}`);
      const response = await fetch(url);
      console.log(`[Farcaster] Response status: ${response.status}`);
      const data = await response.json();
      
      console.log(`[Farcaster] Fetched followers page, got ${data?.result?.users?.length || 0} users`);
      
      // Check if any of our target usernames are in this page
      const foundUser = data?.result?.users?.find((user: any) => 
        this.TARGET_USERNAMES.includes(user.username)
      );
      
      if (foundUser) {
        console.log(`[Farcaster] ✅ FOUND ${foundUser.username} in this page!`);
        // Don't fetch more - RequestRecorder will capture this request
        // and onFollowersCaptured will handle notarization
        return;
      }
      
      // If there's a next cursor and we haven't found a target, fetch next page
      if (data?.next?.cursor) {
        console.log(`[Farcaster] Target usernames [${this.TARGET_USERNAMES.join(', ')}] not found yet, fetching next page...`);
        await this.fetchFollowersUntilTarget(userFid, data.next.cursor);
      } else {
        console.log(`[Farcaster] ⚠️ Reached end of followers list, none of [${this.TARGET_USERNAMES.join(', ')}] found`);
        this.result(new Error(`None of the target usernames (${this.TARGET_USERNAMES.join(', ')}) are following this user`));
      }
    } catch (err) {
      console.error('[Farcaster] Error fetching followers:', err);
      this.result(err as Error);
    }
  }

  private async onFollowersCaptured(log: Array<Request>) {
    console.log('[Farcaster] ✅ Followers request captured!', log[0].url);
    
    // Check if this request contains one of our target usernames
    const followersRequestWithTarget = await this.findFollowersRequestWithTargetUsername(log);
    
    if (followersRequestWithTarget) {
      // Found a request with target username - notarize ONLY this one!
      console.log('[Farcaster] Found target username, starting notarization');
      await this.notarizeFollowersRequest(followersRequestWithTarget);
    } else {
      console.log('[Farcaster] Target usernames not in this request, continuing...');
      // Continue fetching - fetchFollowersUntilTarget is handling pagination
    }
  }

  private async findFollowersRequestWithTargetUsername(
    followersRequests: Array<Request>
  ): Promise<Request | null> {
    // Check each followers request to see which one contains one of our target usernames
    // We need to actually notarize to get the response, so we'll just return the first one
    // and check during notarization
    
    // For now, just return the most recent followers request
    // The actual check will happen during notarization
    if (followersRequests.length > 0) {
      const latestRequest = followersRequests[followersRequests.length - 1];
      console.log(`[Farcaster] Using latest followers request: ${latestRequest.url}`);
      return latestRequest;
    }
    
    console.log(`[Farcaster] No followers requests captured yet`);
    return null;
  }


  private async notarizeFollowersRequest(
    followersRequest: Request
  ): Promise<void> {
    this.currentStep = 2;
    if (this.currentStepUpdateCallback)
      this.currentStepUpdateCallback(this.currentStep);

    try {
      console.log('[Farcaster] Starting TLSNotary for followers request');
      
      const notary = await TLSNotary.new(
        {
          serverDns: 'client.farcaster.xyz',
          maxSentData: 2048,
          maxRecvData: 16384,
        },
        {
          logEveryNMessages: 100,
          verbose: true,
          logPrefix: '[WS Monitor / Farcaster-Legit-Followers]',
          trackSize: true,
          expectedTotalBytes: 55000000 * 1.15,
          enableProgress: true,
          progressUpdateInterval: 500,
        },
      );
      
      // Notarize ONLY the followers request
      delete followersRequest.headers['Accept-Encoding'];
      
      const result = await notary.transcript(followersRequest);
      if (result instanceof Error) {
        this.result(result);
        return;
      }
      const [transcript, message] = result;

      const commit: Commit = {
        sent: [{ start: 0, end: transcript.sent.length }],
        recv: [{ start: 0, end: message.info.length }],
      };
      
      const jsonStarts: number = Buffer.from(transcript.recv)
        .toString('utf-8')
        .indexOf('{');
      
      const followersData = JSON.parse(message.body.toString());
      const pointers: Pointers = parse(message.body.toString()).pointers;
      
      // Check if our target username is in the followers list
      let targetFollowerIndex = -1;
      const users = followersData?.result?.users || [];
      
      for (let i = 0; i < users.length; i++) {
        if (this.TARGET_USERNAMES.includes(users[i].username)) {
          targetFollowerIndex = i;
          this.foundUsername = users[i].username;
          break;
        }
      }
      
      if (targetFollowerIndex === -1) {
        this.result(new Error(`None of the target usernames (${this.TARGET_USERNAMES.join(', ')}) are following this user`));
        return;
      }
      
      console.log(`[Farcaster] Found ${this.foundUsername} at followers index ${targetFollowerIndex}`);
      
      // Commit the target follower entry
      const targetUsername: Mapping = pointers[`/result/users/${targetFollowerIndex}/username`];
      const targetFollowedBy: Mapping = pointers[`/result/users/${targetFollowerIndex}/viewerContext/followedBy`];
      
      if (!targetUsername.key?.pos) {
        this.result(new Error(`${this.foundUsername} username pointer not found`));
        return;
      }
      
      if (!targetFollowedBy.key?.pos) {
        this.result(new Error(`${this.foundUsername} followedBy pointer not found`));
        return;
      }
      
      // Commit target username
      commit.recv.push({
        start: jsonStarts + targetUsername.key?.pos,
        end: jsonStarts + targetUsername.valueEnd.pos,
      });
      
      // Commit followedBy status (should be true)
      commit.recv.push({
        start: jsonStarts + targetFollowedBy.key?.pos,
        end: jsonStarts + targetFollowedBy.valueEnd.pos,
      });
      
      console.log({ commit });

      this.result(await notary.notarize(commit));
    } catch (err) {
      this.result(err as Error);
    }
  }

  public async onStop(): Promise<void> {
    this.requestRecorder.stop();
    if (this.followersRecorder) {
      this.followersRecorder.stop();
    }
  }
}

