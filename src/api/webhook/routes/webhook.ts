export default {
  routes: [
    {
      method: 'POST',
      path: '/webhook/transaction',
      handler: 'webhook.handleTransaction',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
}; 