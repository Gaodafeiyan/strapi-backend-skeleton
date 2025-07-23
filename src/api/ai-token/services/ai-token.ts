import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreService('api::ai-token.ai-token', ({ strapi }) => ({
  // 获取所有活跃代币
  async getActiveTokens() {
    return await strapi.entityService.findMany('api::ai-token.ai-token', {
      filters: { isActive: true },
      sort: { weight: 'desc' }
    });
  },

  // 随机选择代币
  async selectRandomToken() {
    const tokens = await this.getActiveTokens();
    if (tokens.length === 0) {
      throw new Error('没有可用的AI代币');
    }
    return this.weightedRandomSelect(tokens);
  },

  // 权重随机选择算法
  weightedRandomSelect(tokens: any[]) {
    const totalWeight = tokens.reduce((sum, token) => sum + token.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const token of tokens) {
      random -= token.weight;
      if (random <= 0) {
        return token;
      }
    }
    
    return tokens[0];
  },

  // 获取代币实时价格
  async getTokenPrice(tokenId: number) {
    const token = await strapi.entityService.findOne('api::ai-token.ai-token', tokenId);
    if (!token) {
      throw new Error('代币不存在');
    }

    try {
      if (token.priceSource === 'coingecko') {
        return await this.getCoinGeckoPrice(token.priceApiId);
      } else if (token.priceSource === 'binance') {
        return await this.getBinancePrice(token.priceApiId);
      } else if (token.priceSource === 'dexscreener') {
        return await this.getDexScreenerPrice(token.priceApiId);
      }
    } catch (error) {
      console.error(`获取代币价格失败: ${token.name}`, error);
      // 使用默认价格作为备用
      return 0.01; // 默认价格
    }
  },

  // CoinGecko API
  async getCoinGeckoPrice(coinId: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; AI-Token-Bot/1.0)'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      const data = await response.json();
      if (!data[coinId] || !data[coinId].usd) {
        throw new Error(`Invalid response from CoinGecko for ${coinId}`);
      }
      
      return parseFloat(data[coinId].usd);
    } catch (error) {
      console.error('CoinGecko API error:', error);
      throw error;
    }
  },

  // Binance API
  async getBinancePrice(symbol: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`, {
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Binance API error: ${response.status}`);
      }
      
      const data = await response.json() as any;
      if (!data.price) {
        throw new Error(`Invalid response from Binance for ${symbol}`);
      }
      
      return parseFloat(data.price);
    } catch (error) {
      console.error('Binance API error:', error);
      throw error;
    }
  },

  // DexScreener API
  async getDexScreenerPrice(pairAddress: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/solana/${pairAddress}`, {
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`DexScreener API error: ${response.status}`);
      }
      
      const data = await response.json() as any;
      if (!data.pairs || data.pairs.length === 0 || !data.pairs[0].priceUsd) {
        throw new Error(`Invalid response from DexScreener for ${pairAddress}`);
      }
      
      return parseFloat(data.pairs[0].priceUsd);
    } catch (error) {
      console.error('DexScreener API error:', error);
      throw error;
    }
  },

  // 批量获取代币价格（用于缓存）
  async getBatchTokenPrices() {
    const tokens = await this.getActiveTokens();
    const prices: { [key: number]: number } = {};
    
    for (const token of tokens) {
      try {
        prices[token.id] = await this.getTokenPrice(parseInt(token.id as string));
      } catch (error) {
        console.error(`获取代币 ${token.name} 价格失败:`, error);
        prices[token.id] = 0.01; // 默认价格
      }
    }
    
    return prices;
  },

  // 初始化代币数据
  async initializeTokens() {
    const tokens = [
      {
        name: 'Render',
        symbol: 'RNDR',
        contractAddress: 'RNDR1A97ZatuqTAT2bZn1r4KwQisLvVfwJQfqWwaCSm',
        priceSource: 'coingecko' as const,
        priceApiId: 'render-token',
        weight: 30,
        description: 'Render Network - 去中心化GPU渲染网络'
      },
      {
        name: 'Nosana',
        symbol: 'NOS',
        contractAddress: '4BC2PiK9Y319bPQKHbLbHu86xdksJLAuBTBDPc6QcKAS',
        priceSource: 'coingecko',
        priceApiId: 'nosana',
        weight: 25,
        description: 'Nosana - 去中心化CI/CD平台'
      },
      {
        name: 'Synesis One',
        symbol: 'SNS',
        contractAddress: 'SNS5czn4ZyjtHNpgJyHCN33zBYFWvLJoYxx3JrqkjvGc',
        priceSource: 'coingecko',
        priceApiId: 'synesis-one',
        weight: 20,
        description: 'Synesis One - AI数据标注平台'
      },
      {
        name: 'Numeraire',
        symbol: 'NMR',
        contractAddress: 'NMR1gd2nautLcWTPZLY625YCHP6oVVNqs8s4ET3SkMsv',
        priceSource: 'coingecko',
        priceApiId: 'numerai',
        weight: 15,
        description: 'Numeraire - 去中心化对冲基金'
      },
      {
        name: 'ChainGPT',
        symbol: 'CGPT',
        contractAddress: 'CGPT1Ws3jh9E82fUmX9Zykp17fjM5pVp4SGbXw7U7Doo',
        priceSource: 'coingecko',
        priceApiId: 'chaingpt',
        weight: 10,
        description: 'ChainGPT - AI驱动的区块链工具'
      }
    ];

    for (const tokenData of tokens) {
      const existingToken = await strapi.entityService.findMany('api::ai-token.ai-token', {
        filters: { symbol: tokenData.symbol }
      });

      if (existingToken.length === 0) {
        await strapi.entityService.create('api::ai-token.ai-token', {
          data: tokenData
        });
        console.log(`创建代币: ${tokenData.name}`);
      }
    }
  }
})); 