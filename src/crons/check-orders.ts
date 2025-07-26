export default {
  '0 0 * * *': async ({ strapi }: any) => {
    try {
      console.log('=== 定时任务开始执行 ===');
      console.log('执行时间:', new Date().toISOString());
      console.log('开始检查到期订单...');
      
      // 分批处理，避免一次性加载太多数据
      const batchSize = 50;
      let offset = 0;
      let hasMore = true;
      let totalProcessed = 0;
      
      while (hasMore) {
        const dueOrders = await strapi.entityService.findMany(
          'api::dinggou-dingdan.dinggou-dingdan',
          {
            filters: { 
              status: 'running', 
              end_at: { $lte: new Date() } 
            },
            start: offset,
            limit: batchSize,
            sort: { end_at: 'asc' }
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
              { data: { status: 'finished' } }
            );
            console.log(`✅ 订单 ${order.id} 已标记为完成状态`);
            totalProcessed++;
          } catch (error) {
            console.error(`❌ 订单 ${order.id} 标记失败:`, error instanceof Error ? error.message : '未知错误');
          }
        }
        
        offset += batchSize;
        
        // 如果返回的数据少于批次大小，说明没有更多数据了
        if (dueOrders.length < batchSize) {
          hasMore = false;
        }
      }
      
      console.log(`=== 定时任务执行完成 ===`);
      console.log(`总共处理了 ${totalProcessed} 个订单`);
      console.log(`执行时间: ${new Date().toISOString()}`);
    } catch (error) {
      console.error('❌ 定时任务执行错误:', error);
    }
  },
}; 