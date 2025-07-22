const disablePreview = () => {
  return async (ctx, next) => {
    if (ctx.path.startsWith('/content-manager/preview/url')) {
      ctx.status = 204;      // No Content
      return;
    }
    await next();
  };
};

/* 👇 关键行：直接导出函数，而非 default 属性 */
module.exports = disablePreview; 