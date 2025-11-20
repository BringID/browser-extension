# Custom Notarization Handlers Guide

This guide explains how to create custom notarization handlers that extend the `NotarizationBase` class to implement domain-specific notarization workflows.

## Overview

Notarization handlers are responsible for managing the complete notarization workflow. They can perform virtually any actions needed for their specific use case. While most handlers (99.9% of cases) will typically:

1. Record specific HTTP requests from web pages
2. Create cryptographic proofs (notarizations) of those requests using TLSNotary
3. Manage the notarization lifecycle and progress reporting
4. Implement partial data reveal through commitments

The handlers have complete flexibility to implement custom logic, interact with different APIs, perform data processing, or execute any other operations required for their specific notarization scenario.

## Template-Based Handler Workflow

1. **Describe the task** – every notarization task that appears in the UI is configured in [`cfg/tasks.json`](../../../cfg/tasks.json). Update the metadata here so the Side Panel knows how to present the flow and which steps/notarization states to show.
2. **Create a template config** – add a new config file under [`handlers/`](./handlers) and export it through `handlers/index.ts`. Choose the config type from [`types.ts`](./types.ts):
   - `SimpleHandlerConfig` (most common): define a single `TargetRequest`, `replayRequestCfg` for deterministic replays, and `transcriptDisclose` JSON pointers.
   - `HandlerConfig`: use when you need multiple `TargetRequest` entries, custom request/response middleware, or hand-crafted transcript handling.
3. **Leverage `NotarizationTemplate`** – instantiate [`NotarizationTemplate`](./notarization-template.ts) with your config. The template automatically sets up `RequestRecorder`, browser redirects, optional response validation, TLSNotary transcript generation, and commitment creation via the middleware you supplied.
4. **Register the handler** – wire everything up in [`src/side-panel/services/notarization/index.ts`](./index.ts) by creating a `NotarizationTemplate` instance (or another handler) for the matching `Task` returned from `tasks()`. Registration here ensures the `NotarizationManager` can start/stop your handler based on user actions.

Following this flow keeps task metadata, handler logic, and runtime registration in sync while maximizing reuse of the template pipeline.

## Building Blocks in `src/side-panel/services/notarization`

- `helpers.ts`: utility layer for manipulating captured requests (`replayRequest`, cookie whitelist/blacklist handling), crafting transcript commits (`newCommitForRequest`), and composing middleware factories (`newRequestMiddleware`, `newTranscriptMiddleware`). These helpers let you assemble complex disclosure logic without rewriting boilerplate.
- `notarization-base.ts`: abstract class that standardizes lifecycle management, progress reporting, and result emission. Custom handlers that outgrow the template should extend this class directly.
- `notarization-template.ts`: opinionated implementation that wires together request recording, optional response validation, TLSNotary transcript creation, and notarization. It accepts the configs defined in `types.ts` and calls the helper-provided middleware under the hood.
- `types.ts`: shared type definitions for handler lifecycles (`NotarizationHandler`, `NotarizationStatus`), middleware signatures, and the `HandlerConfig` / `SimpleHandlerConfig` schemas. The type guards exported here (`isSimpleHandlerConfig`) make it easy for the template to branch between simple and advanced setups.
- `handlers/`: concrete configs such as `uber-rides.ts`, `x-verified-followers.ts`, and `apple-devices.ts` that demonstrate both Simple and advanced template usage.
- `index.ts`: central registration point that creates the `NotarizationManager` with the list of handler instances. When you add a handler config, make sure you also instantiate it here so the Side Panel can start and stop it with the rest.

## Template Architecture

### `NotarizationTemplate`

[`NotarizationTemplate`](./notarization-template.ts) is the recommended entry point for new handlers. It:

- Starts `RequestRecorder` with your `TargetRequest` definitions and navigates the user to `redirect`.
- Applies optional `requestMiddleware` and `responseMiddleware` to massage captured data or validate server responses before notarization.
- Creates a TLSNotary session with the provided `tlsnConfig`, generates transcripts, and uses your `transcriptMiddleware` (or helpers) to compute commitments.
- Reports progress through `currentStep` updates (visit site → capture request → notarization) that align with the `steps` declared in `cfg/tasks.json`.

Because the template already calls into the helper factories (`newRequestMiddleware`, `newTranscriptMiddleware`) and enforces consistent TLSN behavior, most handlers only need to focus on defining their configuration object.

### Template Config Reference

Every handler config extends the `HandlerConfigBase` shape:

- `name`: label displayed in logs and progress messages.
- `redirect`: URL opened in a new tab when the handler starts. Point this to the page that triggers the captured request.
- `tlsnConfig`: `{ serverDns, maxSentData?, maxRecvData? }` forwarded to `TLSNotary.new`. Adjust the limits if your request/response sizes differ from the defaults used in the template.

From there pick one of the following:

**SimpleHandlerConfig (single request):**

- `request`: `TargetRequest` definition consumed by `RequestRecorder` (method + URL pattern).
- `replayRequestCfg`: instructions for `replayRequest()` describing which headers/cookies to forward and how to override the body. Use this to turn the captured request into a deterministic API call run from the extension context.
- `transcriptDisclose`: array of JSON pointers (e.g., `/data/currentUser/uuid`) passed to `newTranscriptMiddleware`, which reveals only those parts of the response in the TLSN commitment.
- `responseMiddleware?`: optional async function to validate the JSON payload returned by your replayed request before notarization continues.

**HandlerConfig (advanced/multi-request):**

- `requests`: array of `TargetRequest` entries captured in order. The callback receives them in the same sequence.
- `requestMiddleware?`: async hook (often composed via `newRequestMiddleware`) that can derive the replay request from the entire log rather than a single entry.
- `responseMiddleware?`: same as above.
- `transcriptMiddleware`: async hook (commonly from `newTranscriptMiddleware` or a custom function) that inspects the original requests plus the parsed transcript and returns the `Commit` object used for notarization.

**Example Simple Handler Config**

```typescript
export const UberRidesHandlerConfig: SimpleHandlerConfig = {
  name: 'X-Uber',
  redirect: 'https://riders.uber.com/trips',
  tlsnConfig: { serverDns: 'riders.uber.com', maxSentData: 704, maxRecvData: 5000 },
  request: { method: 'POST', urlPattern: 'https://riders.uber.com/graphql' },
  replayRequestCfg: {
    headers: {
      custom: { 'content-type': 'application/json', 'x-csrf-token': 'x' },
      cookie: { whitelist: ['sid', 'csid'] },
    },
    customBody: {
      query: '{currentUser {uuid} activities {past(limit: 10) {activities {uuid, description}}}}',
    },
  },
  transcriptDisclose: ['/data/currentUser/uuid', '/data/activities/past/activities'],
  responseMiddleware: validateUberResponse,
};
```

This mirrors the production `UberRidesHandlerConfig` and highlights how each field lines up with the template pipeline.

### Key Dependencies

1. **RequestRecorder** ([`request-recorder.ts`](../requests-recorder/request-recorder.ts))
   - Captures HTTP requests matching specified patterns
   - Provides filtered request logs for notarization

2. **TLSNotary** ([`tlsnotary.ts`](../tlsn/tlsnotary.ts))
   - Creates cryptographic proofs of HTTP requests
   - Generates transcripts and presentations

## Extending `NotarizationBase` Directly

If your flow does not fit inside the template (e.g., it needs bespoke UI steps, multiple notarization phases, or advanced TLSN coordination), inherit from [`NotarizationBase`](./notarization-base.ts) and implement the lifecycle yourself.

### Base Class Features

- `setProgress(progress: number)` – update percentage (0-100)
- `setStatus(status: NotarizationStatus)` – adjust lifecycle state
- `setError(error: Error)` – persist error context
- `result(res: Result<Presentation>)` – finish the notarization with either a presentation or an error

### Required Overrides

- `onStart(): Promise<void>` – kick off the workflow (request recording, navigation, TLSN, etc.)
- `onStop(): Promise<void>` – gracefully clean up resources when the user aborts

You can still reuse helpers (`replayRequest`, `newCommitForRequest`, middleware factories) inside a custom class, but you own the orchestration normally handled by the template.

### Step 1: Basic Handler Structure

```typescript
import { NotarizationBase } from '../notarization-base';

export class NotarizationMyService extends NotarizationBase {
  public async onStart(): Promise<void> {
    // Implementation here
  }

  public async onStop(): Promise<void> {
    // Implementation here
  }
}
```

### Step 2: Adding Request Recording (Optional)

Most handlers will need to capture HTTP requests. The `RequestRecorder` constructor takes:

- `targetRequests`: Array of request patterns to capture
- `successCallback`: Function called when all target requests are captured

```typescript
import { NotarizationBase } from '../notarization-base';
import { RequestRecorder } from '../../requests-recorder';
import { Request } from '../../../common/types';

export class NotarizationMyService extends NotarizationBase {
  requestRecorder: RequestRecorder = new RequestRecorder(
    [
      { method: 'GET', urlPattern: 'https://api.myservice.com/user/*' },
      { method: 'POST', urlPattern: 'https://api.myservice.com/data*' },
    ],
    this.onRequestsCaptured.bind(this),
  );

  public async onStart(): Promise<void> {
    // Implementation here
  }

  public async onStop(): Promise<void> {
    // Implementation here
  }

  private async onRequestsCaptured(log: Array<Request>) {
    // Implementation here
  }
}
```

**URL Pattern Matching:**

- Use `*` as wildcard for any characters
- Exact matches without wildcards are supported
- Patterns are converted to regex internally

**⚠️ IMPORTANT - Request Log Ordering:**
The callback receives a log array where `log[0]` corresponds to the first request pattern in the constructor, `log[1]` to the second pattern, etc. This ordering is guaranteed and maintained by the `RequestRecorder` implementation, regardless of when the requests actually occur.

### Step 3: Example Implementation of onStart()

Here's an example of how you might implement the `onStart()` method:

```typescript
public async onStart(): Promise<void> {
    // Start request recording
    this.requestRecorder.start();

    // Navigate to the target page
    await chrome.tabs.create({ url: "https://myservice.com/profile" });

    // Update progress
    this.setProgress(30);
}
```

### Step 4: Example Implementation of onStop()

Here's an example of how you might implement the `onStop()` method:

```typescript
public async onStop(): Promise<void> {
    // Stop request recording
    this.requestRecorder.stop();
}
```

### Step 5: Example Request Processing

Here's an example of how you might process captured requests:

```typescript
private async onRequestsCaptured(log: Array<Request>) {
    this.setProgress(60);

    try {
        // Create TLSNotary instance for the target hostname
        const notary = await TLSNotary.new("api.myservice.com");

        // Generate transcript
        const result = await notary.transcript(log[0]);
        if (result instanceof Error) {
            this.result(result);
            return;
        }

        const [transcript, parsedResponse] = result;

        // Create commitment for partial data reveal
        const commit: Commit = {
            sent: [{ start: 0, end: transcript.sent.length }],
            recv: [{ start: 0, end: Math.floor(transcript.recv.length / 2) }]
        };

        // Generate final notarization
        const presentation = await notary.notarize(commit);
        this.result(presentation);

    } catch (error) {
        this.result(new Error(`Notarization failed: ${error.message}`));
    }
}
```

## Progress Updates

Handlers should provide progress updates to inform users about the notarization status. Use the protected methods from [`NotarizationBase`](notarization-base.ts):

### Available Progress Methods

- `setProgress(progress: number)` - Update progress (0-100)
- `setStatus(status: NotarizationStatus)` - Update status (handled automatically by base class)
- `setError(error: Error)` - Set error state

### Progress Update Example

```typescript
public async onStart(): Promise<void> {
    this.setProgress(10); // Starting

    this.requestRecorder.start();
    this.setProgress(30); // Request recording started

    await chrome.tabs.create({ url: "https://example.com" });
    this.setProgress(50); // Navigation complete
}

private async onRequestsCaptured(log: Array<Request>) {
    this.setProgress(70); // Requests captured

    const notary = await TLSNotary.new("api.example.com");
    this.setProgress(80); // TLSNotary initialized

    const result = await notary.transcript(log[0]);
    this.setProgress(90); // Transcript generated

    // Final result call automatically sets progress to 100
    this.result(await notary.notarize(commit));
}
```

## Returning Results

Handlers must call the `result()` method to complete the notarization process.

### Using the result() Method

```typescript
// For successful notarization
const presentation = await notary.notarize(commit);
this.result(presentation);

// For errors
this.result(new Error('Notarization failed: invalid response'));
```

The `result()` method:

- Automatically sets progress to 100% for successful results
- Sets appropriate error state for Error objects
- Updates the notarization status

## Error Handling

Always handle errors appropriately and use the `result()` method to report them:

```typescript
private async onRequestsCaptured(log: Array<Request>) {
    try {
        const notary = await TLSNotary.new("api.example.com");
        const result = await notary.transcript(log[0]);

        if (result instanceof Error) {
            this.result(result);
            return;
        }

        // ... process result

    } catch (error) {
        this.result(new Error(`Processing failed: ${error.message}`));
    }
}
```

## Partial Data Reveal (Commitments)

### What is Partial Data Reveal?

Partial data reveal allows you to prove specific parts of an HTTP request/response while keeping other parts private. This is achieved through cryptographic commitments.

### Commitment Structure

```typescript
const commit: Commit = {
  sent: [{ start: 0, end: transcript.sent.length }], // Reveal entire request
  recv: [{ start: 100, end: 500 }], // Reveal bytes 100-500 of response
};
```

## Complete Example: X Profile Handler

Reference implementation from [`x-profile.ts`](./x-profile.ts):

```typescript
import { NotarizationBase } from '../../notarization-base';
import { RequestRecorder } from '../../../requests-recorder';
import { Request } from '../../../../common/types';
import { TLSNotary } from '../../../tlsn';
import { Commit } from 'bringid-tlsn-js';

export class NotarizationXVerifiedFollowers extends NotarizationBase {
   requestRecorder: RequestRecorder = new RequestRecorder(
           [
              {
                 method: 'GET',
                 urlPattern:
                         'https://x.com/i/api/graphql/LwtiA7urqM6eDeBheAFi5w/AccountOverviewQuery?*',
              },
           ],
           this.onRequestsCaptured.bind(this),
   );

   public async onStart(): Promise<void> {
      this.requestRecorder.start();

      await chrome.tabs.create({
         url: 'https://x.com/i/account_analytics/overview',
      });
      this.currentStep = 1;
      if (this.currentStepUpdateCallback)
         this.currentStepUpdateCallback(this.currentStep);
   }

   private async onRequestsCaptured(log: Array<Request>) {
      console.log('onRequestsCaptured');
      this.currentStep = 2;
      if (this.currentStepUpdateCallback)
         this.currentStepUpdateCallback(this.currentStep);

      // Create a deep copy of the request to avoid modifying the original
      const reqLog = {
         ...log[0],
         headers: { ...log[0].headers }, // Shallow copy of headers is fine since we're replacing them
      };

      // Store original headers for extraction
      const originalHeaders = log[0].headers;

      // Extract the original URL and parse the variables
      const originalUrl = log[0].url;
      const url = new URL(originalUrl);
      const variablesParam = url.searchParams.get('variables');

      const originalVariables = JSON.parse(
              decodeURIComponent(variablesParam || ''),
      );

      // Create minimal variables with "Follows" metric to avoid errors
      const minimalVariables = {
         requested_metrics: ['Follows'],
         to_time: originalVariables.to_time,
         from_time: originalVariables.to_time,
         granularity: originalVariables.granularity,
         show_verified_followers: originalVariables.show_verified_followers,
      };

      // Create the new URL with minimal parameters
      const baseUrl = `${url.protocol}//${url.host}${url.pathname}`;
      const newVariablesParam = encodeURIComponent(
              JSON.stringify(minimalVariables),
      );
      const newUrl = `${baseUrl}?variables=${newVariablesParam}`;

      // Update the copied request log
      reqLog.url = newUrl;

      // Extract required values from original headers
      const authorization =
              originalHeaders['authorization'] ||
              originalHeaders['Authorization'] ||
              '';
      const xCsrfToken =
              originalHeaders['x-csrf-token'] || originalHeaders['X-Csrf-Token'] || '';

      // Extract auth_token and ct0 from cookie
      const cookieHeader =
              originalHeaders['cookie'] || originalHeaders['Cookie'] || '';
      const authTokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
      const ct0Match = cookieHeader.match(/ct0=([^;]+)/);
      const authTokenValue = authTokenMatch ? authTokenMatch[1] : '';
      const ct0Value = ct0Match ? ct0Match[1] : '';

      // Create new headers with only required fields
      reqLog.headers = {
         Accept: '*/*',
         'Accept-Encoding': 'identity',
         Connection: 'close',
         'Content-Type': 'application/json',
      };

      // Add authorization if exists
      if (authorization) {
         reqLog.headers['Authorization'] = authorization;
      }

      // Add x-csrf-token if exists
      if (xCsrfToken) {
         reqLog.headers['X-Csrf-Token'] = xCsrfToken;
      }

      // Add cookies with both auth_token and ct0
      const cookies = [];
      if (authTokenValue) {
         cookies.push(`auth_token=${authTokenValue}`);
      }
      if (ct0Value) {
         cookies.push(`ct0=${ct0Value}`);
      }
      if (cookies.length > 0) {
         reqLog.headers['Cookie'] = cookies.join('; ');
      }

      console.log('Modified headers:', reqLog.headers);
      console.log('Original request preserved:', log[0]);

      const requestParams = {
         headers: reqLog.headers,
         method: reqLog.method,
      };

      try {
         const response = await fetch(log[0].url, requestParams);
         
         const verifiedFollowersMatch = JSON.stringify(await response.json()).match(
                 /"verified_follower_count":"(\d+)"/,
         );

         if (!verifiedFollowersMatch) {
            this.result(new Error('required_data_not_found'));
            return;
         }

         if (verifiedFollowersMatch[1] && Number(verifiedFollowersMatch[1]) < 10) {
            this.result(new Error('not_enough_followers'));
         }
      } catch (err) {
         console.error(err);
      }

      try {
         const notary = await TLSNotary.new(
                 {
                    serverDns: 'x.com',
                    maxSentData: 1008,
                    maxRecvData: 25000,
                 },
                 {
                    logEveryNMessages: 100,
                    verbose: true,
                    logPrefix: '[WS Monitor / X-followers]',
                    trackSize: true,
                    expectedTotalBytes: 55000000 * 1.15,
                    enableProgress: true,
                    progressUpdateInterval: 500,
                 },
         );
         console.log('LOG:', log[0]);

         const result = await notary.transcript(reqLog);

         if (result instanceof Error) {
            this.result(result);
            return;
         }
         const [transcript] = result;
         const responseBody = String.fromCharCode(...transcript.recv);

         const verifiedFollowersMatch = responseBody.match(
                 /"verified_follower_count":"(\d+)"/,
         );

         const userIdMatch = responseBody.match(/"id":"(VXNlcjo[A-Za-z0-9+/=]+)"/);

         console.log({ responseBody, verifiedFollowersMatch, userIdMatch });

         // keep only HTTP method and URL and hide everything after in the response
         const sentEnd = `${reqLog.method} ${reqLog.url}`.length;

         const commit: Commit = {
            sent: [{ start: 0, end: sentEnd }],
            recv: [],
         };

         // Add verified followers if found
         if (verifiedFollowersMatch) {
            const start = verifiedFollowersMatch.index;
            if (start && start >= 0) {
               commit.recv.push({
                  start: start,
                  end: start + verifiedFollowersMatch[0].length,
               });
            }
         }

         if (verifiedFollowersMatch && Number(verifiedFollowersMatch[1]) < 10) {
            this.result(new Error('not_enough_followers'));
            return;
         }

         // Add user ID if found
         if (userIdMatch) {
            const start = userIdMatch.index;
            if (start && start >= 0) {
               commit.recv.push({
                  start: start,
                  end: start + userIdMatch[0].length,
               });
            }
         }

         this.result(await notary.notarize(commit));
      } catch (err) {
         console.error('Error during notarization:', err);
         console.log('Original request that failed:', log[0]);
         this.result(err as Error);
      }
   }
   public async onStop(): Promise<void> {
      this.requestRecorder.stop();
   }
}
```