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

export async function configureWechat(data: ShareData): Promise<void> {
  const endpoint = process.env.NEXT_PUBLIC_WECHAT_SIGNATURE_URL || '/api/wechat/signature';
  if (!endpoint || !/MicroMessenger/i.test(navigator.userAgent)) return;
  // The signed URL must match the actual WebView URL, including query, excluding hash.
  const url = new URL(endpoint, location.origin);
  url.searchParams.set('url', location.href.split('#')[0]);
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error('Signature unavailable');
  const config = (await response.json()) as { appId: string; timestamp: number; nonceStr: string; signature: string };
  if (!config.appId || !config.timestamp || !config.nonceStr || !/^[a-f0-9]{40}$/i.test(config.signature))
    throw new Error('Invalid signature');
  await loadSdk();
  const wx = window.wx;
  if (!wx) throw new Error('SDK unavailable');
  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error('WeChat configuration timeout')), 10000);
    wx.error((error) => {
      clearTimeout(timeout);
      reject(new Error(error.errMsg || 'WeChat configuration failed'));
    });
    wx.ready(() => {
      const payload = { title: data.title, desc: data.description, link: data.url, imgUrl: data.image };
      wx.updateAppMessageShareData(payload);
      wx.updateTimelineShareData({ title: data.title, link: data.url, imgUrl: data.image });
      clearTimeout(timeout);
      resolve();
    });
    wx.config({ ...config, debug: false, jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData'] });
  });
}
