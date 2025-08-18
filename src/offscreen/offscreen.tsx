import React, { useEffect } from 'react';
import getStorage from '../popup/db-storage';

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

            chrome.runtime.sendMessage({
              type: 'UPDATE_COMPLETED_INDICATOR',
              completedCount: '1',
            });
          }
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return <div className="App" />;
};

export default Offscreen;
