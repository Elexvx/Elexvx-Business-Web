import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { StatusErrorState, StatusLogin, StatusPanel, StatusSkeleton } from '../src/site/services/status-components';
import { createDemoStatusData } from '../src/site/services/status-demo';

describe('status page accessibility', () => {
  it.each([false, true])('names the loading state and hides decorative placeholders (history: %s)', (history) => {
    const html = renderToStaticMarkup(<StatusSkeleton history={history} />);

    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain(`aria-label="${history ? '正在加载历史可用性' : '正在加载服务状态'}"`);
    expect(html).toMatch(/class="service-status-panel service-status-skeleton[^"]*" aria-hidden="true"/);
    expect(html).not.toMatch(/role="(?:alert|progressbar)"|aria-valuenow|\d+(?:\.\d+)?%/);
    expect(html).not.toContain('<button');
  });

  it('announces normal status updates politely', () => {
    const html = renderToStaticMarkup(
      <StatusPanel data={createDemoStatusData(3)} onRefresh={vi.fn()} refreshing={false} />
    );

    expect(html).toContain('所有系统运行正常');
    expect(html).toContain('role="status" aria-live="polite" aria-atomic="true" aria-busy="false"');
    expect(html).not.toContain('role="alert"');
    expect(html).toContain('aria-label="刷新状态"');
  });

  it('names and disables the refresh control while an update is pending', () => {
    const html = renderToStaticMarkup(<StatusPanel data={createDemoStatusData(3)} onRefresh={vi.fn()} refreshing />);

    expect(html).toContain('aria-busy="true"');
    expect(html).toMatch(/<button[^>]*aria-label="正在刷新状态"[^>]*disabled=""/);
  });

  it('associates the password input with its guidance without marking it invalid initially', () => {
    const html = renderToStaticMarkup(<StatusLogin onLogin={vi.fn()} />);
    const input = html.match(/<input\b[^>]*>/)?.[0];
    const descriptionId = input?.match(/aria-describedby="([^"]+)"/)?.[1];

    expect(input).toContain('aria-invalid="false"');
    expect(input).toContain('required=""');
    expect(descriptionId).toBeTruthy();
    expect(html).toContain(`<p id="${descriptionId}">请输入访问密码后查看监控数据。</p>`);
    expect(html).not.toContain('role="alert"');
  });

  it('associates an API failure with its title and details and preserves the retry action', () => {
    const html = renderToStaticMarkup(<StatusErrorState error="请求超时" onRetry={vi.fn()} />);
    const titleId = html.match(/aria-labelledby="([^"]+)"/)?.[1];
    const descriptionId = html.match(/aria-describedby="([^"]+)"/)?.[1];

    expect(html).toContain('role="alert"');
    expect(html).toContain(`<h2 id="${titleId}">暂时无法获取服务状态</h2>`);
    expect(html).toContain(`<p id="${descriptionId}">请求超时</p>`);
    expect(html).toContain('<button type="button">重新加载</button>');
  });
});
