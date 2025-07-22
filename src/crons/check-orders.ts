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
        
        // 标记到期订单为可赎回状态
        for (const order of dueOrders) {
          try {
            await strapi.entityService.update(
              'api::dinggou-dingdan.dinggou-dingdan',
              order.id,
              { data: { zhuangtai: 'redeemable' } }
            );
            console.log(`订单 ${order.id} 已标记为可赎回状态`);
          } catch (error) {
            console.error(`订单 ${order.id} 标记失败:`, error instanceof Error ? error.message : '未知错误');
          }
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