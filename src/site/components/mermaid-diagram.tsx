'use client';

import { useEffect, useId, useState } from 'react';
import { useNearViewport } from './use-near-viewport';

export const MermaidDiagram = ({ chart }: { chart: string }) => {
  const rawId = useId();
  const diagramId = `mermaid-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const { ref, isNear } = useNearViewport<HTMLDivElement>();
  const [rendered, setRendered] = useState<{ chart: string; svg: string }>();

  useEffect(() => {
    if (!isNear) return;
    let active = true;
    const theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'base';

    void import('mermaid')
      .then(({ default: mermaid }) => {
        if (!active) return;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme,
          fontFamily: 'inherit',
        });
        return mermaid.render(diagramId, chart);
      })
      .then((result) => {
        if (active && result) setRendered({ chart, svg: result.svg });
      })
      .catch(() => {
        // The source remains readable if the diagram cannot be loaded or rendered.
      });

    return () => {
      active = false;
    };
  }, [chart, diagramId, isNear]);

  return (
    <div ref={ref}>
      {rendered?.chart === chart ? (
        <div className="mermaid-diagram" dangerouslySetInnerHTML={{ __html: rendered.svg }} />
      ) : (
        <pre className="mermaid-diagram-fallback" data-language="mermaid">
          <code>{chart}</code>
        </pre>
      )}
    </div>
  );
};
