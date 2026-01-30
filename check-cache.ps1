# Vercel 缓存配置检查脚本 (PowerShell 版)
# 用于验证 CDN 缓存是否正确配置

param(
    [Parameter(Mandatory=$true)]
    [string]$Domain
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Vercel CDN 缓存配置检查" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ 检查域名: $Domain" -ForegroundColor Green
Write-Host ""

# 检查函数
function Check-Cache {
    param(
        [string]$Path,
        [string]$Description
    )
    
    Write-Host "检查: $Description" -ForegroundColor Yellow
    Write-Host "路径: $Path"
    
    try {
        $response = Invoke-WebRequest -Uri "https://${Domain}${Path}" -Method Head -UseBasicParsing
        
        $cacheControl = $response.Headers["Cache-Control"]
        $vercelCache = $response.Headers["X-Vercel-Cache"]
        $age = $response.Headers["Age"]
        
        Write-Host "Cache-Control: $(if($cacheControl) { $cacheControl } else { 'N/A' })"
        Write-Host "X-Vercel-Cache: $(if($vercelCache) { $vercelCache } else { 'N/A' })" -ForegroundColor $(if($vercelCache -eq "HIT") { 'Green' } else { 'Yellow' })
        Write-Host "Age: $(if($age) { $age } else { 'N/A' })"
    }
    catch {
        Write-Host "❌ 错误: $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

# 执行检查
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "1. 不可变资源 (应该是 HIT + immutable)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Check-Cache "/_astro/index.js" "Astro JS 文件"
Check-Cache "/assets/images/test.jpg" "图片资源"
Check-Cache "/fonts/inter.woff2" "字体文件"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "2. 动态内容 (应该是 HIT + s-maxage)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Check-Cache "/" "主页"
Check-Cache "/blog" "博客页面"
Check-Cache "/company/careers" "公司页面"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "3. 配置文件" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Check-Cache "/robots.txt" "Robots"
Check-Cache "/sitemap.xml" "Sitemap"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "缓存状态说明" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "HIT   - 在 CDN 缓存中（最快）" -ForegroundColor Green
Write-Host "MISS  - 不在 CDN 缓存中（首次或刚清除）" -ForegroundColor Yellow
Write-Host "STALE - 返回过期的缓存版本" -ForegroundColor Yellow
Write-Host ""

Write-Host "✓ 检查完成！" -ForegroundColor Green
