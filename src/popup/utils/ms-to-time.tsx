const msToTime = (duration: number) => {
  if (duration <= 0) {
    return '00:00:00';
  }

  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  const hoursFormatted = hours < 10 ? '0' + hours : hours;
  const minutesFormatted = minutes < 10 ? '0' + minutes : minutes;
  const secondsFormatted = seconds < 10 ? '0' + seconds : seconds;

  return hoursFormatted + ':' + minutesFormatted + ':' + secondsFormatted;
};

export default msToTime;
