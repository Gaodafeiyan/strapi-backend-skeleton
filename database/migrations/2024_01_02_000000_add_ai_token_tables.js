'use strict';

/**
 * 添加AI代币相关表
 */
module.exports = {
  async up(knex) {
    // 创建AI代币表
    await knex.schema.createTable('ai_tokens', (table) => {
      table.increments('id').primary();
      table.string('name', 100).notNullable().unique();
      table.string('symbol', 20).notNullable().unique();
      table.string('contract_address', 100);
      table.enum('price_source', ['coingecko', 'binance', 'dexscreener']).notNullable();
      table.string('price_api_id', 100);
      table.integer('weight').defaultTo(20).unsigned();
      table.boolean('is_active').defaultTo(true);
      table.string('logo_url', 255);
      table.text('description');
      table.timestamps(true, true);
      
      // 索引
      table.index(['is_active']);
      table.index(['symbol']);
    });

    // 创建代币赠送记录表
    await knex.schema.createTable('token_reward_records', (table) => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable();
      table.integer('order_id').unsigned().notNullable();
      table.integer('token_id').unsigned().notNullable();
      table.decimal('amount', 20, 8).notNullable();
      table.decimal('usdt_value', 10, 2).notNullable();
      table.decimal('token_price', 10, 8).notNullable();
      table.timestamps(true, true);
      
      // 外键约束
      table.foreign('user_id').references('users-permissions_user.id').onDelete('CASCADE');
      table.foreign('order_id').references('dinggou_dingdans.id').onDelete('CASCADE');
      table.foreign('token_id').references('ai_tokens.id').onDelete('CASCADE');
      
      // 索引
      table.index(['user_id']);
      table.index(['order_id']);
      table.index(['token_id']);
      table.index(['created_at']);
    });

    // 为钱包余额表添加AI代币余额字段
    await knex.schema.alterTable('qianbao_yues', (table) => {
      table.json('ai_token_balances').defaultTo('{}');
    });

    // 插入初始代币数据
    const tokens = [
      {
        name: 'Render',
        symbol: 'RNDR',
        contract_address: 'RNDR1A97ZatuqTAT2bZn1r4KwQisLvVfwJQfqWwaCSm',
        price_source: 'coingecko',
        price_api_id: 'render-token',
        weight: 30,
        description: 'Render Network - 去中心化GPU渲染网络'
      },
      {
        name: 'Nosana',
        symbol: 'NOS',
        contract_address: '4BC2PiK9Y319bPQKHbLbHu86xdksJLAuBTBDPc6QcKAS',
        price_source: 'coingecko',
        price_api_id: 'nosana',
        weight: 25,
        description: 'Nosana - 去中心化CI/CD平台'
      },
      {
        name: 'Synesis One',
        symbol: 'SNS',
        contract_address: 'SNS5czn4ZyjtHNpgJyHCN33zBYFWvLJoYxx3JrqkjvGc',
        price_source: 'coingecko',
        price_api_id: 'synesis-one',
        weight: 20,
        description: 'Synesis One - AI数据标注平台'
      },
      {
        name: 'Numeraire',
        symbol: 'NMR',
        contract_address: 'NMR1gd2nautLcWTPZLY625YCHP6oVVNqs8s4ET3SkMsv',
        price_source: 'coingecko',
        price_api_id: 'numerai',
        weight: 15,
        description: 'Numeraire - 去中心化对冲基金'
      },
      {
        name: 'ChainGPT',
        symbol: 'CGPT',
        contract_address: 'CGPT1Ws3jh9E82fUmX9Zykp17fjM5pVp4SGbXw7U7Doo',
        price_source: 'coingecko',
        price_api_id: 'chaingpt',
        weight: 10,
        description: 'ChainGPT - AI驱动的区块链工具'
      }
    ];

    for (const token of tokens) {
      await knex('ai_tokens').insert({
        ...token,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
  },

  async down(knex) {
    // 删除代币赠送记录表
    await knex.schema.dropTableIfExists('token_reward_records');
    
    // 删除AI代币表
    await knex.schema.dropTableIfExists('ai_tokens');
    
    // 移除钱包余额表的AI代币余额字段
    await knex.schema.alterTable('qianbao_yues', (table) => {
      table.dropColumn('ai_token_balances');
    });
  }
}; 