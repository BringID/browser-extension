function getTabsByHost(targetHosts: string[]): Promise<chrome.tabs.Tab[]> {
  return new Promise((resolve) => {
    chrome.tabs.query({}, (tabs) => {
      const matchingTabs = tabs.filter((tab) => {
        if (!tab.url) return false;
        try {
          const url = new URL(tab.url);
          return targetHosts.includes(url.hostname);
        } catch {
          return false;
        }
      });
      resolve(matchingTabs);
    });
  });
}

export default getTabsByHost;
