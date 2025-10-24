const defineZuploNetworkName = (chainId: string | null): string => {
  switch (chainId) {
    case '8453':
      return 'base';
    case '84532':
      return 'base-sepolia';
    default:
      return 'base';
  }
};

export default defineZuploNetworkName;
