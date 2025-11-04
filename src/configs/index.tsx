const REGISTRY = process.env.EXTENSION_MODE === 'testnet' ? '0x0b2Ab187a6FD2d2F05fACc158611838c284E3a9c' : '0xFEA4133236B093eC727286473286A45c5d4443BC'
const EXTENSION_ID = 'fjlmbkpfjmbjokokgmfcijlliceljbeh';
const ZUPLO_KEY = 'zpka_52e44068bb9745f2be776b343e96cdab_1a60a93b';
const ZUPLO_API_URL = 'https://api.bringid.org';
const CONNECTOR_HOSTS = ['app.bringid.org', 'connect.bringid.org'];
const CONNECT_WALLET_URL = `https://${CONNECTOR_HOSTS[1]}`;
const TELEGRAM_URL = 'https://t.me/bringid_chat';
const CHAIN_ID = process.env.EXTENSION_MODE === 'testnet' ? '84532' : '8453'

export default {
  REGISTRY,
  EXTENSION_ID,
  CONNECT_WALLET_URL,
  ZUPLO_KEY,
  CONNECTOR_HOSTS,
  TELEGRAM_URL,
  ZUPLO_API_URL,
  CHAIN_ID,
};
