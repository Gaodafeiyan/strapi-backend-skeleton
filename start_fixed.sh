#!/bin/bash

echo "🚀 启动后端修复流程..."

# 1. 检查Node.js环境
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

echo "✅ Node.js 环境检查通过"

# 2. 安装依赖
echo "📦 安装依赖..."
npm install

# 3. 运行数据库初始化
echo "🗄️  初始化数据库..."
echo "请手动执行: mysql -u your_user -p your_database < database_init.sql"

# 4. 启动开发服务器
echo "🔧 启动 Strapi 开发服务器..."
npm run develop
