'use client';

import type { ProductShowcaseContent } from '../../data/product-pages';
import { ActionButton, SiteShell } from '../components/index';
import { SiteImage } from '../components/site-image';
import { ShowcaseFrame } from '../components/showcase-frame';
import { Translated, useI18n } from '../providers/i18n';

export const ProductShowcase = ({ content, image }: { content: ProductShowcaseContent; image: string }) => {
  const { t } = useI18n();
  const { hero, pillars, showcase, stack, architecture, flow, technology, runtime, closing } = content;

  return (
    <SiteShell activePath="/products">
      <article className="lumira-product">
        <header className="lumira-hero">
          <div>
            <p className="eyebrow">
              <Translated>{hero.eyebrow}</Translated>
            </p>
            <h1>{hero.title}</h1>
            <h2>
              <Translated>{hero.subtitle}</Translated>
            </h2>
            <p>
              <Translated>{hero.description}</Translated>
            </p>
            <div className="lumira-actions">
              {hero.actions.map((action) => (
                <ActionButton key={action.href} href={action.href} secondary={action.secondary}>
                  {action.label}
                </ActionButton>
              ))}
            </div>
          </div>
          <SiteImage
            src={image}
            alt={hero.imageAlt}
            width={hero.imageSize}
            height={hero.imageSize}
            fetchPriority="high"
          />
        </header>

        <section className="lumira-section" aria-labelledby={pillars.titleId}>
          <p className="eyebrow">
            <Translated>{pillars.eyebrow}</Translated>
          </p>
          <h2 id={pillars.titleId}>
            <Translated>{pillars.title}</Translated>
          </h2>
          <div className={pillars.threeColumns ? 'lumira-grid lumira-grid-three' : 'lumira-grid'}>
            {pillars.items.map((item) => (
              <article key={item.number}>
                <span className="lumira-number">{item.number}</span>
                <h3>
                  <Translated>{item.title}</Translated>
                </h3>
                <p>
                  <Translated>{item.description}</Translated>
                </p>
                <span className="lumira-tag">
                  <Translated>{item.tag}</Translated>
                </span>
              </article>
            ))}
          </div>
        </section>

        {showcase && (
          <section className="lumira-section" id={showcase.id} aria-labelledby={showcase.titleId}>
            <p className="eyebrow">{showcase.eyebrow}</p>
            <h2 id={showcase.titleId}>
              <Translated>{showcase.title}</Translated>
            </h2>
            <p className="lumira-section-intro">
              <Translated>{showcase.description}</Translated>
            </p>
            <div className="home-mac-preview humite-showcase-frame">
              <div className="home-mac-toolbar">
                <span className="home-mac-controls" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span>{t(showcase.frameLabel)}</span>
              </div>
              <ShowcaseFrame src={showcase.framePath} title={t(showcase.frameTitle)} />
            </div>
          </section>
        )}

        <section className="lumira-section" aria-labelledby={stack.titleId}>
          <p className="eyebrow">TECHNOLOGY STACK</p>
          <h2 id={stack.titleId}>
            <Translated>{stack.title}</Translated>
          </h2>
          <div className="lumira-stack">
            {stack.items.map((item) => (
              <article key={item.label}>
                <p className="eyebrow">
                  <Translated>{item.label}</Translated>
                </p>
                <h3>
                  <Translated>{item.technologies}</Translated>
                </h3>
                <p>
                  <Translated>{item.description}</Translated>
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="lumira-section" aria-labelledby={architecture.titleId}>
          <h2 id={architecture.titleId}>
            <Translated>{architecture.title}</Translated>
          </h2>
          <p>
            <Translated>{architecture.description}</Translated>
          </p>
          <figure className="lumira-architecture">
            <div className="lumira-diagram-node">
              <span>
                <Translated>{architecture.clientNode.label}</Translated>
              </span>
              <strong>{architecture.clientNode.title}</strong>
              <small>
                <Translated>{architecture.clientNode.detail}</Translated>
              </small>
            </div>
            <div className="lumira-diagram-arrow" aria-hidden="true">
              ↓
            </div>
            <div className="lumira-server-box">
              <span className="eyebrow">
                <Translated>{architecture.serverBox.eyebrow}</Translated>
              </span>
              <h3>{architecture.serverBox.name}</h3>
              <div className="lumira-module-chips">
                {architecture.serverBox.modules.map((label) => (
                  <span key={label}>
                    <Translated>{label}</Translated>
                  </span>
                ))}
              </div>
              <p>
                <Translated>{architecture.serverBox.summary}</Translated>
              </p>
            </div>
            <div className="lumira-diagram-arrow" aria-hidden="true">
              ↕
            </div>
            <div className="lumira-diagram-workers">
              {architecture.workerNodes.map((worker) => (
                <div className="lumira-diagram-node" key={worker.name}>
                  <strong>{worker.name}</strong>
                  <small>
                    <Translated>{worker.detail}</Translated>
                  </small>
                </div>
              ))}
            </div>
            <figcaption>
              <Translated>{architecture.caption}</Translated>
            </figcaption>
          </figure>
        </section>

        <section className="lumira-section" aria-labelledby={flow.titleId}>
          <h2 id={flow.titleId}>
            <Translated>{flow.title}</Translated>
          </h2>
          <p>
            <Translated>{flow.description}</Translated>
          </p>
          <ol className="lumira-flow">
            {flow.steps.map((step, index) => (
              <li key={step.title}>
                <span className="lumira-flow-index">0{index + 1}</span>
                <h3>
                  <Translated>{step.title}</Translated>
                </h3>
                <p>
                  <Translated>{step.description}</Translated>
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="lumira-section" id={technology.id}>
          <p className="eyebrow">
            <Translated>{'技术架构'}</Translated>
          </p>
          <h2>
            <Translated>{technology.title}</Translated>
          </h2>
          <p className="lumira-section-intro">
            <Translated>{technology.description}</Translated>
          </p>
          <div className="lumira-grid">
            {technology.items.map((item) => (
              <article key={item.title}>
                <h3>
                  <Translated>{item.title}</Translated>
                </h3>
                <p>
                  <Translated>{item.description}</Translated>
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="lumira-section" aria-labelledby={runtime.titleId}>
          <h2 id={runtime.titleId}>
            <Translated>{runtime.title}</Translated>
          </h2>
          <div className="lumira-grid lumira-grid-three">
            {runtime.items.map((item) => (
              <article key={item.tag}>
                <span className="lumira-tag">{item.tag}</span>
                <h3>
                  <Translated>{item.title}</Translated>
                </h3>
                <p>
                  <Translated>{item.description}</Translated>
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="lumira-closing">
          <div>
            <h2>
              <Translated>{closing.title}</Translated>
            </h2>
            <p>
              <Translated>{closing.description}</Translated>
            </p>
          </div>
          {closing.actions.length > 1 ? (
            <div className="lumira-actions">
              {closing.actions.map((action) => (
                <ActionButton key={action.href} href={action.href} secondary={action.secondary}>
                  {action.label}
                </ActionButton>
              ))}
            </div>
          ) : (
            closing.actions[0] && (
              <ActionButton href={closing.actions[0].href} secondary={closing.actions[0].secondary}>
                {closing.actions[0].label}
              </ActionButton>
            )
          )}
        </section>
      </article>
    </SiteShell>
  );
};
