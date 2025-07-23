#!/bin/bash

echo "🚀 开始部署AI代币系统..."

# 检查是否在正确的目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在strapi-backend-skeleton目录下运行此脚本"
    exit 1
fi

# 1. 安装依赖
echo "📦 安装依赖..."
npm install

# 2. 构建项目
echo "🔨 构建项目..."
npm run build

# 3. 运行数据库迁移
echo "🗄️ 运行数据库迁移..."
npm run strapi database:migrate

# 4. 启动服务器
echo "🚀 启动服务器..."
npm run develop &

# 等待服务器启动
echo "⏳ 等待服务器启动..."
sleep 10

# 5. 初始化代币数据
echo "🎯 初始化代币数据..."
curl -X POST http://localhost:1337/api/ai-tokens/initialize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{}'

# 6. 运行测试
echo "🧪 运行系统测试..."
node test-ai-token-system.js

echo "✅ AI代币系统部署完成！"
echo ""
echo "📋 系统功能:"
echo "  - 5种AI代币随机赠送"
echo "  - 实时价格获取 (CoinGecko/Binance/DexScreener)"
echo "  - 权重随机选择算法"
echo "  - 代币余额管理"
echo "  - 赠送记录追踪"
echo ""
echo "🔗 API端点:"
echo "  - GET /api/ai-tokens/active - 获取活跃代币"
echo "  - GET /api/ai-tokens/:id/price - 获取代币价格"
echo "  - GET /api/ai-tokens/prices/batch - 批量获取价格"
echo "  - GET /api/qianbao-yues/token-balances - 用户代币余额"
echo "  - GET /api/qianbao-yues/token-rewards - 用户赠送记录"
echo ""
echo "💡 提示: 请确保在test-ai-token-system.js中设置正确的用户token进行完整测试" 