const shortenString = (string: string | undefined, symbolsToShow: number = 5) => {
  if (!string) return '...'
  if (string.length <= symbolsToShow) { return string }
  return `${string.slice(0, symbolsToShow)}...${string.slice(-symbolsToShow)}`
}

export default shortenString