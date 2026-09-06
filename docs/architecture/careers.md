# 工作机会

设计参考 https://openai.com/careers/ ：居中首屏、充足留白、分栏文化说明与清晰的职位入口。内容已从旧 Astro 站点的招聘页面和职位数据迁入（旧版源码已删除，可通过 Git 历史查看）；原有职位、薪资、福利文案与投递地址原样迁入，未重新确认招聘状态。

现行入口：src/site/pages/careers.tsx；职位：src/data/jobs.ts；文化与准则：src/data/careers.ts；样式：src/styles/sections/18-careers.css。

/careers 支持关键词、工作地点、职位类型组合筛选。/careers/[id] 展示完整职责、要求及福利；申请按钮沿用旧站飞书表单，不在站内收集简历。新增职位后重新构建，中英文详情路由随数据生成。
