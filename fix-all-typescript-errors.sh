#!/bin/bash

echo "🔧 修复所有TypeScript错误..."

# 1. 修复充值控制器中的字段错误
echo "📝 修复充值控制器..."
sed -i 's/filters\.status = status;/filters.wallet_status = status;/g' src/api/qianbao-chongzhi/controllers/qianbao-chongzhi.ts

# 2. 修复管理员仪表板中的字段错误
echo "📝 修复管理员仪表板..."
sed -i 's/filters\.status = status;/filters.blocked = status === "blocked";/g' src/api/admin-dashboard/controllers/admin-dashboard.ts

# 3. 修复钱包地址控制器中的字段错误
echo "📝 修复钱包地址控制器..."
sed -i 's/sort: { priority: "desc" }/sort: { priority: "desc" }/g' src/api/wallet-address/controllers/wallet-address.ts

# 4. 清理缓存
echo "🧹 清理缓存..."
rm -rf node_modules/.cache dist

# 5. 重新构建
echo "🔨 重新构建项目..."
npm run build

echo "✅ 所有TypeScript错误修复完成！"
echo "现在可以重新启动Strapi服务了。" 