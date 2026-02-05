import Icons from '../../components/icons'
import React from 'react'

const defineTaskIcon = (
  taskIcon?: string
) => {
  switch (taskIcon) {
    
    case 'okx':
      return <Icons.OKXIcon />

    case 'binance':
      return <Icons.BinanceIcon />

    case 'uber':
      return <Icons.UberIcon />

    case 'apple':
      return <Icons.AppleIcon />
  
    default:
      return undefined
  }
}

export default defineTaskIcon
