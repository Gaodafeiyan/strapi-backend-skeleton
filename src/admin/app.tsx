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
    
    // 监听内容类型变化
    app.subscribe((event) => {
      if (event.type === 'ContentManager/ListView/CHANGE_LIST_LAYOUT') {
        // 当列表视图改变时
        console.log('List view changed');
      }
    });

    // 添加自定义菜单项（如果需要）
    // app.addMenuLink({
    //   to: '/custom-page',
    //   icon: 'plugin',
    //   intlLabel: {
    //     id: 'custom.page',
    //     defaultMessage: 'Custom Page',
    //   },
    //   Component: () => null,
    //   permissions: [],
    // });

    // 添加自定义设置链接（如果需要）
    // app.addSettingsLink('global', {
    //   intlLabel: {
    //     id: 'custom.settings',
    //     defaultMessage: 'Custom Settings',
    //   },
    //   id: 'custom-settings',
    //   to: '/settings/custom',
    //   Component: () => null,
    //   permissions: [],
    // });
  },
}; 