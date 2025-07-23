#!/bin/bash

echo "🚀 安全启动Strapi后端..."

# 备份数据库
if [ -f ".tmp/data.db" ]; then
    cp .tmp/data.db .tmp/data.db.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ 数据库已备份"
fi

# 清理缓存
echo "🧹 清理缓存..."
rm -rf node_modules/.cache dist .tmp/migrations/

# 跳过迁移启动
echo "🔧 跳过数据库迁移启动..."
STRAPI_SKIP_MIGRATIONS=true npm run develop

echo "✅ 安全启动完成！" 