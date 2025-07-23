export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/wallet-addresses',
      handler: 'wallet-address.find',
    },
    {
      method: 'GET',
      path: '/wallet-addresses/:id',
      handler: 'wallet-address.findOne',
    },
    {
      method: 'POST',
      path: '/wallet-addresses',
      handler: 'wallet-address.create',
    },
    {
      method: 'PUT',
      path: '/wallet-addresses/:id',
      handler: 'wallet-address.update',
    },
    {
      method: 'DELETE',
      path: '/wallet-addresses/:id',
      handler: 'wallet-address.delete',
    },
    // 自定义路由
    {
      method: 'GET',
      path: '/wallet-addresses/best/:chain/:asset',
      handler: 'wallet-address.getBestAddress',
    },
    {
      method: 'POST',
      path: '/wallet-addresses/rotate',
      handler: 'wallet-address.rotateAddresses',
    },
    {
      method: 'POST',
      path: '/wallet-addresses/generate',
      handler: 'wallet-address.generateAddresses',
    },
  ],
}; 