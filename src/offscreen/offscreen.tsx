import React, { useEffect } from 'react';
import getStorage from '../popup/db-storage';

function sendMessageToBackground(data: any) {
  const port = chrome.runtime.connect({ name: 'offscreen' });

  port.onDisconnect.addListener(() => {
    console.warn('[offscreen] Port disconnected. Retrying...');
    // Retry after small delay
    setTimeout(() => sendMessageToBackground(data), 200);
  });

  try {
    port.postMessage(data);
  } catch (err) {
    console.error('[offscreen] Failed to post message:', err);
  }
}

const Offscreen = () => {
  useEffect(() => {
    const interval = setInterval(async () => {
      const storage = await getStorage();
      await storage.syncVerifications();

      const verifications = await storage.getVerifications();
      console.log('background check verifications: ', { verifications });
      verifications.forEach(async (item) => {
        if (item.status !== 'completed') {
          const now = +new Date();
          const expiration = item.scheduledTime - now;
          if (expiration <= 0) {
            await storage.updateVerificationStatus(
              item.credentialGroupId,
              'completed',
            );

            console.log('UPDATED TO COMPLETED');

            sendMessageToBackground({
              type: 'UPDATE_COMPLETED_INDICATOR',
              completedCount: '✓',
            });

            // chrome.runtime.sendMessage({
            //   type: 'UPDATE_COMPLETED_INDICATOR',
            //   completedCount: '✓',
            // });
          }
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return <div className="App" />;
};

export default Offscreen;
