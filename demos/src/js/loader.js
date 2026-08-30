/**
 * M2.9 HTML Fragment Loader (loader.js)
 * ═══════════════════════════════════════════════════
 * 扫描页面中所有 [data-include] 元素，fetch() 对应 HTML 片段并注入 DOM。
 * 支持多语言 (zh / en / ja)，支持嵌套 include 与动态平滑无刷新重载。
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
   * 将原始路径转换为对应语言的目标路径
   * @param {string} originalSrc
   * @param {string} currentLang
   * @returns {string}
   */
  function resolveTargetSrc(originalSrc, currentLang) {
    if (!originalSrc) return originalSrc;
    // 提取不含语言后缀的基础路径
    const baseSrc = originalSrc.replace(/-(?:en|ja|jp)\.html$/, '.html');
    
    if (currentLang === 'en') {
      return baseSrc.replace(/\.html$/, '-en.html');
    } else if (currentLang === 'ja' || currentLang === 'jp') {
      return baseSrc.replace(/\.html$/, '-ja.html');
    }
    return baseSrc;
  }

  /**
   * 递归加载所有 [data-include] 占位符
   * @param {Element} root - 搜索根元素
   * @param {string} [overrideLang] - 可选指定语言
   * @returns {Promise<void>}
   */
  async function loadIncludes(root, overrideLang) {
    const slots = root.querySelectorAll('[data-include]');
    if (slots.length === 0) return;

    const currentLang = overrideLang || localStorage.getItem('m29_lang') || 'zh';

    const promises = Array.from(slots).map(async (slot) => {
      const originalSrc = slot.getAttribute('data-include');
      if (!originalSrc) return;

      const baseSrc = originalSrc.replace(/-(?:en|ja|jp)\.html$/, '.html');
      let targetSrc = resolveTargetSrc(originalSrc, currentLang);

      try {
        let resp = await fetch(targetSrc);
        if (!resp.ok && targetSrc !== baseSrc) {
          // 如果对应语言版本不存在，优雅回退至默认中文基础版
          resp = await fetch(baseSrc);
          targetSrc = baseSrc;
        }
        if (!resp.ok) {
          console.warn(`[M29 Loader] Failed to load: ${originalSrc} (${resp.status})`);
          return;
        }
        const html = await resp.text();

        // 记录原始 include 路径，方便后续热切换
        slot.setAttribute('data-original-include', baseSrc);

        // 将片段 HTML 注入到占位 div 内部
        slot.innerHTML = html;
        slot.removeAttribute('data-include');
        slot.setAttribute('data-loaded', targetSrc);

        // 递归处理嵌套 include（如 component-panel 内嵌 widget）
        await loadIncludes(slot, currentLang);
      } catch (err) {
        console.error(`[M29 Loader] Error loading ${originalSrc}:`, err);
      }
    });

    await Promise.all(promises);
  }

  /**
   * 获取当前语言
   * @returns {string} 'zh' | 'en' | 'ja'
   */
  function getCurrentLang() {
    let lang = localStorage.getItem('m29_lang') || 'zh';
    if (lang === 'jp') lang = 'ja';
    return lang;
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

  // 暴露全局 Loader API 给业务模块调用
  window.m29Loader = {
    loadIncludes,
    resolveTargetSrc,
    getCurrentLang
  };

  // 如果 DOM 已就绪则立即执行，否则等待 DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
