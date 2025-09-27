const checkIfPermissionGranted = async (origin: string): Promise<boolean> => {
  const originPattern = origin.endsWith("/*") ? origin : `${origin}/*`;
  console.log({ originPattern })
  return new Promise((resolve) => {
    chrome.permissions.contains({ origins: [originPattern] }, (result) => {
      if (chrome.runtime.lastError) {
        console.error("Permission check error:", chrome.runtime.lastError.message);
        return resolve(false);
      }

      console.log({ result })

      resolve(result);
    });
  });
};

export default checkIfPermissionGranted