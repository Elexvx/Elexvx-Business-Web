import type { HumiteReleaseContent } from '../src/data/humite-content.empty';

const homeIntro = {
        release: 'Humite · 书林',
        title: '让好书相聚，让阅读归于自己。',
        description:
          'Humite 是面向家庭与个人的自托管数字藏书系统，将 NAS 中的 EPUB 与 PDF 映射进三维明式书楼「观文藏阁」，支持分类检索、在线阅读与划线批注。家人共享藏书，每个人拥有独立的阅读进度与私人笔记。',
        action: '了解 Humite',
        actionHref: '/products/humite',
        showcase: {
          path: '/visuals/humite-library/index.html?theme=light',
          label: 'Humite · 观文藏阁',
          title: 'Humite 观文藏阁 3D 漫游（模拟）',
        },
      };

export const humiteContent: HumiteReleaseContent = {
  intro: homeIntro,
  card: {
              name: 'Humite',
              slug: 'humite',
              image: '/products/humite-cover-textured.png',
              href: '/products/humite',
              category: '家庭数字藏书阁',
              description:
                '开源、自托管的家庭数字藏书阁与三维书楼系统，支持 NAS 书目纳管、EPUB / PDF 阅读，以及账号隔离的进度与笔记。',
            },
  showcase: {
        hero: {
          eyebrow: '家庭数字藏书阁',
          title: 'Humite',
          subtitle: '让好书相聚，让阅读归于自己。',
          description:
            'Humite（书林）是面向家庭与个人的自托管数字藏书阁，将散落在 NAS 中的 EPUB 与 PDF 1:1 映射进两层明式三维藏书楼「观文藏阁」。全家人共享同一套书目典藏，每个人的阅读进度、划线批注与私人笔记严格按账号隔离。',
          actions: [
            { label: '访问 GitHub', href: 'https://github.com/johntao2004/Silvae' },
          ],
          imageAlt: 'Humite',
          imageSize: 1254,
        },
        pillars: {
          titleId: 'humite-pillars-title',
          eyebrow: '核心能力',
          title: '典藏入林、观文藏阁与各得其所',
          threeColumns: true,
          items: [
            {
              title: '典藏入林',
              description:
                '受控 NAS 馆藏与书目编排，原生支持 EPUB 与 PDF、Thema 1.6 学科分类、SHA-256 去重校验与 2:3 封面裁切；写操作强制预览指纹并保留回滚保护，绝不静默改写原件。',
            },
            {
              title: '观文藏阁',
              description:
                '内置 Three.js 打造的二层明式虚拟书楼，将真实馆藏 1:1 映射上架；结合出版级 Web 阅读器、网页文章剪藏「文钞馆」与全馆知识图谱网络，让藏书真正可观可读。',
            },
            {
              title: '各得其所',
              description:
                '主人、管理员与成员三级权限体系让全家共享同一套书库；个人阅读进度、多色高亮划线与独立笔记严格按账号隔离，另设配备 TOTP 二次验证的加密秘阁空间。',
            },
          ],
        },
        showcase: {
          id: 'humite-library',
          titleId: 'humite-library-title',
          eyebrow: '3D MING LIBRARY',
          title: '观文藏阁 · 二层明式三维书楼',
          description:
            '直接同步自 Humite 内嵌的观文藏阁三维场景，支持第一人称步行漫游、学科分类书架定位、四时晨昏天色切换、御碑拓片导览与今日读书签抽取。',
          frameLabel: homeIntro.showcase.label,
          framePath: homeIntro.showcase.path,
          frameTitle: homeIntro.showcase.title,
        },
        stack: {
          titleId: 'humite-stack-title',
          title: '从三维空间到持久化的完整技术栈',
          items: [
            {
              label: '前端界面与状态',
              technologies: 'React 19 · TypeScript · Vite',
              description:
                '使用 React 19、TypeScript 与 Vite 构建应用，配合 Ant Design 与 React Query 管理书目检索、阅读台与客户端缓存。',
            },
            {
              label: '阅读与写作引擎',
              technologies: 'epub.js · PDF.js · TipTap',
              description:
                '提供 EPUB 与 PDF 双引擎纸感阅读器、自定义中文字体排版、TipTap 富文本与 Markdown 笔记编辑，以及网页文章采集剪藏。',
            },
            {
              label: '三维与图谱可视化',
              technologies: 'Three.js · AntV G2 · Graphs',
              description: '驱动「观文藏阁」二层明式木构渲染与实体书册排架，并构建全馆知识关联图谱与个人阅读统计图表。',
            },
            {
              label: '服务端与数据库',
              technologies: 'Java 21 · Spring Boot · jOOQ · PostgreSQL 18',
              description:
                '基于 Java 21 与 Spring Boot 搭建模块化单体服务，通过 Spring Session JDBC、Flyway 与 jOOQ 配合 PostgreSQL 18 保证类型安全与查询性能。',
            },
            {
              label: '文档处理与部署',
              technologies: 'PDFBox · Batik · Docker Compose',
              description:
                '利用 Apache PDFBox 与 Batik 解析文档元信息及封面渲染，通过单镜像多运行角色配合 Docker Compose 实现一键自托管启动。',
            },
          ],
        },
        architecture: {
          titleId: 'humite-diagram-title',
          title: '从客户端工作台，到多角色自托管容器',
          description:
            'Web 端与观文藏阁通过同一套 OpenAPI 契约访问 API 服务；异步入库与批量任务由 Worker 进程独立承接，业务数据与文件指纹统一沉淀在 PostgreSQL 与 NAS 挂载目录中。',
          clientNode: {
            label: '客户端与三维场景',
            title: 'React 19 / Three.js / Web Reader',
            detail: '书库浏览 · 双引擎阅读器 · 观文藏阁漫游',
          },
          serverBox: {
            eyebrow: 'REST API · 会话认证 · 权限隔离',
            name: 'humite-api',
            modules: ['书目与 Thema 1.6', 'EPUB / PDF 阅读', '划线与独立笔记', '文钞馆与知识图谱', 'TOTP 加密秘阁'],
            summary: 'Spring Boot + jOOQ 统一访问 PostgreSQL 18 与受控 NAS 书库',
          },
          workerNodes: [
            { name: 'humite-worker', detail: '异步扫描入库 · 元数据补全 · 封面渲染批处理' },
            { name: 'PostgreSQL 18 + NAS', detail: 'Flyway 迁移 · SHA-256 指纹 · 原件只读保护' },
          ],
          caption:
            '部署示意：app 与 worker 共享同一容器镜像，通过 SPRING_PROFILES_ACTIVE 分别承担在线请求与后台异步处理。',
        },
        flow: {
          titleId: 'humite-flow-title',
          title: '一本书如何从 NAS 进入观文藏阁',
          description: '从文件入库、元数据校对到三维排架与家庭共读，每一步保持原件可追溯、个人数据互不干扰。',
          steps: [
            {
              title: '扫描与去重',
              description: '扫描 NAS 书库目录或通过流式上传暂存文件，计算 SHA-256 指纹避免重复入库。',
            },
            {
              title: '编目与分类',
              description: '解析内嵌书目信息并匹配 Thema 1.6 学科编码，按需在线补全简介与 2:3 规范封面。',
            },
            {
              title: '映射观文藏阁',
              description: '依据学科分类自动分配至明式两层书架格位，生成可近观、可抽签的三维实体书册。',
            },
            {
              title: '共藏与私密阅读',
              description: '家人随时浏览并阅读同一本典藏，各自的进度、书签、划线高亮与笔记严格隔离。',
            },
          ],
        },
        technology: {
          id: 'humite-technology',
          title: '为自托管与长期保存而设计的系统边界',
          description:
            'Humite 将家庭数字藏书所需的书目管理、文档解析、三维可视化与隐私边界整合进同一套轻量化容器栈，既适合 NAS 长期运行，也保留清晰的工程模块边界。',
          items: [
            {
              title: '受控文件纳管与指纹校验',
              description:
                '所有书籍写入与目录整理均需先计算 SHA-256 指纹并生成预览变更，支持原子提交与历史回滚，确保本地 NAS 原始文件不被静默破坏。',
            },
            {
              title: '内嵌三维书楼与真实书目通道',
              description:
                '「观文藏阁」已直接内嵌于 Web 应用资源中，通过同源 postMessage 通道接收真实馆藏目录、同步阅读返回视角，并支持多天色氛围与碑刻导览。',
            },
            {
              title: 'EPUB 与 PDF 双引擎纸感阅读',
              description:
                '针对电子书与版式文献分别集成 epub.js 与 PDF.js，支持自定义字体包下载、行距页边距调节、位置持久化、多色划线和独立阅读笔记。',
            },
            {
              title: '文钞馆与知识关联网络',
              description:
                '支持抓取网页文章正文与配图进行离线精读，按文集归档；同时以书籍、批注与主题标签构建交互式知识图谱，沉淀长期阅读脉络。',
            },
            {
              title: '账号级隐私隔离与加密秘阁',
              description:
                '每位成员的阅读进度、划线、书签和笔记在数据库查询层强制按用户隔离；敏感私人资料可存入支持 TOTP 二次验证的独立加密秘阁。',
            },
            {
              title: '零外部依赖的一键容器部署',
              description:
                '前端静态资源打包进 Spring Boot 服务端镜像，宿主机无需额外安装 Node.js 或 Java，一条 Docker Compose 命令即可启动完整服务。',
            },
          ],
        },
        runtime: {
          titleId: 'humite-runtime-title',
          title: '三个核心服务，支撑完整书库运行',
          items: [
            {
              tag: 'API Server',
              title: '书库接口与阅读服务',
              description: '基于 Spring Boot 提供认证鉴权、书目检索、阅读流分发、笔记管理与 Web 静态资源托管。',
            },
            {
              tag: 'Async Worker',
              title: '异步扫描与任务处理',
              description: '通过 SPRING_PROFILES_ACTIVE=worker 独立运行，负责 NAS 目录扫描、元数据补全与封面生成。',
            },
            {
              tag: 'PostgreSQL 18',
              title: '持久化与会话存储',
              description: '配合 Flyway 版本迁移与 jOOQ 类型安全查询，统一存储书目索引、批注数据与 JDBC 会话状态。',
            },
          ],
        },
        closing: {
          title: '了解 Humite，搭建你的私人书林',
          description: '查看源码仓库、Docker 部署指南与观文藏阁三维场景实现。',
          actions: [
            { label: '查看项目', href: 'https://github.com/johntao2004/Silvae' },
            { label: '全部产品', href: '/products', secondary: true },
          ],
        },
      },
  english: {
        '让好书相聚，让阅读归于自己。': 'Bring your books together. Make reading your own.',
        'Humite 是面向家庭与个人的自托管数字藏书系统，将 NAS 中的 EPUB 与 PDF 映射进三维明式书楼「观文藏阁」，支持分类检索、在线阅读与划线批注。家人共享藏书，每个人拥有独立的阅读进度与私人笔记。':
          'Humite is a self-hosted digital library for individuals and families. Map EPUB and PDF books from your NAS into the 3D Ming-style Guanwen Library, browse by subject, read online, and highlight and annotate while keeping reading progress and private notes personal.',
        '了解 Humite': 'Discover Humite',
        'Humite · 书林': 'Humite · Your digital library',
        'Humite · 观文藏阁': 'Humite · Guanwen Library',
        'Humite 观文藏阁 3D 漫游（模拟）': 'Humite Guanwen Library 3D tour (simulation, Chinese controls)',
        家庭数字藏书阁: 'Family digital library',
        '开源、自托管的家庭数字藏书阁与三维书楼系统，支持 NAS 书目纳管、EPUB / PDF 阅读，以及账号隔离的进度与笔记。':
          'An open-source, self-hosted family digital library and 3D pavilion for NAS book curation, EPUB/PDF reading, and per-account reading progress and private notes.',
        'Humite（书林）是面向家庭与个人的自托管数字藏书阁，将散落在 NAS 中的 EPUB 与 PDF 1:1 映射进两层明式三维藏书楼「观文藏阁」。全家人共享同一套书目典藏，每个人的阅读进度、划线批注与私人笔记严格按账号隔离。':
          'Humite is a self-hosted digital library for families and individuals. It maps EPUB and PDF collections from your NAS 1:1 into the two-story Ming-style 3D pavilion Guanwen Library, letting household members share one curated archive while keeping reading progress, highlights, and private notes strictly isolated per account.',
        核心能力: 'Core capabilities',
        '典藏入林、观文藏阁与各得其所': 'Curated archive, 3D pavilion, and private reading sovereignty',
        典藏入林: 'Curated archive',
        '受控 NAS 馆藏与书目编排，原生支持 EPUB 与 PDF、Thema 1.6 学科分类、SHA-256 去重校验与 2:3 封面裁切；写操作强制预览指纹并保留回滚保护，绝不静默改写原件。':
          'Controlled NAS ingestion and cataloging with native EPUB/PDF support, Thema 1.6 classification, SHA-256 deduplication, and 2:3 cover cropping; write operations preview fingerprints with rollback protection and never silently alter originals.',
        观文藏阁: 'Guanwen Library',
        '内置 Three.js 打造的二层明式虚拟书楼，将真实馆藏 1:1 映射上架；结合出版级 Web 阅读器、网页文章剪藏「文钞馆」与全馆知识图谱网络，让藏书真正可观可读。':
          'A built-in two-story Ming-style 3D virtual pavilion powered by Three.js that places real library holdings 1:1 onto shelves, paired with an editorial web reader, web article clipping, and a library-wide knowledge graph.',
        各得其所: 'Private sanctuary',
        '主人、管理员与成员三级权限体系让全家共享同一套书库；个人阅读进度、多色高亮划线与独立笔记严格按账号隔离，另设配备 TOTP 二次验证的加密秘阁空间。':
          'Three-tier Owner, Admin, and Member roles allow families to share one catalog while isolating progress, multi-color highlights, and private notes per account—plus an encrypted Vault protected by TOTP two-factor authentication.',
        '观文藏阁 · 二层明式三维书楼': 'Guanwen Library · Two-story Ming 3D Pavilion',
        '直接同步自 Humite 内嵌的观文藏阁三维场景，支持第一人称步行漫游、学科分类书架定位、四时晨昏天色切换、御碑拓片导览与今日读书签抽取。':
          'Synced directly from Humite’s embedded Guanwen Library 3D scene, supporting first-person walking tours, subject shelf navigation, seasonal lighting presets, stele rubbing guides, and daily reading fortune cards.',
        从三维空间到持久化的完整技术栈: 'A full stack from 3D space to persistence',
        前端界面与状态: 'Frontend UI & State',
        'React 19 · TypeScript · Vite': 'React 19 · TypeScript · Vite',
        '使用 React 19、TypeScript 与 Vite 构建应用，配合 Ant Design 与 React Query 管理书目检索、阅读台与客户端缓存。':
          'Built with React 19, TypeScript, and Vite, combining Ant Design and React Query for catalog discovery, reading workspaces, and client caching.',
        阅读与写作引擎: 'Reading & Writing Engines',
        'epub.js · PDF.js · TipTap': 'epub.js · PDF.js · TipTap',
        '提供 EPUB 与 PDF 双引擎纸感阅读器、自定义中文字体排版、TipTap 富文本与 Markdown 笔记编辑，以及网页文章采集剪藏。':
          'Dual-engine EPUB and PDF paper-feel readers with custom Chinese typography, TipTap rich-text and Markdown note editing, and web article clipping.',
        三维与图谱可视化: '3D & Graph Visualization',
        'Three.js · AntV G2 · Graphs': 'Three.js · AntV G2 · Graphs',
        '驱动「观文藏阁」二层明式木构渲染与实体书册排架，并构建全馆知识关联图谱与个人阅读统计图表。':
          'Drives the two-story Ming timber architecture and physical 3D book placement in Guanwen Library, alongside AntV knowledge graphs and reading analytics.',
        服务端与数据库: 'Server & Database',
        'Java 21 · Spring Boot · jOOQ · PostgreSQL 18': 'Java 21 · Spring Boot · jOOQ · PostgreSQL 18',
        '基于 Java 21 与 Spring Boot 搭建模块化单体服务，通过 Spring Session JDBC、Flyway 与 jOOQ 配合 PostgreSQL 18 保证类型安全与查询性能。':
          'Modular monolith built on Java 21 and Spring Boot, pairing Spring Session JDBC, Flyway, and jOOQ with PostgreSQL 18 for type-safe persistence and fast queries.',
        文档处理与部署: 'Document Processing & Deployment',
        'PDFBox · Batik · Docker Compose': 'PDFBox · Batik · Docker Compose',
        '利用 Apache PDFBox 与 Batik 解析文档元信息及封面渲染，通过单镜像多运行角色配合 Docker Compose 实现一键自托管启动。':
          'Uses Apache PDFBox and Batik for metadata extraction and cover rendering, packaged in a single container image with Docker Compose for turnkey self-hosting.',
        '从客户端工作台，到多角色自托管容器': 'From client workspace to multi-role self-hosted containers',
        'Web 端与观文藏阁通过同一套 OpenAPI 契约访问 API 服务；异步入库与批量任务由 Worker 进程独立承接，业务数据与文件指纹统一沉淀在 PostgreSQL 与 NAS 挂载目录中。':
          'Both the web app and Guanwen Library consume the API via a unified OpenAPI contract; asynchronous ingestion and batch jobs run in an isolated worker process backed by PostgreSQL and mounted NAS directories.',
        客户端与三维场景: 'Client & 3D Scene',
        'React 19 / Three.js / Web Reader': 'React 19 / Three.js / Web Reader',
        '书库浏览 · 双引擎阅读器 · 观文藏阁漫游': 'Catalog browsing · Dual reader · 3D library tour',
        'REST API · 会话认证 · 权限隔离': 'REST API · Session auth · Role isolation',
        '书目与 Thema 1.6': 'Catalog & Thema 1.6',
        'EPUB / PDF 阅读': 'EPUB / PDF reading',
        划线与独立笔记: 'Highlights & private notes',
        文钞馆与知识图谱: 'Articles & knowledge graph',
        'TOTP 加密秘阁': 'TOTP encrypted vault',
        'Spring Boot + jOOQ 统一访问 PostgreSQL 18 与受控 NAS 书库':
          'Spring Boot + jOOQ unifying access to PostgreSQL 18 and controlled NAS storage',
        '异步扫描入库 · 元数据补全 · 封面渲染批处理': 'Async ingestion · Metadata enrichment · Cover batch rendering',
        'Flyway 迁移 · SHA-256 指纹 · 原件只读保护': 'Flyway migrations · SHA-256 fingerprints · Read-safe originals',
        '部署示意：app 与 worker 共享同一容器镜像，通过 SPRING_PROFILES_ACTIVE 分别承担在线请求与后台异步处理。':
          'Deployment overview: app and worker share one container image and separate online API traffic from background processing via SPRING_PROFILES_ACTIVE.',
        '一本书如何从 NAS 进入观文藏阁': 'How a book moves from NAS into Guanwen Library',
        '从文件入库、元数据校对到三维排架与家庭共读，每一步保持原件可追溯、个人数据互不干扰。':
          'From file ingestion and metadata verification to 3D shelf placement and shared reading, every step preserves traceability and personal privacy.',
        扫描与去重: 'Scan & deduplicate',
        '扫描 NAS 书库目录或通过流式上传暂存文件，计算 SHA-256 指纹避免重复入库。':
          'Scan mounted NAS roots or stream uploads to staging, computing SHA-256 fingerprints to prevent duplicates.',
        编目与分类: 'Catalog & classify',
        '解析内嵌书目信息并匹配 Thema 1.6 学科编码，按需在线补全简介与 2:3 规范封面。':
          'Extract embedded metadata, map Thema 1.6 subject codes, and optionally enrich descriptions and 2:3 covers online.',
        映射观文藏阁: 'Map to 3D Pavilion',
        '依据学科分类自动分配至明式两层书架格位，生成可近观、可抽签的三维实体书册。':
          'Assign books by subject to two-story Ming shelf bays, generating inspectable 3D volumes ready for browsing and fortune cards.',
        共藏与私密阅读: 'Share & read privately',
        '家人随时浏览并阅读同一本典藏，各自的进度、书签、划线高亮与笔记严格隔离。':
          'Family members read from one shared archive while keeping reading positions, bookmarks, highlights, and notes isolated.',
        为自托管与长期保存而设计的系统边界: 'System boundaries designed for self-hosting and longevity',
        'Humite 将家庭数字藏书所需的书目管理、文档解析、三维可视化与隐私边界整合进同一套轻量化容器栈，既适合 NAS 长期运行，也保留清晰的工程模块边界。':
          'Humite unifies library management, document parsing, 3D visualization, and privacy isolation in a lightweight container stack suited for long-term NAS operation.',
        受控文件纳管与指纹校验: 'Controlled file management & fingerprints',
        '所有书籍写入与目录整理均需先计算 SHA-256 指纹并生成预览变更，支持原子提交与历史回滚，确保本地 NAS 原始文件不被静默破坏。':
          'Every file operation computes SHA-256 fingerprints and previews changes before atomic commit with rollback support, protecting original NAS files.',
        内嵌三维书楼与真实书目通道: 'Embedded 3D pavilion & live catalog bridge',
        '「观文藏阁」已直接内嵌于 Web 应用资源中，通过同源 postMessage 通道接收真实馆藏目录、同步阅读返回视角，并支持多天色氛围与碑刻导览。':
          'Guanwen Library is bundled directly inside the web app, receiving live catalogs over a same-origin postMessage bridge and syncing reader return poses.',
        'EPUB 与 PDF 双引擎纸感阅读': 'Dual-engine EPUB & PDF paper reader',
        '针对电子书与版式文献分别集成 epub.js 与 PDF.js，支持自定义字体包下载、行距页边距调节、位置持久化、多色划线和独立阅读笔记。':
          'Integrates epub.js and PDF.js for reflowable and fixed-layout books, with custom font packages, layout tuning, persistent positions, and color highlights.',
        文钞馆与知识关联网络: 'Article clippings & knowledge network',
        '支持抓取网页文章正文与配图进行离线精读，按文集归档；同时以书籍、批注与主题标签构建交互式知识图谱，沉淀长期阅读脉络。':
          'Clips web articles and images for offline reading in curated collections while connecting books, notes, and topics in an interactive knowledge graph.',
        账号级隐私隔离与加密秘阁: 'Per-account isolation & encrypted Vault',
        '每位成员的阅读进度、划线、书签和笔记在数据库查询层强制按用户隔离；敏感私人资料可存入支持 TOTP 二次验证的独立加密秘阁。':
          'Reading progress, highlights, bookmarks, and notes are strictly scoped by user at the query layer, with an encrypted Vault gated by TOTP 2FA.',
        零外部依赖的一键容器部署: 'Zero-dependency turnkey container deployment',
        '前端静态资源打包进 Spring Boot 服务端镜像，宿主机无需额外安装 Node.js 或 Java，一条 Docker Compose 命令即可启动完整服务。':
          'The web bundle is packaged inside the Spring Boot image so hosts need no local Node.js or Java runtime—just Docker Compose.',
        '三个核心服务，支撑完整书库运行': 'Three core services powering the complete library',
        书库接口与阅读服务: 'Library API & reading server',
        '基于 Spring Boot 提供认证鉴权、书目检索、阅读流分发、笔记管理与 Web 静态资源托管。':
          'Spring Boot service handling authentication, catalog search, reading streams, annotations, and static web asset delivery.',
        异步扫描与任务处理: 'Async scanning & job processing',
        '通过 SPRING_PROFILES_ACTIVE=worker 独立运行，负责 NAS 目录扫描、元数据补全与封面生成。':
          'Runs independently via SPRING_PROFILES_ACTIVE=worker to handle NAS scans, metadata enrichment, and cover rendering.',
        持久化与会话存储: 'Persistence & session store',
        '配合 Flyway 版本迁移与 jOOQ 类型安全查询，统一存储书目索引、批注数据与 JDBC 会话状态。':
          'Combines Flyway schema migrations and type-safe jOOQ queries for book metadata, annotations, and JDBC session storage.',
        '了解 Humite，搭建你的私人书林': 'Explore Humite and build your private library',
        '查看源码仓库、Docker 部署指南与观文藏阁三维场景实现。':
          'Explore the source repository, Docker deployment guide, and 3D Guanwen Library implementation.',
      },
};
