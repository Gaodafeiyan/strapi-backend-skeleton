'use strict';

/**
 * 安全添加性能优化索引
 * 先检查表是否存在，再添加索引
 */
module.exports = {
  async up(knex) {
    console.log('开始安全添加性能优化索引...');

    // 检查表是否存在的函数
    const tableExists = async (tableName) => {
      try {
        const result = await knex.raw(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}'`);
        return result.length > 0;
      } catch (error) {
        console.log(`检查表 ${tableName} 时出错:`, error.message);
        return false;
      }
    };

    // 检查索引是否存在的函数
    const indexExists = async (tableName, indexName) => {
      try {
        const result = await knex.raw(`PRAGMA index_list(${tableName})`);
        return result.some(index => index.name === indexName);
      } catch (error) {
        return false;
      }
    };

    // 安全添加索引的函数
    const safeAddIndex = async (tableName, indexName, columns) => {
      try {
        const tableExistsResult = await tableExists(tableName);
        if (!tableExistsResult) {
          console.log(`⚠️ 表 ${tableName} 不存在，跳过索引创建`);
          return;
        }

        const indexExistsResult = await indexExists(tableName, indexName);
        if (indexExistsResult) {
          console.log(`⚠️ 索引 ${indexName} 已存在，跳过`);
          return;
        }

        await knex.schema.alterTable(tableName, (table) => {
          if (Array.isArray(columns)) {
            table.index(columns, indexName);
          } else {
            table.index([columns], indexName);
          }
        });
        console.log(`✅ 成功添加索引 ${indexName} 到表 ${tableName}`);
      } catch (error) {
        console.log(`⚠️ 添加索引 ${indexName} 到表 ${tableName} 失败:`, error.message);
      }
    };

    // 添加钱包表索引
    await safeAddIndex('qianbao_yues', 'idx_qianbao_yues_yonghu', 'yonghu');

    // 添加投资订单表索引
    await safeAddIndex('dinggou_dingdans', 'idx_dinggou_dingdans_yonghu', 'yonghu');
    await safeAddIndex('dinggou_dingdans', 'idx_dinggou_dingdans_zhuangtai', 'zhuangtai');
    await safeAddIndex('dinggou_dingdans', 'idx_dinggou_dingdans_yonghu_zhuangtai', ['yonghu', 'zhuangtai']);
    await safeAddIndex('dinggou_dingdans', 'idx_dinggou_dingdans_kaishi_shi_jian', 'kaishi_shi_jian');
    await safeAddIndex('dinggou_dingdans', 'idx_dinggou_dingdans_jieshu_shi_jian', 'jieshu_shi_jian');

    // 添加邀请奖励表索引
    await safeAddIndex('yaoqing_jianglis', 'idx_yaoqing_jianglis_tuijian_ren', 'tuijian_ren');
    await safeAddIndex('yaoqing_jianglis', 'idx_yaoqing_jianglis_laiyuan_ren', 'laiyuan_ren');
    await safeAddIndex('yaoqing_jianglis', 'idx_yaoqing_jianglis_tuijian_laiyuan', ['tuijian_ren', 'laiyuan_ren']);

    // 添加抽奖机会表索引
    await safeAddIndex('choujiang_jihuis', 'idx_choujiang_jihuis_yonghu', 'yonghu');
    await safeAddIndex('choujiang_jihuis', 'idx_choujiang_jihuis_zhuangtai', 'zhuangtai');
    await safeAddIndex('choujiang_jihuis', 'idx_choujiang_jihuis_yonghu_zhuangtai', ['yonghu', 'zhuangtai']);
    await safeAddIndex('choujiang_jihuis', 'idx_choujiang_jihuis_dao_qi_shi_jian', 'dao_qi_shi_jian');

    // 添加抽奖记录表索引
    await safeAddIndex('choujiang_ji_lus', 'idx_choujiang_ji_lus_yonghu', 'yonghu');
    await safeAddIndex('choujiang_ji_lus', 'idx_choujiang_ji_lus_zhuangtai', 'zhuangtai');
    await safeAddIndex('choujiang_ji_lus', 'idx_choujiang_ji_lus_chou_jiang_shi_jian', 'chou_jiang_shi_jian');

    // 添加商城相关表索引
    await safeAddIndex('shop_products', 'idx_shop_products_status', 'status');
    await safeAddIndex('shop_products', 'idx_shop_products_category', 'category');
    await safeAddIndex('shop_products', 'idx_shop_products_price', 'price');
    await safeAddIndex('shop_products', 'idx_shop_products_is_hot', 'is_hot');
    await safeAddIndex('shop_products', 'idx_shop_products_is_new', 'is_new');
    await safeAddIndex('shop_products', 'idx_shop_products_is_recommend', 'is_recommend');

    await safeAddIndex('shop_orders', 'idx_shop_orders_user', 'user');
    await safeAddIndex('shop_orders', 'idx_shop_orders_status', 'status');
    await safeAddIndex('shop_orders', 'idx_shop_orders_order_number', 'order_number');
    await safeAddIndex('shop_orders', 'idx_shop_orders_user_status', ['user', 'status']);
    await safeAddIndex('shop_orders', 'idx_shop_orders_created_at', 'created_at');

    await safeAddIndex('shop_carts', 'idx_shop_carts_user', 'user');
    await safeAddIndex('shop_carts', 'idx_shop_carts_product', 'product');
    await safeAddIndex('shop_carts', 'idx_shop_carts_user_selected', ['user', 'is_selected']);

    // 添加用户表索引
    await safeAddIndex('up_users', 'idx_up_users_yaoqing_ma', 'yaoqing_ma');
    await safeAddIndex('up_users', 'idx_up_users_shangji', 'shangji');

    console.log('🎉 安全索引添加完成！');
  },

  async down(knex) {
    console.log('开始删除性能优化索引...');

    // 删除索引的函数
    const safeDropIndex = async (tableName, indexName) => {
      try {
        await knex.raw(`DROP INDEX IF EXISTS ${indexName}`);
        console.log(`✅ 成功删除索引 ${indexName}`);
      } catch (error) {
        console.log(`⚠️ 删除索引 ${indexName} 失败:`, error.message);
      }
    };

    // 删除所有索引
    await safeDropIndex('qianbao_yues', 'idx_qianbao_yues_yonghu');
    await safeDropIndex('dinggou_dingdans', 'idx_dinggou_dingdans_yonghu');
    await safeDropIndex('dinggou_dingdans', 'idx_dinggou_dingdans_zhuangtai');
    await safeDropIndex('dinggou_dingdans', 'idx_dinggou_dingdans_yonghu_zhuangtai');
    await safeDropIndex('dinggou_dingdans', 'idx_dinggou_dingdans_kaishi_shi_jian');
    await safeDropIndex('dinggou_dingdans', 'idx_dinggou_dingdans_jieshu_shi_jian');
    await safeDropIndex('yaoqing_jianglis', 'idx_yaoqing_jianglis_tuijian_ren');
    await safeDropIndex('yaoqing_jianglis', 'idx_yaoqing_jianglis_laiyuan_ren');
    await safeDropIndex('yaoqing_jianglis', 'idx_yaoqing_jianglis_tuijian_laiyuan');
    await safeDropIndex('choujiang_jihuis', 'idx_choujiang_jihuis_yonghu');
    await safeDropIndex('choujiang_jihuis', 'idx_choujiang_jihuis_zhuangtai');
    await safeDropIndex('choujiang_jihuis', 'idx_choujiang_jihuis_yonghu_zhuangtai');
    await safeDropIndex('choujiang_jihuis', 'idx_choujiang_jihuis_dao_qi_shi_jian');
    await safeDropIndex('choujiang_ji_lus', 'idx_choujiang_ji_lus_yonghu');
    await safeDropIndex('choujiang_ji_lus', 'idx_choujiang_ji_lus_zhuangtai');
    await safeDropIndex('choujiang_ji_lus', 'idx_choujiang_ji_lus_chou_jiang_shi_jian');
    await safeDropIndex('shop_products', 'idx_shop_products_status');
    await safeDropIndex('shop_products', 'idx_shop_products_category');
    await safeDropIndex('shop_products', 'idx_shop_products_price');
    await safeDropIndex('shop_products', 'idx_shop_products_is_hot');
    await safeDropIndex('shop_products', 'idx_shop_products_is_new');
    await safeDropIndex('shop_products', 'idx_shop_products_is_recommend');
    await safeDropIndex('shop_orders', 'idx_shop_orders_user');
    await safeDropIndex('shop_orders', 'idx_shop_orders_status');
    await safeDropIndex('shop_orders', 'idx_shop_orders_order_number');
    await safeDropIndex('shop_orders', 'idx_shop_orders_user_status');
    await safeDropIndex('shop_orders', 'idx_shop_orders_created_at');
    await safeDropIndex('shop_carts', 'idx_shop_carts_user');
    await safeDropIndex('shop_carts', 'idx_shop_carts_product');
    await safeDropIndex('shop_carts', 'idx_shop_carts_user_selected');
    await safeDropIndex('up_users', 'idx_up_users_yaoqing_ma');
    await safeDropIndex('up_users', 'idx_up_users_shangji');

    console.log('🎉 所有性能索引删除完成！');
  }
}; 