function getTabsByHost(targetHost: string): Promise<chrome.tabs.Tab[]> {
  return new Promise((resolve) => {
    chrome.tabs.query({}, (tabs) => {
      const matchingTabs = tabs.filter((tab) => {
        if (!tab.url) return false;
        try {
          const url = new URL(tab.url);
          return url.hostname === targetHost;
        } catch {
          return false;
        }
      });
      resolve(matchingTabs);
    });
  });
}

export default getTabsByHost;
