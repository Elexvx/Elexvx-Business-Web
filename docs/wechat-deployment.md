# 微信网页分享部署

正式站点：`https://www.elexvx.com`。Vercel Node 函数：`/api/wechat/signature`，区域 `hkg1`。

生产环境需要敏感变量 `WECHAT_APP_ID` 和 `WECHAT_APP_SECRET`。不得将密钥写入源码或 NEXT_PUBLIC 变量。
客户端仅在微信中加载官方 JS-SDK，从页面 Open Graph 与 canonical 元数据设置朋友和朋友圈分享内容。

接口只签名 www.elexvx.com 的 HTTPS URL，保留查询参数并去除片段，响应不缓存且不包含 access_token 或 jsapi_ticket。票据在单实例缓存并合并并发刷新；实例间通过 stable_token 非强制刷新保持兼容。

公众号已配置 JS 接口安全域名。当前使用动态出口 IP，管理员接受 IP 变化后人工更新白名单的方式。曾验证的 IP 不保证其他实例或后续部署使用相同地址。

部署后验证：合法 URL 返回四个签名字段；非本站 URL 返回 400；POST 返回 405。最终需在 iOS/Android 微信中打开正式文章并分享，核对标题、摘要、图片和链接，包含带查询参数的页面。
