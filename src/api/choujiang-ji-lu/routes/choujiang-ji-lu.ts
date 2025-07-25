export default {
  routes: [
    // 标准REST API路由
    {
      method: 'GET',
      path: '/choujiang-ji-lus',
      handler: 'choujiang-ji-lu.find',
      config: {
        auth: {
          scope: ['authenticated'],
        },
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'GET',
      path: '/choujiang-ji-lus/:id',
      handler: 'choujiang-ji-lu.findOne',
      config: {
        auth: {
          scope: ['authenticated'],
        },
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'POST',
      path: '/choujiang-ji-lus',
      handler: 'choujiang-ji-lu.create',
      config: {
        auth: {
          scope: ['authenticated'],
        },
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'PUT',
      path: '/choujiang-ji-lus/:id',
      handler: 'choujiang-ji-lu.update',
      config: {
        auth: {
          scope: ['authenticated'],
        },
        policies: [],
        middlewares: [],
      }
    },
    {
      method: 'DELETE',
      path: '/choujiang-ji-lus/:id',
      handler: 'choujiang-ji-lu.delete',
      config: {
        auth: {
          scope: ['authenticated'],
        },
        policies: [],
        middlewares: [],
      }
    },
    // 执行抽奖 - 需要认证
    {
      method: 'POST',
      path: '/choujiang/perform',
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
      path: '/choujiang/jihui',
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
      path: '/choujiang/check-jihui',
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
      path: '/choujiang/records',
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
      path: '/choujiang/claim-prize',
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
      path: '/choujiang/prizes',
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
      path: '/choujiang/test-check',
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