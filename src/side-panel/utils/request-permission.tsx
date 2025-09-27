const requestHostPermission = async (origins: string[]): Promise<boolean> => {

  return new Promise((resolve) => {
    chrome.permissions.request({ origins }, (granted) => {
      if (chrome.runtime.lastError) {
        console.error("Permission request error:", chrome.runtime.lastError.message);
        return resolve(false);
      }

      resolve(granted);
    });
  });
};

export default requestHostPermission