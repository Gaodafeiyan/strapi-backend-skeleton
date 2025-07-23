'use strict';

/**
 * 添加性能优化索引
 * 提升关键查询的性能
 */
module.exports = {
  async up(knex) {
    console.log('开始添加性能优化索引...');

    // 钱包表索引
    await knex.schema.alterTable('qianbao_yues', (table) => {
      table.index(['yonghu'], 'idx_qianbao_yues_yonghu');
      console.log('✅ 添加钱包表用户索引');
    });

    // 投资订单表索引
    await knex.schema.alterTable('dinggou_dingdans', (table) => {
      table.index(['yonghu'], 'idx_dinggou_dingdans_yonghu');
      table.index(['zhuangtai'], 'idx_dinggou_dingdans_zhuangtai');
      table.index(['yonghu', 'zhuangtai'], 'idx_dinggou_dingdans_yonghu_zhuangtai');
      table.index(['kaishi_shi_jian'], 'idx_dinggou_dingdans_kaishi_shi_jian');
      table.index(['jieshu_shi_jian'], 'idx_dinggou_dingdans_jieshu_shi_jian');
      console.log('✅ 添加投资订单表索引');
    });

    // 邀请奖励表索引
    await knex.schema.alterTable('yaoqing_jianglis', (table) => {
      table.index(['tuijian_ren'], 'idx_yaoqing_jianglis_tuijian_ren');
      table.index(['laiyuan_ren'], 'idx_yaoqing_jianglis_laiyuan_ren');
      table.index(['tuijian_ren', 'laiyuan_ren'], 'idx_yaoqing_jianglis_tuijian_laiyuan');
      console.log('✅ 添加邀请奖励表索引');
    });

    // 抽奖机会表索引
    await knex.schema.alterTable('choujiang_jihuis', (table) => {
      table.index(['yonghu'], 'idx_choujiang_jihuis_yonghu');
      table.index(['zhuangtai'], 'idx_choujiang_jihuis_zhuangtai');
      table.index(['yonghu', 'zhuangtai'], 'idx_choujiang_jihuis_yonghu_zhuangtai');
      table.index(['dao_qi_shi_jian'], 'idx_choujiang_jihuis_dao_qi_shi_jian');
      console.log('✅ 添加抽奖机会表索引');
    });

    // 抽奖记录表索引
    await knex.schema.alterTable('choujiang_ji_lus', (table) => {
      table.index(['yonghu'], 'idx_choujiang_ji_lus_yonghu');
      table.index(['zhuangtai'], 'idx_choujiang_ji_lus_zhuangtai');
      table.index(['chou_jiang_shi_jian'], 'idx_choujiang_ji_lus_chou_jiang_shi_jian');
      console.log('✅ 添加抽奖记录表索引');
    });

    // 商城商品表索引
    await knex.schema.alterTable('shop_products', (table) => {
      table.index(['status'], 'idx_shop_products_status');
      table.index(['category'], 'idx_shop_products_category');
      table.index(['price'], 'idx_shop_products_price');
      table.index(['is_hot'], 'idx_shop_products_is_hot');
      table.index(['is_new'], 'idx_shop_products_is_new');
      table.index(['is_recommend'], 'idx_shop_products_is_recommend');
      console.log('✅ 添加商城商品表索引');
    });

    // 商城订单表索引
    await knex.schema.alterTable('shop_orders', (table) => {
      table.index(['user'], 'idx_shop_orders_user');
      table.index(['status'], 'idx_shop_orders_status');
      table.index(['order_number'], 'idx_shop_orders_order_number');
      table.index(['user', 'status'], 'idx_shop_orders_user_status');
      table.index(['created_at'], 'idx_shop_orders_created_at');
      console.log('✅ 添加商城订单表索引');
    });

    // 购物车表索引
    await knex.schema.alterTable('shop_carts', (table) => {
      table.index(['user'], 'idx_shop_carts_user');
      table.index(['product'], 'idx_shop_carts_product');
      table.index(['user', 'is_selected'], 'idx_shop_carts_user_selected');
      console.log('✅ 添加购物车表索引');
    });

    // 用户表索引
    await knex.schema.alterTable('up_users', (table) => {
      table.index(['yaoqing_ma'], 'idx_up_users_yaoqing_ma');
      table.index(['shangji'], 'idx_up_users_shangji');
      console.log('✅ 添加用户表索引');
    });

    console.log('🎉 所有性能索引添加完成！');
  },

  async down(knex) {
    console.log('开始删除性能优化索引...');

    // 删除钱包表索引
    await knex.schema.alterTable('qianbao_yues', (table) => {
      table.dropIndex(['yonghu'], 'idx_qianbao_yues_yonghu');
    });

    // 删除投资订单表索引
    await knex.schema.alterTable('dinggou_dingdans', (table) => {
      table.dropIndex(['yonghu'], 'idx_dinggou_dingdans_yonghu');
      table.dropIndex(['zhuangtai'], 'idx_dinggou_dingdans_zhuangtai');
      table.dropIndex(['yonghu', 'zhuangtai'], 'idx_dinggou_dingdans_yonghu_zhuangtai');
      table.dropIndex(['kaishi_shi_jian'], 'idx_dinggou_dingdans_kaishi_shi_jian');
      table.dropIndex(['jieshu_shi_jian'], 'idx_dinggou_dingdans_jieshu_shi_jian');
    });

    // 删除邀请奖励表索引
    await knex.schema.alterTable('yaoqing_jianglis', (table) => {
      table.dropIndex(['tuijian_ren'], 'idx_yaoqing_jianglis_tuijian_ren');
      table.dropIndex(['laiyuan_ren'], 'idx_yaoqing_jianglis_laiyuan_ren');
      table.dropIndex(['tuijian_ren', 'laiyuan_ren'], 'idx_yaoqing_jianglis_tuijian_laiyuan');
    });

    // 删除抽奖机会表索引
    await knex.schema.alterTable('choujiang_jihuis', (table) => {
      table.dropIndex(['yonghu'], 'idx_choujiang_jihuis_yonghu');
      table.dropIndex(['zhuangtai'], 'idx_choujiang_jihuis_zhuangtai');
      table.dropIndex(['yonghu', 'zhuangtai'], 'idx_choujiang_jihuis_yonghu_zhuangtai');
      table.dropIndex(['dao_qi_shi_jian'], 'idx_choujiang_jihuis_dao_qi_shi_jian');
    });

    // 删除抽奖记录表索引
    await knex.schema.alterTable('choujiang_ji_lus', (table) => {
      table.dropIndex(['yonghu'], 'idx_choujiang_ji_lus_yonghu');
      table.dropIndex(['zhuangtai'], 'idx_choujiang_ji_lus_zhuangtai');
      table.dropIndex(['chou_jiang_shi_jian'], 'idx_choujiang_ji_lus_chou_jiang_shi_jian');
    });

    // 删除商城商品表索引
    await knex.schema.alterTable('shop_products', (table) => {
      table.dropIndex(['status'], 'idx_shop_products_status');
      table.dropIndex(['category'], 'idx_shop_products_category');
      table.dropIndex(['price'], 'idx_shop_products_price');
      table.dropIndex(['is_hot'], 'idx_shop_products_is_hot');
      table.dropIndex(['is_new'], 'idx_shop_products_is_new');
      table.dropIndex(['is_recommend'], 'idx_shop_products_is_recommend');
    });

    // 删除商城订单表索引
    await knex.schema.alterTable('shop_orders', (table) => {
      table.dropIndex(['user'], 'idx_shop_orders_user');
      table.dropIndex(['status'], 'idx_shop_orders_status');
      table.dropIndex(['order_number'], 'idx_shop_orders_order_number');
      table.dropIndex(['user', 'status'], 'idx_shop_orders_user_status');
      table.dropIndex(['created_at'], 'idx_shop_orders_created_at');
    });

    // 删除购物车表索引
    await knex.schema.alterTable('shop_carts', (table) => {
      table.dropIndex(['user'], 'idx_shop_carts_user');
      table.dropIndex(['product'], 'idx_shop_carts_product');
      table.dropIndex(['user', 'is_selected'], 'idx_shop_carts_user_selected');
    });

    // 删除用户表索引
    await knex.schema.alterTable('up_users', (table) => {
      table.dropIndex(['yaoqing_ma'], 'idx_up_users_yaoqing_ma');
      table.dropIndex(['shangji'], 'idx_up_users_shangji');
    });

    console.log('🎉 所有性能索引删除完成！');
  }
}; 