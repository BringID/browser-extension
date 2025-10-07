type TChains = {
  [chainId: number]: {
    chainName: string;
    displayName: string;
    testnet: boolean;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls: string[];
  };
};

const chains: TChains = {
  84532: {
    chainName: 'Base Sepolia',
    displayName: 'Base Sepolia',
    testnet: true,
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://base-sepolia.drpc.org'],
    blockExplorerUrls: ['https://sepolia.basescan.org'],
  },
  8453: {
    chainName: 'Base',
    displayName: 'Base',
    testnet: false,
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://developer-access-mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org'],
  },
};

export default chains;
