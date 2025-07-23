const { ethers } = require('ethers');
const config = require('./config');
const logger = require('./logger');

class BlockchainService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
    
    // 移除固定的signer，改为动态选择
    // this.signer = new ethers.Wallet(config.blockchain.hotWalletPrivateKey, this.provider);
    
    // USDT合约ABI (简化版)
    this.usdtAbi = [
      'function transfer(address to, uint256 amount) returns (bool)',
      'function balanceOf(address account) view returns (uint256)',
      'function decimals() view returns (uint8)',
      'function symbol() view returns (string)'
    ];
    
    this.usdtContract = new ethers.Contract(
      config.blockchain.usdtContractAddress,
      this.usdtAbi,
      this.provider
    );
    
    logger.info('Blockchain service initialized', {
      rpcUrl: config.blockchain.rpcUrl,
      usdtContract: config.blockchain.usdtContractAddress
    });
  }
  
  // 获取指定钱包的余额
  async getWalletBalance(walletAddress) {
    try {
      const balance = await this.usdtContract.balanceOf(walletAddress);
      const decimals = await this.usdtContract.decimals();
      const formattedBalance = ethers.formatUnits(balance, decimals);
      
      logger.info('Wallet balance retrieved', { 
        walletAddress,
        balance: formattedBalance 
      });
      return parseFloat(formattedBalance);
    } catch (error) {
      logger.error('Failed to get wallet balance', { 
        walletAddress,
        error: error.message 
      });
      throw error;
    }
  }

  // 获取最佳提现钱包地址
  async getBestWithdrawalWallet(amount) {
    try {
      // 临时使用固定钱包地址进行测试
      // TODO: 等Strapi后台问题解决后，改为从数据库获取
      const testWallets = [
        {
          id: 1,
          address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          private_key: config.blockchain.hotWalletPrivateKey, // 使用配置中的私钥
          balance: 1000.00,
          priority: 50,
          usage_count: 0,
          status: 'active',
          chain: 'BSC',
          asset: 'USDT'
        },
        {
          id: 2,
          address: '0xe3353f75d68f9096aC4A49b4968e56b5DFbd2697',
          private_key: config.blockchain.hotWalletPrivateKey,
          balance: 500.00,
          priority: 40,
          usage_count: 0,
          status: 'active',
          chain: 'BSC',
          asset: 'USDT'
        }
      ];
      
      // 筛选有足够余额的钱包
      const availableWallets = testWallets.filter(wallet => 
        parseFloat(wallet.balance) >= parseFloat(amount)
      );
      
      if (availableWallets.length === 0) {
        throw new Error(`没有余额足够的提现钱包。需要: ${amount} USDT`);
      }
      
      // 按优先级和使用次数排序
      const bestWallet = availableWallets.sort((a, b) => {
        // 优先级高的优先
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        // 使用次数少的优先
        return a.usage_count - b.usage_count;
      })[0];
      
      logger.info('Best withdrawal wallet selected (test mode)', {
        walletAddress: bestWallet.address,
        balance: bestWallet.balance,
        amount,
        priority: bestWallet.priority,
        usageCount: bestWallet.usage_count
      });
      
      return bestWallet;
    } catch (error) {
      logger.error('Failed to get best withdrawal wallet', { error: error.message });
      throw error;
    }
  }
  
  // 签名USDT转账交易 - 使用动态钱包
  async signWithdrawalTransaction(toAddress, amount) {
    try {
      // 验证地址格式
      if (!ethers.isAddress(toAddress)) {
        throw new Error('Invalid recipient address');
      }
      
      // 验证金额
      if (amount < config.security.minWithdrawalAmount || amount > config.security.maxWithdrawalAmount) {
        throw new Error(`Amount must be between ${config.security.minWithdrawalAmount} and ${config.security.maxWithdrawalAmount}`);
      }
      
      // 获取最佳提现钱包
      const bestWallet = await this.getBestWithdrawalWallet(amount);
      
      // 创建该钱包的signer
      const walletSigner = new ethers.Wallet(bestWallet.private_key, this.provider);
      
      // 检查钱包余额
      const walletBalance = await this.getWalletBalance(bestWallet.address);
      if (walletBalance < amount) {
        throw new Error(`Insufficient wallet balance. Required: ${amount}, Available: ${walletBalance}`);
      }
      
      // 使用该钱包的合约实例
      const walletContract = new ethers.Contract(
        config.blockchain.usdtContractAddress,
        this.usdtAbi,
        walletSigner
      );
      
      // 获取USDT小数位数
      const decimals = await this.usdtContract.decimals();
      const amountWei = ethers.parseUnits(amount.toString(), decimals);
      
      // 创建交易
      const tx = await walletContract.transfer.populateTransaction(toAddress, amountWei);
      
      // 估算gas费用
      const gasEstimate = await this.provider.estimateGas(tx);
      const gasPrice = await this.provider.getFeeData();
      
      // 设置gas限制和价格
      tx.gasLimit = gasEstimate;
      tx.maxFeePerGas = gasPrice.maxFeePerGas;
      tx.maxPriorityFeePerGas = gasPrice.maxPriorityFeePerGas;
      
      logger.info('Withdrawal transaction prepared', {
        fromWallet: bestWallet.address,
        toAddress,
        amount,
        gasEstimate: gasEstimate.toString(),
        maxFeePerGas: gasPrice.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas?.toString()
      });
      
      return {
        to: tx.to,
        data: tx.data,
        gasLimit: tx.gasLimit,
        maxFeePerGas: tx.maxFeePerGas,
        maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
        value: tx.value || '0x0',
        fromWallet: bestWallet.address,
        walletId: bestWallet.id
      };
    } catch (error) {
      logger.error('Failed to sign withdrawal transaction', {
        toAddress,
        amount,
        error: error.message
      });
      throw error;
    }
  }
  
  // 广播交易
  async broadcastTransaction(signedTx) {
    try {
      // 创建临时signer来广播交易
      const tempSigner = new ethers.Wallet(config.blockchain.hotWalletPrivateKey, this.provider);
      
      const tx = await tempSigner.sendTransaction(signedTx);
      
      logger.info('Transaction broadcasted', {
        txHash: tx.hash,
        fromWallet: signedTx.fromWallet
      });
      
      return {
        txHash: tx.hash,
        fromWallet: signedTx.fromWallet,
        walletId: signedTx.walletId
      };
    } catch (error) {
      logger.error('Failed to broadcast transaction', {
        error: error.message,
        fromWallet: signedTx.fromWallet
      });
      throw error;
    }
  }
  
  // 获取交易状态
  async getTransactionStatus(txHash) {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return { status: 'pending' };
      }
      
      const status = receipt.status === 1 ? 'success' : 'failed';
      
      logger.info('Transaction status retrieved', {
        txHash,
        status,
        blockNumber: receipt.blockNumber
      });
      
      return {
        status,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice.toString()
      };
    } catch (error) {
      logger.error('Failed to get transaction status', {
        txHash,
        error: error.message
      });
      throw error;
    }
  }
}

module.exports = BlockchainService; 