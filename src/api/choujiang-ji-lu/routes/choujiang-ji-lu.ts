export default {
  routes: [
    // 执行抽奖 - 需要认证
    {
      method: 'POST',
      path: '/api/choujiang/perform',
      handler: 'choujiang-ji-lu.performChoujiang',
      config: {
        auth: {
          scope: ['authenticated'],
        },
        policies: [],
        middlewares: [],
      }
    },
    // 获取用户抽奖机会 - 需要认证
    {
      method: 'GET',
      path: '/api/choujiang/jihui',
      handler: 'choujiang-ji-lu.getUserChoujiangJihui',
      config: {
        auth: {
          scope: ['authenticated'],
        },
        policies: [],
        middlewares: [],
      }
    },
    // 检查用户抽奖机会 - 需要认证
    {
      method: 'GET',
      path: '/api/choujiang/check-jihui',
      handler: 'choujiang-ji-lu.checkUserChoujiangJihui',
      config: {
        auth: {
          scope: ['authenticated'],
        },
        policies: [],
        middlewares: [],
      }
    },
    // 获取用户抽奖记录 - 需要认证
    {
      method: 'GET',
      path: '/api/choujiang/records',
      handler: 'choujiang-ji-lu.getUserChoujiangRecords',
      config: {
        auth: {
          scope: ['authenticated'],
        },
        policies: [],
        middlewares: [],
      }
    },
    // 领取奖品 - 需要认证
    {
      method: 'POST',
      path: '/api/choujiang/claim-prize',
      handler: 'choujiang-ji-lu.claimPrize',
      config: {
        auth: {
          scope: ['authenticated'],
        },
        policies: [],
        middlewares: [],
      }
    },
    // 获取抽奖奖品列表（公开接口）- 保持公开
    {
      method: 'GET',
      path: '/api/choujiang/prizes',
      handler: 'choujiang-ji-lu.getChoujiangPrizes',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      }
    },
    // 测试抽奖机会检查（仅管理员）- 添加管理员权限
    {
      method: 'GET',
      path: '/api/choujiang/test-check',
      handler: 'choujiang-ji-lu.testCheckJihui',
      config: {
        auth: {
          scope: ['admin::is-authenticated'],
        },
        policies: [],
        middlewares: [],
      }
    }
  ]
}; 