type TFormatTime = (time: string | number, showSeconds?: boolean) => string

function msToTime(duration: number) {
  let milliseconds = Math.floor((duration % 1000) / 100)
  let seconds = Math.floor((duration / 1000) % 60)
  let minutes = Math.floor((duration / (1000 * 60)) % 60)
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

  const hoursFormatted = (hours < 10) ? "0" + hours : hours;
  const  minutesFormatted = (minutes < 10) ? "0" + minutes : minutes;
  const  secondsFormatted = (seconds < 10) ? "0" + seconds : seconds;

  return hoursFormatted + ":" + minutesFormatted + ":" + secondsFormatted
}

export default msToTime