const testWalletDebug = async () => {
  console.log('=== 钱包调试测试 ===');
  
  try {
    const userId = 4;
    const testAmount = '25.00';
    
    console.log('测试参数:', { userId, testAmount });
    
    // 1. 测试钱包查询
    console.log('\n1. 测试钱包查询...');
    const wallets = await strapi.entityService.findMany(
      'api::qianbao-yue.qianbao-yue',
      { 
        filters: { yonghu: { id: userId } }, 
        populate: ['yonghu'] 
      }
    );
    
    console.log('查询到的钱包数量:', wallets.length);
    if (wallets.length > 0) {
      const wallet = wallets[0];
      console.log('钱包详情:', {
        id: wallet.id,
        usdtYue: wallet.usdtYue,
        yonghuId: wallet.yonghu?.id,
        yonghuUsername: wallet.yonghu?.username
      });
    }
    
    // 2. 测试钱包服务方法
    console.log('\n2. 测试钱包服务方法...');
    const walletService = strapi.service('api::qianbao-yue.qianbao-yue');
    
    // 获取当前余额
    const currentWallets = await strapi.entityService.findMany(
      'api::qianbao-yue.qianbao-yue',
      { filters: { yonghu: { id: userId } } }
    );
    
    if (currentWallets.length > 0) {
      const currentWallet = currentWallets[0];
      const currentBalance = currentWallet.usdtYue;
      console.log('当前余额:', currentBalance);
      
      // 手动计算新余额
      const newBalance = (parseFloat(currentBalance) + parseFloat(testAmount)).toFixed(2);
      console.log('预期新余额:', newBalance);
      
      // 3. 调用钱包服务
      console.log('\n3. 调用钱包服务...');
      try {
        await walletService.addBalance(userId, testAmount);
        console.log('✅ 钱包服务调用成功');
      } catch (serviceError) {
        console.error('❌ 钱包服务调用失败:', serviceError.message);
        return;
      }
      
      // 4. 验证结果
      console.log('\n4. 验证更新结果...');
      const updatedWallets = await strapi.entityService.findMany(
        'api::qianbao-yue.qianbao-yue',
        { filters: { yonghu: { id: userId } } }
      );
      
      if (updatedWallets.length > 0) {
        const updatedWallet = updatedWallets[0];
        const actualNewBalance = updatedWallet.usdtYue;
        const balanceChange = parseFloat(actualNewBalance) - parseFloat(currentBalance);
        
        console.log('更新结果:', {
          oldBalance: currentBalance,
          actualNewBalance: actualNewBalance,
          expectedNewBalance: newBalance,
          balanceChange: balanceChange,
          expectedChange: parseFloat(testAmount)
        });
        
        if (Math.abs(balanceChange - parseFloat(testAmount)) < 0.01) {
          console.log('✅ 钱包更新成功！余额正确增加');
        } else {
          console.error('❌ 钱包更新失败，余额变化不正确');
          console.error('期望增加:', testAmount, '实际增加:', balanceChange);
        }
      }
    } else {
      console.error('❌ 未找到用户钱包');
    }
    
  } catch (error) {
    console.error('❌ 钱包调试测试失败:', error);
    console.error('错误详情:', error.message);
    console.error('错误堆栈:', error.stack);
  }
  
  console.log('\n=== 钱包调试测试完成 ===');
};

module.exports = {
  testWalletDebug
}; 