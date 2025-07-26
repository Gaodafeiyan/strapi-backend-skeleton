import { factories } from '@strapi/strapi';
import Decimal from 'decimal.js';

export default factories.createCoreController(
  'api::qianbao-yue.qianbao-yue',
  ({ strapi }) => ({
    // 继承默认的CRUD操作

    // 获取用户代币余额
    async getTokenBalances(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
          filters: { yonghu: userId }
        });
        
        const wallet = wallets[0];

        if (!wallet) {
          ctx.throw(404, '钱包不存在');
        }

        const tokenBalances = JSON.parse((wallet as any).aiTokenBalances || '{}');
        
        // 获取所有代币信息
        const tokens = await strapi.service('api::ai-token.ai-token').getActiveTokens();
        
        // 计算每个代币的总价值
        const balancesWithValue = await Promise.all(
          tokens.map(async (token) => {
            const balance = new Decimal(tokenBalances[token.id] || 0);
            let price = 0;
            
            try {
              price = await strapi.service('api::ai-token.ai-token').getTokenPrice(token.id);
            } catch (error) {
              console.error(`获取代币 ${token.name} 价格失败:`, error);
              price = 0.01; // 默认价格
            }
            
            const value = balance.mul(price).toFixed(2);
            
            return {
              id: token.id,
              name: token.name,
              symbol: token.symbol,
              balance: balance.toFixed(8),
              price: price.toFixed(8),
              value: value,
              logo: token.logoUrl,
              description: token.description
            };
          })
        );

        ctx.body = {
          data: balancesWithValue
        };
      } catch (error) {
        ctx.throw(500, error.message);
      }
    },

    // 获取用户钱包
    async getUserWallet(ctx) {
      try {
        const userId = ctx.state.user.id;
        
        console.log('获取用户钱包，用户ID:', userId);
        
        const wallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
          filters: { yonghu: userId }
        });
        
        console.log('查询到的钱包数量:', wallets.length);
        
        const wallet = wallets[0];

        if (!wallet) {
          console.log('用户钱包不存在，尝试创建钱包...');
          
          // 尝试创建钱包
          try {
            const newWallet = await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
              data: {
                usdtYue: '0',
                aiYue: '0',
                aiTokenBalances: '{}',
                yonghu: userId
              }
            });
            
            console.log('✅ 钱包创建成功:', newWallet.id);
            ctx.body = { data: newWallet };
          } catch (createError) {
            console.error('❌ 创建钱包失败:', createError);
            ctx.throw(404, '钱包不存在且无法创建');
          }
          return;
        }

        console.log('✅ 找到用户钱包:', wallet.id);
        ctx.body = { data: wallet };
      } catch (error) {
        console.error('获取用户钱包失败:', error);
        ctx.throw(500, error.message);
      }
    },

    // 获取用户代币赠送记录
    async getTokenRewardRecords(ctx) {
      try {
        const userId = ctx.state.user.id;
        const records = await strapi.service('api::token-reward-record.token-reward-record').getUserTokenRewards(userId);
        
        ctx.body = {
          data: records
        };
      } catch (error) {
        ctx.throw(500, error.message);
      }
    },

    // 重写create方法，添加数据验证
    async create(ctx) {
      try {
        const { data } = ctx.request.body;
        
        // 验证data字段
        if (!data) {
          return ctx.badRequest('缺少data字段');
        }
        
        // 验证用户ID
        if (!data.yonghu) {
          return ctx.badRequest('缺少用户ID');
        }
        
        // 验证用户是否存在
        const user = await strapi.entityService.findOne('plugin::users-permissions.user', data.yonghu);
        if (!user) {
          return ctx.badRequest('用户不存在');
        }
        
        // 检查用户是否已有钱包
        const existingWallet = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
          filters: { yonghu: data.yonghu }
        });
        
        if (existingWallet.length > 0) {
          return ctx.badRequest('用户已存在钱包');
        }
        
        const wallet = await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
          data: {
            usdtYue: data.usdtYue || '0',
            aiYue: data.aiYue || '0',
            aiTokenBalances: data.aiTokenBalances || '{}',
            yonghu: data.yonghu
          }
        });
        
        ctx.body = { data: wallet };
      } catch (error) {
        ctx.throw(500, `创建钱包失败: ${error.message}`);
      }
    },
  })
); 