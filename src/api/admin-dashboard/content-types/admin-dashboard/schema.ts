const AdminDashboardSchema = {
  kind: 'collectionType',
  pluginOptions: { 'content-api': { enabled: true } },
  info: { 
    singularName: 'admin-dashboard', 
    pluralName: 'admin-dashboards', 
    displayName: '后台管理面板',
    description: '系统后台管理面板'
  },
  options: { draftAndPublish: false },
  attributes: {
    name: { 
      type: 'string',
      maxLength: 100
    },
    description: { 
      type: 'text'
    }
  },
};

export default AdminDashboardSchema; 