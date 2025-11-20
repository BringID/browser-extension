import React, { useEffect } from 'react';
import getStorage from '../db-storage';

function sendMessageToBackground(data: any): Promise<void> {
  return new Promise((resolve, reject) => {
    let retryTimeout: number | null = null;
    let messageSent = false;

    if (messageSent) {
      resolve();
      return;
    }

    const attemptSend = () => {
      const port = chrome.runtime.connect({ name: 'offscreen' });

      // Listen for a response (assuming background sends ack)
      port.onMessage.addListener((msg) => {
        if (msg && msg.status === 'ok') {
          messageSent = true;
          if (retryTimeout) clearTimeout(retryTimeout);
          port.disconnect();
          resolve();
        }
      });

      port.onDisconnect.addListener(() => {
        if (!messageSent) {
          console.warn('[offscreen] Port disconnected. Retrying...');

          retryTimeout = window.setTimeout(() => {
            attemptSend();
          }, 200);
        }
      });

      try {
        port.postMessage(data);
      } catch (err) {
        console.error('[offscreen] Failed to post message:', err);
        reject(err);
      }
    };

    attemptSend();
  });
}

const Offscreen = () => {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const storage = await getStorage();
        await storage.syncVerifications();

        const verifications = await storage.getVerifications();
        const notCompletedVerifications = verifications.filter(
          (verification) => verification.status !== 'completed',
        );
        if (notCompletedVerifications.length === 0) {
          return;
        }
        notCompletedVerifications.forEach(async (item) => {
          if (item.status !== 'completed') {
            const now = +new Date();
            const expiration = item.scheduledTime - now;
            if (expiration <= 0) {
              await storage.updateVerificationStatus(
                item.credentialGroupId,
                'completed',
              );

              sendMessageToBackground({
                type: 'UPDATE_COMPLETED_INDICATOR',
                completedCount: '✓',
              });
            } else {
              sendMessageToBackground({
                type: 'UPDATE_PENDING_INDICATOR',
                completedCount: '⧗',
              });
            }
          }
        });
      } catch (err) {
        console.log({ err });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return <div className="App" />;
};

export default Offscreen;
