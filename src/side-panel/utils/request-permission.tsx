const requestHostPermission = async (origin: string): Promise<boolean> => {
  const originPattern = origin.endsWith("/*") ? origin : `${origin}/*`;

  return new Promise((resolve) => {
    console.log({ originPattern })
    chrome.permissions.request({ origins: [originPattern] }, (granted) => {
      if (chrome.runtime.lastError) {
        console.error("Permission request error:", chrome.runtime.lastError.message);
        return resolve(false);
      }

      resolve(granted);
    });
  });
};

export default requestHostPermission