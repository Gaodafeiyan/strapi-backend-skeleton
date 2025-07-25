#!/bin/bash

echo "🚨 紧急API修复脚本"
echo "=================="

# 1. 停止Strapi
echo "1. 停止Strapi服务..."
pkill -f "strapi develop" || true
pkill -f "node.*strapi" || true
sleep 2

# 2. 清理所有缓存
echo "2. 清理缓存..."
rm -rf node_modules/.cache
rm -rf dist
rm -rf .tmp
rm -rf build

# 3. 检查API文件结构
echo "3. 检查API文件结构..."
echo "检查content-types:"
find src/api -name "schema.ts" -o -name "schema.json" | head -10

echo "检查routes:"
find src/api -name "*.ts" | grep routes | head -10

# 4. 重新安装依赖
echo "4. 重新安装依赖..."
npm install

# 5. 启动Strapi
echo "5. 启动Strapi..."
echo "请手动运行: npm run develop"
echo ""
echo "启动后运行: node debug_strapi_apis.js"
echo ""

echo "🎯 修复脚本完成" 