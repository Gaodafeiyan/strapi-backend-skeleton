export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/api/yaoqing-jianglis',
      handler: 'yaoqing-jiangli.find',
    },
    {
      method: 'GET',
      path: '/api/yaoqing-jianglis/:id',
      handler: 'yaoqing-jiangli.findOne',
    },
    {
      method: 'POST',
      path: '/api/yaoqing-jianglis',
      handler: 'yaoqing-jiangli.create',
    },
    {
      method: 'PUT',
      path: '/api/yaoqing-jianglis/:id',
      handler: 'yaoqing-jiangli.update',
    },
    {
      method: 'DELETE',
      path: '/api/yaoqing-jianglis/:id',
      handler: 'yaoqing-jiangli.delete',
    },
  ],
}; 