const formatBandwidth = (bps: number): string => {
  if (bps < 0) return '0bps';

  const units = ['bps', 'Kbps', 'Mbps', 'Gbps', 'Tbps'];
  let index = 0;

  while (bps >= 1000 && index < units.length - 1) {
    bps /= 1000;
    index++;
  }

  return `${bps.toFixed(2)}${units[index]}`;
};

export default formatBandwidth