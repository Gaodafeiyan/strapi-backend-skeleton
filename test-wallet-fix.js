const testWalletUpdate = async () => {
  console.log('=== 钱包更新测试开始 ===');
  
  try {
    // 1. 测试钱包查询
    console.log('1. 测试钱包查询...');
    const wallets = await strapi.entityService.findMany(
      'api::qianbao-yue.qianbao-yue',
      { 
        filters: { yonghu: { id: 4 } }, 
        populate: ['yonghu'] 
      }
    );
    
    console.log('查询到的钱包数量:', wallets.length);
    if (wallets.length > 0) {
      console.log('钱包信息:', {
        id: wallets[0].id,
        usdtYue: wallets[0].usdtYue,
        yonghu: wallets[0].yonghu?.id
      });
    }
    
    // 2. 测试钱包服务调用
    console.log('2. 测试钱包服务调用...');
    const walletService = strapi.service('api::qianbao-yue.qianbao-yue');
    
    // 获取当前余额
    const currentWallets = await strapi.entityService.findMany(
      'api::qianbao-yue.qianbao-yue',
      { filters: { yonghu: { id: 4 } } }
    );
    
    if (currentWallets.length > 0) {
      const currentBalance = currentWallets[0].usdtYue;
      console.log('当前余额:', currentBalance);
      
      // 尝试更新余额
      await walletService.addBalance(4, '10.00');
      console.log('✅ 钱包更新调用成功');
      
      // 检查更新后的余额
      const updatedWallets = await strapi.entityService.findMany(
        'api::qianbao-yue.qianbao-yue',
        { filters: { yonghu: { id: 4 } } }
      );
      
      if (updatedWallets.length > 0) {
        const updatedBalance = updatedWallets[0].usdtYue;
        console.log('更新后余额:', updatedBalance);
        console.log('余额变化:', parseFloat(updatedBalance) - parseFloat(currentBalance));
      }
    }
    
  } catch (error) {
    console.error('❌ 钱包更新测试失败:', error);
    console.error('错误详情:', error.message);
    console.error('错误堆栈:', error.stack);
  }
  
  console.log('=== 钱包更新测试完成 ===');
};

module.exports = {
  testWalletUpdate
}; 