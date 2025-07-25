export default {
  type: 'content-api',
  routes: [
  {
    method: 'GET',
    path: '/api/yaoqing-jianglis/my-invites',
    handler: 'yaoqing-jiangli.getMyInvites',
    config: { auth: { scope: ['authenticated'] } },
  },
  {
    method: 'GET',
    path: '/api/yaoqing-jianglis/invite-stats',
    handler: 'yaoqing-jiangli.getInviteStats',
    config: { auth: { scope: ['authenticated'] } },
  },
    {
      method: 'GET',
      path: '/yaoqing-jianglis',
      handler: 'yaoqing-jiangli.find',
    },
    {
      method: 'GET',
      path: '/yaoqing-jianglis/:id',
      handler: 'yaoqing-jiangli.findOne',
    },
    {
      method: 'POST',
      path: '/yaoqing-jianglis',
      handler: 'yaoqing-jiangli.create',
    },
    {
      method: 'PUT',
      path: '/yaoqing-jianglis/:id',
      handler: 'yaoqing-jiangli.update',
    },
    {
      method: 'DELETE',
      path: '/yaoqing-jianglis/:id',
      handler: 'yaoqing-jiangli.delete',
    },
  ],
}; 