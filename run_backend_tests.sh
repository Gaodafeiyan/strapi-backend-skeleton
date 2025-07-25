#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 后端代码排查和API测试启动脚本${NC}"
echo -e "${BLUE}================================${NC}"

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js未安装，请先安装Node.js${NC}"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm未安装，请先安装npm${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js版本: $(node --version)${NC}"
echo -e "${GREEN}✅ npm版本: $(npm --version)${NC}"

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 安装项目依赖...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 依赖安装失败${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ 依赖安装完成${NC}"
else
    echo -e "${GREEN}✅ 依赖已存在${NC}"
fi

# 检查必要的文件是否存在
if [ ! -f "backend_code_analysis.js" ]; then
    echo -e "${RED}❌ 未找到backend_code_analysis.js文件${NC}"
    exit 1
fi

if [ ! -f "comprehensive_api_test.js" ]; then
    echo -e "${RED}❌ 未找到comprehensive_api_test.js文件${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 所有必要文件已找到${NC}"

# 创建测试结果目录
mkdir -p test_results
echo -e "${CYAN}📁 创建测试结果目录${NC}"

# 第一步：运行代码分析
echo -e "${MAGENTA}\n🔍 第一步：开始后端代码结构分析${NC}"
echo -e "${MAGENTA}================================${NC}"

node backend_code_analysis.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 代码分析完成${NC}"
else
    echo -e "${RED}❌ 代码分析失败${NC}"
    exit 1
fi

# 等待用户确认是否继续
echo -e "${YELLOW}\n是否继续运行API测试？(y/n)${NC}"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "${GREEN}继续运行API测试...${NC}"
else
    echo -e "${YELLOW}跳过API测试${NC}"
    exit 0
fi

# 第二步：运行API测试
echo -e "${MAGENTA}\n🧪 第二步：开始API接口测试${NC}"
echo -e "${MAGENTA}==============================${NC}"

# 检查服务器是否可访问
echo -e "${CYAN}🔍 检查服务器连接性...${NC}"
if command -v curl &> /dev/null; then
    if curl -s --connect-timeout 5 http://118.107.4.158:1337 > /dev/null; then
        echo -e "${GREEN}✅ 服务器连接正常${NC}"
    else
        echo -e "${RED}❌ 无法连接到服务器，请检查服务器状态${NC}"
        echo -e "${YELLOW}是否继续测试？(y/n)${NC}"
        read -r continue_response
        if [[ ! "$continue_response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            exit 1
        fi
    fi
else
    echo -e "${YELLOW}⚠️ 未安装curl，跳过连接性检查${NC}"
fi

# 运行API测试
node comprehensive_api_test.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ API测试完成${NC}"
else
    echo -e "${RED}❌ API测试失败${NC}"
    exit 1
fi

# 生成综合报告
echo -e "${MAGENTA}\n📊 生成综合测试报告${NC}"
echo -e "${MAGENTA}======================${NC}"

# 查找最新的报告文件
latest_analysis_report=$(ls -t backend_analysis_report_*.json 2>/dev/null | head -1)
latest_api_report=$(ls -t api_test_report_*.json 2>/dev/null | head -1)

if [ -n "$latest_analysis_report" ] && [ -n "$latest_api_report" ]; then
    echo -e "${GREEN}✅ 找到分析报告: $latest_analysis_report${NC}"
    echo -e "${GREEN}✅ 找到API测试报告: $latest_api_report${NC}"
    
    # 创建综合报告
    timestamp=$(date +"%Y%m%d_%H%M%S")
    summary_file="test_results/comprehensive_report_${timestamp}.md"
    
    cat > "$summary_file" << EOF
# 后端代码排查和API测试综合报告

生成时间: $(date)

## 测试概述
- 代码分析报告: $latest_analysis_report
- API测试报告: $latest_api_report

## 快速查看
- 代码分析结果: 查看 $latest_analysis_report
- API测试结果: 查看 $latest_api_report

## 下一步行动
1. 查看详细报告文件
2. 根据测试结果修复问题
3. 重新运行测试验证修复效果

EOF

    echo -e "${GREEN}✅ 综合报告已生成: $summary_file${NC}"
else
    echo -e "${YELLOW}⚠️ 未找到完整的报告文件${NC}"
fi

echo -e "${GREEN}\n🎉 所有测试完成！${NC}"
echo -e "${CYAN}📁 测试结果保存在 test_results/ 目录中${NC}"
echo -e "${CYAN}📄 详细报告文件已生成${NC}"

# 显示文件大小信息
echo -e "${MAGENTA}\n📈 报告文件信息:${NC}"
if [ -n "$latest_analysis_report" ]; then
    size=$(du -h "$latest_analysis_report" | cut -f1)
    echo -e "${CYAN}   代码分析报告: $latest_analysis_report ($size)${NC}"
fi
if [ -n "$latest_api_report" ]; then
    size=$(du -h "$latest_api_report" | cut -f1)
    echo -e "${CYAN}   API测试报告: $latest_api_report ($size)${NC}"
fi

echo -e "${GREEN}\n✅ 脚本执行完成！${NC}" 