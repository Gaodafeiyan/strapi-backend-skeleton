export default {
  '*/10 * * * *': async ({ strapi }: any) => {
    try {
      console.log('开始检查到期订单...');
      
      // 分批处理，避免一次性加载太多数据
      const batchSize = 50;
      let offset = 0;
      let hasMore = true;
      
      while (hasMore) {
        const dueOrders = await strapi.entityService.findMany(
          'api::dinggou-dingdan.dinggou-dingdan',
          {
            filters: { 
              zhuangtai: 'active', 
              jieshuShiJian: { $lte: new Date() } 
            },
            start: offset,
            limit: batchSize,
            sort: { jieshuShiJian: 'asc' }
          }
        );
        
        if (dueOrders.length === 0) {
          hasMore = false;
          break;
        }
        
        console.log(`处理 ${dueOrders.length} 个到期订单...`);
        
        // 并发处理订单，但限制并发数
        const concurrency = 5;
        for (let i = 0; i < dueOrders.length; i += concurrency) {
          const batch = dueOrders.slice(i, i + concurrency);
          await Promise.all(
            batch.map(async (order) => {
              try {
                await strapi.service('api::dinggou-dingdan.dinggou-dingdan').redeem(order.id);
                console.log(`订单 ${order.id} 赎回成功`);
              } catch (error) {
                console.error(`订单 ${order.id} 赎回失败:`, error.message);
              }
            })
          );
        }
        
        offset += batchSize;
        
        // 如果返回的数据少于批次大小，说明没有更多数据了
        if (dueOrders.length < batchSize) {
          hasMore = false;
        }
      }
      
      console.log('到期订单检查完成');
    } catch (error) {
      console.error('定时任务执行错误:', error);
    }
  },
}; 