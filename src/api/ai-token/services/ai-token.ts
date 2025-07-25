import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::ai-token.ai-token', ({ strapi }) => ({
  // 获取所有活跃的代币
  async getActiveTokens() {
    try {
      const result = await strapi.db.connection.raw(`
        SELECT * FROM ai_tokens 
        WHERE is_active = true 
        ORDER BY weight DESC
      `);
      console.log('Database query result:', result); // 调试日志
      return result[0] || []; // 确保返回数组
    } catch (error) {
      console.error('获取活跃代币失败:', error);
      // 如果表不存在，返回空数组而不是抛出错误
      if (error.message.includes('Table') && error.message.includes('doesn\'t exist')) {
        console.log('ai_tokens 表不存在，返回空数组');
        return [];
      }
      throw error;
    }
  },

  // 随机选择一个代币（基于权重）
  async selectRandomToken() {
    const tokens = await this.getActiveTokens();
    if (tokens.length === 0) {
      throw new Error('没有可用的AI代币');
    }
    return this.weightedRandomSelect(tokens);
  },

  // 基于权重的随机选择算法
  weightedRandomSelect(tokens: any[]) {
    const totalWeight = tokens.reduce((sum, token) => sum + token.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const token of tokens) {
      random -= token.weight;
      if (random <= 0) {
        return token;
      }
    }
    
    return tokens[tokens.length - 1]; // 兜底
  },

  // 获取代币价格
  async getTokenPrice(tokenId: number) {
    try {
      const result = await strapi.db.connection.raw(`
        SELECT * FROM ai_tokens WHERE id = ?
      `, [tokenId]);
      
      const token = result[0][0];
      if (!token) {
        console.warn(`代币不存在: ${tokenId}`);
        return 0.01; // 返回默认价格而不是抛出错误
      }

      const { price_source, price_api_id } = token;
      
      switch (price_source) {
        case 'coingecko':
          return await this.getCoinGeckoPrice(price_api_id);
        case 'binance':
          return await this.getBinancePrice(price_api_id);
        case 'dexscreener':
          return await this.getDexScreenerPrice(price_api_id);
        default:
          console.warn(`不支持的价格源: ${price_source}`);
          return 0.01; // 返回默认价格
      }
    } catch (error) {
      console.error(`获取代币 ${tokenId} 价格失败:`, error);
      return 0.01; // 返回默认价格而不是抛出错误
    }
  },

  // CoinGecko API
  async getCoinGeckoPrice(coinId: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      const data = await response.json() as any;
      if (!data[coinId] || !data[coinId].usd) {
        throw new Error(`Invalid response from CoinGecko for ${coinId}`);
      }
      
      return data[coinId].usd;
    } catch (error) {
      console.error('CoinGecko API error:', error);
      throw error;
    }
  },

  // Binance API
  async getBinancePrice(symbol: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(
        `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`,
        { signal: controller.signal }
      );
      
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
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(
        `https://api.dexscreener.com/latest/dex/pairs/solana/${pairAddress}`,
        { signal: controller.signal }
      );
      
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
        contract_address: 'RNDR1A97ZatuqTAT2bZn1r4KwQisLvVfwJQfqWwaCSm',
        price_source: 'coingecko',
        price_api_id: 'render-token',
        weight: 30,
        description: 'Render Network - 去中心化GPU渲染网络',
        is_active: true
      },
      {
        name: 'Nosana',
        symbol: 'NOS',
        contract_address: '4BC2PiK9Y319bPQKHbLbHu86xdksJLAuBTBDPc6QcKAS',
        price_source: 'coingecko',
        price_api_id: 'nosana',
        weight: 25,
        description: 'Nosana - 去中心化CI/CD平台',
        is_active: true
      },
      {
        name: 'Synesis One',
        symbol: 'SNS',
        contract_address: 'SNS5czn4ZyjtHNpgJyHCN33zBYFWvLJoYxx3JrqkjvGc',
        price_source: 'coingecko',
        price_api_id: 'synesis-one',
        weight: 20,
        description: 'Synesis One - AI数据标注平台',
        is_active: true
      },
      {
        name: 'Numeraire',
        symbol: 'NMR',
        contract_address: 'NMR1gd2nautLcWTPZLY625YCHP6oVVNqs8s4ET3SkMsv',
        price_source: 'coingecko',
        price_api_id: 'numerai',
        weight: 15,
        description: 'Numeraire - 去中心化对冲基金',
        is_active: true
      },
      {
        name: 'ChainGPT',
        symbol: 'CGPT',
        contract_address: 'CGPT1Ws3jh9E82fUmX9Zykp17fjM5pVp4SGbXw7U7Doo',
        price_source: 'coingecko',
        price_api_id: 'chaingpt',
        weight: 10,
        description: 'ChainGPT - AI驱动的区块链工具',
        is_active: true
      }
    ];

    for (const tokenData of tokens) {
      const result = await strapi.db.connection.raw(`
        SELECT id FROM ai_tokens WHERE symbol = ?
      `, [tokenData.symbol]);

      if (result[0].length === 0) {
        await strapi.db.connection.raw(`
          INSERT INTO ai_tokens (name, symbol, contract_address, price_source, price_api_id, weight, description, is_active, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [
          tokenData.name,
          tokenData.symbol,
          tokenData.contract_address,
          tokenData.price_source,
          tokenData.price_api_id,
          tokenData.weight,
          tokenData.description,
          tokenData.is_active
        ]);
        console.log(`创建代币: ${tokenData.name}`);
      }
    }
  }
})); 