const testDirectWalletUpdate = async () => {
  console.log('=== 直接钱包更新测试 ===');
  
  try {
    // 测试用户ID 4的钱包更新
    const userId = 4;
    const testAmount = '50.00';
    
    console.log('测试参数:', { userId, testAmount });
    
    // 1. 获取当前钱包余额
    const currentWallets = await strapi.entityService.findMany(
      'api::qianbao-yue.qianbao-yue',
      { filters: { yonghu: { id: userId } } }
    );
    
    if (currentWallets.length === 0) {
      console.error('❌ 用户钱包不存在');
      return;
    }
    
    const currentWallet = currentWallets[0];
    const currentBalance = currentWallet.usdtYue;
    console.log('当前钱包信息:', {
      id: currentWallet.id,
      currentBalance,
      userId
    });
    
    // 2. 直接调用钱包服务
    const walletService = strapi.service('api::qianbao-yue.qianbao-yue');
    console.log('调用钱包服务...');
    
    await walletService.addBalance(userId, testAmount);
    console.log('✅ 钱包服务调用完成');
    
    // 3. 验证更新结果
    const updatedWallets = await strapi.entityService.findMany(
      'api::qianbao-yue.qianbao-yue',
      { filters: { yonghu: { id: userId } } }
    );
    
    if (updatedWallets.length > 0) {
      const updatedWallet = updatedWallets[0];
      const newBalance = updatedWallet.usdtYue;
      const balanceChange = parseFloat(newBalance) - parseFloat(currentBalance);
      
      console.log('更新结果:', {
        oldBalance: currentBalance,
        newBalance: newBalance,
        balanceChange: balanceChange,
        expectedChange: parseFloat(testAmount)
      });
      
      if (Math.abs(balanceChange - parseFloat(testAmount)) < 0.01) {
        console.log('✅ 钱包更新成功！');
      } else {
        console.error('❌ 钱包更新失败，余额变化不正确');
      }
    }
    
  } catch (error) {
    console.error('❌ 直接钱包更新测试失败:', error);
    console.error('错误详情:', error.message);
    console.error('错误堆栈:', error.stack);
  }
  
  console.log('=== 直接钱包更新测试完成 ===');
};

module.exports = {
  testDirectWalletUpdate
}; 