export type CaseStudy = {
  slug: string;
  title: string;
  titleEn: string;
  excerpt: string;
  excerptEn: string;
  publishedAt: string;
  author: string;
  keywords: string[];
  keywordsEn: string[];
  category: string;
  categoryEn: string;
  status: 'draft' | 'published';
  cover: string;
  body: string;
  bodyEn: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: 'kaicheng-international-journal-publishing-system',
    title: 'ELEXVX 期刊管理与出版协同系统助力凯城国际',
    titleEn: 'ELEXVX Journal Management & Publishing Collaboration System for Kaicheng International',
    excerpt:
      'ELEXVX 期刊管理与出版协同系统已在凯城国际出版社使用，围绕海外出版工作连接期刊策划、稿件流转、编辑协作、元数据整理与多语种发布。',
    excerptEn:
      'ELEXVX Journal Management & Publishing Collaboration System is now used by Kaicheng International Publishing House to connect journal planning, manuscript workflows, editorial collaboration, metadata, and multilingual release for overseas publishing.',
    publishedAt: '2026-09-07',
    author: 'Elexvx',
    keywords: ['期刊管理', '海外出版', '编辑协作', '多语种发布', '出版数字化'],
    keywordsEn: [
      'journal management',
      'overseas publishing',
      'editorial collaboration',
      'multilingual release',
      'publishing systems',
    ],
    category: '出版数字化',
    categoryEn: 'Publishing systems',
    status: 'published',
    cover: '/visuals/ai-safety-gradient.jpg',
    body: `## 项目背景

凯城国际出版社持续推进海外出版业务，需要把期刊选题、作者沟通、审稿协作、编辑加工、排版校对、元数据整理与海外发行安排组织到一条清晰的工作链路中。原有流程分散在邮件、表格和即时沟通工具里，参与者很难在同一个页面看到稿件当前状态、下一步责任人和待处理事项。

ELEXVX 围绕“让出版流程可追踪，让协作信息可复用”的目标，为凯城国际出版社提供期刊管理与出版协同系统，帮助团队把一次次出版任务沉淀为可持续运行的工作方法。

![ELEXVX 期刊管理与出版协同系统项目视觉](/visuals/ai-safety-gradient.jpg)

图 1 ELEXVX 期刊管理与出版协同系统项目视觉。

## 从期刊管理到海外发行

系统以期刊和出版项目为基本单元，为每个项目建立统一的资料空间、人员关系和流程状态。编辑可以从选题或征稿开始创建任务，逐步记录稿件进入、初审、外审、修改、终审、排版和发布等节点；管理人员则可以按期刊、批次、责任人和时间范围查看整体进度。

海外出版还需要处理语言版本、作者信息、摘要关键词、栏目分类、版权说明和发行渠道等资料。系统将这些信息作为结构化字段管理，减少重复录入，也让不同版本之间的对应关系更容易被复核。

## 系统如何协作

### 1. 统一项目台账

每本期刊、每一期内容和每项出版任务都有独立记录，编辑团队可以在一个入口中查看稿件、作者、审稿人、文件和时间节点。重要变更保留操作记录，方便在多人协作时回看处理过程。

### 2. 让流程状态清楚可见

系统把出版工作拆分为可理解的阶段，并为不同角色显示对应的待办事项。编辑关注稿件质量和沟通，排版人员关注文件与校对，项目负责人关注批次进度和发布准备，所有人都以同一套状态作为协作依据。

### 3. 支持多语种资料准备

围绕海外发行需要的英文标题、摘要、关键词、作者简介和版权信息，系统提供集中整理与校对的位置。中文原稿、英文版本和最终发布资料保持关联，便于在交付前完成逐项检查。

### 4. 连接交付与发布

出版文件、封面、目录、元数据和渠道资料按照项目归档。系统通过清单提醒团队完成发布前检查，将编辑完成与正式发行之间的交接变成可确认的步骤。

## 交付重点

本次合作重点不在于增加一个孤立的后台页面，而在于把出版社已有的工作经验整理成可以共同使用的系统语言。项目从流程访谈和角色梳理开始，逐步明确数据对象、权限边界、状态变化和文件关系，再根据团队的实际节奏安排模块建设与验证。

在系统落地过程中，ELEXVX 与凯城国际出版社围绕真实出版任务进行走查，持续调整字段、筛选条件、提醒方式和协作入口，让系统贴合编辑团队的日常工作，而不是要求团队改变全部工作习惯来适应工具。

## 项目价值

通过期刊管理、编辑协作、资料校验和发布准备的统一，凯城国际出版社可以更清楚地掌握海外出版项目的进展与责任边界。出版资料从分散文件变成有上下文的项目记录，后续的新一期、新期刊或新的海外渠道也可以沿用已经验证过的流程。

对 ELEXVX 而言，这次合作进一步验证了“从复杂工作流中提炼可复用系统”的方法：先理解业务现场，再组织数据和权限，最后用持续反馈推动产品化。系统的具体功能会随着凯城国际出版社的出版计划和海外合作范围继续演进。

> 本案例为官网展示稿，具体合作范围、交付版本和后续计划以双方确认的信息为准。
`,
    bodyEn: `## Project context

Kaicheng International Publishing House is expanding its overseas publishing work and needs a clear workflow that connects journal planning, author communication, peer-review coordination, editorial processing, proofreading, metadata preparation, and international release. The existing work was spread across email, spreadsheets, and messaging tools, making it difficult for everyone to see the current manuscript status, the next owner, and outstanding tasks in one place.

ELEXVX provides the Journal Management & Publishing Collaboration System now used by Kaicheng International Publishing House. Built around one goal—to make the publishing workflow traceable and collaboration information reusable—the system turns individual publishing tasks into a working method that the team can continue to use.

![ELEXVX journal management and publishing collaboration system for Kaicheng International](/visuals/ai-safety-gradient.jpg)

Figure 1. Visual for the ELEXVX journal management and publishing collaboration system used by Kaicheng International.

## From journal management to international release

The system treats journals and publishing projects as the primary units. Each project has a shared space for materials, people, and workflow status. Editors can create a task from a topic or call for papers and record each stage from submission, initial review, peer review, revision, and final review through layout and release. Managers can view progress by journal, issue, owner, or date range.

International publishing also requires language versions, author information, abstracts, keywords, section categories, copyright statements, and channel materials. The system manages these items as structured fields so the team can reduce duplicate entry and review the relationships between versions more easily.

## How the system supports collaboration

### 1. One project register

Every journal, issue, and publishing task has its own record. Editors can review manuscripts, authors, reviewers, files, and milestones from one entry point. Important changes retain an activity history so the team can revisit decisions in a multi-person workflow.

### 2. Visible workflow status

The system breaks publishing into understandable stages and shows each role its relevant tasks. Editors focus on manuscript quality and communication, production staff focus on files and proofreading, and project owners focus on issue progress and release readiness. Everyone works from the same status model.

### 3. Multilingual preparation

For English titles, abstracts, keywords, author biographies, and copyright information required for overseas release, the system provides a shared place for preparation and review. Chinese source material, English versions, and final publishing assets remain linked so the team can check them item by item before delivery.

### 4. Connected delivery and release

Publishing files, covers, tables of contents, metadata, and channel materials are archived by project. A release checklist helps the team confirm each handoff between editorial completion and formal publication.

## Delivery focus

The work was not about adding an isolated administration screen. It was about translating the publisher's existing experience into a shared system language. The project began with workflow interviews and role mapping, then clarified data objects, permission boundaries, status transitions, and file relationships before modules were built and reviewed against the team's actual rhythm.

ELEXVX and Kaicheng International Publishing House walked through real publishing tasks during implementation and refined fields, filters, reminders, and collaboration entry points. This kept the system close to the editorial team's daily work instead of asking the team to replace its entire working method for the tool.

## Project value

By bringing journal management, editorial collaboration, material checks, and release preparation together, Kaicheng International Publishing House can see the progress and ownership boundaries of overseas publishing projects more clearly. Publishing materials become contextual project records instead of disconnected files, and the validated workflow can be reused for new issues, journals, and international channels.

For ELEXVX, the collaboration further validates a method for turning complex workflows into reusable systems: understand the working context first, organize data and permissions next, and use continuous feedback to guide productization. The system will continue to evolve with Kaicheng International Publishing House's publishing schedule and international partnerships.

> This is a website case-study draft. The specific scope, delivered version, and follow-up plan remain subject to confirmation by both parties.
`,
  },
];

export const publishedCaseStudies = caseStudies.filter((item) => item.status === 'published');
