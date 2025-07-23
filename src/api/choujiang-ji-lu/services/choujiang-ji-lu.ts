import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::choujiang-ji-lu.choujiang-ji-lu' as any, ({ strapi }) => ({
  // 执行抽奖
  async performChoujiang(userId: number, jihuiId: number) {
    return strapi.db.transaction(async (trx) => {
      try {
        // 1. 验证抽奖机会
        const jihui = await strapi.entityService.findOne('api::choujiang-jihui.choujiang-jihui' as any, jihuiId, {
          populate: ['dingdan'],
          transaction: trx
        });

        if (!jihui) {
          throw new Error('抽奖机会不存在');
        }

        if ((jihui as any).shengYuCiShu <= 0) {
          throw new Error('抽奖机会已用完');
        }

        if ((jihui as any).zhuangtai !== 'active') {
          throw new Error('抽奖机会已过期或已用完');
        }

        // 2. 获取可用奖品
        const prizes = await strapi.entityService.findMany('api::choujiang-jiangpin.choujiang-jiangpin' as any, {
          filters: {
            kaiQi: true,
            kuCunShuLiang: {
              $gt: 0
            }
          },
          sort: { paiXuShunXu: 'asc' },
          transaction: trx
        }) as any[];

        if (prizes.length === 0) {
          throw new Error('暂无可用的抽奖奖品');
        }

        // 3. 执行抽奖算法
        const selectedPrize = this.calculatePrize(prizes);
        
        if (!selectedPrize) {
          throw new Error('抽奖失败，请重试');
        }

        // 4. 检查奖品库存
        if ((selectedPrize as any).kuCunShuLiang <= 0) {
          throw new Error('奖品库存不足');
        }

        // 5. 使用抽奖机会
        await strapi.service('api::choujiang-jihui.choujiang-jihui').useChoujiangJihui(jihuiId);

        // 6. 更新奖品库存
        await strapi.entityService.update('api::choujiang-jiangpin.choujiang-jiangpin' as any, selectedPrize.id as number, {
          data: {
            kuCunShuLiang: (selectedPrize as any).kuCunShuLiang - 1,
            yiFaChuShuLiang: (selectedPrize as any).yiFaChuShuLiang + 1
          },
          transaction: trx
        });

        // 7. 创建抽奖记录
        const choujiangRecord = await strapi.entityService.create('api::choujiang-ji-lu.choujiang-ji-lu' as any, {
          data: {
            yonghu: userId,
            jiangpin: selectedPrize.id,
            choujiangJihui: jihuiId,
            dingdan: (jihui as any).dingdan?.id,
            chouJiangShiJian: new Date(),
            jiangPinMing: (selectedPrize as any).jiangpinMing,
            jiangPinJiaZhi: (selectedPrize as any).jiangpinJiaZhi,
            jiangPinLeiXing: (selectedPrize as any).jiangpinLeiXing,
            zhuangtai: 'zhongJiang'
          },
          transaction: trx
        });

        // 8. 如果是USDT或AI代币，直接发放到钱包
        if ((selectedPrize as any).jiangpinLeiXing === 'USDT' || (selectedPrize as any).jiangpinLeiXing === 'AI_TOKEN') {
          await this.distributePrize(userId, selectedPrize, choujiangRecord.id as number);
        }

        console.log(`用户 ${userId} 抽奖成功，获得: ${(selectedPrize as any).jiangpinMing}`);

        return {
          success: true,
          prize: selectedPrize,
          record: choujiangRecord
        };

      } catch (error) {
        console.error('抽奖失败:', error);
        throw error;
      }
    });
  },

  // 概率计算算法
  calculatePrize(prizes: any[]): any {
    const random = Math.random() * 100;
    let cumulative = 0;
    
    for (const prize of prizes) {
      cumulative += parseFloat(prize.zhongJiangGaiLv || 0);
      if (random <= cumulative) {
        return prize;
      }
    }
    
    // 如果没有中奖，返回概率最高的奖品
    return prizes.sort((a, b) => parseFloat(b.zhongJiangGaiLv || 0) - parseFloat(a.zhongJiangGaiLv || 0))[0];
  },

  // 发放奖品
  async distributePrize(userId: number, prize: any, recordId: number) {
    try {
      if (prize.jiangpinLeiXing === 'USDT') {
        // 发放USDT到钱包
        await strapi.service('api::qianbao-yue.qianbao-yue').addBalance(
          userId, 
          prize.jiangpinJiaZhi
        );
        
        // 更新记录状态为已领取
        await strapi.entityService.update('api::choujiang-ji-lu.choujiang-ji-lu' as any, recordId, {
          data: {
            zhuangtai: 'yiLingQu',
            lingQuShiJian: new Date(),
            beiZhu: 'USDT已自动发放到钱包'
          }
        });

        console.log(`USDT奖品已发放到用户 ${userId} 钱包: ${prize.jiangpinJiaZhi}`);

      } else if (prize.jiangpinLeiXing === 'AI_TOKEN') {
        // 发放AI代币到钱包
        await strapi.service('api::qianbao-yue.qianbao-yue').addBalance(
          userId, 
          '0', // USDT余额不变
          prize.jiangpinJiaZhi // AI代币余额增加
        );
        
        // 更新记录状态为已领取
        await strapi.entityService.update('api::choujiang-ji-lu.choujiang-ji-lu' as any, recordId, {
          data: {
            zhuangtai: 'yiLingQu',
            lingQuShiJian: new Date(),
            beiZhu: 'AI代币已自动发放到钱包'
          }
        });

        console.log(`AI代币奖品已发放到用户 ${userId} 钱包: ${prize.jiangpinJiaZhi}`);
      }
    } catch (error) {
      console.error('发放奖品失败:', error);
      throw error;
    }
  },

  // 获取用户抽奖记录
  async getUserChoujiangRecords(userId: number, limit: number = 20, offset: number = 0) {
    try {
      const records = await strapi.entityService.findMany('api::choujiang-ji-lu.choujiang-ji-lu' as any, {
        filters: { yonghu: userId },
        sort: { chouJiangShiJian: 'desc' },
        pagination: { limit, start: offset },
        populate: ['jiangpin']
      });

      return records;
    } catch (error) {
      console.error('获取用户抽奖记录失败:', error);
      throw error;
    }
  },

  // 领取实物奖品
  async claimPhysicalPrize(recordId: number) {
    try {
      const record = await strapi.entityService.findOne('api::choujiang-ji-lu.choujiang-ji-lu' as any, recordId);
      
      if (!record) {
        throw new Error('抽奖记录不存在');
      }

      if ((record as any).jiangPinLeiXing !== 'WU_PIN') {
        throw new Error('只有实物奖品需要手动领取');
      }

      if ((record as any).zhuangtai !== 'zhongJiang') {
        throw new Error('奖品状态不允许领取');
      }

      // 更新记录状态为已领取
      const updatedRecord = await strapi.entityService.update('api::choujiang-ji-lu.choujiang-ji-lu' as any, recordId, {
        data: {
          zhuangtai: 'yiLingQu',
          lingQuShiJian: new Date(),
          beiZhu: '实物奖品已领取'
        }
      });

      console.log(`用户领取实物奖品: ${(record as any).jiangPinMing}`);
      return updatedRecord;
    } catch (error) {
      console.error('领取实物奖品失败:', error);
      throw error;
    }
  }
})); 