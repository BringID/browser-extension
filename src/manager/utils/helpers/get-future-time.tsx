const getFutureTime = (
  date: Date,
  minutes: number
) => {
    return Number(new Date(date.getTime() + minutes * 60000))
}

export default getFutureTime
