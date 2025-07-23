import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::notification.notification', ({ strapi }) => ({
  // 发送邮件通知
  async sendEmail(to: string, subject: string, content: string) {
    try {
      // TODO: 集成邮件服务（如SendGrid、Mailgun等）
      console.log(`📧 邮件通知: ${to} - ${subject}`);
      console.log(`内容: ${content}`);
      
      // 这里应该调用实际的邮件服务
      // await emailService.send({ to, subject, content });
      
      return { success: true, message: '邮件发送成功' };
    } catch (error) {
      console.error('❌ 邮件发送失败:', error);
      throw error;
    }
  },

  // 发送短信通知
  async sendSMS(to: string, message: string) {
    try {
      // TODO: 集成短信服务（如Twilio、阿里云短信等）
      console.log(`📱 短信通知: ${to} - ${message}`);
      
      // 这里应该调用实际的短信服务
      // await smsService.send({ to, message });
      
      return { success: true, message: '短信发送成功' };
    } catch (error) {
      console.error('❌ 短信发送失败:', error);
      throw error;
    }
  },

  // 发送站内消息
  async sendInAppMessage(userId: number, title: string, content: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    try {
      const message = await strapi.entityService.create('api::notification.notification', {
        data: {
          user: userId,
          title,
          content,
          type,
          isRead: false,
        },
      });
      
      console.log(`💬 站内消息: 用户${userId} - ${title}`);
      
      return message;
    } catch (error) {
      console.error('❌ 站内消息发送失败:', error);
      throw error;
    }
  },

  // 投资相关通知
  async notifyInvestmentSuccess(userId: number, orderId: number, amount: string) {
    const title = '投资成功';
    const content = `您的投资订单 #${orderId} 已成功创建，投资金额：${amount} USDT`;
    
    await this.sendInAppMessage(userId, title, content, 'success');
  },

  // 提现相关通知
  async notifyWithdrawalRequest(userId: number, withdrawalId: number, amount: string) {
    const title = '提现申请已提交';
    const content = `您的提现申请 #${withdrawalId} 已提交，提现金额：${amount} USDT，请等待处理`;
    
    await this.sendInAppMessage(userId, title, content, 'info');
  },

  // 邀请奖励通知
  async notifyReferralReward(userId: number, rewardAmount: string, inviteeName: string) {
    const title = '邀请奖励到账';
    const content = `恭喜！您邀请的用户 ${inviteeName} 完成投资，您获得奖励：${rewardAmount} USDT`;
    
    await this.sendInAppMessage(userId, title, content, 'success');
  },

  // 订单到期通知
  async notifyOrderExpired(userId: number, orderId: number) {
    const title = '投资订单已到期';
    const content = `您的投资订单 #${orderId} 已到期，可以申请赎回了`;
    
    await this.sendInAppMessage(userId, title, content, 'warning');
  },
})); 