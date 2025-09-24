const msToMinutes = (duration: number): string => {
  const totalSeconds = Math.floor(Math.max(0, duration) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}m ${seconds}s`;
};


export default msToMinutes