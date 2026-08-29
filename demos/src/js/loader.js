/**
 * M2.9 HTML Fragment Loader (loader.js)
 * ═══════════════════════════════════════════════════
 * 扫描页面中所有 [data-include] 元素，fetch() 对应 HTML 片段并注入 DOM。
 * 支持嵌套 include（如 component-panel 内嵌 widget include）。
 * 加载完成后派发 'm29:loaded' 事件，由 app.js 监听并初始化全部交互。
 *
 * 📦 使用方式:
 *   <div data-include="src/containers/navigation-rail.html"></div>
 *   <script src="src/js/loader.js"></script>
 *   <script src="src/js/app.js"></script>
 */
(function () {
  'use strict';

  /**
   * 递归加载所有 [data-include] 占位符
   * @param {Element} root - 搜索根元素
   * @returns {Promise<void>}
   */
  async function loadIncludes(root) {
    const slots = root.querySelectorAll('[data-include]');
    if (slots.length === 0) return;

    const promises = Array.from(slots).map(async (slot) => {
      const src = slot.getAttribute('data-include');
      if (!src) return;

      try {
        const resp = await fetch(src);
        if (!resp.ok) {
          console.warn(`[M29 Loader] Failed to load: ${src} (${resp.status})`);
          return;
        }
        const html = await resp.text();

        // 将片段 HTML 注入到占位 div 内部（保留外层 div 以维持 DOM 结构）
        slot.innerHTML = html;
        slot.removeAttribute('data-include');
        slot.setAttribute('data-loaded', src);

        // 递归处理嵌套 include（如 component-panel 内嵌 widget）
        await loadIncludes(slot);
      } catch (err) {
        console.error(`[M29 Loader] Error loading ${src}:`, err);
      }
    });

    await Promise.all(promises);
  }

  /**
   * 入口: DOMContentLoaded 后启动加载流程
   */
  async function init() {
    // 第一轮: 加载所有顶层 include (containers, content)
    await loadIncludes(document.body);

    // 派发自定义事件，通知 app.js 所有 HTML 片段已就绪
    window.dispatchEvent(new CustomEvent('m29:loaded'));

    console.log('[M29 Loader] All HTML fragments loaded successfully.');
  }

  // 如果 DOM 已就绪则立即执行，否则等待 DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
