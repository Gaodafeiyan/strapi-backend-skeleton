export default () => {
  return async (ctx, next) => {
    if (ctx.path.startsWith('/content-manager/preview/url')) {
      ctx.status = 204;          // No Content
      return;
    }
    await next();
  };
}; 