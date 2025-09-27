const checkIfPermissionGranted = async (origins: string[]): Promise<boolean> => {
  return new Promise((resolve) => {
    chrome.permissions.contains({ origins }, (result) => {
      if (chrome.runtime.lastError) {
        console.error("Permission check error:", chrome.runtime.lastError.message);
        return resolve(false);
      }

      resolve(result);
    });
  });
};

export default checkIfPermissionGranted