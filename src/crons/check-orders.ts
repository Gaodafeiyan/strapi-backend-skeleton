export default {
  '*/10 * * * *': async ({ strapi }: any) => {
    const dueOrders = await strapi.entityService.findMany(
      'api::dinggou-dingdan.dinggou-dingdan',
      {
        filters: { zhuangtai: 'active', jieshuShiJian: { $lte: new Date() } },
      }
    );
    for (const o of dueOrders) {
      await strapi.service('api::dinggou-dingdan.dinggou-dingdan').redeem(o.id);
    }
  },
}; 