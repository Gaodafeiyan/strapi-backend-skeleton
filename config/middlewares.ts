export default [
  // ① 自定义中间件：禁用预览功能
  {
    name: 'disable-preview',
    resolve: './src/middlewares/disablePreview',
  },
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  {
    name: 'global::error-handler',
    config: {},
  },
];
