type ShareData = { title: string; description: string; url: string; image: string };

type Wx = {
  config: (config: Record<string, unknown>) => void;
  ready: (callback: () => void) => void;
  error: (callback: (error: { errMsg?: string }) => void) => void;
  updateAppMessageShareData: (data: Record<string, unknown>) => void;
  updateTimelineShareData: (data: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    wx?: Wx;
  }
}
let sdk: Promise<void> | undefined;
const loadSdk = () =>
  (sdk ??= new Promise<void>((resolve, reject) => {
    if (window.wx) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js';
    const timer = window.setTimeout(() => {
      sdk = undefined;
      script.remove();
      reject(new Error('SDK timeout'));
    }, 10000);
    script.onload = () => {
      clearTimeout(timer);
      resolve();
    };
    script.onerror = () => {
      clearTimeout(timer);
      sdk = undefined;
      script.remove();
      reject(new Error('SDK unavailable'));
    };
    document.head.append(script);
  }));

let queue: Promise<void> = Promise.resolve();
let configuredUrl: string | undefined;

export function configureWechat(data: ShareData): Promise<void> {
  const next = queue.then(() => configure(data));
  queue = next.catch(() => {});
  return next;
}

async function configure(data: ShareData): Promise<void> {
  const endpoint = process.env.NEXT_PUBLIC_WECHAT_SIGNATURE_URL || '/api/wechat/signature';
  if (!endpoint || !/MicroMessenger/i.test(navigator.userAgent)) return;
  await loadSdk();
  const wx = window.wx;
  if (!wx) throw new Error('SDK unavailable');
  const pageUrl = location.href.split('#')[0];
  if (configuredUrl !== pageUrl) {
    const url = new URL(endpoint, location.origin);
    url.searchParams.set('url', pageUrl);
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`签名服务不可用（HTTP ${response.status}）`);
    const config = (await response.json()) as { appId: string; timestamp: number; nonceStr: string; signature: string };
    if (!config.appId || !config.timestamp || !config.nonceStr || !/^[a-f0-9]{40}$/i.test(config.signature))
      throw new Error('Invalid signature');
    await new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('微信权限验证超时')), 10000);
      wx.error((error) => {
        clearTimeout(timeout);
        configuredUrl = undefined;
        reject(new Error(error.errMsg || '微信权限验证失败'));
      });
      // config resets SDK readiness; register ready against this configuration.
      wx.config({ ...config, debug: false, jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData'] });
      wx.ready(() => {
        clearTimeout(timeout);
        resolve();
      });
    });
    configuredUrl = pageUrl;
  }
  const update = (api: 'updateAppMessageShareData' | 'updateTimelineShareData', payload: Record<string, unknown>) =>
    new Promise<void>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error(`${api}：微信未返回设置结果`)), 10000);
      const fail = (error: { errMsg?: string }) => {
        clearTimeout(timeout);
        reject(new Error(`${api}：${error.errMsg || '设置失败'}`));
      };
      try {
        wx[api]({
          ...payload,
          success: () => {
            clearTimeout(timeout);
            resolve();
          },
          fail,
          cancel: () => fail({ errMsg: '设置被取消' }),
        });
      } catch (error) {
        fail({ errMsg: error instanceof Error ? error.message : '接口不可用' });
      }
    });
  await Promise.all([
    update('updateAppMessageShareData', {
      title: data.title,
      desc: data.description,
      link: data.url,
      imgUrl: data.image,
    }),
    update('updateTimelineShareData', { title: data.title, link: data.url, imgUrl: data.image }),
  ]);
}
