#!/bin/bash

# Vercel 缓存配置检查脚本
# 用于验证 CDN 缓存是否正确配置

echo "=========================================="
echo "Vercel CDN 缓存配置检查"
echo "=========================================="
echo ""

# 获取域名
if [ -z "$1" ]; then
    echo "使用方法: bash check-cache.sh <domain>"
    echo "示例: bash check-cache.sh example.vercel.app"
    exit 1
fi

DOMAIN=$1
echo "✓ 检查域名: $DOMAIN"
echo ""

# 检查函数
check_cache() {
    local path=$1
    local description=$2
    
    echo "检查: $description"
    echo "路径: $path"
    
    response=$(curl -s -I "https://${DOMAIN}${path}")
    cache_control=$(echo "$response" | grep -i "^Cache-Control:" | cut -d: -f2- | xargs)
    vercel_cache=$(echo "$response" | grep -i "^X-Vercel-Cache:" | cut -d: -f2- | xargs)
    age=$(echo "$response" | grep -i "^Age:" | cut -d: -f2- | xargs)
    
    echo "Cache-Control: $cache_control"
    echo "X-Vercel-Cache: $vercel_cache"
    echo "Age: ${age:-N/A}"
    echo ""
}

# 执行检查
echo "=========================================="
echo "1. 不可变资源 (应该是 HIT + immutable)"
echo "=========================================="
check_cache "/_astro/index.js" "Astro JS 文件"
check_cache "/assets/images/test.jpg" "图片资源"
check_cache "/fonts/inter.woff2" "字体文件"

echo "=========================================="
echo "2. 动态内容 (应该是 HIT + s-maxage)"
echo "=========================================="
check_cache "/" "主页"
check_cache "/blog" "博客页面"
check_cache "/company/careers" "公司页面"

echo "=========================================="
echo "3. 配置文件"
echo "=========================================="
check_cache "/robots.txt" "Robots"
check_cache "/sitemap.xml" "Sitemap"

echo "=========================================="
echo "缓存状态说明"
echo "=========================================="
echo "HIT   - 在 CDN 缓存中（最快）"
echo "MISS  - 不在 CDN 缓存中（首次或刚清除）"
echo "STALE - 返回过期的缓存版本"
echo ""

echo "✓ 检查完成！"
