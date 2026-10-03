import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';
import { StatusPage } from '../src/site/services/status-page';
import { createDemoStatusData } from '../src/site/services/status-demo';

afterEach(() => vi.unstubAllGlobals());

it('keeps status and history initial HTML identical when the browser has cached monitor data', () => {
  const exported = [false, true].map((history) => renderToString(createElement(StatusPage, { history })));
  const getItem = vi.fn().mockReturnValue(JSON.stringify({ savedAt: Date.now(), data: createDemoStatusData(60) }));
  vi.stubGlobal('window', { localStorage: { getItem } });

  for (const [index, history] of [false, true].entries()) {
    expect(renderToString(createElement(StatusPage, { history }))).toBe(exported[index]);
  }
  expect(getItem).not.toHaveBeenCalled();
});
