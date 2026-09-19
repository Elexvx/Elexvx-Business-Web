'use client';

import { useEffect, useId, useState } from 'react';

export const MermaidDiagram = ({ chart }: { chart: string }) => {
  const rawId = useId();
  const diagramId = `mermaid-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const [mounted, setMounted] = useState(false);
  const [svg, setSvg] = useState('');

  useEffect(() => {
    let active = true;
    setMounted(true);
    const theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'base';

    void import('mermaid')
      .then(({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme,
          fontFamily: 'inherit',
        });
        return mermaid.render(diagramId, chart);
      })
      .then((result) => {
        if (active) setSvg(result.svg);
      })
      .catch(() => {
        if (active) setSvg('');
      });

    return () => {
      active = false;
    };
  }, [chart, diagramId]);

  // Keep the server HTML and the first client render identical. Mermaid mutates
  // the DOM while rendering, so it must only be introduced after hydration.
  if (!mounted) {
    return <div className="mermaid-diagram-placeholder" aria-label="Mermaid diagram" />;
  }

  if (!svg) {
    return (
      <pre className="mermaid-diagram-fallback" data-language="mermaid">
        <code>{chart}</code>
      </pre>
    );
  }

  return <div className="mermaid-diagram" dangerouslySetInnerHTML={{ __html: svg }} />;
};
