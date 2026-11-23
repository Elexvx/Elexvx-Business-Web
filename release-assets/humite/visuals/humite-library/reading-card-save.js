(() => {
  const button = document.querySelector('#reading-card-save');
  const sheet = document.querySelector('#reading-card-sheet');
  let renderer;
  function loadRenderer() {
    return renderer ??= new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = './html2canvas-1.4.1.min.js';
      script.onload = () => resolve(window.html2canvas);
      script.onerror = () => { renderer = undefined; reject(new Error('图片组件加载失败')); };
      document.head.append(script);
    });
  }

  button.addEventListener('click', async () => {
    const label = button.querySelector('span') || button;
    const copy = sheet.cloneNode(true);
    const title = copy.querySelector('h3').textContent;
    const date = copy.querySelector('.reading-card-kicker').textContent;
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;left:-10000px;top:0;width:464px;pointer-events:none';
    copy.removeAttribute('id');
    copy.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    copy.classList.remove('is-drawing');
    copy.style.cssText += ';transform:none;animation:none;box-shadow:none;border:4px double #ad946d';
    copy.querySelector('.reading-card-foil')?.remove();
    // Canvas text layout needs explicit lines for the book's vertical title.
    const spine = copy.querySelector('.reading-card-emblem-spine');
    if (spine) {
      spine.textContent = Array.from(spine.textContent).join('\n');
      spine.style.cssText = 'writing-mode:horizontal-tb;white-space:pre;line-height:1.16';
    }
    const cover = copy.querySelector('img');
    if (cover && (cover.hidden || !cover.complete || !cover.naturalWidth || !['data:', 'blob:'].includes(new URL(cover.src || location.href).protocol) && new URL(cover.src || location.href).origin !== location.origin)) cover.remove();
    host.append(copy);
    document.body.append(host);
    button.disabled = true;
    label.textContent = '正在生成…';
    try {
      const render = await loadRenderer();
      await document.fonts.ready;
      const canvas = await render(copy, {scale:3,backgroundColor:'#f7efda',logging:false,
        ignoreElements: el => el.tagName === 'CANVAS' || (el.parentElement === document.body && el !== host && !el.contains(host))});
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('签图生成失败');
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = ('读书签-' + date + '-' + title).replace(/[\\/:*?"<>|]/g,'-') + '.png';
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 60000);
      label.textContent = '保存图片';
    } catch {
      label.textContent = '重试保存图片';
    } finally {
      host.remove();
      button.disabled = false;
    }
  });
})();
