export default {
  routes: [
    // 执行抽奖
    {
      method: 'POST',
      path: '/choujiang/perform',
      handler: 'choujiang-jiLu.performChoujiang',
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
      handler: 'choujiang-jiLu.getUserChoujiangJihui',
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
      handler: 'choujiang-jiLu.checkUserChoujiangJihui',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    // 获取用户抽奖记录
    {
      method: 'GET',
      path: '/choujiang/records',
      handler: 'choujiang-jiLu.getUserChoujiangRecords',
      config: {
        auth: {
          scope: ['authenticated']
        }
      }
    },
    // 领取实物奖品
    {
      method: 'POST',
      path: '/choujiang/claim-prize',
      handler: 'choujiang-jiLu.claimPhysicalPrize',
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
      handler: 'choujiang-jiLu.getChoujiangPrizes',
      config: {
        auth: false
      }
    }
  ]
}; 