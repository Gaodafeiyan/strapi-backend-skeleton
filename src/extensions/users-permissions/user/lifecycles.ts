// 用户生命周期管理
const YonghuLife = {
  // 用户创建后自动创建钱包
  async afterCreate({ result }: { result: any }) {
    try {
      console.log('用户注册成功，开始创建钱包，用户ID:', result.id);
      
      // 检查是否已存在钱包
      const existingWallets = await strapi.entityService.findMany('api::qianbao-yue.qianbao-yue', {
        filters: { yonghu: result.id }
      });
      
      if (existingWallets.length > 0) {
        console.log('用户钱包已存在，跳过创建');
        return;
      }
      
      // 创建新钱包
      const wallet = await strapi.entityService.create('api::qianbao-yue.qianbao-yue', {
        data: {
          usdtYue: '0',
          aiYue: '0',
          aiTokenBalances: '{}',
          yonghu: result.id
        }
      });
      
      console.log('✅ 用户钱包创建成功:', {
        userId: result.id,
        walletId: wallet.id,
        username: result.username
      });
    } catch (error) {
      console.error('❌ 创建用户钱包失败:', error);
      // 不抛出错误，避免影响用户注册流程
    }
  },

  // 注释掉自动生成邀请码的生命周期，因为现在在 inviteRegister 中手动设置
  // async beforeCreate({ params }: { params: any }) {
  //   params.data.yaoqingMa = nanoid8();
  // },
} as any;

export default YonghuLife; 