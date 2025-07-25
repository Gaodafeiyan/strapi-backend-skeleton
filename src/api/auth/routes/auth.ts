export default {
  type: 'content-api',
  routes: [
    {
      method: 'POST',
      path: '/api/auth/invite-register',
      handler: 'auth.inviteRegister',
      config: { auth: false },
    },
  ],
}; 