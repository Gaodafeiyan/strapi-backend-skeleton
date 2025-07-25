import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::webhook.webhook', ({ strapi }) => ({
  // 继承默认的CRUD操作
}));