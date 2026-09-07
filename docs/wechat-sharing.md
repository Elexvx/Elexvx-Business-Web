# 官网分享与微信卡片

## 已实现

- 全站右下角分享入口：复制正式链接、浏览器系统分享、生成和下载 PNG 分享卡片。
- 卡片在浏览器本地生成，包含封面、标题、摘要和正式网址二维码；不上传用户信息。微信内可长按保存图片。
- 每页静态 HTML 包含 Open Graph 和 Twitter 标题、摘要、封面及 canonical URL。活动、研究、案例、新闻采用各自封面，其他页面采用默认品牌封面。
- 微信环境在配置签名接口后加载官方 JS-SDK，设置发送给朋友和朋友圈的分享内容；无接口或配置失败时，链接与图片卡片仍可使用。

网页元数据不能保证微信聊天自动显示指定卡片。JS-SDK 需公众号具有网页接口权限，且域名、签名 URL 和凭据配置正确；仍需在真实微信客户端验收。二维码指向正式官网，新文章应在部署后再对外分享。

## 管理员一次性配置

1. 在公众号后台确认具备 JS 接口权限，将 `www.elexvx.com` 加入 **JS 接口安全域名**，按平台要求放置域名验证文件。将签名服务器出口 IP 加入接口 IP 白名单。
2. 将公众号 AppID 和 AppSecret 写入服务器环境变量或密钥管理系统，不要提交 Git，也不要写入任何 `NEXT_PUBLIC_` 变量。若已有统一 access_token 服务，优先接入既有服务，避免多个应用管理同一公众号凭据。
3. 安装项目依赖后，以单进程运行 `npm run wechat:serve`，使用 systemd 等进程管理器保持运行：

```sh
WECHAT_APP_ID=公众号AppID
WECHAT_APP_SECRET=仅服务端保存的AppSecret
WECHAT_ALLOWED_ORIGINS=https://www.elexvx.com
WECHAT_SHARE_PORT=8787
```

服务仅监听 `127.0.0.1`；凭据必须由进程环境注入，以上为配置字段示例。使用 Node.js 22+，运行时需安装 tsx（项目开发依赖）。服务缓存 jsapi_ticket，合并并发刷新；多副本部署应改用共享缓存。

4. 用官网 HTTPS 反向代理转发同源请求，避免跨域和泄露服务端凭据：

```nginx
location = /api/wechat/signature {
    proxy_pass http://127.0.0.1:8787;
    proxy_read_timeout 25s;
}
```

5. 官网构建环境设置 `NEXT_PUBLIC_WECHAT_SIGNATURE_URL=/api/wechat/signature`，重新运行 `npm run build` 并部署静态产物。此变量只是公开接口路径，不是密钥。

## 接口约定与验证

`GET /api/wechat/signature?url=<encodeURIComponent(当前页面完整URL，不含#)>`

成功返回 `{ appId, timestamp, nonceStr, signature }`。仅签名允许的 HTTPS origin，拒绝带用户名或密码的 URL；客户端和服务端都不记录 token、ticket 或密钥。失败返回通用错误，页面降级为复制链接和二维码卡片。

- `npx vitest run tests/wechat-signature.test.ts`：签名、域名校验、URL 编码、缓存与失败恢复。
- `npm run build`：中英文静态分享元数据与页面构建。
- 部署后分别在 iOS 和 Android 微信打开正式文章，使用右上角菜单发送给朋友、朋友圈，核对标题、摘要、图片及链接；还需测试带查询参数 URL。
- AppSecret 不应由浏览器获取，签名接口不应返回 access_token 或 jsapi_ticket。

参考入口：https://developers.weixin.qq.com/doc/service/guide/h5/jssdk.html 。本次工具无法读取官方文档正文，最终公众号权限与设置名称以登录后的官方后台为准。
