const { createStrapi } = require('@strapi/strapi');

async function testUserRelations() {
  try {
    // 初始化Strapi
    const strapi = await createStrapi();
    await strapi.load();

    console.log('=== 测试用户关系 ===');

    // 1. 检查用户是否存在
    const users = await strapi.entityService.findMany('plugin::users-permissions.user');
    console.log('所有用户:', users.map(u => ({ id: u.id, username: u.username, email: u.email })));

    // 2. 检查抽奖机会
    const jihuis = await strapi.entityService.findMany('api::choujiang-jihui.choujiang-jihui', {
      populate: ['yonghu']
    });
    console.log('所有抽奖机会:', jihuis.map(j => ({
      id: j.id,
      userId: j.yonghu?.id,
      shengYuCiShu: j.shengYuCiShu,
      zhuangtai: j.zhuangtai
    })));

    // 3. 为用户ID 2创建新的抽奖机会（如果不存在）
    const userId = 2;
    const existingJihui = jihuis.find(j => j.yonghu?.id === userId);
    
    if (!existingJihui) {
      console.log(`为用户 ${userId} 创建新的抽奖机会...`);
      
      const newJihui = await strapi.entityService.create('api::choujiang-jihui.choujiang-jihui', {
        data: {
          yonghu: { id: userId },
          zongCiShu: 3,
          yiYongCiShu: 0,
          shengYuCiShu: 3,
          zhuangtai: 'active',
          chuangJianShiJian: new Date(),
          daoQiShiJian: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });
      
      console.log('创建成功:', newJihui);
    } else {
      console.log(`用户 ${userId} 已有抽奖机会:`, existingJihui);
    }

    // 4. 验证关系
    const updatedJihuis = await strapi.entityService.findMany('api::choujiang-jihui.choujiang-jihui', {
      filters: { yonghu: userId },
      populate: ['yonghu']
    });
    
    console.log(`用户 ${userId} 的抽奖机会:`, updatedJihuis);

    await strapi.destroy();
    console.log('测试完成');

  } catch (error) {
    console.error('测试失败:', error);
  }
}

testUserRelations(); 