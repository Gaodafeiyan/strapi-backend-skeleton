export default {
  // Webhook统一处理转入/转出txHash
  async handleTransaction(ctx) {
    const { txHash, status, type } = ctx.request.body;
    
    if (!txHash || !status || !type) {
      return ctx.badRequest('缺少必要参数: txHash, status, type');
    }

    try {
      const result = await strapi.service('api::webhook.webhook').processTransaction(txHash, status, type);
      
      ctx.body = { 
        success: true, 
        message: result.message,
        txHash 
      };
    } catch (error) {
      ctx.throw(500, `处理交易失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}; 