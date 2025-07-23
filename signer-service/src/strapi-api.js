const axios = require('axios');
const config = require('./config');
const logger = require('./logger');

class StrapiApiService {
  constructor() {
    this.apiUrl = config.strapi.apiUrl;
    this.apiToken = config.strapi.apiToken;
    
    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiToken && { 'Authorization': `Bearer ${this.apiToken}` })
      }
    });
    
    logger.info('Strapi API service initialized', { apiUrl: this.apiUrl });
  }
  
  // 更新提现状态
  async updateWithdrawalStatus(withdrawalId, status, txHash = null) {
    try {
      const updateData = { zhuangtai: status };
      if (txHash) {
        updateData.txHash = txHash;
      }
      
      const response = await this.client.put(`/api/qianbao-tixians/${withdrawalId}`, {
        data: updateData
      });
      
      logger.info('Withdrawal status updated', {
        withdrawalId,
        status,
        txHash,
        response: response.data
      });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to update withdrawal status', {
        withdrawalId,
        status,
        txHash,
        error: error.response?.data || error.message
      });
      throw error;
    }
  }
  
  // 获取提现详情
  async getWithdrawal(withdrawalId) {
    try {
      const response = await this.client.get(`/api/qianbao-tixians/${withdrawalId}?populate=yonghu`);
      
      logger.info('Withdrawal details retrieved', {
        withdrawalId,
        data: response.data
      });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to get withdrawal details', {
        withdrawalId,
        error: error.response?.data || error.message
      });
      throw error;
    }
  }
  
  // 处理提现失败 - 返还余额
  async handleWithdrawalFailure(withdrawalId) {
    try {
      // 直接更新状态为failed，不调用不存在的handle-failure端点
      const response = await this.client.put(`/api/qianbao-tixians/${withdrawalId}`, {
        data: { zhuangtai: 'failed' }
      });
      
      logger.info('Withdrawal failure handled', {
        withdrawalId,
        response: response.data
      });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to handle withdrawal failure', {
        withdrawalId,
        error: error.response?.data || error.message
      });
      throw error;
    }
  }
  
  // 获取待处理的提现列表
  async getPendingWithdrawals() {
    try {
      const response = await this.client.get('/api/qianbao-tixians?filters[zhuangtai]=pending&populate=yonghu');
      
      logger.info('Pending withdrawals retrieved', {
        count: response.data.data?.length || 0
      });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to get pending withdrawals', {
        error: error.response?.data || error.message
      });
      throw error;
    }
  }
  
  // 获取已广播的提现列表
  async getBroadcastedWithdrawals() {
    try {
      const response = await this.client.get('/api/qianbao-tixians?filters[zhuangtai]=broadcasted&populate=yonghu');
      
      logger.info('Broadcasted withdrawals retrieved', {
        count: response.data.data?.length || 0
      });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to get broadcasted withdrawals', {
        error: error.response?.data || error.message
      });
      throw error;
    }
  }
  
  // 发送Webhook通知
  async sendWebhookNotification(type, data) {
    try {
      const response = await this.client.post('/api/webhook/transaction', {
        type,
        data
      });
      
      logger.info('Webhook notification sent', {
        type,
        data,
        response: response.data
      });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to send webhook notification', {
        type,
        data,
        error: error.response?.data || error.message
      });
      throw error;
    }
  }

  // 更新钱包余额
  async updateWalletBalance(walletId, newBalance) {
    try {
      const response = await this.client.put(`/api/wallet-addresses/${walletId}`, {
        data: { 
          balance: newBalance,
          last_used_at: new Date().toISOString()
        }
      });

      logger.info('Wallet balance updated', {
        walletId,
        newBalance,
        response: response.data
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to update wallet balance', {
        walletId,
        newBalance,
        error: error.response?.data || error.message
      });
      throw error;
    }
  },

  // 获取钱包地址详情
  async getWalletAddress(walletId) {
    try {
      const response = await this.client.get(`/api/wallet-addresses/${walletId}`);
      
      logger.info('Wallet address retrieved', {
        walletId,
        data: response.data
      });
      
      return response.data;
    } catch (error) {
      logger.error('Failed to get wallet address', {
        walletId,
        error: error.response?.data || error.message
      });
      throw error;
    }
  }
}

module.exports = StrapiApiService; 