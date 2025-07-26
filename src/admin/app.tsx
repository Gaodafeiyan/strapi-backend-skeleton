import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: [
      'zh-Hans',
      'zh',
    ],
  },
  bootstrap(app: StrapiApp) {
    console.log('Strapi Admin App Bootstrap');
    
    // 为认购计划添加自定义操作按钮
    app.addReducers({
      'admin-dashboard': {
        // 添加仪表板状态管理
      }
    });

    // 注册自定义组件
    app.registerPlugin({
      name: 'plan-management',
      injectionZones: {
        admin: {
          // 在管理面板中注入自定义组件
        }
      }
    });

    // 添加自定义API调用
    app.addFields({
      'plan-actions': {
        // 自定义字段组件
      }
    });

    // 监听内容类型变化
    app.subscribe((event) => {
      if (event.type === 'ContentManager/ListView/CHANGE_LIST_LAYOUT') {
        // 当列表视图改变时
        console.log('List view changed');
      }
    });
  },
}; 