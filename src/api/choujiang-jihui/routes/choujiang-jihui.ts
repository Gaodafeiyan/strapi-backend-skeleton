export default {
  type: 'content-api',
  routes: [
    {
      method: 'GET',
      path: '/choujiang-jihuis',
      handler: 'choujiang-jihui.find',
    },
    {
      method: 'GET',
      path: '/choujiang-jihuis/:id',
      handler: 'choujiang-jihui.findOne',
    },
    {
      method: 'POST',
      path: '/choujiang-jihuis',
      handler: 'choujiang-jihui.create',
    },
    {
      method: 'PUT',
      path: '/choujiang-jihuis/:id',
      handler: 'choujiang-jihui.update',
    },
    {
      method: 'DELETE',
      path: '/choujiang-jihuis/:id',
      handler: 'choujiang-jihui.delete',
    },
  ],
}; 