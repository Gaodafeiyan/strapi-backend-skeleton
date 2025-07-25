import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::webhook.webhook' as any, ({ strapi }) => ({
  // 继承默认的CRUD操作
}));