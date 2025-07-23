export default (policyContext, config, { strapi }) => {
  // 检查用户是否已认证
  if (policyContext.state.user) {
    return true;
  }

  return false;
}; 