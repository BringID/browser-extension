const getConfigs = async () => {
  const data = await chrome.storage.sync.get('devMode')
  const REGISTRY = data.devMode ? '0x0b2Ab187a6FD2d2F05fACc158611838c284E3a9c' : '0xFEA4133236B093eC727286473286A45c5d4443BC'
  const CHAIN_ID = data.devMode ? '84532' : '8453'
  const EXTENSION_MODE = data.devMode ? 'testnet' : undefined
  console.log({
    REGISTRY,
    CHAIN_ID,
    EXTENSION_MODE
  })
  return {
    REGISTRY,
    CHAIN_ID,
    EXTENSION_MODE
  }
}

export default getConfigs
