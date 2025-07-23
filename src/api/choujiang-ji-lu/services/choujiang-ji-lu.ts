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

        // 7. 验证用户存在性
        const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId);
        
        if (!user) {
          throw new Error(`用户ID ${userId} 不存在`);
        }

        // 8. 创建抽奖记录
        let choujiangRecord;
        try {
          choujiangRecord = await strapi.entityService.create('api::choujiang-ji-lu.choujiang-ji-lu' as any, {
            data: {
              yonghu: { id: userId },
              jiangpin: { id: selectedPrize.id },
              choujiangJihui: { id: jihuiId },
              dingdan: (jihui as any).dingdan ? { id: (jihui as any).dingdan.id } : null,
              chouJiangShiJian: new Date(),
              jiangPinMing: (selectedPrize as any).jiangpinMing,
              jiangPinJiaZhi: (selectedPrize as any).jiangpinJiaZhi,
              jiangPinLeiXing: (selectedPrize as any).jiangpinLeiXing,
              zhuangtai: 'zhongJiang'
            },
            transaction: trx
          });
        } catch (createError) {
          console.error('Strapi创建记录失败，使用原始SQL:', createError);
          
          // 备用方案：使用原始SQL插入
          const documentId = `choujiang_${Date.now()}_${userId}`;
          await strapi.db.connection.raw(`
            INSERT INTO [choujiang-ji-lu] (document_id, chou_jiang_shi_jian, jiang_pin_ming, jiang_pin_jia_zhi, jiang_pin_lei_xing, zhuangtai) 
            VALUES (?, ?, ?, ?, ?, ?)
          `, [documentId, new Date(), (selectedPrize as any).jiangpinMing, (selectedPrize as any).jiangpinJiaZhi, (selectedPrize as any).jiangpinLeiXing, 'zhongJiang']);
          
          // 获取插入的记录ID
          const result = await strapi.db.connection.raw('SELECT last_insert_rowid() as id');
          const recordId = result[0].id;
          
          // 手动插入关系
          await strapi.db.connection.raw(`
            INSERT INTO choujiang_ji_lu_yonghu_lnk (choujiang_ji_lu_id, user_id) 
            VALUES (?, ?)
          `, [recordId, userId]);
          
          await strapi.db.connection.raw(`
            INSERT INTO choujiang_ji_lu_jiangpin_lnk (choujiang_ji_lu_id, choujiang_jiangpin_id) 
            VALUES (?, ?)
          `, [recordId, selectedPrize.id]);
          
          await strapi.db.connection.raw(`
            INSERT INTO choujiang_ji_lu_choujiang_jihui_lnk (choujiang_ji_lu_id, choujiang_jihui_id) 
            VALUES (?, ?)
          `, [recordId, jihuiId]);
          
          if ((jihui as any).dingdan) {
            await strapi.db.connection.raw(`
              INSERT INTO choujiang_ji_lu_dinggou_dingdan_lnk (choujiang_ji_lu_id, dinggou_dingdan_id) 
              VALUES (?, ?)
            `, [recordId, (jihui as any).dingdan.id]);
          }
          
          // 构造返回的记录对象
          choujiangRecord = {
            id: recordId,
            document_id: documentId,
            chouJiangShiJian: new Date(),
            jiangPinMing: (selectedPrize as any).jiangpinMing,
            jiangPinJiaZhi: (selectedPrize as any).jiangpinJiaZhi,
            jiangPinLeiXing: (selectedPrize as any).jiangpinLeiXing,
            zhuangtai: 'zhongJiang'
          };
        }

        // 8. 奖品发放逻辑（商城板块处理）
        // 所有奖品都通过抽奖记录管理，由商城板块处理具体发放
        console.log(`用户 ${userId} 抽奖成功，获得: ${(selectedPrize as any).jiangpinMing}`);

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

  // 领取奖品
  async claimPrize(recordId: number) {
    try {
      const record = await strapi.entityService.findOne('api::choujiang-ji-lu.choujiang-ji-lu' as any, recordId);
      
      if (!record) {
        throw new Error('抽奖记录不存在');
      }

      if ((record as any).zhuangtai !== 'zhongJiang') {
        throw new Error('奖品状态不允许领取');
      }

      // 更新记录状态为已领取
      const updatedRecord = await strapi.entityService.update('api::choujiang-ji-lu.choujiang-ji-lu' as any, recordId, {
        data: {
          zhuangtai: 'yiLingQu',
          lingQuShiJian: new Date(),
          beiZhu: '奖品已领取，请到商城查看'
        }
      });

      console.log(`用户领取奖品: ${(record as any).jiangPinMing}`);
      return updatedRecord;
    } catch (error) {
      console.error('领取奖品失败:', error);
      throw error;
    }
  }
})); 