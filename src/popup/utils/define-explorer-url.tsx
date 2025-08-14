import chains from '../configs/chains';

const defineExplorerURL = (chainId: number): string | null => {
  const chainConfig = chains[chainId];
  if (chainConfig) {
    const { blockExplorerUrls } = chainConfig;
    if (blockExplorerUrls) {
      const explorerURL = blockExplorerUrls[0];
      if (explorerURL) {
        return explorerURL;
      }
    }
  }
  return null;
};

export default defineExplorerURL;
