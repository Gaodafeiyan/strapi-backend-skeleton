export default {
  routes: [
    // 执行抽奖
    {
      method: 'POST',
      path: '/choujiang/perform',
      handler: 'choujiang-ji-lu.performChoujiang',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    // 获取用户抽奖机会
    {
      method: 'GET',
      path: '/choujiang/jihui',
      handler: 'choujiang-ji-lu.getUserChoujiangJihui',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    // 检查用户抽奖机会
    {
      method: 'GET',
      path: '/choujiang/check-jihui',
      handler: 'choujiang-ji-lu.checkUserChoujiangJihui',
      config: {
        auth: false
      }
    },
    // 获取用户抽奖记录
    {
      method: 'GET',
      path: '/choujiang/records',
      handler: 'choujiang-ji-lu.getUserChoujiangRecords',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    // 领取奖品
    {
      method: 'POST',
      path: '/choujiang/claim-prize',
      handler: 'choujiang-ji-lu.claimPrize',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    // 获取抽奖奖品列表（公开接口）
    {
      method: 'GET',
      path: '/choujiang/prizes',
      handler: 'choujiang-ji-lu.getChoujiangPrizes',
      config: {
        auth: false
      }
    },
    // 测试抽奖机会检查（公开接口，用于调试）
    {
      method: 'GET',
      path: '/choujiang/test-check',
      handler: 'choujiang-ji-lu.testCheckJihui',
      config: {
        auth: false
      }
    }
  ]
}; 