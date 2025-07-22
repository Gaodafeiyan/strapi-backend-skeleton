require('dotenv').config();

module.exports = {
  redis: {
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  },
  
  blockchain: {
    rpcUrl: process.env.RPC_URL || 'https://bsc-dataseed1.binance.org/',
    usdtContractAddress: process.env.USDT_CONTRACT_ADDRESS || '0x55d398326f99059fF775485246999027B3197955',
    hotWalletPrivateKey: process.env.HOT_WALLET_PRIVATE_KEY,
    hotWalletAddress: process.env.HOT_WALLET_ADDRESS,
  },
  
  strapi: {
    apiUrl: process.env.STRAPI_API_URL || 'http://118.107.4.158:1337',
    apiToken: process.env.STRAPI_API_TOKEN,
  },
  
  service: {
    port: process.env.SIGNER_SERVICE_PORT || 3001,
    logLevel: process.env.LOG_LEVEL || 'info',
  },
  
  security: {
    maxWithdrawalAmount: parseFloat(process.env.MAX_WITHDRAWAL_AMOUNT) || 10000,
    minWithdrawalAmount: parseFloat(process.env.MIN_WITHDRAWAL_AMOUNT) || 1,
  },
}; 