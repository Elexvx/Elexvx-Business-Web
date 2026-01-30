/**
 * 全局懒加载脚本
 * 为所有带有 loading="lazy" 的图片启用高级加载功能
 * 支持渐进式加载、错误处理和性能监控
 */

interface LazyLoadConfig {
  rootMargin: string;
  enableProgressiveLoad: boolean;
  enableErrorHandling: boolean;
  enablePerformanceMonitoring: boolean;
}

class LazyLoadManager {
  private config: LazyLoadConfig;
  private observer: IntersectionObserver | null = null;
  private loadedImages = new Set<HTMLImageElement>();
  private failedImages = new Set<HTMLImageElement>();

  constructor(config: Partial<LazyLoadConfig> = {}) {
    this.config = {
      rootMargin: '50px',
      enableProgressiveLoad: true,
      enableErrorHandling: true,
      enablePerformanceMonitoring: false,
      ...config,
    };

    if (this.isBrowserSupported()) {
      this.init();
    }
  }

  /**
   * 检查浏览器是否支持必要的 API
   */
  private isBrowserSupported(): boolean {
    return 'IntersectionObserver' in window && 'requestIdleCallback' in window;
  }

  /**
   * 初始化懒加载管理器
   */
  private init(): void {
    this.setupIntersectionObserver();
    this.setupMutationObserver();
    this.loadInitialImages();
  }

  /**
   * 设置 Intersection Observer
   */
  private setupIntersectionObserver(): void {
    const options: IntersectionObserverInit = {
      rootMargin: this.config.rootMargin,
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target as HTMLImageElement);
          this.observer?.unobserve(entry.target);
        }
      });
    }, options);
  }

  /**
   * 设置 Mutation Observer 来监听 DOM 变化
   */
  private setupMutationObserver(): void {
    if ('MutationObserver' in window) {
      const mutationObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node instanceof HTMLElement) {
                this.observeLazyImages(node);
              }
            });
          }
        });
      });

      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  }

  /**
   * 加载初始的懒加载图片
   */
  private loadInitialImages(): void {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.observeLazyImages(document.body);
      });
    } else {
      setTimeout(() => {
        this.observeLazyImages(document.body);
      }, 1000);
    }
  }

  /**
   * 观察元素及其子元素中的懒加载图片
   */
  private observeLazyImages(element: HTMLElement): void {
    const lazyImages = element.querySelectorAll(
      'img[loading="lazy"]:not([data-lazy-observed])'
    );

    lazyImages.forEach((img) => {
      (img as HTMLImageElement).setAttribute('data-lazy-observed', 'true');
      this.observer?.observe(img);
    });
  }

  /**
   * 加载单个图片
   */
  private loadImage(img: HTMLImageElement): void {
    // 避免重复加载
    if (this.loadedImages.has(img) || this.failedImages.has(img)) {
      return;
    }

    // 添加加载状态类
    img.classList.add('lazy-loading');

    // 监听加载完成
    const handleLoad = () => {
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-loaded');
      this.loadedImages.add(img);

      if (this.config.enablePerformanceMonitoring) {
        console.log(`[LazyLoad] Image loaded: ${img.src}`);
      }

      this.cleanup(img);
    };

    const handleError = () => {
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-error');
      this.failedImages.add(img);

      if (this.config.enableErrorHandling) {
        console.warn(`[LazyLoad] Failed to load image: ${img.src}`);
      }

      this.cleanup(img);
    };

    img.addEventListener('load', handleLoad, { once: true });
    img.addEventListener('error', handleError, { once: true });

    // 触发图片加载
    if (img.dataset.src) {
      img.src = img.dataset.src;
      delete img.dataset.src;
    }
  }

  /**
   * 清理事件监听
   */
  private cleanup(img: HTMLImageElement): void {
    img.removeEventListener('load', () => {});
    img.removeEventListener('error', () => {});
  }

  /**
   * 手动加载指定的图片
   */
  public loadImageNow(img: HTMLImageElement): void {
    if (!this.loadedImages.has(img)) {
      this.loadImage(img);
      this.observer?.unobserve(img);
    }
  }

  /**
   * 获取加载统计
   */
  public getStats() {
    return {
      loaded: this.loadedImages.size,
      failed: this.failedImages.size,
    };
  }
}

// 初始化全局懒加载管理器
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const manager = new LazyLoadManager({
      rootMargin: '50px',
      enableProgressiveLoad: true,
      enableErrorHandling: true,
      enablePerformanceMonitoring: false,
    });
    (globalThis as unknown as Record<string, LazyLoadManager>).lazyLoadManager = manager;
  });
} else {
  const manager = new LazyLoadManager({
    rootMargin: '50px',
    enableProgressiveLoad: true,
    enableErrorHandling: true,
    enablePerformanceMonitoring: false,
  });
  (globalThis as unknown as Record<string, LazyLoadManager>).lazyLoadManager = manager;
}
