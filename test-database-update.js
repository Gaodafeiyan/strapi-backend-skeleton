const testDatabaseUpdate = async () => {
  console.log('=== 数据库直接更新测试 ===');
  
  try {
    const walletId = 4;
    const newBalance = '7132.00';
    
    console.log('测试参数:', { walletId, newBalance });
    
    // 1. 获取当前钱包信息
    console.log('\n1. 获取当前钱包信息...');
    const currentWallet = await strapi.entityService.findOne(
      'api::qianbao-yue.qianbao-yue',
      walletId
    );
    
    if (!currentWallet) {
      console.error('❌ 钱包不存在，ID:', walletId);
      return;
    }
    
    console.log('当前钱包信息:', {
      id: currentWallet.id,
      currentBalance: currentWallet.usdtYue,
      updatedAt: currentWallet.updatedAt
    });
    
    // 2. 直接更新钱包
    console.log('\n2. 直接更新钱包...');
    const updateResult = await strapi.entityService.update(
      'api::qianbao-yue.qianbao-yue',
      walletId,
      { data: { usdtYue: newBalance } }
    );
    
    console.log('更新结果:', {
      id: updateResult.id,
      newBalance: updateResult.usdtYue,
      updatedAt: updateResult.updatedAt
    });
    
    // 3. 验证更新结果
    console.log('\n3. 验证更新结果...');
    const verifyWallet = await strapi.entityService.findOne(
      'api::qianbao-yue.qianbao-yue',
      walletId
    );
    
    if (verifyWallet) {
      console.log('验证结果:', {
        id: verifyWallet.id,
        finalBalance: verifyWallet.usdtYue,
        updatedAt: verifyWallet.updatedAt
      });
      
      if (verifyWallet.usdtYue === newBalance) {
        console.log('✅ 数据库更新成功！');
      } else {
        console.error('❌ 数据库更新失败，余额不匹配');
        console.error('期望:', newBalance, '实际:', verifyWallet.usdtYue);
      }
    }
    
  } catch (error) {
    console.error('❌ 数据库更新测试失败:', error);
    console.error('错误详情:', error.message);
    console.error('错误堆栈:', error.stack);
  }
  
  console.log('\n=== 数据库直接更新测试完成 ===');
};

module.exports = {
  testDatabaseUpdate
}; 