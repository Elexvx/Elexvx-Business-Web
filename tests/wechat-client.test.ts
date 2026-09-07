import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  vi.resetModules();
});

async function setup() {
  const callbacks: Record<string, { success: () => void; fail: (error: { errMsg: string }) => void }> = {};
  const wx = {
    config: vi.fn(),
    error: vi.fn(),
    ready: (callback: () => void) => callback(),
    updateAppMessageShareData: vi.fn((data) => {
      callbacks.friend = data;
    }),
    updateTimelineShareData: vi.fn((data) => {
      callbacks.timeline = data;
    }),
  };
  vi.stubGlobal('window', { wx, setTimeout });
  vi.stubGlobal('navigator', { userAgent: 'MicroMessenger' });
  vi.stubGlobal('location', {
    origin: 'https://www.elexvx.com',
    href: 'https://www.elexvx.com/article/?from=singlemessage#section',
  });
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ appId: 'test', timestamp: 1, nonceStr: 'test', signature: 'a'.repeat(40) }),
      })
  );
  const { configureWechat } = await import('../src/site/sharing/wechat');
  const run = () =>
    configureWechat({
      title: 'Article',
      description: 'Description',
      url: 'https://www.elexvx.com/article/',
      image: 'https://www.elexvx.com/cover.png',
    });
  return { callbacks, wx, run };
}

it('waits for both share acknowledgements and reuses configuration', async () => {
  const { callbacks, wx, run } = await setup();
  let done = false;
  const result = run().then(() => {
    done = true;
  });
  await vi.waitFor(() => expect(callbacks.timeline).toBeDefined());
  expect(done).toBe(false);
  callbacks.friend.success();
  await Promise.resolve();
  expect(done).toBe(false);
  callbacks.timeline.success();
  await result;
  const second = run();
  await vi.waitFor(() => expect(wx.updateAppMessageShareData).toHaveBeenCalledTimes(2));
  callbacks.friend.success();
  callbacks.timeline.success();
  await second;
  expect(wx.config).toHaveBeenCalledTimes(1);
  const requested = vi.mocked(fetch).mock.calls[0][0] as URL;
  expect(requested.searchParams.get('url')).toBe('https://www.elexvx.com/article/?from=singlemessage');
});

it('reports the API rejection instead of successful configuration', async () => {
  const { callbacks, run } = await setup();
  const result = run();
  const assertion = expect(result).rejects.toThrow('updateAppMessageShareData：permission denied');
  await vi.waitFor(() => expect(callbacks.timeline).toBeDefined());
  callbacks.friend.fail({ errMsg: 'permission denied' });
  callbacks.timeline.success();
  await assertion;
});
