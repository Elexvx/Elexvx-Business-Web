'use client';
import { Translated } from '../providers/i18n';

import { SiteImage } from '../components/site-image';
import { homeContent } from '../../data/page-content';
import { SiteShell, ActionButton } from '../components/index';
import { useI18n } from '../providers/i18n';
import { useCategoryFilter } from '../providers/category-filter';
import { HomeMediaCard } from './shared';
import { NotFoundPage } from './shared';

export const ProductCatalogPage = () => {
  const [category, selectCategory] = useCategoryFilter();
  const { t } = useI18n();
  const products = homeContent.product.items;
  const categories = [...new Set(products.map((product) => product.category))];
  const visible = products.filter((product) => category === 'all' || product.category === category);
  return (
    <SiteShell activePath="/products">
      <section className="product-index" aria-labelledby="product-index-title">
        <h1 id="product-index-title">{t('产品')}</h1>
        <nav className="research-index-tabs" aria-label={t('产品分类')}>
          {['all', ...categories].map((value) => (
            <button
              key={value}
              type="button"
              className={`research-index-tab ${category === value ? 'research-index-tab-active' : ''}`}
              aria-pressed={category === value}
              onClick={() => selectCategory(value)}
            >
              {value === 'all' ? t('全部') : t(value)}
            </button>
          ))}
        </nav>
        <div className="home-media-grid home-products-grid">
          {visible.map((product) => (
            <HomeMediaCard
              key={product.slug}
              image={product.image}
              imageAlt={product.name}
              title={product.name}
              eyebrow={product.category}
              href={product.href}
              naturalTitle
            />
          ))}
        </div>
        {!visible.length && <p>{t('暂无匹配内容')}</p>}
      </section>
    </SiteShell>
  );
};
export const ProductDetailPage = ({ slug }: { slug: string }) => {
  const { href, t } = useI18n();
  const product = homeContent.product.items.find((item) => item.slug === slug);
  if (!product) return <NotFoundPage />;
  if (slug === 'lumira') return <LumiraPage image={product.image} />;
  return (
    <SiteShell activePath="/products">
      <article className="team-profile">
        <a className="team-back" href={href('/products')}>
          <Translated>{'← 全部产品'}</Translated>
        </a>
        <div className="team-profile-layout">
          <SiteImage className="team-portrait" src={product.image} alt={product.name} width={1600} height={1600} />
          <div className="team-biography">
            <header>
              <p className="eyebrow">{t(product.category)}</p>
              <h1>
                <Translated>{product.name}</Translated>
              </h1>
            </header>
            <div className="team-biography-text">
              <p>{t(product.description)}</p>
            </div>
          </div>
        </div>
      </article>
    </SiteShell>
  );
};

const LumiraPage = ({ image }: { image: string }) => (
  <SiteShell activePath="/products">
    <article className="lumira-product">
      <header className="lumira-hero">
        <div>
          <p className="eyebrow">
            <Translated>{'企业管理平台'}</Translated>
          </p>
          <h1>Lumira</h1>
          <h2>
            <Translated>{'让业务协作，建立在统一的平台之上。'}</Translated>
          </h2>
          <p>
            <Translated>
              {
                'Lumira 是面向企业管理与活动协作的 SaaS 平台，将活动、项目、赛事、专家与工作流等业务模块，与身份认证、团队、文件和消息等基础能力组织在一起。'
              }
            </Translated>
          </p>
          <div className="lumira-actions">
            <ActionButton href="https://github.com/Elexvx/Lumira">访问 GitHub</ActionButton>
            <ActionButton href="#lumira-technology" secondary>
              了解技术架构
            </ActionButton>
          </div>
        </div>
        <SiteImage src={image} alt="Lumira" width={1600} height={1600} fetchPriority="high" />
      </header>
      <section className="lumira-section">
        <p className="eyebrow">
          <Translated>{'产品能力'}</Translated>
        </p>
        <h2>
          <Translated>{'业务模块与平台能力，一起协作'}</Translated>
        </h2>
        <div className="lumira-grid">
          <article>
            <span className="lumira-number">01</span>
            <h3>
              <Translated>{'业务协作'}</Translated>
            </h3>
            <p>
              <Translated>
                {'围绕活动、项目和赛事设置业务模块，通过专家、团队与工作流能力，组织业务参与者和处理流程。'}
              </Translated>
            </p>
            <span className="lumira-tag">
              <Translated>{'活动 · 项目 · 赛事'}</Translated>
            </span>
          </article>
          <article>
            <span className="lumira-number">02</span>
            <h3>
              <Translated>{'统一的基础能力'}</Translated>
            </h3>
            <p>
              <Translated>
                {'身份认证、文件、消息、支付、国际化与插件各自形成模块，为不同业务提供可复用的平台能力。'}
              </Translated>
            </p>
            <span className="lumira-tag">
              <Translated>{'认证 · 文件 · 消息'}</Translated>
            </span>
          </article>
        </div>
      </section>
      <section className="lumira-section" aria-labelledby="lumira-stack-title">
        <p className="eyebrow">TECHNOLOGY STACK</p>
        <h2 id="lumira-stack-title">
          <Translated>{'从交互到数据的完整技术栈'}</Translated>
        </h2>
        <div className="lumira-stack">
          {[
            ['界面层', 'React · TypeScript · Umi', '组件化构建业务界面，使用类型约束组织页面与数据交互。'],
            [
              '交互与数据请求',
              'Ant Design · Pro Components · React Query',
              '复用管理端表格、表单与布局，管理请求状态及客户端数据缓存。',
            ],
            ['应用层', 'Java · Spring Boot · Maven', '通过模块化工程组织领域能力、应用接口和基础设施实现。'],
            ['持久化与迁移', 'MySQL · MyBatis-Plus · Flyway', '承载业务数据、数据访问和有版本记录的数据库结构变更。'],
            ['状态与事件', 'Redis · Redis Streams · Outbox', '分别支撑会话与授权状态、可重建缓存和后台事件处理。'],
          ].map(([label, technologies, description]) => (
            <article key={label}>
              <p className="eyebrow">
                <Translated>{label}</Translated>
              </p>
              <h3>
                <Translated>{technologies}</Translated>
              </h3>
              <p>
                <Translated>{description}</Translated>
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="lumira-section" aria-labelledby="lumira-diagram-title">
        <h2 id="lumira-diagram-title">
          <Translated>{'从界面到业务，再到后台任务'}</Translated>
        </h2>
        <p>
          <Translated>
            {
              '前端通过同步 API 访问 Server。业务模块在 Server 内通过应用端口协作；Async 和 Job Executor 使用经过认证的内部接口访问业务能力。业务数据库由 Server 统一持有。'
            }
          </Translated>
        </p>
        <figure className="lumira-architecture">
          <div className="lumira-diagram-node">
            <span>
              <Translated>{'用户界面'}</Translated>
            </span>
            <strong>React / Umi</strong>
            <small>
              <Translated>{'表单、表格、业务页面'}</Translated>
            </small>
          </div>
          <div className="lumira-diagram-arrow" aria-hidden="true">
            ↓
          </div>
          <div className="lumira-server-box">
            <span className="eyebrow">
              <Translated>{'同步 API · 认证与授权'}</Translated>
            </span>
            <h3>lumira-server</h3>
            <div className="lumira-module-chips">
              {['活动与赛事', '项目与团队', '专家与工作流', '文件与消息', '支付与插件'].map((label) => (
                <span key={label}>
                  <Translated>{label}</Translated>
                </span>
              ))}
            </div>
            <p>
              <Translated>{'应用端口与契约连接模块，统一访问 MySQL'}</Translated>
            </p>
          </div>
          <div className="lumira-diagram-arrow" aria-hidden="true">
            ↕
          </div>
          <div className="lumira-diagram-workers">
            <div className="lumira-diagram-node">
              <strong>lumira-async</strong>
              <small>
                <Translated>{'Outbox 中继 · Redis Streams 消费'}</Translated>
              </small>
            </div>
            <div className="lumira-diagram-node">
              <strong>lumira-job-executor</strong>
              <small>
                <Translated>{'定时调度 · 补偿 · 显式重放'}</Translated>
              </small>
            </div>
          </div>
          <figcaption>
            <Translated>
              {'运行关系示意：后台单元通过内部接口调用 Server，业务模块并非各自独立部署的微服务。'}
            </Translated>
          </figcaption>
        </figure>
      </section>
      <section className="lumira-section" aria-labelledby="lumira-flow-title">
        <h2 id="lumira-flow-title">
          <Translated>{'一次业务操作如何完成'}</Translated>
        </h2>
        <p>
          <Translated>{'以需要后续异步处理的业务请求为例，同步响应与后台工作由不同路径承担。'}</Translated>
        </p>
        <ol className="lumira-flow">
          {[
            ['提交操作', '用户在业务页面填写表单或发起操作，前端向服务端提交请求。'],
            ['校验身份与权限', '服务端核对会话和授权版本，依据当前用户、角色及数据范围处理访问。'],
            ['执行业务逻辑', '应用层调用相应业务模块，校验业务规则并通过统一数据访问入口保存结果。'],
            ['处理后续事件', '需要异步处理的工作进入事件处理路径，由 Async 中继或消费；异常恢复由调度单元承担。'],
          ].map(([title, description], index) => (
            <li key={title}>
              <span className="lumira-flow-index">0{index + 1}</span>
              <h3>
                <Translated>{title}</Translated>
              </h3>
              <p>
                <Translated>{description}</Translated>
              </p>
            </li>
          ))}
        </ol>
      </section>
      <section className="lumira-section" id="lumira-technology">
        <p className="eyebrow">
          <Translated>{'技术架构'}</Translated>
        </p>
        <h2>
          <Translated>{'模块化业务系统，明确的职责边界'}</Translated>
        </h2>
        <p className="lumira-section-intro">
          <Translated>
            {
              'Lumira 采用模块化单体架构：业务领域在同一个服务端内协作，异步处理与定时任务由独立运行单元承担。模块通过明确的应用接口交换数据，业务逻辑、基础设施和运行时职责分层组织。'
            }
          </Translated>
        </p>
        <div className="lumira-grid">
          {[
            [
              '前端：一致的业务交互',
              '管理界面基于 React、TypeScript 和 Umi，使用 Ant Design 与 Pro Components 组织表单、表格和业务布局。React Query 管理服务端数据请求与缓存；界面组件与数据访问分别组织，便于多个业务模块复用同一套交互方式。',
            ],
            [
              '后端：围绕业务领域划分模块',
              '后端采用 Java、Spring Boot 与 Maven 多模块工程，覆盖活动、项目、赛事、专家、团队、支付、文件和消息等领域。模块间通过应用端口与共享契约协作，不直接依赖其他模块内部的控制器、实体或数据访问实现。',
            ],
            [
              '数据：明确所有权与访问入口',
              'MySQL 保存业务数据，MyBatis-Plus 承担持久化访问。业务数据库统一由 Server 访问，异步和任务执行单元通过内部应用接口调用业务能力。表与迁移归属按模块记录，使数据结构变更有明确责任边界。',
            ],
            [
              '缓存：区分运行状态和可重建数据',
              'Redis 分为运行状态与缓存两类用途。会话、权限版本及消息流等运行状态使用独立实例，可重新生成的缓存使用另一实例，避免将不同可靠性要求的数据混在同一个缓存生命周期中。',
            ],
            [
              '身份与权限：随业务变化更新授权',
              '认证将 JWT 与服务端会话状态关联。授权版本分别跟踪用户状态、角色与部门绑定、角色权限及数据范围策略；相关权限变化后，受影响会话在后续请求中重新校验，减少对无关用户的影响。',
            ],
            [
              '异步处理：从业务事件到后台执行',
              'Outbox 中继与 Redis Streams 消费由 Async 负责。不同业务事件归属使用独立执行通道、有限队列和熔断状态，控制慢请求的影响范围；定时补偿和人工重放则交给 Job Executor 处理。',
            ],
            [
              '插件：可追踪的扩展生命周期',
              '插件从校验、迁移、运行验证到激活按状态推进，失败会记录为独立状态。插件包与迁移内容通过摘要关联；数据库结构变更由专用迁移器执行，业务应用负责插件的控制与状态管理。',
            ],
            [
              '工程约束：让模块边界持续有效',
              'Maven 元数据、Enforcer 规则和架构边界测试共同约束依赖关系。领域代码与 Web、数据库和缓存实现分离，公共库不反向依赖业务模块，减少功能增长过程中产生的隐式耦合。',
            ],
          ].map(([title, description]) => (
            <article key={title}>
              <h3>
                <Translated>{title}</Translated>
              </h3>
              <p>
                <Translated>{description}</Translated>
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="lumira-section" aria-labelledby="lumira-runtime-title">
        <h2 id="lumira-runtime-title">
          <Translated>{'三个运行单元，各自承担清晰职责'}</Translated>
        </h2>
        <div className="lumira-grid lumira-grid-three">
          <article>
            <span className="lumira-tag">Server</span>
            <h3>
              <Translated>{'业务与控制中心'}</Translated>
            </h3>
            <p>
              <Translated>
                {'接收同步 API 请求，组装业务模块，执行认证、授权和业务处理，并统一访问业务数据库。'}
              </Translated>
            </p>
          </article>
          <article>
            <span className="lumira-tag">Async</span>
            <h3>
              <Translated>{'事件与异步处理'}</Translated>
            </h3>
            <p>
              <Translated>
                {'承担常规 Outbox 中继和消息流消费，通过经过认证的内部接口执行业务操作，不直接读取业务数据库。'}
              </Translated>
            </p>
          </article>
          <article>
            <span className="lumira-tag">Job Executor</span>
            <h3>
              <Translated>{'调度与恢复'}</Translated>
            </h3>
            <p>
              <Translated>
                {'处理定时任务、补偿、显式重放与恢复操作，与常规异步消息处理分工，避免多个运行单元重复承担中继职责。'}
              </Translated>
            </p>
          </article>
        </div>
      </section>
      <section className="lumira-closing">
        <div>
          <h2>
            <Translated>{'了解 Lumira，开始构建'}</Translated>
          </h2>
          <p>
            <Translated>{'深入了解功能模块、技术实现与项目进展。'}</Translated>
          </p>
        </div>
        <ActionButton href="https://github.com/Elexvx/Lumira">查看项目</ActionButton>
      </section>
    </article>
  </SiteShell>
);
