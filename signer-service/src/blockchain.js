const { ethers } = require('ethers');
const config = require('./config');
const logger = require('./logger');

class BlockchainService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
    this.signer = new ethers.Wallet(config.blockchain.hotWalletPrivateKey, this.provider);
    
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
      this.signer
    );
    
    logger.info('Blockchain service initialized', {
      rpcUrl: config.blockchain.rpcUrl,
      walletAddress: config.blockchain.hotWalletAddress,
      usdtContract: config.blockchain.usdtContractAddress
    });
  }
  
  // 获取钱包余额
  async getWalletBalance() {
    try {
      const balance = await this.usdtContract.balanceOf(config.blockchain.hotWalletAddress);
      const decimals = await this.usdtContract.decimals();
      const formattedBalance = ethers.formatUnits(balance, decimals);
      
      logger.info('Wallet balance retrieved', { balance: formattedBalance });
      return parseFloat(formattedBalance);
    } catch (error) {
      logger.error('Failed to get wallet balance', { error: error.message });
      throw error;
    }
  }
  
  // 签名USDT转账交易
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
      
      // 检查钱包余额
      const walletBalance = await this.getWalletBalance();
      if (walletBalance < amount) {
        throw new Error(`Insufficient wallet balance. Required: ${amount}, Available: ${walletBalance}`);
      }
      
      // 获取USDT小数位数
      const decimals = await this.usdtContract.decimals();
      const amountWei = ethers.parseUnits(amount.toString(), decimals);
      
      // 创建交易
      const tx = await this.usdtContract.transfer.populateTransaction(toAddress, amountWei);
      
      // 估算gas费用
      const gasEstimate = await this.provider.estimateGas(tx);
      const gasPrice = await this.provider.getFeeData();
      
      // 设置gas限制和价格
      tx.gasLimit = gasEstimate;
      tx.maxFeePerGas = gasPrice.maxFeePerGas;
      tx.maxPriorityFeePerGas = gasPrice.maxPriorityFeePerGas;
      
      logger.info('Withdrawal transaction prepared', {
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
        value: tx.value || '0x0'
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
      const txResponse = await this.signer.sendTransaction(signedTx);
      const receipt = await txResponse.wait();
      
      logger.info('Transaction broadcasted successfully', {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      });
      
      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === 1 ? 'success' : 'failed'
      };
    } catch (error) {
      logger.error('Failed to broadcast transaction', {
        error: error.message,
        signedTx
      });
      throw error;
    }
  }
  
  // 检查交易状态
  async getTransactionStatus(txHash) {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return { status: 'pending', txHash };
      }
      
      return {
        status: receipt.status === 1 ? 'success' : 'failed',
        txHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
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