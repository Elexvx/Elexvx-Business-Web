# 网站备案信息

在 `catalog.json` 的 `identity.registrations` 中填写正式备案信息：

- `icp.number`：完整 ICP 备案号。
- `icp.url`：对应的 HTTPS 备案查询链接。
- `publicSecurity.number`：完整公安联网备案号。
- `publicSecurity.url`：对应的 HTTPS 公安备案查询链接。

两项与全站页脚版权信息同行显示，空间不足时自然换行。备案号留空时隐藏该项；仅填写号码时显示文字，同时填写 HTTPS 链接后可点击并在新标签页打开。保存后本地预览自动更新，正式站需重新构建部署。
