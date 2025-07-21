export default {
  type: 'content-api',
  routes: [
    { method: 'POST', path: '/dinggou-dingdans', handler: 'dinggou-dingdan.createWithPlan' },
    { method: 'POST', path: '/dinggou-dingdans/:id/redeem', handler: 'dinggou-dingdan.redeem' },
  ],
}; 