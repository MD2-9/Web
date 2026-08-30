// M2.9 Demo Application JS (extracted from index.html)
// All interaction logic, theme management, navigation, components, pickers, etc.
// Runs after 'm29:loaded' event dispatched by loader.js

window.addEventListener('m29:loaded', function() {
    // 实例化 MDC 组件
    if (window.mdc && mdc.autoInit) mdc.autoInit();

    // =========================================================================
    // 页面背景独享水波纹主题动效 (仅页面背景底层扩散水波纹，侧边栏与卡片保持直接平滑渐变)
    // =========================================================================
    function executeThemeRippleTransition(event, changeCallback) {
      // 1. 立即更新色彩数据与主题变量（侧边栏、卡片、控件等保持原生直接平滑过渡）
      changeCallback();

      // 2. 仅在页面背景底层独立扩散水波纹 (从窗口左上角 0,0 扩散至全屏，速率 29% 经典慢速)
      const bgLayer = document.getElementById('app-bg-layer');
      if (bgLayer) {
        const maxDim = Math.max(window.innerWidth, window.innerHeight);
        const diameter = Math.round(maxDim * 4.2);
        const bgWave = document.createElement('div');
        bgWave.className = 'm29-bg-theme-wave';
        bgWave.style.width = `${diameter}px`;
        bgWave.style.height = `${diameter}px`;
        bgWave.style.left = `${-diameter / 2}px`;
        bgWave.style.top = `${-diameter / 2}px`;
        bgWave.style.backgroundColor = isDarkMode ? '#131217' : '#fdf8fd';
        bgLayer.appendChild(bgWave);

        requestAnimationFrame(() => {
          bgWave.style.transform = 'translate3d(0, 0, 0) scale(1)';
        });

        setTimeout(() => {
          if (bgWave.parentNode) bgWave.parentNode.removeChild(bgWave);
        }, 1500);
      }
    }
    window.executeThemeRippleTransition = executeThemeRippleTransition;

    // 暗色模式状态与 3 档切换系统 (auto: 跟随系统, light: 浅色, dark: 暗色)
    let isDarkMode = false;
    let currentGlobalThemeMode = localStorage.getItem('m29_theme_mode') || 'auto';

    function applyGlobalThemeMode(mode) {
      currentGlobalThemeMode = mode || 'auto';
      localStorage.setItem('m29_theme_mode', currentGlobalThemeMode);

      if (currentGlobalThemeMode === 'auto') {
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        isDarkMode = !!systemPrefersDark;
      } else if (currentGlobalThemeMode === 'dark') {
        isDarkMode = true;
      } else {
        isDarkMode = false;
      }

      if (isDarkMode) {
        document.body.classList.add('dark-theme');
        document.documentElement.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
        document.documentElement.classList.remove('dark-theme');
      }

      updateThemeModeTexts();
      applyMonetTheme();

      // 如果组件栏是 auto 状态，同步刷新组件栏
      const panelTheme = localStorage.getItem('m29_component_panel_theme') || 'auto';
      if (typeof applyComponentPanelTheme === 'function') {
        applyComponentPanelTheme(panelTheme);
      }
    }
    window.applyGlobalThemeMode = applyGlobalThemeMode;

    function toggleThemeMode(event) {
      const evt = event || (window.event ? window.event : null);
      let nextMode = 'light';
      if (currentGlobalThemeMode === 'auto') {
        nextMode = 'light';
      } else if (currentGlobalThemeMode === 'light') {
        nextMode = 'dark';
      } else {
        nextMode = 'auto';
      }

      executeThemeRippleTransition(evt, () => {
        applyGlobalThemeMode(nextMode);
        const lang = currentLang;
        if (nextMode === 'auto') {
          showDemoToast(lang === 'en' ? 'Theme set to Auto (Following System Theme)' : (lang === 'ja' ? 'テーマを自動モード（システム準拠）に設定しました' : '全局主题已切换为自动模式（跟随系统设置）'));
        } else if (nextMode === 'light') {
          showDemoToast(lang === 'en' ? 'Theme set to Light Mode' : (lang === 'ja' ? 'ライトテーマに設定しました' : '全局主题已切换为浅色模式'));
        } else {
          showDemoToast(lang === 'en' ? 'Theme set to Dark Mode' : (lang === 'ja' ? 'ダークテーマに設定しました' : '全局主题已切换为暗色模式'));
        }
      });
    }
    window.toggleThemeMode = toggleThemeMode;

    function updateThemeModeTexts() {
      const railDarkIcon = document.getElementById('rail-dark-icon');
      const railCompactDarkIcon = document.getElementById('rail-compact-dark-icon');
      const mobileDarkIcon = document.getElementById('mobile-dark-icon');

      let icon = 'brightness_auto';
      if (currentGlobalThemeMode === 'light') {
        icon = 'brightness_5';
      } else if (currentGlobalThemeMode === 'dark') {
        icon = 'brightness_4';
      }

      if (railDarkIcon) railDarkIcon.textContent = icon;
      if (railCompactDarkIcon) railCompactDarkIcon.textContent = icon;
      if (mobileDarkIcon) mobileDarkIcon.textContent = icon;

      const lang = currentLang;
      let tip = '';
      if (currentGlobalThemeMode === 'auto') {
        tip = lang === 'en' ? 'Current: Auto (Following System Theme) · Click for Light Mode' : (lang === 'ja' ? '現在: 自動モード（システム準拠） · クリックでライトへ' : '当前: 自动模式 (跟随系统设置) · 点击切换为浅色');
      } else if (currentGlobalThemeMode === 'light') {
        tip = lang === 'en' ? 'Current: Light Mode · Click for Dark Mode' : (lang === 'ja' ? '現在: ライトモード · クリックでダークへ' : '当前: 浅色模式 · 点击切换为暗色');
      } else {
        tip = lang === 'en' ? 'Current: Dark Mode · Click for Auto Mode' : (lang === 'ja' ? '現在: ダークモード · クリックで自動へ' : '当前: 暗色模式 · 点击切换为自动跟随系统');
      }

      const btnDark = document.getElementById('btn-toggle-dark');
      const btnCompactDark = document.getElementById('btn-toggle-dark-compact');
      const btnMobileDark = document.getElementById('btn-toggle-dark-mobile');
      if (btnDark) btnDark.title = tip;
      if (btnCompactDark) btnCompactDark.title = tip;
      if (btnMobileDark) btnMobileDark.title = tip;
    }

    // 监听系统深色/浅色偏好实时变更
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (currentGlobalThemeMode === 'auto') {
          applyGlobalThemeMode('auto');
        }
      });
    }

    // =========================================================================
    // 🌐 多语言平滑热切换系统 (i18n System: zh-CN / en-US / ja-JP)
    // =========================================================================
    let currentLang = localStorage.getItem('m29_lang') || 'zh';
    if (currentLang === 'jp') currentLang = 'ja';

    const I18N_SIDEBAR_TEXTS = {
      zh: {
        brandSubtitle: '点击取色',
        brandHeaderTitle: '点击打开莫奈动态调色盘',
        navHome: '主页',
        navCatalog: '目录',
        navSettings: '设置',
        navAbout: '关于',
        navHomeTitle: '主页 (Overview)',
        navCatalogTitle: '目录 (点击展开二级全景组件)',
        navSettingsTitle: '设置 (暗色与主题配置)',
        navAboutTitle: '关于项目',
        catalogHeader: '组件全景目录',
        catalogBack: '返回一级菜单',
        catalogItems: [
          '1. 按钮与 FAB', '2. 直角卡片', '3. 标签与徽标', '4. 表单与开关',
          '5. 列表与手风琴', '6. 直角对话框与菜单', '7. 选项卡', '8. 进度条',
          '9. 莫奈色彩全景实验室', '10. 排版与字体', '11. 日历与时钟选择器'
        ],
        settingsHeader: '外观与偏好设置',
        settingsDimTitle: '色彩方案维度 (1 / 2 / 3 色)',
        settingsDimSub: '支持 1色（单色）、2色（主次）与 3色（三色对比）无缝切换',
        btnDim1: '1色·单色',
        btnDim2: '2色·主次',
        btnDim3: '3色·三色',
        settingsMonetTitle: '莫奈动态调色盘',
        btnOpenMonet: '打开水波纹 3 步调色盘',
        settingsThemeTitle: '主题模式',
        btnToggleTheme: '切换亮/暗色模式',
        settingsSysTitle: '系统偏好设置',
        btnClearSettings: '清除所有记忆配置',
        aboutHeader: '关于 M2.9 项目',
        btnPanelTitle: '组件栏 (开关/调出组件栏)',
        btnLangTitle: '当前: 简体中文 · 点击切换为 English',
        btnLayoutTitle: '切换单/双/三栏布局 (Columns)',
        panelTitle: '组件',
        panelCloseTitle: '关闭组件栏',
        panelSwapTitle: '切换左右布局 (对调侧边栏与组件栏)',
        panelPaletteTitle: '组件栏专属调色盘 (长按或右键恢复跟随全局)',
        panelResizerTitle: '左右拖动调整组件栏宽度（双击重置为 290px）',
        toastLangSwitched: '已平滑切换为简体中文',
        docTitle: 'M2.9 · MDC-Web · 纯直角 & 莫奈动态色 Navigation Rail 全景展厅'
      },
      en: {
        brandSubtitle: 'Theme Palette',
        brandHeaderTitle: 'Click to open Monet Color Palette',
        navHome: 'Home',
        navCatalog: 'Catalog',
        navSettings: 'Settings',
        navAbout: 'About',
        navHomeTitle: 'Home (Overview)',
        navCatalogTitle: 'Catalog (All Components)',
        navSettingsTitle: 'Settings (Themes & Dark Mode)',
        navAboutTitle: 'About Project',
        catalogHeader: 'Component Catalog',
        catalogBack: 'Back to Main Menu',
        catalogItems: [
          '1. Buttons & FAB', '2. Sharp Cards', '3. Chips & Badges', '4. Forms & Controls',
          '5. Lists & Accordions', '6. Dialogs & Menus', '7. Tabs', '8. Progress Indicators',
          '9. Monet Color Lab', '10. Typography & Fonts', '11. Date & Time Pickers'
        ],
        settingsHeader: 'Global Settings',
        settingsDimTitle: 'Color Palette Dimensions (1 / 2 / 3 Colors)',
        settingsDimSub: 'Configure layout color expressiveness: 1-Tone, 2-Tone, or 3-Tone:',
        btnDim1: '1-Tone',
        btnDim2: '2-Tone',
        btnDim3: '3-Tone',
        settingsMonetTitle: 'Monet Dynamic Color Palette',
        btnOpenMonet: 'Open 3-Step Palette Picker',
        settingsThemeTitle: 'Theme Mode',
        btnToggleTheme: 'Toggle Light / Dark Mode',
        settingsSysTitle: 'System Configuration',
        btnClearSettings: 'Reset All Stored Settings',
        aboutHeader: 'About M2.9',
        btnPanelTitle: 'Component Panel (Toggle Side Panel)',
        btnLangTitle: 'Current: English · Click for 日本語',
        btnLayoutTitle: 'Switch Column Layout (1 / 2 / 3 Columns)',
        panelTitle: 'Components',
        panelCloseTitle: 'Close Panel',
        panelSwapTitle: 'Swap Sidebars (Left / Right positions)',
        panelPaletteTitle: 'Component Panel Palette (Long-press to follow global)',
        panelResizerTitle: 'Drag left edge to resize panel width (Double-click to reset)',
        toastLangSwitched: 'Language switched to English',
        docTitle: 'M2.9 · MDC-Web · Sharp 0px & Monet Dynamic Color Navigation Rail Showroom'
      },
      ja: {
        brandSubtitle: 'パレットを開く',
        brandHeaderTitle: 'クリックしてモネカラーパレットを開く',
        navHome: 'ホーム',
        navCatalog: 'カタログ',
        navSettings: '設定',
        navAbout: '情報',
        navHomeTitle: 'ホーム (Overview)',
        navCatalogTitle: 'カタログ (コンポーネント一覧)',
        navSettingsTitle: '設定 (テーマとダークモード)',
        navAboutTitle: 'プロジェクト情報',
        catalogHeader: 'コンポーネントカタログ',
        catalogBack: 'メインメニューに戻る',
        catalogItems: [
          '1. ボタンと FAB', '2. 直角カード', '3. チップとバッジ', '4. フォームとスイッチ',
          '5. リストとアコーディオン', '6. ダイアログとメニュー', '7. タブ', '8. プログレスバー',
          '9. モネカラー実験室', '10. タイポグラフィ', '11. ピッカー (日時)'
        ],
        settingsHeader: 'グローバル設定',
        settingsDimTitle: 'カラースキーム次元 (1 / 2 / 3 色)',
        settingsDimSub: '色彩の豊かさを調整: 単色統一、2色バランス、または3色フル階調:',
        btnDim1: '1色・単色',
        btnDim2: '2色・主従',
        btnDim3: '3色・対比',
        settingsMonetTitle: 'モネ ダイナミックカラー パレット',
        btnOpenMonet: '3ステップ カラーピッカーを開く',
        settingsThemeTitle: 'テーマモード',
        btnToggleTheme: 'ライト / ダーク / 自動 切替',
        settingsSysTitle: 'システム設定リセット',
        btnClearSettings: 'すべての保存設定を初期化',
        aboutHeader: 'M2.9 について',
        btnPanelTitle: 'コンポーネントパネル (展開/収納)',
        btnLangTitle: '現在: 日本語 · クリックして中文へ',
        btnLayoutTitle: '段組みレイアウト切替 (1 / 2 / 3 列)',
        panelTitle: 'コンポーネント',
        panelCloseTitle: 'パネルを閉じる',
        panelSwapTitle: '左右配置反転 (サイドバーとコンポーネントパネルの位置を交換)',
        panelPaletteTitle: 'パネル専用パレット (長押し/右クリックでグローバル追従に戻す)',
        panelResizerTitle: '左右ドラッグで幅を調節（ダブルクリックで 290px にリセット）',
        toastLangSwitched: '言語を日本語に切り替えました',
        docTitle: 'M2.9 · MDC-Web · 完全直角＆モネダイナミックカラー Navigation Rail パノラマ展覧ホール'
      }
    };

    function updateSidebarI18nTexts(lang) {
      const dict = I18N_SIDEBAR_TEXTS[lang] || I18N_SIDEBAR_TEXTS.zh;
      
      // Rail & Drawer Brand Headers
      document.querySelectorAll('.rail-header-text div:last-child, .mobile-drawer-header .rail-header-text div:last-child').forEach(el => {
        el.textContent = dict.brandSubtitle;
      });
      document.querySelectorAll('.rail-header, .mobile-drawer-header').forEach(el => {
        el.title = dict.brandHeaderTitle;
      });

      // 1st level nav items (Home, Catalog, Settings, About)
      const updateNavList = (container) => {
        if (!container) return;
        const items = container.querySelectorAll('.rail-nav-item, .mobile-drawer-nav-item');
        if (items.length >= 4) {
          const homeSpan = items[0].querySelector('.rail-item-text');
          if (homeSpan) homeSpan.textContent = dict.navHome;
          items[0].title = dict.navHomeTitle;

          const catSpan = items[1].querySelector('.rail-item-text');
          if (catSpan) catSpan.textContent = dict.navCatalog;
          items[1].title = dict.navCatalogTitle;

          const setSpan = items[2].querySelector('.rail-item-text');
          if (setSpan) setSpan.textContent = dict.navSettings;
          items[2].title = dict.navSettingsTitle;

          const aboutSpan = items[3].querySelector('.rail-item-text');
          if (aboutSpan) aboutSpan.textContent = dict.navAbout;
          items[3].title = dict.navAboutTitle;
        }
      };
      updateNavList(document.querySelector('.drawer-nav-section .rail-nav-list'));
      updateNavList(document.querySelector('.mobile-drawer-nav-list'));

      // Catalog Submenu Panel
      const catalogPanel = document.getElementById('catalogSubmenuPanel');
      if (catalogPanel) {
        const catTitle = catalogPanel.querySelector('.overlay-header-title span');
        if (catTitle) catTitle.textContent = dict.catalogHeader;
        const catBackBtn = catalogPanel.querySelector('.overlay-header-title button');
        if (catBackBtn) catBackBtn.title = dict.catalogBack;
        const catBottomBtn = catalogPanel.querySelector('.overlay-bottom-bar button');
        if (catBottomBtn) {
          catBottomBtn.innerHTML = `<i class="material-icons mdc-button__icon">arrow_back</i>${dict.catalogBack}`;
        }
        const catLinks = catalogPanel.querySelectorAll('.rail-nav-list a.rail-nav-item');
        catLinks.forEach((link, idx) => {
          if (dict.catalogItems[idx]) {
            link.title = dict.catalogItems[idx];
            const textSpan = link.querySelector('.rail-item-text');
            if (textSpan) textSpan.textContent = dict.catalogItems[idx];
          }
        });
      }

      // Settings Submenu Panel
      const settingsPanel = document.getElementById('settingsSubmenuPanel');
      if (settingsPanel) {
        const setTitle = settingsPanel.querySelector('.overlay-header-title span');
        if (setTitle) setTitle.textContent = dict.settingsHeader;
        const setBackBtn = settingsPanel.querySelector('.overlay-header-title button');
        if (setBackBtn) setBackBtn.title = dict.catalogBack;
        const setBottomBtn = settingsPanel.querySelector('.overlay-bottom-bar button');
        if (setBottomBtn) {
          setBottomBtn.innerHTML = `<i class="material-icons mdc-button__icon">arrow_back</i>${dict.catalogBack}`;
        }
      }

      // About Submenu Panel
      const aboutPanel = document.getElementById('aboutSubmenuPanel');
      if (aboutPanel) {
        const aboutTitle = aboutPanel.querySelector('.overlay-header-title span');
        if (aboutTitle) aboutTitle.textContent = dict.aboutHeader;
        const aboutBackBtn = aboutPanel.querySelector('.overlay-header-title button');
        if (aboutBackBtn) aboutBackBtn.title = dict.catalogBack;
        const aboutBottomBtn = aboutPanel.querySelector('.overlay-bottom-bar button');
        if (aboutBottomBtn) {
          aboutBottomBtn.innerHTML = `<i class="material-icons mdc-button__icon">arrow_back</i>${dict.catalogBack}`;
        }
      }

      // Footer Buttons Tooltips
      const btnPanel = document.getElementById('btn-toggle-panel');
      const btnPanelMobile = document.getElementById('btn-toggle-panel-mobile');
      if (btnPanel) btnPanel.title = dict.btnPanelTitle;
      if (btnPanelMobile) btnPanelMobile.title = dict.btnPanelTitle;

      const btnLang = document.getElementById('btn-toggle-lang');
      const btnMobileLang = document.getElementById('btn-toggle-lang-mobile');
      if (btnLang) btnLang.title = dict.btnLangTitle;
      if (btnMobileLang) btnMobileLang.title = dict.btnLangTitle;

      const btnLayout = document.getElementById('btn-toggle-layout');
      const btnLayoutMobile = document.getElementById('btn-toggle-layout-mobile');
      if (btnLayout) btnLayout.title = dict.btnLayoutTitle;
      if (btnLayoutMobile) btnLayoutMobile.title = dict.btnLayoutTitle;

      // Component Panel Header & Actions
      const compPanel = document.getElementById('app-component-panel');
      if (compPanel) {
        const cpTitle = compPanel.querySelector('.component-panel-header-title span');
        if (cpTitle) cpTitle.textContent = dict.panelTitle;
        const cpClose = compPanel.querySelector('.component-panel-header-title button');
        if (cpClose) cpClose.title = dict.panelCloseTitle;
        const cpResizer = document.getElementById('componentPanelResizer');
        if (cpResizer) cpResizer.title = dict.panelResizerTitle;
      }
    }

    const SECTION_TEMPLATES = [
      { id: 'section-overview', base: '/demos/src/content/overview.html' },
      { id: 'section-buttons', base: '/demos/src/content/buttons.html' },
      { id: 'section-cards', base: '/demos/src/content/cards.html' },
      { id: 'section-chips', base: '/demos/src/content/chips.html' },
      { id: 'section-form', base: '/demos/src/content/form.html' },
      { id: 'section-list', base: '/demos/src/content/list.html' },
      { id: 'section-dialogs', base: '/demos/src/content/dialogs.html' },
      { id: 'section-tabs', base: '/demos/src/content/tabs.html' },
      { id: 'section-progress', base: '/demos/src/content/progress.html' },
      { id: 'section-monet-lab', base: '/demos/src/content/monet-lab.html' },
      { id: 'section-typography', base: '/demos/src/content/typography.html' },
      { id: 'section-pickers', base: '/demos/src/content/pickers.html' },
      { id: 'section-footer', base: '/demos/src/content/footer.html' }
    ];

    async function reloadMainContentForLanguage(targetLang) {
      const container = document.getElementById('mainContainer');
      if (!container) return;

      container.style.transition = 'opacity 0.18s cubic-bezier(0.4, 0, 0.2, 1)';
      container.style.opacity = '0.35';

      const fetchPromises = SECTION_TEMPLATES.map(async item => {
        let targetUrl = item.base;
        if (targetLang === 'en') {
          targetUrl = item.base.replace(/\.html$/, '-en.html');
        } else if (targetLang === 'ja' || targetLang === 'jp') {
          targetUrl = item.base.replace(/\.html$/, '-ja.html');
        }

        try {
          let resp = await fetch(targetUrl);
          if (!resp.ok && targetUrl !== item.base) {
            resp = await fetch(item.base);
          }
          if (resp && resp.ok) {
            const text = await resp.text();
            return { id: item.id, html: text };
          }
        } catch (e) {
          console.warn('[M29 i18n] Failed to load card:', targetUrl, e);
        }
        return null;
      });

      const results = await Promise.all(fetchPromises);

      results.forEach(res => {
        if (!res) return;
        const cardEl = document.getElementById(res.id);
        if (!cardEl) return;

        const temp = document.createElement('div');
        temp.innerHTML = res.html.trim();
        const newCard = temp.querySelector(`#${res.id}`) || temp.firstElementChild;
        if (newCard) {
          cardEl.innerHTML = newCard.innerHTML;
        }
      });

      // 重新实例化 MDC 组件与交互绑定
      if (window.mdc && mdc.autoInit) mdc.autoInit();
      initM29TabIndicator();
      rebindSliderEvents();
      rebindUnusedButtonToasts();

      if (typeof renderDemoDatePicker === 'function') renderDemoDatePicker();
      if (typeof renderDemoTimePicker === 'function') renderDemoTimePicker();

      // 重新渲染莫奈全景实验室内色阶
      const currentTheme = window._lastCalculatedTheme || null;
      if (currentTheme && typeof renderTonalSwatches === 'function') {
        renderTonalSwatches(currentTheme);
      }

      requestAnimationFrame(() => {
        container.style.opacity = '1';
      });
    }

    function rebindSliderEvents() {
      const sInput = document.getElementById('slider-tone');
      const sFill = document.getElementById('m29SliderFill');
      const sThumbWrapper = document.getElementById('m29SliderThumbWrapper');
      const sVal = document.getElementById('slider-val');
      const sPinText = document.getElementById('m29SliderPinText');
      const sBox = document.getElementById('m29SliderBox');

      if (sInput) {
        const updateSl = (val) => {
          const min = parseInt(sInput.min, 10);
          const max = parseInt(sInput.max, 10);
          const percent = ((val - min) / (max - min)) * 100;
          if (sFill) sFill.style.width = `${percent}%`;
          if (sThumbWrapper) sThumbWrapper.style.left = `${percent}%`;
          if (sVal) sVal.textContent = `Tone ${val}`;
          if (sPinText) sPinText.textContent = val;
        };

        sInput.addEventListener('input', (e) => updateSl(e.target.value));
        sInput.addEventListener('focus', () => { if (sBox) sBox.classList.add('is-active'); });
        sInput.addEventListener('blur', () => { if (sBox) sBox.classList.remove('is-active'); });
        updateSl(sInput.value);
      }
    }

    function rebindUnusedButtonToasts() {
      document.querySelectorAll('#mainContainer button:not([onclick]), #mainContainer .surface-token-chip:not([onclick])').forEach(btn => {
        btn.addEventListener('click', () => {
          const text = btn.textContent.trim();
          const lang = currentLang;
          const msg = lang === 'en' ? (text ? `Button demo clicked: (${text})` : 'Button demo clicked') : (lang === 'ja' ? (text ? `デモボタンをクリックしました (${text})` : 'デモボタンをクリックしました') : (text ? `这是一个演示按钮 (${text})` : '这是一个演示按钮'));
          showDemoToast(msg);
        });
      });
    }

    function applyLanguage(lang, isInteractive = false) {
      if (lang === 'jp') lang = 'ja';
      currentLang = lang;
      localStorage.setItem('m29_lang', lang);
      document.documentElement.lang = lang === 'en' ? 'en-US' : (lang === 'ja' ? 'ja-JP' : 'zh-CN');

      const dict = I18N_SIDEBAR_TEXTS[lang] || I18N_SIDEBAR_TEXTS.zh;
      document.title = dict.docTitle;

      updateSidebarI18nTexts(lang);
      updateThemeModeTexts();
      if (typeof updateComponentPanelWidthIcon === 'function') updateComponentPanelWidthIcon();

      if (isInteractive) {
        reloadMainContentForLanguage(lang);
        showDemoToast(dict.toastLangSwitched);
      }
    }
    window.applyLanguage = applyLanguage;

    function toggleLanguage(event) {
      if (event) event.stopPropagation();
      let nextLang = 'en';
      if (currentLang === 'zh') {
        nextLang = 'en';
      } else if (currentLang === 'en') {
        nextLang = 'ja';
      } else {
        nextLang = 'zh';
      }
      applyLanguage(nextLang, true);
    }
    window.toggleLanguage = toggleLanguage;

    // =========================================================================
    // 🔀 布局左右互换 (Layout Swap)
    // =========================================================================
    let isLayoutSwapped = localStorage.getItem('m29_layout_swap') === 'true';

    function applyLayoutSwap(swapped) {
      isLayoutSwapped = swapped;
      if (swapped) {
        document.body.classList.add('layout-swap');
      } else {
        document.body.classList.remove('layout-swap');
      }
      if (window.pageOverlayScrollbar && typeof window.pageOverlayScrollbar.update === 'function') {
        window.pageOverlayScrollbar.update();
      }
    }

    function toggleLayoutSwap(event) {
      if (event) event.stopPropagation();
      const nextSwapped = !isLayoutSwapped;
      localStorage.setItem('m29_layout_swap', nextSwapped ? 'true' : 'false');
      applyLayoutSwap(nextSwapped);
      showDemoToast(currentLang === 'en' ? 'Layout Swapped' : '已切换侧边栏布局');
      
      requestAnimationFrame(() => {
        setTimeout(updateMainLayoutColumns, 50);
      });
    }
    window.toggleLayoutSwap = toggleLayoutSwap;

    function clearLocalStorageSettings() {
      localStorage.clear();
      showDemoToast(currentLang === 'en' ? 'Settings Cleared. Reloading...' : '所有记忆配置已清除，即将刷新...');
      setTimeout(() => window.location.reload(), 1500);
    }
    window.clearLocalStorageSettings = clearLocalStorageSettings;

    // =========================================================================
    // 📐 文章卡片单/双/三栏排版切换系统 (1 Column Centered / 2-3 Columns Full Width)
    // =========================================================================
    let currentCardColumns = localStorage.getItem('m29_card_columns') || '2';

    function updateMainLayoutColumns() {
      const isDesktop = window.innerWidth >= 768;
      const isPanelClosed = document.body.classList.contains('component-panel-closed') || !isDesktop;
      
      // 🌟 核心公式：当组件栏收纳或在移动端时，组件栏宽度直接算作 0；展开时扣除实际宽度与侧边栏 72px
      let panelWidth = 0;
      if (isDesktop && !isPanelClosed) {
        const rawWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--component-panel-width'), 10);
        panelWidth = (!isNaN(rawWidth) && rawWidth > 0) ? rawWidth : 290;
      }
      const railWidth = window.innerWidth >= 640 ? 72 : 0;
      
      // 主内容区域净可用宽度
      const availableWidth = window.innerWidth - railWidth - panelWidth;

      document.body.classList.remove('downgrade-1col', 'downgrade-2col');

      // 🌟 768px 平板/小屏断点或主区域可用宽度不足时，卡片强制切为单栏
      if (window.innerWidth <= 768 || availableWidth < 560) {
        document.body.classList.add('downgrade-1col');
      } else if (currentCardColumns === '3') {
        // 🌟 三栏阶梯降级：560px ~ 860px 先降为 2 栏；>= 860px 始终完整呈现 3 栏
        if (availableWidth < 860) {
          document.body.classList.add('downgrade-2col');
        }
      }

      // 🌟 1. 动态瀑布流排版：自动按列分配 ✖ 伴随卡片平滑移动动画
      renderMasonryLayout();

      // 🌟 2. 莫奈动态三色列着色系统 (第 1 列主色，第 2 列次色，第 3 列与组件栏第三色)
      applyColumnColorTones();
    }
    window.updateMainLayoutColumns = updateMainLayoutColumns;

    // 🌟 全新动态瀑布流排版引擎 (支持置顶、置底、强制满宽及顺序自适应)
    let currentRenderedCols = -1;

    function renderMasonryLayout() {
      const container = document.querySelector('.main-container');
      if (!container) return;

      // 1. 拆除 loader.js 遗留的包裹层，并将自定义属性继承到实际的顶级模块卡片上
      const wrappers = container.querySelectorAll('[data-loaded]');
      wrappers.forEach(w => {
        const card = Array.from(w.children).find(el => el.id && el.id.startsWith('section-')) || w.firstElementChild;
        if (card) {
          if (w.hasAttribute('data-span')) card.setAttribute('data-span', w.getAttribute('data-span'));
          if (w.hasAttribute('data-pin')) card.setAttribute('data-pin', w.getAttribute('data-pin'));
          if (w.hasAttribute('data-sticky')) card.setAttribute('data-sticky', w.getAttribute('data-sticky'));
          container.insertBefore(card, w); // 移出包裹层
        }
        w.remove();
      });

      // 2. 仅捕获真正的顶级模块卡片 (ID 以 section- 开头，绝不误抓卡片内部的嵌套子卡片或弹窗)
      const allCards = Array.from(container.querySelectorAll('[id^="section-"]'));
      if (!allCards.length) return;

      // 🌟 核心防乱序：依据标准模块定义顺序进行绝对稳定排序，防止在列容器重建后获取到的 DOM 顺序发生混乱
      const STABLE_SECTION_ORDER = [
        'section-overview',
        'section-buttons',
        'section-cards',
        'section-chips',
        'section-form',
        'section-list',
        'section-dialogs',
        'section-tabs',
        'section-progress',
        'section-monet-lab',
        'section-typography',
        'section-pickers',
        'section-footer'
      ];
      allCards.sort((a, b) => {
        const ia = STABLE_SECTION_ORDER.indexOf(a.id);
        const ib = STABLE_SECTION_ORDER.indexOf(b.id);
        if (ia !== -1 && ib !== -1) return ia - ib;
        if (ia !== -1) return -1;
        if (ib !== -1) return 1;
        return 0;
      });

      let targetCols = 1;
      if (document.body.classList.contains('layout-triple-columns')) {
        targetCols = document.body.classList.contains('downgrade-1col') ? 1 : (document.body.classList.contains('downgrade-2col') ? 2 : 3);
      } else if (document.body.classList.contains('layout-double-columns')) {
        targetCols = document.body.classList.contains('downgrade-1col') ? 1 : 2;
      }

      if (targetCols === currentRenderedCols) return;

      // 🌟 FLIP 动画 Step 1 (First): 记录所有卡片在排版前的屏幕绝对坐标
      const firstPositions = new Map();
      allCards.forEach(card => {
        const rect = card.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          firstPositions.set(card, rect);
        }
      });

      currentRenderedCols = targetCols;

      // 清理已有列容器
      const existingCols = Array.from(container.querySelectorAll('.masonry-col'));
      existingCols.forEach(col => col.remove());

      // 3. 按 `data-pin` 分类卡片
      const topPinned = [];
      const bottomPinned = [];
      const normalCards = [];

      allCards.forEach(card => {
        const pin = card.getAttribute('data-pin');
        if (pin === 'top') topPinned.push(card);
        else if (pin === 'bottom') bottomPinned.push(card);
        else normalCards.push(card);
      });

      // 优先追加置顶卡片
      topPinned.forEach(card => container.appendChild(card));

      if (targetCols === 1) {
        // 单栏模式：所有卡片依次排布
        normalCards.forEach(card => container.appendChild(card));
      } else {
        // 🌟 智能自适应瀑布流填充引擎 (Greedy Shortest Column Packing)：
        // 遇到长短卡片搭配时，每次优先填入当前高度最短的列，实现无缝紧凑排版！
        let currentColsDivs = [];

        const startNewColumnsGroup = () => {
          currentColsDivs = [];
          for (let i = 0; i < targetCols; i++) {
            const col = document.createElement('div');
            col.className = 'masonry-col';
            container.appendChild(col);
            currentColsDivs.push(col);
          }
        };

        startNewColumnsGroup();

        normalCards.forEach(card => {
          if (card.getAttribute('data-span') === 'full') {
            container.appendChild(card); // 独占满宽，跨层级
            startNewColumnsGroup();      // 强制重启一组新的瀑布流
          } else {
            // 寻找当前高度最短的列进行填充 (自适应紧凑瀑布流)
            let shortestCol = currentColsDivs[0];
            let minHeight = shortestCol.scrollHeight || shortestCol.offsetHeight || 0;
            for (let i = 1; i < currentColsDivs.length; i++) {
              const h = currentColsDivs[i].scrollHeight || currentColsDivs[i].offsetHeight || 0;
              if (h < minHeight) {
                minHeight = h;
                shortestCol = currentColsDivs[i];
              }
            }
            shortestCol.appendChild(card);
          }
        });
      }

      // 追加置底卡片
      bottomPinned.forEach(card => container.appendChild(card));

      // 🌟 FLIP 动画：纯净自然位移动画 (无拉伸形变、无回弹超调，纯粹丝滑平移入位)
      if (firstPositions.size > 0) {
        requestAnimationFrame(() => {
          allCards.forEach(card => {
            const firstRect = firstPositions.get(card);
            if (!firstRect) return;
            const lastRect = card.getBoundingClientRect();

            const dx = firstRect.left - lastRect.left;
            const dy = firstRect.top - lastRect.top;

            if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
              card.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
              card.style.transition = 'none';

              requestAnimationFrame(() => {
                card.style.transition = 'transform 0.3s cubic-bezier(0, 0, 0.2, 1)';
                card.style.transform = 'translate3d(0, 0, 0)';

                const onEnd = () => {
                  card.style.transition = '';
                  card.style.transform = '';
                  card.removeEventListener('transitionend', onEnd);
                };
                card.addEventListener('transitionend', onEnd, { once: true });
              });
            }
          });
        });
      }
    }
    window.renderMasonryLayout = renderMasonryLayout;

    // 🌟 卡片着色系统 (统一使用主色对应色阶)
    function applyColumnColorTones() {
      const overviewCard = document.getElementById('section-overview');
      if (overviewCard) {
        overviewCard.style.setProperty('--card-theme-color', 'var(--mdc-theme-primary)');
      }

      const allCards = Array.from(document.querySelectorAll('.main-container [id^="section-"]'));
      if (!allCards.length) return;

      allCards.forEach(card => {
        card.style.setProperty('--card-theme-color', 'var(--mdc-theme-primary)');
      });
    }
    window.applyColumnColorTones = applyColumnColorTones;




    function applyCardColumns(cols) {
      currentCardColumns = cols;
      localStorage.setItem('m29_card_columns', cols);
      document.body.classList.remove('layout-double-columns', 'layout-triple-columns');

      if (cols === '2') {
        document.body.classList.add('layout-double-columns');
      } else if (cols === '3') {
        document.body.classList.add('layout-triple-columns');
      }
      // '1' 对应单栏居中（无多栏类）

      updateLayoutTexts();
      updateMainLayoutColumns();
      window.dispatchEvent(new Event('resize'));
    }


    function updateLayoutTexts() {
      const isEn = currentLang === 'en';
      let icon = 'view_agenda';
      let tip = '';

      if (currentCardColumns === '1') {
        icon = 'view_agenda';
        tip = isEn ? 'Switch to 2 Columns (Full Width)' : '切换为双栏满宽布局';
      } else if (currentCardColumns === '2') {
        icon = 'view_column';
        tip = isEn ? 'Switch to 3 Columns (Full Width)' : '切换为三栏满宽布局';
      } else {
        icon = 'dashboard';
        tip = isEn ? 'Switch to 1 Column (Centered)' : '切换为单栏居中布局';
      }

      const railLayoutIcon = document.getElementById('rail-layout-icon');
      const mobileLayoutIcon = document.getElementById('mobile-layout-icon');
      const btnLayout = document.getElementById('btn-toggle-layout');
      const btnMobileLayout = document.getElementById('btn-toggle-layout-mobile');

      if (railLayoutIcon) railLayoutIcon.textContent = icon;
      if (mobileLayoutIcon) mobileLayoutIcon.textContent = icon;
      if (btnLayout) btnLayout.title = tip;
      if (btnMobileLayout) btnMobileLayout.title = tip;
    }

    function toggleCardColumns(event) {
      if (event) event.stopPropagation();
      let nextCols = '1';
      if (currentCardColumns === '1') {
        nextCols = '2';
      } else if (currentCardColumns === '2') {
        nextCols = '3';
      } else {
        nextCols = '1';
      }

      applyCardColumns(nextCols);
      if (nextCols === '2') {
        showDemoToast(currentLang === 'en' ? 'Double-column full-width layout enabled' : '已开启双栏满宽布局（宽度不足自动降级）');
      } else if (nextCols === '3') {
        showDemoToast(currentLang === 'en' ? 'Triple-column full-width layout enabled' : '已开启三栏满宽布局（宽度不足自动降级）');
      } else {
        showDemoToast(currentLang === 'en' ? 'Single-column centered layout enabled' : '已切换为单栏居中布局');
      }
    }
    window.toggleCardColumns = toggleCardColumns;

    // =========================================================================
    // 🧩 侧边栏底部「组件栏」开关与唤出触发器 (电脑端开关 ✖ 手机端调出)
    // =========================================================================
    function toggleComponentPanelTrigger(event) {
      if (event) event.stopPropagation();
      const isDesktop = window.innerWidth >= 768;
      if (isDesktop) {
        const isClosed = document.body.classList.toggle('component-panel-closed');
        localStorage.setItem('m29_component_panel_closed', isClosed ? 'true' : 'false');
        updateMainLayoutColumns();
        window.dispatchEvent(new Event('resize'));
        showDemoToast(isClosed ? (currentLang === 'en' ? 'Component panel closed' : '已关闭右侧组件栏') : (currentLang === 'en' ? 'Component panel opened' : '已展开右侧组件栏'));
      } else {
        closeMobileDrawer();
        openComponentPanel();
      }
    }
    window.toggleComponentPanelTrigger = toggleComponentPanelTrigger;

    // 页面载入初始化语言与卡片列数及组件栏折叠状态
    applyLanguage(currentLang);
    applyCardColumns(currentCardColumns);
    if (localStorage.getItem('m29_component_panel_closed') === 'true' && window.innerWidth >= 768) {
      document.body.classList.add('component-panel-closed');
    }
    updateMainLayoutColumns();
    window.addEventListener('resize', updateMainLayoutColumns, { passive: true });

    // =========================================================================
    // 导航系统：桌面端 Navigation Rail (Hover展开/移开收起) ✖ 移动端独立抽屉 (0.39s跳转收起)
    // =========================================================================
    let activeOverlayId = null;
    let mobileNavDelayTimer = null;

    function openOverlay(panelId, event) {
      if (event && typeof event.stopPropagation === 'function') {
        event.stopPropagation();
      }

      const isMobile = window.innerWidth < 640;
      const targetContainer = isMobile ? document.getElementById('app-mobile-drawer') : document.getElementById('app-rail');
      const panel = document.getElementById(panelId);
      if (!targetContainer || !panel) return;

      // 确保面板放置在当前宿主容器内
      if (panel.parentElement !== targetContainer) {
        targetContainer.appendChild(panel);
      }

      if (panelId === 'themePickerPanel') {
        if (!window._isComponentPanelThemePicking) {
          currentStep = 1;
          selectedSecondary = null;
          selectedTertiary = null;
        }
        renderThemeTiles();
      }

      // 计算点击坐标相对于宿主容器的原点 (水波纹圆形展开原点)
      const rect = targetContainer.getBoundingClientRect();
      let originX = 36;
      let originY = 80;

      const evt = event || (window.event ? window.event : null);
      if (evt) {
        const clientX = evt.clientX !== undefined ? evt.clientX : (evt.touches && evt.touches[0] ? evt.touches[0].clientX : null);
        const clientY = evt.clientY !== undefined ? evt.clientY : (evt.touches && evt.touches[0] ? evt.touches[0].clientY : null);
        if (clientX !== null && clientY !== null) {
          originX = Math.max(0, Math.min(rect.width, clientX - rect.left));
          originY = Math.max(0, Math.min(rect.height, clientY - rect.top));
        } else if (evt.currentTarget && evt.currentTarget.getBoundingClientRect) {
          const itemRect = evt.currentTarget.getBoundingClientRect();
          originX = (itemRect.left + itemRect.width / 2) - rect.left;
          originY = (itemRect.top + itemRect.height / 2) - rect.top;
        }
      }

      panel.style.setProperty('--ripple-origin-x', `${originX}px`);
      panel.style.setProperty('--ripple-origin-y', `${originY}px`);

      // 若之前已有其他展开的二级菜单，先关闭它
      if (activeOverlayId && activeOverlayId !== panelId) {
        const prev = document.getElementById(activeOverlayId);
        if (prev) {
          prev.classList.remove('anim-in');
          prev.classList.remove('anim-out');
        }
      }

      if (!isMobile) {
        targetContainer.classList.add('is-expanded');
      }
      panel.style.display = 'flex';
      panel.classList.remove('anim-out');
      panel.classList.add('anim-in');
      activeOverlayId = panelId;

      const scrollable = panel.querySelector('.rail-nav-list, .secondary-overlay-content, .theme-grid') || panel;
      if (scrollable) {
        scrollable.scrollTop = 0;
      }
    }

    function closeOverlay(panelId, event) {
      if (event && typeof event.stopPropagation === 'function') {
        event.stopPropagation();
      }

      const id = panelId || activeOverlayId;
      if (!id) return;

      const panel = document.getElementById(id);
      const isMobile = window.innerWidth < 640;
      const targetContainer = isMobile ? document.getElementById('app-mobile-drawer') : document.getElementById('app-rail');
      if (!panel) return;

      // 如果有传入关闭点击事件，设置水波纹收缩原点
      if (targetContainer) {
        const rect = targetContainer.getBoundingClientRect();
        let originX = 36;
        let originY = 36;
        const evt = event || (window.event ? window.event : null);
        if (evt && evt.currentTarget && evt.currentTarget.getBoundingClientRect) {
          const itemRect = evt.currentTarget.getBoundingClientRect();
          originX = (itemRect.left + itemRect.width / 2) - rect.left;
          originY = (itemRect.top + itemRect.height / 2) - rect.top;
          panel.style.setProperty('--ripple-origin-x', `${originX}px`);
          panel.style.setProperty('--ripple-origin-y', `${originY}px`);
        }
      }

      panel.classList.remove('anim-in');
      panel.classList.add('anim-out');

      setTimeout(() => {
        panel.style.display = 'none';
        panel.classList.remove('anim-out');
        if (!isMobile && targetContainer) {
          targetContainer.classList.remove('is-expanded');
        }
        if (activeOverlayId === id) activeOverlayId = null;
      }, 260);
    }
    window.openOverlay = openOverlay;
    window.closeOverlay = closeOverlay;

    function handleNavClick() {
      // 兼容函数
    }

    // 🌟 辅助：判定是否为文本展示区或交互控件 (文本区域与正在选中的文本均不算空白区域)
    function isSidebarTextOrInteractive(target) {
      if (!target || typeof target.closest !== 'function') return false;

      // 1. 如果用户正在选中文本，绝对不算空白点击
      const sel = typeof window.getSelection === 'function' ? window.getSelection().toString().trim() : '';
      if (sel.length > 0) return true;

      // 2. 交互控件 (链接、按钮、输入框、选项卡、色块、开关等)
      const isInteractive = target.closest(
        'a, button, input, select, textarea, .mdc-button, .segmented-button, .theme-tile, .theme-swatch, .rail-nav-item, .rail-header, .mobile-drawer-header, .rail-footer-icon-btn, .rail-footer-compact-btn, .mobile-drawer-footer-btn'
      );
      if (isInteractive) return true;

      // 3. 🌟 文本区域判定 (段落、标题、标签、说明文案、头部标题、强调文本等均不算空白)
      const isTextTag = target.closest(
        'p, h1, h2, h3, h4, h5, h6, label, span, strong, em, b, i, code, pre, small, .overlay-header-title, .rail-vertical-title, #pickerStepTitle, #pickerStepSub, .theme-tile-cn, .theme-tile-en'
      );
      if (isTextTag) return true;

      // 4. 检查元素自身是否包含非纯空白的直接文本节点 (如关于/设置面板内部说明文本行)
      if (target.childNodes && target.childNodes.length > 0) {
        for (let i = 0; i < target.childNodes.length; i++) {
          const node = target.childNodes[i];
          if (node.nodeType === Node.TEXT_NODE && node.nodeValue && node.nodeValue.trim().length > 0) {
            return true;
          }
        }
      }

      // 5. 属于二级面板内容展示文本块内部 (例如关于面板中的版权、作者介绍、协议说明卡片)
      if (target.closest('.secondary-overlay-content > div, .secondary-overlay-content > p, .secondary-overlay-content > h4')) {
        return true;
      }

      return false;
    }

    // =========================================================================
    // 桌面端 Navigation Rail 交互：单图标模式 ✖ Hover 展开 ✖ 移开/单击空白收回
    // =========================================================================
    const desktopRail = document.getElementById('app-rail');
    if (desktopRail) {
      desktopRail.addEventListener('mouseenter', () => {
        if (window.innerWidth >= 640) {
          desktopRail.classList.add('is-expanded');
        }
      });

      desktopRail.addEventListener('mouseleave', () => {
        if (window.innerWidth >= 640 && !activeOverlayId) {
          desktopRail.classList.remove('is-expanded');
        }
      });

      // 🌟 桌面端点击侧边栏空白区域返回 (单点空白返回上一级/收起，文本区域除外)
      desktopRail.addEventListener('click', (e) => {
        if (window.innerWidth >= 640) {
          if (!e || !e.target) return;
          if (!isSidebarTextOrInteractive(e.target)) {
            if (activeOverlayId) {
              closeOverlay(activeOverlayId, e);
            } else {
              desktopRail.classList.remove('is-expanded');
            }
          }
        }
      });
    }

    // 点击页面主体空白处时，收回桌面端二级覆层
    document.addEventListener('click', (e) => {
      if (window.innerWidth >= 640 && activeOverlayId) {
        if (!e || !e.target || typeof e.target.closest !== 'function') return;
        if (!e.target.closest('#app-rail, .secondary-overlay-panel, #themePickerPanel, [onclick*="openOverlay"], [onclick*="themePickerPanel"]')) {
          closeOverlay(activeOverlayId, e);
        }
      }
    });

    // =========================================================================
    // 🌟 侧边栏右键返回机制 (Right-Click Context Menu Return Gesture)
    // 1. 二级菜单内右键：立即返回一级菜单并伴随水波纹收缩
    // 2. 桌面端 Rail 展开时右键：收起为 72px 紧凑模式
    // 3. 移动端抽屉内右键：立即平滑收回抽屉
    // 4. 右侧组件栏内右键：收起右侧组件栏
    // =========================================================================
    function handleSidebarContextMenu(e) {
      if (!e) return;
      e.preventDefault();
      e.stopPropagation();

      // 1. 如果当前展开了二级覆层菜单，右键立即返回一级菜单
      if (activeOverlayId) {
        closeOverlay(activeOverlayId, e);
        showDemoToast('已返回上一级菜单');
        return;
      }

      // 2. 移动端抽屉打开时，右键关闭抽屉
      const mobileDrawer = document.getElementById('app-mobile-drawer');
      if (mobileDrawer && (mobileDrawer.classList.contains('mobile-open') || mobileDrawer.classList.contains('is-open'))) {
        closeMobileDrawer();
        showDemoToast('已关闭导航抽屉');
        return;
      }

      // 3. 桌面端 Navigation Rail 处于展开态时，右键收起为 72px 紧凑模式
      if (desktopRail && desktopRail.classList.contains('is-expanded')) {
        desktopRail.classList.remove('is-expanded');
        showDemoToast('已收起导航栏');
        return;
      }

      // 4. 右侧组件栏内右键，收起组件栏
      const compPanel = document.getElementById('app-component-panel');
      if (compPanel && compPanel.contains(e.target) && !document.body.classList.contains('component-panel-closed')) {
        closeComponentPanel();
        showDemoToast('已收起组件栏');
        return;
      }
    }

    if (desktopRail) {
      desktopRail.addEventListener('contextmenu', handleSidebarContextMenu);
    }

    // =========================================================================
    // 移动端独立抽屉交互 (MdcMobileDrawer 核心规范)
    // 1. 默认不显示，点击悬浮按钮或屏幕边缘右滑呼出
    // 2. 点击右侧空白区域(Backdrop)、反向左滑、点击侧边栏内部空白区域立即收回
    // 3. 点击【跳转页面内容】的导航链接时，保持 0.39s (390ms) 延迟后平滑收回
    // 4. 点击【非跳转按钮】(如二级目录展开、设置、关于、调色盘、暗色切换) 不收回侧边栏
    // =========================================================================
    // =========================================================================
    // 📱 移动端边缘滑动引导系统 (Android 10-12 全面屏手势动画 · 直线变箭头)
    // 页面静止 2.9s 出现，持续 2.9s，每次刷新最多出现 2 次；成功打开对应面板 2 次后写入 localStorage 永久静默
    // =========================================================================
    let leftGestureHintCount = 0;
    let rightGestureHintCount = 0;
    let leftHintTimer = null;
    let rightHintTimer = null;

    function getDrawerOpenSuccessCount() {
      return parseInt(localStorage.getItem('m29_drawer_open_count') || '0', 10);
    }
    function recordDrawerOpenSuccess() {
      const count = getDrawerOpenSuccessCount() + 1;
      localStorage.setItem('m29_drawer_open_count', count.toString());
      if (count >= 2) {
        localStorage.setItem('m29_drawer_hint_disabled', 'true');
      }
      hideGestureHints();
    }

    function getPanelOpenSuccessCount() {
      return parseInt(localStorage.getItem('m29_panel_open_count') || '0', 10);
    }
    function recordPanelOpenSuccess() {
      const count = getPanelOpenSuccessCount() + 1;
      localStorage.setItem('m29_panel_open_count', count.toString());
      if (count >= 2) {
        localStorage.setItem('m29_panel_hint_disabled', 'true');
      }
      hideGestureHints();
    }

    function isLeftGestureHintDisabled() {
      return localStorage.getItem('m29_drawer_hint_disabled') === 'true' || getDrawerOpenSuccessCount() >= 2;
    }

    function isRightGestureHintDisabled() {
      return localStorage.getItem('m29_panel_hint_disabled') === 'true' || getPanelOpenSuccessCount() >= 2;
    }

    function triggerGestureHints() {
      // 1. 左侧抽屉引导 (< 640px 移动端且未超额)
      if (window.innerWidth < 640 && !isLeftGestureHintDisabled() && leftGestureHintCount < 2) {
        const mobileDrawer = document.getElementById('app-mobile-drawer');
        const isDrawerOpen = mobileDrawer && (mobileDrawer.classList.contains('mobile-open') || mobileDrawer.classList.contains('is-open'));
        if (!isDrawerOpen) {
          const hintLeft = document.getElementById('m29GestureHintLeft');
          if (hintLeft) {
            hintLeft.classList.remove('is-animating');
            void hintLeft.offsetWidth; // 触发重绘重播动画
            hintLeft.classList.add('is-animating');
            leftGestureHintCount++;
            if (leftHintTimer) clearTimeout(leftHintTimer);
            leftHintTimer = setTimeout(() => {
              hintLeft.classList.remove('is-animating');
              leftHintTimer = null;
            }, 2900);
          }
        }
      }

      // 2. 右侧组件栏引导 (< 768px 移动/折叠期且未超额)
      if (window.innerWidth < 768 && !isRightGestureHintDisabled() && rightGestureHintCount < 2) {
        const compPanel = document.getElementById('app-component-panel');
        const isPanelOpen = compPanel && compPanel.classList.contains('is-open');
        if (!isPanelOpen) {
          const hintRight = document.getElementById('m29GestureHintRight');
          if (hintRight) {
            hintRight.classList.remove('is-animating');
            void hintRight.offsetWidth; // 触发重绘重播动画
            hintRight.classList.add('is-animating');
            rightGestureHintCount++;
            if (rightHintTimer) clearTimeout(rightHintTimer);
            rightHintTimer = setTimeout(() => {
              hintRight.classList.remove('is-animating');
              rightHintTimer = null;
            }, 2900);
          }
        }
      }
    }

    function hideGestureHints() {
      const hintLeft = document.getElementById('m29GestureHintLeft');
      if (hintLeft) {
        hintLeft.classList.remove('is-animating');
      }
      if (leftHintTimer) {
        clearTimeout(leftHintTimer);
        leftHintTimer = null;
      }

      const hintRight = document.getElementById('m29GestureHintRight');
      if (hintRight) {
        hintRight.classList.remove('is-animating');
      }
      if (rightHintTimer) {
        clearTimeout(rightHintTimer);
        rightHintTimer = null;
      }
    }

    let idleTimeoutSeconds = 2.9;
    let idleTimer = null;

    function resetIdleTimer(e) {
      if (e && e.target && typeof e.target.closest === 'function') {
        if (e.target.closest('#btnMobileFloatingMenu') || 
            e.target.closest('#app-mobile-drawer') || 
            e.target.closest('#mobileDrawerBackdrop') ||
            e.target.closest('.mobile-drawer-backdrop') ||
            e.target.closest('#app-component-panel') ||
            e.target.closest('#componentPanelBackdrop') ||
            e.target.closest('.m29-gesture-hint')) {
          return;
        }
      }
      document.body.classList.remove('page-is-idle');
      hideGestureHints();
      if (idleTimer) clearTimeout(idleTimer);

      idleTimer = setTimeout(() => {
        document.body.classList.add('page-is-idle');
        triggerGestureHints();
      }, idleTimeoutSeconds * 1000);
    }

    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'touchmove', 'scroll', 'wheel'].forEach(evt => {
      window.addEventListener(evt, resetIdleTimer, { passive: true });
    });
    resetIdleTimer();

    function openMobileDrawer() {
      recordDrawerOpenSuccess();
      const mobileDrawer = document.getElementById('app-mobile-drawer');
      const backdrop = document.getElementById('mobileDrawerBackdrop');
      if (mobileDrawer) {
        mobileDrawer.classList.add('mobile-open', 'is-open');
      }
      if (backdrop) backdrop.classList.add('is-active');
    }

    function closeMobileDrawer() {
      const mobileDrawer = document.getElementById('app-mobile-drawer');
      const backdrop = document.getElementById('mobileDrawerBackdrop');
      if (mobileDrawer) {
        mobileDrawer.classList.remove('mobile-open', 'is-open');
      }
      if (backdrop) backdrop.classList.remove('is-active');
      if (activeOverlayId) closeOverlay(activeOverlayId);
      if (mobileNavDelayTimer) {
        clearTimeout(mobileNavDelayTimer);
        mobileNavDelayTimer = null;
      }
    }
    window.openMobileDrawer = openMobileDrawer;
    window.closeMobileDrawer = closeMobileDrawer;

    // =========================================================================
    // 🧩 右侧组件栏交互 (Component Panel)
    // =========================================================================
    function openComponentPanel() {
      recordPanelOpenSuccess();
      const panel = document.getElementById('app-component-panel');
      const backdrop = document.getElementById('componentPanelBackdrop');
      if (window.innerWidth >= 768) {
        document.body.classList.remove('component-panel-closed');
        localStorage.setItem('m29_component_panel_closed', 'false');
      }
      if (panel) panel.classList.add('is-open');
      if (backdrop) backdrop.classList.add('is-active');
      if (typeof updateMainLayoutColumns === 'function') updateMainLayoutColumns();
      window.dispatchEvent(new Event('resize'));
    }

    function closeComponentPanel() {
      const panel = document.getElementById('app-component-panel');
      const backdrop = document.getElementById('componentPanelBackdrop');
      if (window.innerWidth >= 768) {
        document.body.classList.add('component-panel-closed');
        localStorage.setItem('m29_component_panel_closed', 'true');
      }
      if (panel) panel.classList.remove('is-open');
      if (backdrop) backdrop.classList.remove('is-active');
      if (typeof updateMainLayoutColumns === 'function') updateMainLayoutColumns();
      window.dispatchEvent(new Event('resize'));
    }
    window.openComponentPanel = openComponentPanel;
    window.closeComponentPanel = closeComponentPanel;

    const compPanelRootEl = document.getElementById('app-component-panel');
    if (compPanelRootEl) {
      compPanelRootEl.addEventListener('contextmenu', handleSidebarContextMenu);
    }

    // 绑定移动端抽屉内部交互事件
    const mobileDrawerEl = document.getElementById('app-mobile-drawer');
    if (mobileDrawerEl) {
      mobileDrawerEl.addEventListener('contextmenu', handleSidebarContextMenu);
      mobileDrawerEl.addEventListener('click', (e) => {
        const target = e.target;
        if (!target || typeof target.closest !== 'function') return;

        // 🌟 1. 检查是否点击了跳转页面内容的导航链接 (a[href^="#"] 或 a[href])
        const navLink = target.closest('a[href]');
        if (navLink) {
          const href = navLink.getAttribute('href');
          if (href && (href.startsWith('#') || href.startsWith('http') || href.startsWith('/'))) {
            // 保持 0.39s (390ms) 延迟后再平滑收回抽屉
            if (mobileNavDelayTimer) clearTimeout(mobileNavDelayTimer);
            mobileNavDelayTimer = setTimeout(() => {
              closeMobileDrawer();
              mobileNavDelayTimer = null;
            }, 390);
            return;
          }
        }

        // 🌟 2. 文本展示区域或交互功能元素：放行阅读与交互，不收回
        if (isSidebarTextOrInteractive(target)) {
          return;
        }

        // 🌟 3. 单点真正的空白区域返回：若二级菜单开启则返回一级菜单，否则收起抽屉
        if (activeOverlayId) {
          closeOverlay(activeOverlayId, e);
        } else {
          closeMobileDrawer();
        }
      });
    }

    // 绑定移动端悬浮按钮独立事件
    const btnMobileFab = document.getElementById('btnMobileFloatingMenu');
    if (btnMobileFab) {
      btnMobileFab.addEventListener('click', (e) => {
        e.stopPropagation();
        openMobileDrawer();
      });
      btnMobileFab.addEventListener('touchstart', (e) => {
        e.stopPropagation();
      }, { passive: true });
    }

    // 移动端边缘手势滑动唤出 (12% 边缘区域滑动手势 ✖ 反向滑动收起)
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartedInDrawer = false;
    let touchStartedInPanel = false;

    window.addEventListener('touchstart', (e) => {
      if (!e.touches || !e.touches[0]) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartedInDrawer = !!(e.target && typeof e.target.closest === 'function' && e.target.closest('#app-mobile-drawer'));
      touchStartedInPanel = !!(e.target && typeof e.target.closest === 'function' && e.target.closest('#app-component-panel'));
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (!e.changedTouches || !e.changedTouches[0]) return;
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = Math.abs(touchEndY - touchStartY);
      const screenWidth = window.innerWidth;
      const edgeThreshold = Math.max(48, screenWidth * 0.12); // 12% 屏幕边缘有效滑动触发区

      const mobileDrawer = document.getElementById('app-mobile-drawer');
      const isDrawerOpen = mobileDrawer && (mobileDrawer.classList.contains('mobile-open') || mobileDrawer.classList.contains('is-open'));

      const componentPanel = document.getElementById('app-component-panel');
      const isComponentPanelOpen = componentPanel && componentPanel.classList.contains('is-open');

      // 🌟 1. 左侧抽屉 (Left Drawer):
      // 屏幕左侧 12% 区域内向右滑动打开 (避开系统自带最边缘手势，在 12% 区域即可舒适呼出)
      if (!isDrawerOpen && touchStartX <= edgeThreshold && deltaX > 35 && deltaY < Math.abs(deltaX) * 1.5) {
        openMobileDrawer();
      }
      // 抽屉开启状态下向左滑动收起
      else if (isDrawerOpen && deltaX < -40 && deltaY < Math.abs(deltaX) * 1.5) {
        closeMobileDrawer();
      }

      // 🌟 2. 右侧组件栏 (Right Component Panel):
      // 屏幕右侧 12% 区域内向左滑动打开
      if (!isComponentPanelOpen && touchStartX >= screenWidth - edgeThreshold && deltaX < -35 && deltaY < Math.abs(deltaX) * 1.5) {
        openComponentPanel();
      }
      // 组件栏开启状态下向右滑动收起
      else if (isComponentPanelOpen && deltaX > 40 && deltaY < Math.abs(deltaX) * 1.5) {
        closeComponentPanel();
      }
    }, { passive: true });

    // =========================================================================
    // Material 核心精确水波纹涟漪系统 (速率放缓 3/5 ✖ 严格单目标捕获 ✖ 绝不牵连父容器)
    // =========================================================================
    function createRipple(e, container) {
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : rect.left + rect.width / 2);
      const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : rect.top + rect.height / 2);
      
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      
      // 计算覆盖当前容器所需的最大圆半径
      const radius = Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y));
      
      const wave = document.createElement('div');
      wave.className = 'm29-ripple-wave';
      wave.style.width = `${radius * 2}px`;
      wave.style.height = `${radius * 2}px`;
      wave.style.left = `${x - radius}px`;
      wave.style.top = `${y - radius}px`;
      
      container.appendChild(wave);
      
      requestAnimationFrame(() => {
        wave.classList.add('is-active');
      });
      
      const startTime = Date.now();
      const MIN_HOLD_TIME = 120; // 🌟 严格提供 0.12s (120ms) 单点留存时间
      const startPointerX = clientX;
      const startPointerY = clientY;

      function onPointerMove(moveEvent) {
        const moveX = moveEvent.clientX !== undefined ? moveEvent.clientX : (moveEvent.touches && moveEvent.touches[0] ? moveEvent.touches[0].clientX : startPointerX);
        const moveY = moveEvent.clientY !== undefined ? moveEvent.clientY : (moveEvent.touches && moveEvent.touches[0] ? moveEvent.touches[0].clientY : startPointerY);
        const dist = Math.hypot(moveX - startPointerX, moveY - startPointerY);
        const hasSelection = typeof window.getSelection === 'function' && window.getSelection().toString().trim().length > 0;
        // 🌟 选中文本或拖拽时立即取消水波纹，保持纯净文本选择体验
        if (dist > 8 || hasSelection) {
          wave.classList.add('is-fading');
          setTimeout(() => {
            if (wave.parentNode) wave.parentNode.removeChild(wave);
          }, 200);
          cleanup();
        }
      }

      function cleanup() {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', removeRipple);
        window.removeEventListener('pointercancel', removeRipple);
      }

      function removeRipple() {
        cleanup();
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, MIN_HOLD_TIME - elapsed);

        setTimeout(() => {
          wave.classList.add('is-fading');
          setTimeout(() => {
            if (wave.parentNode) wave.parentNode.removeChild(wave);
          }, 850);
        }, remaining);
      }
      
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerup', removeRipple, { once: true });
      window.addEventListener('pointercancel', removeRipple, { once: true });
      setTimeout(removeRipple, 2400);
    }

    // 统一精确水波纹委托选择器 (列表项、按钮、标签严格单点隔离，绝不波及父容器)
    const INNER_INTERACTIVE_SELECTOR = [
      '.mdc-list-item',
      '.rail-nav-item',
      '.mobile-drawer-nav-item',
      '.m29-segmented-button',
      '.segmented-button',
      '.surface-token-chip',
      '.mdc-chip',
      '.theme-tile',
      '.theme-swatch',
      '.preview-img-box',
      '.m29-expansion-header',
      '.expansion-header',
      '.m29-tab-item',
      '.mdc-button',
      'button',
      '.mdc-icon-button',
      '.mdc-fab',
      '.mdc-card__action',
      '.mdc-card__primary-action'
    ].join(',');
    const CARD_CONTAINER_SELECTOR = '.demo-card, .mdc-card, [data-m29-ripple], [data-mdui-ripple]';

    // 单一全局事件委托：精准获取最内层目标容器，点列表项仅列表项有涟漪，点按钮仅按钮有涟漪，点卡片空白仅卡片背景底层有涟漪
    document.addEventListener('pointerdown', (e) => {
      if (!e || !e.target || typeof e.target.closest !== 'function') return;

      // 0. 如果当前已有正在选中的文本，不触发水波纹
      if (typeof window.getSelection === 'function' && window.getSelection().toString().trim().length > 0) {
        return;
      }

      // 1. 忽略原生输入框、单选、复选、滑块、自定义选择框以及 Picker 与复合控件、Tab 内容区域
      if (e.target.closest('input, select, textarea, .m29-slider, .m29-switch, .mdc-checkbox, .mdc-radio, .mdc-select-custom, .mdc-date-picker, .mdc-time-picker, .expansion-panel, .m29-tab-content-container, .m29-tab-panel')) {
        const btn = e.target.closest('.mdc-button, button, .mdc-date-picker__nav-btn');
        if (btn) createRipple(e, btn);
        return;
      }

      // 2. 优先查找最内层的具体交互元素（如列表项、按钮、标签、选项等）
      const innerTarget = e.target.closest(INNER_INTERACTIVE_SELECTOR);
      if (innerTarget) {
        // 🌟 精准目标隔离：水波纹仅在被点击的列表项或按钮自身内部扩散，绝不向上波及到父容器或外部卡片！
        createRipple(e, innerTarget);
        return;
      }

      // 3. 若未点击在内部具体交互元素上，且点击在卡片空白区，则仅触发当前卡片自身底层的水波纹（被卡片内前景元素遮挡）
      const cardTarget = e.target.closest(CARD_CONTAINER_SELECTOR);
      if (cardTarget) {
        createRipple(e, cardTarget);
      }
    });

    // =========================================================================
    // 真实莫奈 (Material You / CAM16 & HCT) 色彩调色盘矩阵 (包含深色、鲜亮色与浅色粉彩)
    // =========================================================================
    const MONET_PALETTES = [
      { cn: '薰衣紫', en: 'Lavender', color: '#6750A4', text: '#FFFFFF' },
      { cn: '莫奈靛蓝', en: 'Indigo', color: '#4F5B92', text: '#FFFFFF' },
      { cn: '极光蔚蓝', en: 'Cyan Teal', color: '#006874', text: '#FFFFFF' },
      { cn: '鼠尾草青', en: 'Sage Teal', color: '#006A6A', text: '#FFFFFF' },
      { cn: '深林翠绿', en: 'Forest Green', color: '#386A20', text: '#FFFFFF' },
      { cn: '橄榄青绿', en: 'Olive Green', color: '#5B6400', text: '#FFFFFF' },
      { cn: '暖阳金珀', en: 'Amber Gold', color: '#765B00', text: '#FFFFFF' },
      { cn: '夕照暖橙', en: 'Sunset Orange', color: '#8C5000', text: '#FFFFFF' },
      { cn: '陶瓦砖红', en: 'Terracotta', color: '#8B502A', text: '#FFFFFF' },
      { cn: '绯红赤玉', en: 'Crimson Red', color: '#904A42', text: '#FFFFFF' },
      { cn: '玫瑰暮粉', en: 'Rose Pink', color: '#984061', text: '#FFFFFF' },
      { cn: '锦葵凝紫', en: 'Mauve Violet', color: '#824C71', text: '#FFFFFF' },
      { cn: '黑莓李紫', en: 'Plum Berry', color: '#794F69', text: '#FFFFFF' },
      { cn: '板岩冷蓝', en: 'Slate Blue', color: '#525F7F', text: '#FFFFFF' },
      { cn: '薄荷冰绿', en: 'Mint Green', color: '#1B6C5D', text: '#FFFFFF' },
      { cn: '深海湛蓝', en: 'Ocean Blue', color: '#0061A4', text: '#FFFFFF' },
      { cn: '流沙雅金', en: 'Sand Gold', color: '#715B2F', text: '#FFFFFF' },
      { cn: '素雅冷灰', en: 'Neutral Gray', color: '#5E5E62', text: '#FFFFFF' },
      
      // 鲜亮与浅色粉彩系列 (Light & Pastel Tones)
      { cn: '樱花浅粉', en: 'Sakura Light', color: '#F48FB1', text: '#4A0021' },
      { cn: '薄荷淡青', en: 'Mint Pastel', color: '#80CBC4', text: '#00332C' },
      { cn: '晨曦暖黄', en: 'Morning Sun', color: '#FFE082', text: '#3E2723' },
      { cn: '天际蔚蓝', en: 'Sky Pastel', color: '#90CAF9', text: '#0D47A1' },
      { cn: '香芋淡紫', en: 'Taro Pastel', color: '#CE93D8', text: '#38004D' },
      { cn: '杏仁暖橘', en: 'Apricot Peach', color: '#FFCC80', text: '#4E2600' }
    ];

    let currentStep = 1; // 1: Primary, 2: Secondary, 3: Tertiary
    let selectedPrimary = '#6750A4';
    let selectedSecondary = null;
    let selectedTertiary = null;

    function renderThemeTiles() {
      const grid = document.getElementById('themeGrid');
      const stepTitle = document.getElementById('pickerStepTitle');
      const stepSub = document.getElementById('pickerStepSub');
      if (!grid) return;
      grid.innerHTML = '';
      grid.scrollTop = 0;

      const lang = currentLang;
      const isEn = lang === 'en';
      const isJa = lang === 'ja' || lang === 'jp';
      if (window._isComponentPanelThemePicking) {
        if (stepTitle) stepTitle.textContent = isEn ? 'Component Panel Palette' : (isJa ? 'パネル専用パレット' : '组件栏专属配色');
        if (stepSub) stepSub.textContent = isEn ? 'Select Monet Theme for Component Panel' : (isJa ? '右側パネルの独立モネ配色を選択' : '为右侧组件栏选择独立莫奈配色');
      } else {
        const modeText = colorPaletteMode === 1 
          ? (isEn ? '1-Color Pure Mode' : (isJa ? '単色モード' : '单色模式')) 
          : (colorPaletteMode === 2 
            ? (isEn ? '2-Color Balanced Mode' : (isJa ? '2色バランス' : '双色模式')) 
            : (isEn ? '3-Color Contrast Mode' : (isJa ? '3色対比モード' : '三色模式')));
        if (stepTitle) stepTitle.textContent = modeText;

        let subText = isEn ? 'Select Primary Color' : (isJa ? 'プライマリカラーを選択' : '选择主色');
        if (currentStep === 2) {
          subText = isEn ? 'Select Secondary Color' : (isJa ? 'セカンダリカラーを選択' : '选择次色');
        } else if (currentStep === 3) {
          subText = isEn ? 'Select Tertiary Color' : (isJa ? 'ターシャリカラーを選択' : '选择第三色');
        }
        if (stepSub) stepSub.textContent = subText;
      }

      const activeColor = window._isComponentPanelThemePicking ? (localStorage.getItem('m29_component_panel_color') || selectedPrimary) : selectedPrimary;

      MONET_PALETTES.forEach(t => {
        const tile = document.createElement('div');
        tile.className = 'theme-tile' + (t.color.toUpperCase() === (activeColor || '').toUpperCase() && (!window._isComponentPanelThemePicking ? currentStep === 1 : true) ? ' active' : '');
        tile.style.backgroundColor = t.color;
        tile.style.color = t.text;
        tile.innerHTML = `<div class="theme-tile-cn">${t.cn}</div><div class="theme-tile-en">${t.en}</div>`;

        tile.onclick = (e) => {
          if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
          handleSelectColor(t.color, e);
        };
        grid.appendChild(tile);
      });

      // 默认黑白 / 恢复跟随全局 (组件栏模式下显示恢复跟随全局)
      const specialTile = document.createElement('div');
      specialTile.className = 'theme-tile';
      if (window._isComponentPanelThemePicking) {
        specialTile.style.backgroundColor = 'var(--mdc-theme-surface-container, #f3edf7)';
        specialTile.style.color = 'var(--mdc-theme-on-surface, #1d1b20)';
        specialTile.style.border = '1px dashed rgba(0,0,0,0.2)';
        specialTile.innerHTML = `<div class="theme-tile-cn"><i class="material-icons" style="font-size: 16px; vertical-align: -3px;">sync</i> 跟随全局</div><div class="theme-tile-en">Follow Global</div>`;
        specialTile.onclick = (e) => {
          if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
          applyComponentPanelMonetTheme('auto');
          closeOverlay('themePickerPanel', e);
          window._isComponentPanelThemePicking = false;
        };
      } else if (currentStep === 1 || colorPaletteMode === 1) {
        specialTile.style.backgroundColor = '#1D1B20';
        specialTile.style.color = '#FFFFFF';
        specialTile.innerHTML = '<div class="theme-tile-cn">默认黑白</div><div class="theme-tile-en">Black & White</div>';
        specialTile.onclick = (e) => {
          if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
          selectedPrimary = '#1D1B20';
          selectedSecondary = '#49454F';
          selectedTertiary = '#605D62';
          finishMonetSelection(e);
        };
      } else {
        specialTile.style.backgroundColor = '#FFFFFF';
        specialTile.style.color = '#1D1B20';
        specialTile.style.border = '1px dashed #79747E';
        specialTile.innerHTML = '<div class="theme-tile-cn"><i class="material-icons" style="font-size: 16px; vertical-align: -3px;">fast_forward</i> 直接跳过</div><div class="theme-tile-en">Skip All</div>';
        specialTile.onclick = (e) => {
          if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
          finishMonetSelection(e);
        };
      }
      grid.appendChild(specialTile);
    }

    function handleSelectColor(hex, event) {
      if (event && typeof event.stopPropagation === 'function') {
        event.stopPropagation();
      }

      // 🌟 组件栏专属选色：只改变组件栏独立主题，绝不影响全局界面！
      if (window._isComponentPanelThemePicking) {
        applyComponentPanelMonetTheme(hex);
        closeOverlay('themePickerPanel', event);
        window._isComponentPanelThemePicking = false;
        return;
      }

      if (colorPaletteMode === 1) {
        // 🌟 单色模式：严格只允许主色的色阶配色，选择主色后直接完成！
        selectedPrimary = hex;
        selectedSecondary = hex;
        selectedTertiary = hex;
        finishMonetSelection(event);
        return;
      }
      if (currentStep === 1) {
        selectedPrimary = hex;
        currentStep = 2;
        renderThemeTiles();
      } else if (currentStep === 2) {
        selectedSecondary = hex;
        if (colorPaletteMode === 2) {
          selectedTertiary = hex;
          finishMonetSelection(event);
          return;
        }
        currentStep = 3;
        renderThemeTiles();
      } else {
        selectedTertiary = hex;
        finishMonetSelection(event);
      }
    }

    function openComponentPanelThemePicker(event) {
      window._isComponentPanelThemePicking = true;
      openOverlay('themePickerPanel', event);
    }
    window.openComponentPanelThemePicker = openComponentPanelThemePicker;

    function applyComponentPanelMonetTheme(hex) {
      const panel = document.getElementById('app-component-panel');
      if (!panel) return;
      const isEn = (localStorage.getItem('m29_lang') || 'zh') === 'en';

      const allPanelProps = [
        '--mdc-theme-primary',
        '--mdc-theme-on-primary',
        '--mdc-theme-primary-container',
        '--mdc-theme-on-primary-container',
        '--mdc-theme-secondary',
        '--mdc-theme-on-secondary',
        '--mdc-theme-secondary-container',
        '--mdc-theme-on-secondary-container',
        '--mdc-theme-tertiary',
        '--mdc-theme-on-tertiary',
        '--mdc-theme-tertiary-container',
        '--mdc-theme-on-tertiary-container',
        '--mdc-theme-surface-container-lowest',
        '--mdc-theme-surface-container-low',
        '--mdc-theme-surface-container',
        '--mdc-theme-surface-container-high',
        '--mdc-theme-surface-container-highest',
        '--mdc-theme-surface',
        '--mdc-theme-surface-dim',
        '--mdc-theme-surface-bright',
        '--mdc-theme-surface-variant',
        '--mdc-theme-on-surface',
        '--mdc-theme-on-surface-variant',
        '--mdc-theme-background',
        '--mdc-theme-outline',
        '--mdc-theme-outline-variant',
        '--mdc-theme-text-primary-on-background',
        '--mdc-theme-text-secondary-on-background',
        '--mdc-theme-text-hint-on-background',
        '--mdc-theme-text-disabled-on-background',
        '--mdc-theme-primary-50',
        '--mdc-theme-primary-100',
        '--mdc-theme-primary-200',
        '--mdc-theme-primary-700',
        '--mdc-theme-primary-900'
      ];

      if (!hex || hex === 'auto') {
        localStorage.removeItem('m29_component_panel_color');
        allPanelProps.forEach(p => panel.style.removeProperty(p));
        if (typeof refreshDatePickerThumb === 'function') refreshDatePickerThumb(true);
        showDemoToast(isEn ? 'Component panel is following global theme' : '组件栏已恢复跟随全局主题');
        return;
      }

      localStorage.setItem('m29_component_panel_color', hex);
      const isDark = panel.classList.contains('dark-theme') || (!panel.classList.contains('light-theme') && document.body.classList.contains('dark-theme'));

      let theme;
      if (window.MdcMonet && MdcMonet.MdcMonetEngine) {
        theme = MdcMonet.MdcMonetEngine.generateTheme({
          primary: hex
        }, {
          dark: isDark,
          variant: 'tonal_spot'
        });
      }

      const [hp, sp, lp] = hexToHsl(hex);
      let finalPrimary, onPrimary, pCont, onPCont;
      let surfLowest, surfLow, surfCont, surfHigh, surfHighest, surf, bg, onSurf, onSurfVar, outline;

      if (theme && theme.variables) {
        for (const [key, value] of Object.entries(theme.variables)) {
          panel.style.setProperty(key, value);
        }
      } else {
        // Fallback 与全局 applyMonetTheme 保持 100% 相同算法
        if (isDark) {
          finalPrimary = hslToHex(hp, Math.min(100, Math.max(25, sp * 0.85)), 78);
          onPrimary = '#000000';
          pCont = hslToHex(hp, Math.min(100, sp * 0.5), 32);
          onPCont = hslToHex(hp, Math.min(100, sp * 0.5), 90);

          surfLowest = hslToHex(hp, Math.min(100, sp * 0.15), 6);
          surfLow = hslToHex(hp, Math.min(100, sp * 0.15), 10);
          surfCont = hslToHex(hp, Math.min(100, sp * 0.16), 12);
          surfHigh = hslToHex(hp, Math.min(100, sp * 0.18), 16);
          surfHighest = hslToHex(hp, Math.min(100, sp * 0.2), 20);
          surf = hslToHex(hp, Math.min(100, sp * 0.14), 12);
          bg = hslToHex(hp, Math.min(100, sp * 0.12), 10);
          onSurf = '#e6e1e5';
          onSurfVar = '#cac4d0';
          outline = hslToHex(hp, Math.min(100, sp * 0.15), 45);
        } else {
          finalPrimary = hex;
          onPrimary = '#ffffff';
          pCont = hslToHex(hp, Math.min(100, sp * 0.45), 90);
          onPCont = hslToHex(hp, Math.min(100, sp * 0.6), 15);

          surfLowest = '#ffffff';
          surfLow = hslToHex(hp, Math.min(100, sp * 0.22), 97);
          surfCont = hslToHex(hp, Math.min(100, sp * 0.25), 94);
          surfHigh = hslToHex(hp, Math.min(100, sp * 0.28), 91);
          surfHighest = hslToHex(hp, Math.min(100, sp * 0.3), 88);
          surf = hslToHex(hp, Math.min(100, sp * 0.22), 98);
          bg = hslToHex(hp, Math.min(100, sp * 0.2), 98);
          onSurf = '#1d1b20';
          onSurfVar = '#49454f';
          outline = hslToHex(hp, Math.min(100, sp * 0.2), 60);
        }

        panel.style.setProperty('--mdc-theme-primary', finalPrimary);
        panel.style.setProperty('--mdc-theme-on-primary', onPrimary);
        panel.style.setProperty('--mdc-theme-primary-container', pCont);
        panel.style.setProperty('--mdc-theme-on-primary-container', onPCont);

        panel.style.setProperty('--mdc-theme-secondary', finalPrimary);
        panel.style.setProperty('--mdc-theme-on-secondary', onPrimary);
        panel.style.setProperty('--mdc-theme-secondary-container', pCont);
        panel.style.setProperty('--mdc-theme-on-secondary-container', onPCont);

        panel.style.setProperty('--mdc-theme-tertiary', finalPrimary);
        panel.style.setProperty('--mdc-theme-on-tertiary', onPrimary);
        panel.style.setProperty('--mdc-theme-tertiary-container', pCont);
        panel.style.setProperty('--mdc-theme-on-tertiary-container', onPCont);

        panel.style.setProperty('--mdc-theme-surface-container-lowest', surfLowest);
        panel.style.setProperty('--mdc-theme-surface-container-low', surfLow);
        panel.style.setProperty('--mdc-theme-surface-container', surfCont);
        panel.style.setProperty('--mdc-theme-surface-container-high', surfHigh);
        panel.style.setProperty('--mdc-theme-surface-container-highest', surfHighest);
        panel.style.setProperty('--mdc-theme-surface', surf);
        panel.style.setProperty('--mdc-theme-background', bg);
        panel.style.setProperty('--mdc-theme-on-surface', onSurf);
        panel.style.setProperty('--mdc-theme-on-surface-variant', onSurfVar);
        panel.style.setProperty('--mdc-theme-outline', outline);
      }

      if (typeof refreshDatePickerThumb === 'function') refreshDatePickerThumb(true);
      showDemoToast(isEn ? `Component panel theme updated: ${hex}` : `组件栏已更新专属 MD3 莫奈配色: ${hex}`);
    }
    window.applyComponentPanelMonetTheme = applyComponentPanelMonetTheme;

    function finishMonetSelection(event) {
      const evt = event || (window.event ? window.event : null);
      closeOverlay('themePickerPanel', evt);
      if (window._isComponentPanelThemePicking) {
        window._isComponentPanelThemePicking = false;
        applyComponentPanelMonetTheme(selectedPrimary);
      } else {
        executeThemeRippleTransition(evt, () => {
          applyMonetTheme();
          showDemoToast('已成功应用选定的莫奈三色主题');
        });
      }
    }

    function extractFromSample(p, s, t, event) {
      const evt = event || (window.event ? window.event : null);
      executeThemeRippleTransition(evt, () => {
        selectedPrimary = p;
        selectedSecondary = s;
        selectedTertiary = t;
        applyMonetTheme();
        showDemoToast(`已成功从壁纸提取并应用莫奈三色: P(${p})`);
      });
    }

    function renderTonalSwatches(theme) {
      const container = document.getElementById('monet-swatches-container');
      if (!container || !theme || !theme.tones) return;
      container.innerHTML = '';

      const lang = currentLang;

      function buildRow(title, toneMap) {
        const row = document.createElement('div');
        row.className = 'palette-row';
        row.innerHTML = `<div style="font-size: 12px; font-weight: 600;">${title}</div>`;
        const swatches = document.createElement('div');
        swatches.className = 'palette-swatches';
        for (const [deg, hex] of Object.entries(toneMap)) {
          const sw = document.createElement('div');
          sw.className = 'palette-swatch';
          sw.style.backgroundColor = hex;
          sw.title = `${deg}: ${hex}`;
          sw.innerHTML = `<span>${deg}</span><span style="font-size:8px; opacity:0.85;">${hex.slice(1,4)}</span>`;
          swatches.appendChild(sw);
        }
        row.appendChild(swatches);
        return row;
      }

      const pTitle = lang === 'en' ? 'Primary 50~900 Tonal Swatches (CAM16):' : (lang === 'ja' ? 'Primary プライマリ 50~900 全階調 (CAM16):' : 'Primary 主色 50~900 全色阶 (CAM16):');
      const sTitle = lang === 'en' ? 'Secondary 50~900 Tonal Swatches:' : (lang === 'ja' ? 'Secondary セカンダリ 50~900 全階調:' : 'Secondary 次色 50~900 全色阶:');
      const tTitle = lang === 'en' ? 'Tertiary 50~900 Tonal Swatches:' : (lang === 'ja' ? 'Tertiary ターシャリ 50~900 全階調:' : 'Tertiary 第三色 50~900 全色阶:');

      container.appendChild(buildRow(pTitle, theme.tones.primary));
      container.appendChild(buildRow(sTitle, theme.tones.secondary));
      container.appendChild(buildRow(tTitle, theme.tones.tertiary));
    }

    function hexToHsl(hex) {
      let c = (hex || '#6750a4').replace('#', '');
      if (c.length === 3) c = c.split('').map(x => x + x).join('');
      const num = parseInt(c, 16);
      let r = (num >> 16) / 255, g = ((num >> 8) & 255) / 255, b = (num & 255) / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      if (max === min) { h = s = 0; }
      else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    }

    function hslToHex(h, s, l) {
      h = ((h % 360) + 360) % 360;
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    }

    let colorPaletteMode = 3; // 1: 极致纯净单色模式, 2: 双色中阶平衡模式, 3: 官方三色全阶对比模式 (默认三色全阶)
    try {
      const saved = localStorage.getItem('mdc_color_palette_mode');
      if (saved && ['1', '2', '3'].includes(saved)) {
        colorPaletteMode = parseInt(saved, 10);
      }
    } catch (_) {}

    function setColorPaletteMode(mode, event) {
      colorPaletteMode = mode;
      try { localStorage.setItem('mdc_color_palette_mode', String(mode)); } catch (_) {}
      [1, 2, 3].forEach(m => {
        const btn = document.getElementById(`btn-color-mode-${m}`);
        if (btn) btn.classList.toggle('is-selected', m === mode);
        const labBtn = document.getElementById(`lab-color-mode-${m}`);
        if (labBtn) labBtn.classList.toggle('is-selected', m === mode);
      });
      const evt = event || (window.event ? window.event : null);
      executeThemeRippleTransition(evt, () => {
        applyMonetTheme();
      });
      const modeNames = { 1: '1色·极致单色统一模式', 2: '2色·双色中阶平衡模式', 3: '3色·三色全阶对比模式' };
      showDemoToast(`已切换色彩维度: ${modeNames[mode]}`);
    }

    function applyMonetTheme() {
      // 🌟 1. 色彩维度自由配置与色相收敛
      const [hp, sp, lp] = hexToHsl(selectedPrimary);
      
      let sHex, tHex;
      if (colorPaletteMode === 1) {
        // 🌟 单色模式：严格只允许主色的色阶配色，次色与第三色绝对收敛至主色
        sHex = selectedPrimary;
        tHex = selectedPrimary;
      } else if (colorPaletteMode === 2) {
        // 🌟 双色模式：主色 + 同相低彩度次色，第三色收敛至次色
        sHex = selectedSecondary || hslToHex(hp, Math.max(16, sp * 0.35), lp);
        tHex = sHex;
      } else {
        // 🌟 三色模式：全套官方三色，第三色产生 +60° 色相偏转
        sHex = selectedSecondary || hslToHex(hp, Math.max(16, sp * 0.35), lp);
        tHex = selectedTertiary || hslToHex(hp + 60, Math.min(85, sp * 0.9), lp);
      }

      const [hs, ss, ls] = hexToHsl(sHex);
      const [ht, st, lt] = hexToHsl(tHex);

      let theme;
      if (window.MdcMonet && MdcMonet.MdcMonetEngine) {
        theme = MdcMonet.MdcMonetEngine.applyTheme({
          primary: selectedPrimary,
          secondary: sHex,
          tertiary: tHex
        }, {
          target: document.documentElement,
          dark: isDarkMode,
          variant: 'tonal_spot'
        });
        renderTonalSwatches(theme);
      }

      // 🌟 2. 根据亮/暗模式与维度计算完整 M3 色阶
      let finalPrimary, finalSecondary, finalTertiary;
      let pCont, onPrimary, onPCont;
      let sCont, onSecondary, onSCont;
      let tCont, onTertiary, onTCont;

      if (isDarkMode) {
        // 🌙 暗色模式：Primary/Secondary/Tertiary 采用 Tone 80 柔和浅色调，保证配合 #000000 文字拥有极致对比度
        finalPrimary = hslToHex(hp, Math.min(100, Math.max(25, sp * 0.85)), 78);
        onPrimary = '#000000';
        pCont = hslToHex(hp, Math.min(100, sp * 0.5), 32);
        onPCont = hslToHex(hp, Math.min(100, sp * 0.5), 90);

        if (colorPaletteMode === 1) {
          // 单色模式：次色与第三色全色阶完全使用主色色阶
          finalSecondary = finalPrimary;
          onSecondary = onPrimary;
          sCont = pCont;
          onSCont = onPCont;

          finalTertiary = finalPrimary;
          onTertiary = onPrimary;
          tCont = pCont;
          onTCont = onPCont;
        } else if (colorPaletteMode === 2) {
          finalSecondary = hslToHex(hs, Math.min(100, Math.max(20, ss * 0.8)), 78);
          onSecondary = '#000000';
          sCont = hslToHex(hs, Math.min(100, ss * 0.4), 30);
          onSCont = hslToHex(hs, Math.min(100, ss * 0.4), 88);

          finalTertiary = finalSecondary;
          onTertiary = onSecondary;
          tCont = sCont;
          onTCont = onSCont;
        } else {
          finalSecondary = hslToHex(hs, Math.min(100, Math.max(20, ss * 0.8)), 78);
          onSecondary = '#000000';
          sCont = hslToHex(hs, Math.min(100, ss * 0.4), 30);
          onSCont = hslToHex(hs, Math.min(100, ss * 0.4), 88);

          finalTertiary = hslToHex(ht, Math.min(100, Math.max(25, st * 0.85)), 78);
          onTertiary = '#000000';
          tCont = hslToHex(ht, Math.min(100, st * 0.4), 30);
          onTCont = hslToHex(ht, Math.min(100, st * 0.45), 88);
        }
      } else {
        // ☀️ 亮色模式：主色使用 Tone 40，Container 采用 Tone 90，On-Container 采用 Tone 10
        finalPrimary = selectedPrimary;
        onPrimary = '#ffffff';
        pCont = hslToHex(hp, Math.min(100, sp * 0.45), 90);
        onPCont = hslToHex(hp, Math.min(100, sp * 0.6), 15);

        if (colorPaletteMode === 1) {
          finalSecondary = finalPrimary;
          onSecondary = onPrimary;
          sCont = pCont;
          onSCont = onPCont;

          finalTertiary = finalPrimary;
          onTertiary = onPrimary;
          tCont = pCont;
          onTCont = onPCont;
        } else if (colorPaletteMode === 2) {
          finalSecondary = sHex;
          onSecondary = '#ffffff';
          sCont = hslToHex(hs, Math.min(100, ss * 0.35), 90);
          onSCont = hslToHex(hs, Math.min(100, ss * 0.5), 15);

          finalTertiary = finalSecondary;
          onTertiary = onSecondary;
          tCont = sCont;
          onTCont = onSCont;
        } else {
          finalSecondary = sHex;
          onSecondary = '#ffffff';
          sCont = hslToHex(hs, Math.min(100, ss * 0.35), 90);
          onSCont = hslToHex(hs, Math.min(100, ss * 0.5), 15);

          finalTertiary = tHex;
          onTertiary = '#ffffff';
          tCont = hslToHex(ht, Math.min(100, st * 0.4), 90);
          onTCont = hslToHex(ht, Math.min(100, st * 0.5), 15);
        }
      }

      // 🌟 计算完整的 MD3 动态表面容器色彩层级
      let surfLowest, surfLow, surfCont, surfHigh, surfHighest, surf, bg, onSurf, onSurfVar, outline;
      if (theme && theme.surfaces) {
        surfLowest = theme.surfaces.surfaceContainerLowest;
        surfLow = theme.surfaces.surfaceContainerLow;
        surfCont = theme.surfaces.surfaceContainer;
        surfHigh = theme.surfaces.surfaceContainerHigh;
        surfHighest = theme.surfaces.surfaceContainerHighest;
        surf = theme.surfaces.surface;
        bg = theme.surfaces.background;
        onSurf = theme.surfaces.onSurface;
        onSurfVar = theme.surfaces.onSurfaceVariant;
        outline = theme.surfaces.outline;
      } else if (isDarkMode) {
        surfLowest = hslToHex(hp, Math.min(100, sp * 0.15), 6);
        surfLow = hslToHex(hp, Math.min(100, sp * 0.15), 10);
        surfCont = hslToHex(hp, Math.min(100, sp * 0.16), 12);
        surfHigh = hslToHex(hp, Math.min(100, sp * 0.18), 16);
        surfHighest = hslToHex(hp, Math.min(100, sp * 0.2), 20);
        surf = hslToHex(hp, Math.min(100, sp * 0.14), 12);
        bg = hslToHex(hp, Math.min(100, sp * 0.12), 10);
        onSurf = '#e6e1e5';
        onSurfVar = '#cac4d0';
        outline = hslToHex(hp, Math.min(100, sp * 0.15), 45);
      } else {
        surfLowest = '#ffffff';
        surfLow = hslToHex(hp, Math.min(100, sp * 0.22), 97);
        surfCont = hslToHex(hp, Math.min(100, sp * 0.25), 94);
        surfHigh = hslToHex(hp, Math.min(100, sp * 0.28), 91);
        surfHighest = hslToHex(hp, Math.min(100, sp * 0.3), 88);
        surf = hslToHex(hp, Math.min(100, sp * 0.22), 98);
        bg = hslToHex(hp, Math.min(100, sp * 0.2), 98);
        onSurf = '#1d1b20';
        onSurfVar = '#49454f';
        outline = hslToHex(hp, Math.min(100, sp * 0.2), 60);
      }

      // 🌟 3. 同步注入至 documentElement 与 body，彻底消除暗色模式失效问题
      [document.documentElement, document.body].forEach(target => {
        if (!target) return;
        target.style.setProperty('--mdc-theme-primary', finalPrimary);
        target.style.setProperty('--mdc-theme-secondary', finalSecondary);
        target.style.setProperty('--mdc-theme-tertiary', finalTertiary);

        target.style.setProperty('--mdc-theme-primary-container', pCont);
        target.style.setProperty('--mdc-theme-on-primary', onPrimary);
        target.style.setProperty('--mdc-theme-on-primary-container', onPCont);

        target.style.setProperty('--mdc-theme-secondary-container', sCont);
        target.style.setProperty('--mdc-theme-on-secondary', onSecondary);
        target.style.setProperty('--mdc-theme-on-secondary-container', onSCont);

        target.style.setProperty('--mdc-theme-tertiary-container', tCont);
        target.style.setProperty('--mdc-theme-on-tertiary', onTertiary);
        target.style.setProperty('--mdc-theme-on-tertiary-container', onTCont);

        target.style.setProperty('--mdc-theme-surface-container-lowest', surfLowest);
        target.style.setProperty('--mdc-theme-surface-container-low', surfLow);
        target.style.setProperty('--mdc-theme-surface-container', surfCont);
        target.style.setProperty('--mdc-theme-surface-container-high', surfHigh);
        target.style.setProperty('--mdc-theme-surface-container-highest', surfHighest);
        target.style.setProperty('--mdc-theme-surface', surf);
        target.style.setProperty('--mdc-theme-background', bg);
        target.style.setProperty('--mdc-theme-on-surface', onSurf);
        target.style.setProperty('--mdc-theme-on-surface-variant', onSurfVar);
        target.style.setProperty('--mdc-theme-outline', outline);

        // 选中文本色阶注入
        const p200 = (theme && theme.tones && theme.tones.primary && theme.tones.primary[200]) ? theme.tones.primary[200] : hslToHex(hp, Math.min(100, sp * 0.45), 85);
        const p700 = (theme && theme.tones && theme.tones.primary && theme.tones.primary[700]) ? theme.tones.primary[700] : hslToHex(hp, Math.min(100, sp * 0.5), 32);
        const p900 = (theme && theme.tones && theme.tones.primary && theme.tones.primary[900]) ? theme.tones.primary[900] : hslToHex(hp, Math.min(100, sp * 0.6), 15);
        const p50  = (theme && theme.tones && theme.tones.primary && theme.tones.primary[50])  ? theme.tones.primary[50]  : hslToHex(hp, Math.min(100, sp * 0.3), 96);

        target.style.setProperty('--mdc-theme-primary-200', p200);
        target.style.setProperty('--mdc-theme-primary-700', p700);
        target.style.setProperty('--mdc-theme-primary-900', p900);
        target.style.setProperty('--mdc-theme-primary-50', p50);
      });

      // 同步更新组件栏（未锁定专属调色盘时跟随全局）
      const panel = document.getElementById('app-component-panel');
      if (panel && !localStorage.getItem('m29_component_panel_color')) {
        panel.style.removeProperty('--mdc-theme-primary');
        panel.style.removeProperty('--mdc-theme-on-primary');
        panel.style.removeProperty('--mdc-theme-primary-container');
        panel.style.removeProperty('--mdc-theme-on-primary-container');
        panel.style.removeProperty('--mdc-theme-surface-container-low');
        panel.style.removeProperty('--mdc-theme-surface-container');
        panel.style.removeProperty('--mdc-theme-surface-container-high');
        panel.style.removeProperty('--mdc-theme-surface-container-highest');
        panel.style.removeProperty('--mdc-theme-on-surface');
        panel.style.removeProperty('--mdc-theme-on-surface-variant');
        if (typeof refreshDatePickerThumb === 'function') refreshDatePickerThumb(true);
      }

      const pLabel = document.getElementById('label-cur-p');
      const sLabel = document.getElementById('label-cur-s');
      const tLabel = document.getElementById('label-cur-t');
      if (pLabel) pLabel.textContent = finalPrimary;
      if (sLabel) sLabel.textContent = colorPaletteMode === 1 ? '主色色阶' : finalSecondary;
      if (tLabel) tLabel.textContent = colorPaletteMode === 1 ? '主色色阶' : (colorPaletteMode === 2 ? '次色色阶' : finalTertiary);

      // 🌟 4. 实时刷新各卡片与列的主题色着色体系
      if (typeof applyColumnColorTones === 'function') {
        applyColumnColorTones();
      }
    }

    // =========================================================================
    // M2.9 选项卡系统交互 (Sliding Indicator 动态滑块 ✖ 水平向左/向右方向切换动画)
    // 修复：根据前进/后退索引动态赋予 slide-right 或 slide-left 动画
    // =========================================================================
    let currentM29TabIndex = 0;

    function switchM29Tab(index, eventOrElement) {
      let tabElement;
      if (eventOrElement && eventOrElement.target && typeof eventOrElement.target.closest === 'function') {
        tabElement = eventOrElement.target.closest('.m29-tab-item');
      } else if (eventOrElement && typeof eventOrElement.closest === 'function') {
        tabElement = eventOrElement.closest('.m29-tab-item');
      } else if (eventOrElement instanceof HTMLElement) {
        tabElement = eventOrElement;
      }
      
      const tabs = document.querySelectorAll('.m29-tab-item');
      const panels = document.querySelectorAll('.m29-tab-panel');
      const indicator = document.getElementById('m29TabIndicator');
      
      if (!tabElement && tabs[index]) {
        tabElement = tabs[index];
      }

      const isSlideRight = index >= currentM29TabIndex;
      currentM29TabIndex = index;

      tabs.forEach((tab, i) => {
        if (i === index) {
          tab.classList.add('is-active');
        } else {
          tab.classList.remove('is-active');
        }
      });

      panels.forEach((panel, i) => {
        panel.classList.remove('slide-right', 'slide-left');
        if (i === index) {
          panel.classList.add('is-active');
          if (isSlideRight) {
            panel.classList.add('slide-right');
          } else {
            panel.classList.add('slide-left');
          }
        } else {
          panel.classList.remove('is-active');
        }
      });

      if (indicator && tabElement) {
        indicator.style.width = `${tabElement.offsetWidth}px`;
        indicator.style.left = `${tabElement.offsetLeft}px`;
      }
    }

    function initM29TabIndicator() {
      const activeTab = document.querySelector('.m29-tab-item.is-active');
      const indicator = document.getElementById('m29TabIndicator');
      if (activeTab && indicator) {
        indicator.style.width = `${activeTab.offsetWidth}px`;
        indicator.style.left = `${activeTab.offsetLeft}px`;
      }
    }

    window.addEventListener('load', initM29TabIndicator);
    window.addEventListener('resize', initM29TabIndicator);

    // 监听 Tab 卡片尺寸变化实时对齐指示器
    const tabCardEl = document.getElementById('section-tabs');
    if (tabCardEl && window.ResizeObserver) {
      new ResizeObserver(() => {
        initM29TabIndicator();
      }).observe(tabCardEl);
    }

    // =========================================================================
    // 确定型线性进度条动态控制
    // =========================================================================
    function setDeterminateProgress(val) {
      const bar = document.getElementById('demoDeterminateBar');
      const label = document.getElementById('determinate-val');
      if (bar) bar.style.width = `${val}%`;
      if (label) label.textContent = `${val}%`;
    }

    // 手风琴折叠展开
    function toggleExpansion(el) {
      el.classList.toggle('is-open');
    }

    // 对话框控制
    function openDemoDialog() {
      document.getElementById('demoDialogOverlay').style.display = 'flex';
    }
    function closeDemoDialog() {
      document.getElementById('demoDialogOverlay').style.display = 'none';
    }

    // Snackbar 提示
    let toastTimer = null;
    function showDemoToast(msg) {
      const sb = document.getElementById('demoSnackbar');
      if (!sb) return;
      if (msg) {
        const span = sb.querySelector('span');
        if (span) span.textContent = msg;
      }
      sb.classList.add('is-active');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        hideDemoToast();
      }, 2200);
    }
    function hideDemoToast() {
      const sb = document.getElementById('demoSnackbar');
      if (sb) sb.classList.remove('is-active');
      if (toastTimer) {
        clearTimeout(toastTimer);
        toastTimer = null;
      }
    }

    // =========================================================================
    // MD1 / MDUI 纯正大头针滑块联动 (Discrete Slider with Teardrop Pin)
    // =========================================================================
    const sliderInput = document.getElementById('slider-tone');
    const sliderFill = document.getElementById('m29SliderFill');
    const sliderThumbWrapper = document.getElementById('m29SliderThumbWrapper');
    const sliderVal = document.getElementById('slider-val');
    const sliderPinText = document.getElementById('m29SliderPinText');
    const sliderBox = document.getElementById('m29SliderBox');

    if (sliderInput) {
      function updateSlider(val) {
        const min = parseInt(sliderInput.min, 10);
        const max = parseInt(sliderInput.max, 10);
        const percent = ((val - min) / (max - min)) * 100;
        if (sliderFill) sliderFill.style.width = `${percent}%`;
        if (sliderThumbWrapper) sliderThumbWrapper.style.left = `${percent}%`;
        if (sliderVal) sliderVal.textContent = `Tone ${val}`;
        if (sliderPinText) sliderPinText.textContent = val;
      }

      sliderInput.addEventListener('input', (e) => {
        updateSlider(e.target.value);
      });
      sliderInput.addEventListener('focus', () => {
        if (sliderBox) sliderBox.classList.add('is-active');
      });
      sliderInput.addEventListener('blur', () => {
        if (sliderBox) sliderBox.classList.remove('is-active');
      });
      sliderInput.addEventListener('mousedown', () => {
        if (sliderBox) sliderBox.classList.add('is-active');
      });
      window.addEventListener('mouseup', () => {
        if (sliderBox) sliderBox.classList.remove('is-active');
      });
      sliderInput.addEventListener('touchstart', () => {
        if (sliderBox) sliderBox.classList.add('is-active');
      }, { passive: true });
      window.addEventListener('touchend', () => {
        if (sliderBox) sliderBox.classList.remove('is-active');
      }, { passive: true });

      updateSlider(sliderInput.value);
    }

    // =========================================================================
    // 无用/演示按钮全局点击提示 (对未绑定业务逻辑的按钮触发底部 Snackbar)
    // =========================================================================
    document.querySelectorAll('button:not([onclick]), .surface-token-chip:not([onclick])').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const text = btn.textContent.trim();
        showDemoToast(text ? `这是一个无用的按钮 (${text})` : '这是一个无用的按钮');
      });
    });

    // =========================================================================
    // Material Design 0px 自定义 Select 下拉组件交互与全局外部点击监听
    // =========================================================================
    function toggleMdcSelect(e) {
      if (e) e.stopPropagation();
      const selectBox = document.getElementById('demoMdcSelect');
      const menu = document.getElementById('mdcSelectMenu');
      const arrow = document.getElementById('mdcSelectArrow');
      const parentCard = document.getElementById('section-form');
      if (!menu || !selectBox) return;

      const isOpen = selectBox.classList.contains('is-open') || menu.classList.contains('is-open');
      if (isOpen) {
        selectBox.classList.remove('is-open');
        menu.classList.remove('is-open');
        if (arrow) arrow.style.transform = 'rotate(0deg)';
        setTimeout(() => {
          if (!selectBox.classList.contains('is-open')) {
            selectBox.style.zIndex = '50';
            if (parentCard) {
              parentCard.style.zIndex = '10';
              parentCard.style.overflow = 'hidden';
            }
          }
        }, 240);
      } else {
        selectBox.style.zIndex = '99999';
        if (parentCard) {
          parentCard.style.zIndex = '9999';
          parentCard.style.overflow = 'visible';
        }
        // Force reflow
        void selectBox.offsetWidth;
        selectBox.classList.add('is-open');
        menu.classList.add('is-open');
        if (arrow) arrow.style.transform = 'rotate(180deg)';
      }
    }

    function selectMdcOption(val, el) {
      const valEl = document.getElementById('mdcSelectValue');
      if (valEl) valEl.textContent = val;
      const selectBox = document.getElementById('demoMdcSelect');
      const parentCard = document.getElementById('section-form');
      const menu = document.getElementById('mdcSelectMenu');
      const arrow = document.getElementById('mdcSelectArrow');

      if (menu) {
        menu.querySelectorAll('.mdc-select-custom__item').forEach(item => {
          item.classList.remove('is-selected');
          const check = item.querySelector('.item-check');
          if (check) check.style.visibility = 'hidden';
        });
        el.classList.add('is-selected');
        const activeCheck = el.querySelector('.item-check');
        if (activeCheck) activeCheck.style.visibility = 'visible';
      }

      if (selectBox) selectBox.classList.remove('is-open');
      if (menu) menu.classList.remove('is-open');
      if (arrow) arrow.style.transform = 'rotate(0deg)';

      setTimeout(() => {
        if (selectBox && !selectBox.classList.contains('is-open')) {
          selectBox.style.zIndex = '50';
          if (parentCard) {
            parentCard.style.zIndex = '10';
            parentCard.style.overflow = 'hidden';
          }
        }
      }, 240);
    }

    document.addEventListener('click', (e) => {
      const selectBox = document.getElementById('demoMdcSelect');
      const parentCard = document.getElementById('section-form');
      if (selectBox && !selectBox.contains(e.target)) {
        if (selectBox.classList.contains('is-open')) {
          const menu = document.getElementById('mdcSelectMenu');
          const arrow = document.getElementById('mdcSelectArrow');
          selectBox.classList.remove('is-open');
          if (menu) menu.classList.remove('is-open');
          if (arrow) arrow.style.transform = 'rotate(0deg)';
          setTimeout(() => {
            if (!selectBox.classList.contains('is-open')) {
              selectBox.style.zIndex = '50';
              if (parentCard) {
                parentCard.style.zIndex = '10';
                parentCard.style.overflow = 'hidden';
              }
            }
          }, 240);
        }
      }
    });

    // =========================================================================
    // 外部双竖排标题动态联动系统 (上部 M2.9 / 下部 安秋，随页面与 Tab 自动变化)
    // =========================================================================
    const titleTopEl = document.getElementById('railVerticalTitleTop');
    const titleBottomEl = document.getElementById('railVerticalTitleBottom');

    // 分段按钮点击切换选中态
    function toggleSegmented(btn) {
      const group = btn && typeof btn.closest === 'function' ? btn.closest('.segmented-button-group') : null;
      if (group) {
        group.querySelectorAll('.segmented-button').forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
      }
    }

    function getSectionTitleMap() {
      const lang = currentLang;
      if (lang === 'en') {
        return [
          { id: 'section-overview', top: 'M2.9', bottom: 'Unjal' },
          { id: 'section-buttons', top: 'M2.9 · Buttons', bottom: '1. Buttons & FAB' },
          { id: 'section-cards', top: 'M2.9 · Cards', bottom: '2. Sharp Cards' },
          { id: 'section-chips', top: 'M2.9 · Chips', bottom: '3. Chips & Badges' },
          { id: 'section-form', top: 'M2.9 · Form', bottom: '4. Form Controls' },
          { id: 'section-list', top: 'M2.9 · List', bottom: '5. Lists & Panels' },
          { id: 'section-dialogs', top: 'M2.9 · Dialogs', bottom: '6. Dialogs & Menus' },
          { id: 'section-tabs', top: 'M2.9 · Tabs', bottom: '7. Tabs Bar' },
          { id: 'section-progress', top: 'M2.9 · Progress', bottom: '8. Progress Indicators' },
          { id: 'section-monet-lab', top: 'M2.9 · Monet', bottom: '9. Monet Color Lab' },
          { id: 'section-typography', top: 'M2.9 · Type', bottom: '10. Typography' },
          { id: 'section-pickers', top: 'M2.9 · Pickers', bottom: '11. Date & Time' }
        ];
      } else if (lang === 'ja' || lang === 'jp') {
        return [
          { id: 'section-overview', top: 'M2.9', bottom: '安秋' },
          { id: 'section-buttons', top: 'M2.9 · ボタン', bottom: '1. ボタンと FAB' },
          { id: 'section-cards', top: 'M2.9 · カード', bottom: '2. 直角カード' },
          { id: 'section-chips', top: 'M2.9 · チップ', bottom: '3. チップとバッジ' },
          { id: 'section-form', top: 'M2.9 · フォーム', bottom: '4. フォームとスイッチ' },
          { id: 'section-list', top: 'M2.9 · リスト', bottom: '5. リストとアコーディオン' },
          { id: 'section-dialogs', top: 'M2.9 · ダイアログ', bottom: '6. ダイアログとメニュー' },
          { id: 'section-tabs', top: 'M2.9 · タブ', bottom: '7. タブ' },
          { id: 'section-progress', top: 'M2.9 · プログレス', bottom: '8. プログレスバー' },
          { id: 'section-monet-lab', top: 'M2.9 · モネ', bottom: '9. モネカラー実験室' },
          { id: 'section-typography', top: 'M2.9 · タイポ', bottom: '10. タイポグラフィ' },
          { id: 'section-pickers', top: 'M2.9 · ピッカー', bottom: '11. 日時ピッカー' }
        ];
      }
      return [
        { id: 'section-overview', top: 'M2.9', bottom: '安秋' },
        { id: 'section-buttons', top: 'M2.9 · 按钮', bottom: '1. 按钮与 FAB' },
        { id: 'section-cards', top: 'M2.9 · 卡片', bottom: '2. 直角卡片' },
        { id: 'section-chips', top: 'M2.9 · 标签', bottom: '3. 标签与徽标' },
        { id: 'section-form', top: 'M2.9 · 表单', bottom: '4. 表单与开关' },
        { id: 'section-list', top: 'M2.9 · 列表', bottom: '5. 列表与手风琴' },
        { id: 'section-dialogs', top: 'M2.9 · 弹窗', bottom: '6. 对话框与菜单' },
        { id: 'section-tabs', top: 'M2.9 · 选项卡', bottom: '7. 选项卡 Tab' },
        { id: 'section-progress', top: 'M2.9 · 进度', bottom: '8. 进度指示器' },
        { id: 'section-monet-lab', top: 'M2.9 · 色彩', bottom: '9. 莫奈实验室' },
        { id: 'section-typography', top: 'M2.9 · 排版', bottom: '10. 排版与变量字体' },
        { id: 'section-pickers', top: 'M2.9 · 选择器', bottom: '11. 日历与时钟' }
      ];
    }

    function updateActiveSectionVerticalTitles() {
      const scrollPos = window.scrollY + 180;
      const titleMap = getSectionTitleMap();
      for (let i = titleMap.length - 1; i >= 0; i--) {
        const item = titleMap[i];
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= scrollPos) {
          updateDynamicTitles(item.top, item.bottom);
          break;
        }
      }
    }
    window.updateActiveSectionVerticalTitles = updateActiveSectionVerticalTitles;

    function updateDynamicTitles(topText, bottomText) {
      if (titleTopEl && topText) titleTopEl.textContent = topText;
      if (titleBottomEl && bottomText) titleBottomEl.textContent = bottomText;
    }

    window.addEventListener('scroll', updateActiveSectionVerticalTitles, { passive: true });

    // 初始化色彩方案维度与莫奈主题
    setColorPaletteMode(colorPaletteMode);
    setTimeout(() => {
      const firstTab = document.querySelector('.m29-tab-item.is-active');
      const indicator = document.getElementById('m29TabIndicator');
      if (firstTab && indicator) {
        indicator.style.width = `${firstTab.offsetWidth}px`;
        indicator.style.left = `${firstTab.offsetLeft}px`;
      }
    }, 100);

    // =========================================================================
    // Android 5.0 (Lollipop) ~ Android 11.0 (R) 扁平化边界弧形动效 (Flat Arc EdgeEffect)
    // 1:1 严格复刻 AOSP 原生 Flat EdgeEffect (onPull / onAbsorb / onRelease)、mDisplacement 触摸偏置与 SVG 弧顶
    // 配色与 Material Ripple 完全同源，无任何杂乱发光与光晕
    // =========================================================================
    const SVG_NS = 'http://www.w3.org/2000/svg';

    class M29FlatEdgeEffect {
      constructor(container = null) {
        this.isWindow = !container || container === document.body || container === document.documentElement;
        this.container = this.isWindow ? document.body : container;
        this.isMain = this.container && (this.container.classList.contains('main-container') || this.container.id === 'main-container');
        this.isPanel = this.container && (this.container.classList.contains('mdc-component-panel') || this.container.id === 'app-component-panel');

        this.wrapper = null;
        this.arcs = { top: null, bottom: null, left: null, right: null };
        this.paths = { top: null, bottom: null, left: null, right: null };
        this.recedeTimers = { top: null, bottom: null, left: null, right: null };
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isPulling = { top: false, bottom: false, left: false, right: false };

        this.initDOM();
        this.bindEvents();
      }

      initDOM() {
        this.wrapper = document.createElement('div');
        if (this.isMain) {
          this.wrapper.className = 'm29-overscroll-edge-container m29-overscroll-edge-container--main';
        } else if (this.isPanel) {
          this.wrapper.className = 'm29-overscroll-edge-container m29-overscroll-edge-container--panel';
        } else {
          this.wrapper.className = `m29-overscroll-edge-container ${this.isWindow ? 'm29-overscroll-edge-container--fixed' : ''}`;
        }

        ['top', 'bottom', 'left', 'right'].forEach((dir) => {
          const svg = document.createElementNS(SVG_NS, 'svg');
          svg.setAttribute('class', `m29-overscroll-edge-arc m29-overscroll-edge-arc--${dir}`);
          svg.setAttribute('preserveAspectRatio', 'none');
          
          const isVertical = dir === 'top' || dir === 'bottom';
          svg.setAttribute('viewBox', isVertical ? '0 0 1000 100' : '0 0 100 1000');

          const path = document.createElementNS(SVG_NS, 'path');
          this.updatePathD(path, dir, 0.5);

          svg.appendChild(path);
          this.wrapper.appendChild(svg);

          this.arcs[dir] = svg;
          this.paths[dir] = path;
        });

        if (this.isWindow || this.isMain) {
          document.body.appendChild(this.wrapper);
        } else {
          if (window.getComputedStyle(this.container).position === 'static') {
            this.container.style.position = 'relative';
          }
          this.container.appendChild(this.wrapper);
        }
      }

      updatePathD(pathEl, dir, displacement = 0.5) {
        const dClamped = Math.max(0.05, Math.min(0.95, displacement));
        
        if (dir === 'bottom') {
          // 底部向上拱起的半椭圆弧顶 (基底位于 y=100，最高点位于 y=0)
          const ctrlX = 1000 * (0.5 + (dClamped - 0.5) * 0.45);
          const ctrl1X = Math.max(80, Math.min(920, ctrlX - 250));
          const ctrl2X = Math.max(80, Math.min(920, ctrlX + 250));
          pathEl.setAttribute('d', `M 0 100 C ${ctrl1X} -20, ${ctrl2X} -20, 1000 100 Z`);
        } else if (dir === 'top') {
          // 顶部向下拱起的半椭圆弧顶 (基底位于 y=0，最高点位于 y=100)
          const ctrlX = 1000 * (0.5 + (dClamped - 0.5) * 0.45);
          const ctrl1X = Math.max(80, Math.min(920, ctrlX - 250));
          const ctrl2X = Math.max(80, Math.min(920, ctrlX + 250));
          pathEl.setAttribute('d', `M 0 0 C ${ctrl1X} 120, ${ctrl2X} 120, 1000 0 Z`);
        } else if (dir === 'left') {
          const ctrlY = 1000 * (0.5 + (dClamped - 0.5) * 0.45);
          const ctrl1Y = Math.max(80, Math.min(920, ctrlY - 250));
          const ctrl2Y = Math.max(80, Math.min(920, ctrlY + 250));
          pathEl.setAttribute('d', `M 0 0 C 120 ${ctrl1Y}, 120 ${ctrl2Y}, 0 1000 Z`);
        } else if (dir === 'right') {
          const ctrlY = 1000 * (0.5 + (dClamped - 0.5) * 0.45);
          const ctrl1Y = Math.max(80, Math.min(920, ctrlY - 250));
          const ctrl2Y = Math.max(80, Math.min(920, ctrlY + 250));
          pathEl.setAttribute('d', `M 100 0 C -20 ${ctrl1Y}, -20 ${ctrl2Y}, 100 1000 Z`);
        }
      }

      getDimensions() {
        const rect = this.container ? this.container.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
        const w = this.isMain ? rect.width : (this.container && this.container.clientWidth ? this.container.clientWidth : (rect.width || window.innerWidth));
        const h = this.isMain ? window.innerHeight : (this.container && this.container.clientHeight ? this.container.clientHeight : (rect.height || window.innerHeight));
        return { w, h, rect };
      }

      onPull(dir, delta, displacement = 0.5) {
        const arc = this.arcs[dir];
        const path = this.paths[dir];
        if (!arc || !path) return;

        clearTimeout(this.recedeTimers[dir]);
        this.isPulling[dir] = true;

        this.updatePathD(path, dir, displacement);

        const { w, h } = this.getDimensions();
        const isVertical = dir === 'top' || dir === 'bottom';
        const containerDim = isVertical ? w : h;

        // 🌟 核心规范：
        // 上下垂直临界：21% 宽度 ~ 29% 宽度曲线，倍率为 距离 x 12%
        // 左右水平临界：8% 高度 ~ 12% 高度曲线，倍率为 距离 x 3%
        const minDim = isVertical ? 280 : 300;
        const maxDim = isVertical ? 1200 : 1000;
        const t = Math.max(0, Math.min(1, (containerDim - minDim) / (maxDim - minDim)));
        const smoothT = t * t * (3 - 2 * t);

        const MAX_SCALE = isVertical ? (0.29 - 0.08 * smoothT) : (0.12 - 0.04 * smoothT);
        const MID_RATE = isVertical ? 0.12 : 0.03;

        const pull = Math.abs(delta);
        const normalizedPull = pull / 300; // 🌟 触摸移动距离增加到 3 倍
        const scale = Math.min(MAX_SCALE, MAX_SCALE * Math.tanh((normalizedPull * MID_RATE) / MAX_SCALE));
        const opacity = Math.min(0.28, Math.max(0.06, 0.06 + (scale / MAX_SCALE) * 0.18));

        arc.style.transition = 'none';
        if (isVertical) {
          // 🌟 上下水波纹高度按宽度计算
          const currentHeight = Math.round(w * scale);
          arc.style.height = `${currentHeight}px`;
        } else {
          // 🌟 左右水波纹宽度按高度计算 (8% ~ 12% 高度)
          const currentWidth = Math.round(h * scale);
          arc.style.width = `${currentWidth}px`;
        }

        arc.style.opacity = `${opacity}`;
      }

      onRelease(dir) {
        const arc = this.arcs[dir];
        if (!arc || !this.isPulling[dir]) return;

        this.isPulling[dir] = false;
        clearTimeout(this.recedeTimers[dir]);

        const isVertical = dir === 'top' || dir === 'bottom';
        arc.style.transition = isVertical 
          ? 'height 0.48s cubic-bezier(0.2, 0.8, 0.25, 1), opacity 0.48s cubic-bezier(0.2, 0.8, 0.25, 1)'
          : 'width 0.48s cubic-bezier(0.2, 0.8, 0.25, 1), opacity 0.48s cubic-bezier(0.2, 0.8, 0.25, 1)';
        
        if (isVertical) {
          arc.style.height = '0px';
        } else {
          arc.style.width = '0px';
        }
        arc.style.opacity = '0';
      }

      onAbsorb(dir, velocity = 80, displacement = 0.5) {
        const arc = this.arcs[dir];
        const path = this.paths[dir];
        if (!arc || !path) return;

        clearTimeout(this.recedeTimers[dir]);
        this.updatePathD(path, dir, displacement);

        const { w, h } = this.getDimensions();
        const isVertical = dir === 'top' || dir === 'bottom';
        const containerDim = isVertical ? w : h;

        // 🌟 鼠标滚轮/惯性冲击：
        // 上下：12% 宽度 ~ 16% 宽度曲线 (倍率 12%)
        // 左右：6% 高度 ~ 8% 高度曲线 (倍率 3%)
        const minDim = isVertical ? 280 : 300;
        const maxDim = isVertical ? 1200 : 1000;
        const t = Math.max(0, Math.min(1, (containerDim - minDim) / (maxDim - minDim)));
        const smoothT = t * t * (3 - 2 * t);

        const WHEEL_MAX_SCALE = isVertical ? (0.16 - 0.04 * smoothT) : (0.08 - 0.02 * smoothT);
        const MID_RATE = isVertical ? 0.12 : 0.03;

        const v = Math.abs(velocity);
        const normalizedV = v / 80;
        const peakScale = Math.min(WHEEL_MAX_SCALE, Math.max(0.03, WHEEL_MAX_SCALE * Math.tanh((normalizedV * MID_RATE * 1.5) / WHEEL_MAX_SCALE)));
        const peakOpacity = Math.min(0.24, Math.max(0.06, 0.06 + (peakScale / WHEEL_MAX_SCALE) * 0.16));

        // 阶段 1：快速吸能扩张 (Fast Expand ~140ms)
        arc.style.transition = isVertical
          ? 'height 0.14s cubic-bezier(0, 0, 0.2, 1), opacity 0.14s ease-out'
          : 'width 0.14s cubic-bezier(0, 0, 0.2, 1), opacity 0.14s ease-out';
        
        if (isVertical) {
          const peakHeight = Math.round(w * peakScale);
          arc.style.height = `${peakHeight}px`;
        } else {
          const peakWidth = Math.round(h * peakScale);
          arc.style.width = `${peakWidth}px`;
        }
        arc.style.opacity = `${peakOpacity}`;

        // 阶段 2：到达顶点后平滑收缩回弹 (Decelerate Recede ~500ms)
        this.recedeTimers[dir] = setTimeout(() => {
          arc.style.transition = isVertical
            ? 'height 0.5s cubic-bezier(0.2, 0.8, 0.25, 1), opacity 0.5s cubic-bezier(0.2, 0.8, 0.25, 1)'
            : 'width 0.5s cubic-bezier(0.2, 0.8, 0.25, 1), opacity 0.5s cubic-bezier(0.2, 0.8, 0.25, 1)';
          
          if (isVertical) {
            arc.style.height = '0px';
          } else {
            arc.style.width = '0px';
          }
          arc.style.opacity = '0';
        }, 150);
      }

      trigger(isTopOrDir, intensity = 1, displacement = 0.5) {
        let dir = 'top';
        if (typeof isTopOrDir === 'boolean') {
          dir = isTopOrDir ? 'top' : 'bottom';
        } else if (typeof isTopOrDir === 'string') {
          dir = isTopOrDir;
        }
        this.onAbsorb(dir, intensity * 70, displacement);
      }

      bindEvents() {
        // 自主容器内部绑定由全局统一委托处理，避免重复监听
      }
    }

    // 🌟 初始化内容水波纹 (Main Content) 与组件水波纹 (Component Panel)
    const mainContainerEl = document.querySelector('.main-container');
    const compPanelEl = document.getElementById('app-component-panel');

    window.mainContentEdgeEffect = mainContainerEl ? new M29FlatEdgeEffect(mainContainerEl) : new M29FlatEdgeEffect(null);
    window.componentPanelEdgeEffect = compPanelEl ? new M29FlatEdgeEffect(compPanelEl) : null;
    window.rootFlatEdgeEffect = window.mainContentEdgeEffect;

    const scrollContainerMap = new WeakMap();

    // 🌟 全局鼠标滚轮分发：组件栏在组件栏内部触发，内容区域在内容区域内部触发
    window.addEventListener('wheel', (e) => {
      // 1. 判断是否在右侧组件栏内部滚动
      const isInsidePanel = compPanelEl && (compPanelEl === e.target || compPanelEl.contains(e.target));
      if (isInsidePanel) {
        const panelBody = compPanelEl.querySelector('.component-panel-body') || compPanelEl;
        const isInsideBody = panelBody && (panelBody === e.target || panelBody.contains(e.target));

        // 若光标处于组件栏头部或外框非滚动子元素上，将滚轮量平滑转发给 panelBody
        if (!isInsideBody && panelBody) {
          panelBody.scrollBy({ top: e.deltaY, behavior: 'auto' });
          e.preventDefault();
        }

        if (panelBody && window.componentPanelEdgeEffect) {
          const scrollTop = panelBody.scrollTop;
          const maxScrollY = panelBody.scrollHeight - panelBody.clientHeight;
          const rect = compPanelEl.getBoundingClientRect();
          const displacementX = (e.clientX - rect.left) / (rect.width || 1);

          const isTop = scrollTop <= 1 && e.deltaY < 0;
          const isBottom = scrollTop >= maxScrollY - 2 && e.deltaY > 0;

          if (isTop) {
            window.componentPanelEdgeEffect.onAbsorb('top', Math.abs(e.deltaY), displacementX);
          } else if (isBottom) {
            window.componentPanelEdgeEffect.onAbsorb('bottom', Math.abs(e.deltaY), displacementX);
          }
        }
        return;
      }

      // 2. 检查是否有内部局部可滚动卡片/容器
      let el = e.target;
      let matchedInnerScrollable = false;
      while (el && el !== document.body && el !== document.documentElement && el !== mainContainerEl) {
        if (el.classList && el.classList.contains('m29-overscroll-edge-container')) {
          el = el.parentElement;
          continue;
        }
        const style = window.getComputedStyle(el);
        const isScrollableY = (style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
        const isScrollableX = (style.overflowX === 'auto' || style.overflowX === 'scroll') && el.scrollWidth > el.clientWidth;
        if (isScrollableY || isScrollableX) {
          if (!scrollContainerMap.has(el)) {
            scrollContainerMap.set(el, new M29FlatEdgeEffect(el));
          }
          const innerEffect = scrollContainerMap.get(el);
          const scrollTop = el.scrollTop;
          const maxScrollY = el.scrollHeight - el.clientHeight;
          const rect = el.getBoundingClientRect();
          const displacementX = (e.clientX - rect.left) / (rect.width || 1);

          if (scrollTop <= 1 && e.deltaY < 0) {
            innerEffect.onAbsorb('top', Math.abs(e.deltaY), displacementX);
            matchedInnerScrollable = true;
          } else if (scrollTop >= maxScrollY - 2 && e.deltaY > 0) {
            innerEffect.onAbsorb('bottom', Math.abs(e.deltaY), displacementX);
            matchedInnerScrollable = true;
          }
          break;
        }
        el = el.parentElement;
      }

      if (matchedInnerScrollable) return;

      // 3. 页面主体内容滚动与触顶/触底 (绑定至内容水波纹)
      if (window.mainContentEdgeEffect) {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
        const scrollX = window.scrollX || document.documentElement.scrollLeft;
        const maxScrollX = document.documentElement.scrollWidth - window.innerWidth;

        const rect = mainContainerEl ? mainContainerEl.getBoundingClientRect() : { left: 72, top: 0, width: window.innerWidth - 72 - 290, height: window.innerHeight };
        const displacementX = Math.max(0, Math.min(1, (e.clientX - rect.left) / (rect.width || 1)));
        const displacementY = Math.max(0, Math.min(1, (e.clientY - rect.top) / (rect.height || 1)));

        const isTop = scrollY <= 1 && e.deltaY < 0;
        const isBottom = scrollY >= maxScrollY - 2 && e.deltaY > 0;
        const isLeft = scrollX <= 1 && e.deltaX < 0;
        const isRight = scrollX >= maxScrollX - 2 && e.deltaX > 0;

        if (isTop) {
          window.mainContentEdgeEffect.onAbsorb('top', Math.abs(e.deltaY), displacementX);
        } else if (isBottom) {
          window.mainContentEdgeEffect.onAbsorb('bottom', Math.abs(e.deltaY), displacementX);
        } else if (isLeft) {
          window.mainContentEdgeEffect.onAbsorb('left', Math.abs(e.deltaX), displacementY);
        } else if (isRight) {
          window.mainContentEdgeEffect.onAbsorb('right', Math.abs(e.deltaX), displacementY);
        }
      }
    }, { passive: false, capture: true });

    // 🌟 全局触控手势分发
    let globalTouchStartX = 0;
    let globalTouchStartY = 0;
    let globalActiveTouchTarget = null;

    window.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length > 0) {
        globalTouchStartX = e.touches[0].clientX;
        globalTouchStartY = e.touches[0].clientY;
        globalActiveTouchTarget = e.target;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!e.touches || e.touches.length === 0) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - globalTouchStartY;
      const deltaX = currentX - globalTouchStartX;

      const isInsidePanel = compPanelEl && globalActiveTouchTarget && (compPanelEl === globalActiveTouchTarget || compPanelEl.contains(globalActiveTouchTarget));
      if (isInsidePanel && window.componentPanelEdgeEffect) {
        const panelBody = compPanelEl.querySelector('.component-panel-body') || compPanelEl;
        const scrollTop = panelBody.scrollTop;
        const maxScrollY = panelBody.scrollHeight - panelBody.clientHeight;
        const rect = compPanelEl.getBoundingClientRect();
        const displacementX = (currentX - rect.left) / (rect.width || 1);

        const isTop = scrollTop <= 0 && deltaY > 6;
        const isBottom = scrollTop >= maxScrollY - 2 && deltaY < -6;

        if (isTop) {
          window.componentPanelEdgeEffect.onPull('top', deltaY, displacementX);
        } else if (isBottom) {
          window.componentPanelEdgeEffect.onPull('bottom', deltaY, displacementX);
        }
        return;
      }

      if (window.mainContentEdgeEffect) {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
        const scrollX = window.scrollX || document.documentElement.scrollLeft;
        const maxScrollX = document.documentElement.scrollWidth - window.innerWidth;

        const rect = mainContainerEl ? mainContainerEl.getBoundingClientRect() : { left: 72, top: 0, width: window.innerWidth - 72 - 290, height: window.innerHeight };
        const displacementX = Math.max(0, Math.min(1, (currentX - rect.left) / (rect.width || 1)));
        const displacementY = Math.max(0, Math.min(1, (currentY - rect.top) / (rect.height || 1)));

        const isTop = scrollY <= 0 && deltaY > 6;
        const isBottom = scrollY >= maxScrollY - 2 && deltaY < -6;
        const isLeft = scrollX <= 0 && deltaX > 6;
        const isRight = scrollX >= maxScrollX - 2 && deltaX < -6;

        if (isTop) {
          window.mainContentEdgeEffect.onPull('top', deltaY, displacementX);
        } else if (isBottom) {
          window.mainContentEdgeEffect.onPull('bottom', deltaY, displacementX);
        } else if (isLeft) {
          window.mainContentEdgeEffect.onPull('left', deltaX, displacementY);
        } else if (isRight) {
          window.mainContentEdgeEffect.onPull('right', deltaX, displacementY);
        }
      }
    }, { passive: true });

    const handleGlobalTouchRelease = () => {
      if (window.componentPanelEdgeEffect) {
        window.componentPanelEdgeEffect.onRelease('top');
        window.componentPanelEdgeEffect.onRelease('bottom');
        window.componentPanelEdgeEffect.onRelease('left');
        window.componentPanelEdgeEffect.onRelease('right');
      }
      if (window.mainContentEdgeEffect) {
        window.mainContentEdgeEffect.onRelease('top');
        window.mainContentEdgeEffect.onRelease('bottom');
        window.mainContentEdgeEffect.onRelease('left');
        window.mainContentEdgeEffect.onRelease('right');
      }
    };

    window.addEventListener('touchend', handleGlobalTouchRelease, { passive: true });
    window.addEventListener('touchcancel', handleGlobalTouchRelease, { passive: true });

    // =========================================================================
    // Material 纯直角日历与时钟选择器交互逻辑 (DatePicker & TimePicker)
    // =========================================================================
    let pickerCurrentDate = new Date();
    let pickerSelectedDate = new Date();
    let pickerMode = 'day'; // 'day' | 'month'

    function updateDemoThumbPosition(activeCell, instant = false) {
      const thumb = document.querySelector('#demoDatePicker .mdc-date-picker__selection-thumb');
      const container = document.querySelector('#demoDatePicker .mdc-date-picker__body-container');
      if (!thumb || !container) return;
      if (!activeCell) {
        thumb.style.opacity = '0';
        return;
      }

      const isMonth = pickerMode === 'month';
      const cellW = activeCell.offsetWidth || (isMonth ? 88 : 38);
      const cellH = activeCell.offsetHeight || (isMonth ? 42 : 38);
      const thumbW = isMonth ? cellW : 34;
      const thumbH = isMonth ? cellH : 34;

      // 使用 offsetLeft/offsetTop 遍历计算布局偏移（免疫 CSS Transform 动画干扰）
      let offsetLeft = 0;
      let offsetTop = 0;
      let curr = activeCell;
      while (curr && curr !== container) {
        offsetLeft += curr.offsetLeft;
        offsetTop += curr.offsetTop;
        curr = curr.offsetParent;
      }

      const x = offsetLeft + (cellW - thumbW) / 2;
      const y = offsetTop + (cellH - thumbH) / 2;

      if (instant || document.body.classList.contains('is-resizing-component-panel')) {
        thumb.style.transition = 'none';
      } else {
        thumb.style.transition = '';
      }

      thumb.style.width = `${Math.round(thumbW)}px`;
      thumb.style.height = `${Math.round(thumbH)}px`;
      thumb.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
      thumb.style.opacity = '1';
    }

    function refreshDatePickerThumb(instant = false) {
      const activeCell = document.querySelector('#demoDatePicker .mdc-date-picker__cell.is-selected, #demoDatePicker .mdc-date-picker__month-cell.is-selected');
      if (activeCell) {
        updateDemoThumbPosition(activeCell, instant);
      }
    }
    window.refreshDatePickerThumb = refreshDatePickerThumb;

    // 🌟 监听日历容器尺寸变化，在任何宽度改变、折叠、拖拽时将圆点 100% 锁死在日期上
    const pickerBodyContainer = document.querySelector('#demoDatePicker .mdc-date-picker__body-container');
    if (pickerBodyContainer && window.ResizeObserver) {
      new ResizeObserver(() => {
        refreshDatePickerThumb(true);
      }).observe(pickerBodyContainer);
    }
    const demoDatePickerRoot = document.getElementById('demoDatePicker');
    if (demoDatePickerRoot && window.ResizeObserver) {
      new ResizeObserver(() => {
        refreshDatePickerThumb(true);
      }).observe(demoDatePickerRoot);
    }

    function toggleDemoDatePickerMode(targetMode) {
      const root = document.getElementById('demoDatePicker');
      pickerMode = targetMode || (pickerMode === 'day' ? 'month' : 'day');
      if (root) root.classList.toggle('is-month-mode', pickerMode === 'month');
      renderDemoDatePicker('is-switching-in', '', true);
    }

    // 🌟 动画重放辅助：移除旧动画类 → 强制 reflow → 重新添加，确保每次都能触发
    function triggerDemoAnim(el, className) {
      if (!el) return;
      el.classList.remove('slide-left', 'slide-right', 'is-switching-in', 'm29-year-anim-prev', 'm29-year-anim-next');
      void el.offsetWidth;
      if (className) {
        el.classList.add(className);
      }
    }

    function renderDemoDatePicker(slideDirection = '', yearAnimClass = '', animateHeight = false) {
      const year = pickerCurrentDate.getFullYear();
      const month = pickerCurrentDate.getMonth();

      const container = document.querySelector('#demoDatePicker .mdc-date-picker__body-container');
      const startH = container ? container.offsetHeight : 0;

      const yearEl = document.querySelector('#demoDatePicker .mdc-date-picker__header-year');
      const dateEl = document.querySelector('#demoDatePicker .mdc-date-picker__header-date');
      const monthLabel = document.querySelector('#demoDatePicker .mdc-date-picker__month-label');
      const weekdaysEl = document.querySelector('#demoDatePicker .mdc-date-picker__weekdays');
      const grid = document.querySelector('#demoDatePicker .mdc-date-picker__grid') || document.querySelector('#demoDatePicker .mdc-date-picker__month-grid');
      const prevBtn = document.querySelector('#demoDatePicker .mdc-date-picker__prev-btn');
      const nextBtn = document.querySelector('#demoDatePicker .mdc-date-picker__next-btn');

      const lang = currentLang;
      const isEn = lang === 'en';
      const isJa = lang === 'ja' || lang === 'jp';
      const weekdaysZh = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      const weekdaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekdaysJa = ['日', '月', '火', '水', '木', '金', '土'];
      const monthsEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const monthsShortEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      // 🌟 1. 顶部 Header 与副标题文案联动 (双语与日语自适应)
      if (pickerMode === 'day') {
        if (yearEl) yearEl.textContent = isEn ? `${year}` : `${year} 年`;
        if (dateEl) {
          const sMonth = pickerSelectedDate.getMonth();
          const sDay = pickerSelectedDate.getDate();
          const sW = isEn ? weekdaysEn[pickerSelectedDate.getDay()] : (isJa ? weekdaysJa[pickerSelectedDate.getDay()] + '曜日' : weekdaysZh[pickerSelectedDate.getDay()]);
          dateEl.textContent = isEn ? `${sW}, ${monthsShortEn[sMonth]} ${sDay}` : `${sMonth + 1}月${sDay}日 ${sW}`;
        }
        if (monthLabel) {
          monthLabel.textContent = isEn ? `${monthsEn[month]} ${year}` : `${year} 年 ${month + 1} 月`;
          triggerDemoAnim(monthLabel, yearAnimClass);
        }
        if (prevBtn) prevBtn.title = isEn ? 'Previous Month' : (isJa ? '前月' : '上个月');
        if (nextBtn) nextBtn.title = isEn ? 'Next Month' : (isJa ? '翌月' : '下个月');
        if (weekdaysEl) {
          weekdaysEl.style.display = 'grid';
          const arr = isEn ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : (isJa ? weekdaysJa : ['日', '一', '二', '三', '四', '五', '六']);
          weekdaysEl.innerHTML = arr.map(w => `<span>${w}</span>`).join('');
        }
      } else {
        if (yearEl) yearEl.textContent = isEn ? 'Select Month' : (isJa ? '月を選択' : '选择月份');
        if (dateEl) {
          dateEl.textContent = isEn ? `${year}` : `${year} 年`;
          triggerDemoAnim(dateEl, yearAnimClass);
        }
        if (monthLabel) {
          monthLabel.textContent = isEn ? `${year}` : `${year} 年`;
          triggerDemoAnim(monthLabel, yearAnimClass);
        }
        if (prevBtn) prevBtn.title = isEn ? 'Previous Year' : (isJa ? '前年' : '上一年');
        if (nextBtn) nextBtn.title = isEn ? 'Next Year' : (isJa ? '翌年' : '下一年');
        if (weekdaysEl) weekdaysEl.style.display = 'none';
      }

      if (!grid) return;
      grid.innerHTML = '';
      grid.className = pickerMode === 'day' ? 'mdc-date-picker__grid' : 'mdc-date-picker__month-grid';
      triggerDemoAnim(grid, slideDirection);

      let activeCell = null;

      // 🌟 2. 渲染 日期网格 (Day View)
      if (pickerMode === 'day') {
        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();
        const today = new Date();

        for (let i = 0; i < firstDay; i++) {
          const empty = document.createElement('div');
          empty.className = 'mdc-date-picker__cell is-empty';
          grid.appendChild(empty);
        }

        for (let d = 1; d <= totalDays; d++) {
          const cell = document.createElement('div');
          cell.className = 'mdc-date-picker__cell';

          const isSelected = pickerSelectedDate.getFullYear() === year &&
                             pickerSelectedDate.getMonth() === month &&
                             pickerSelectedDate.getDate() === d;
          const isToday = today.getFullYear() === year &&
                          today.getMonth() === month &&
                          today.getDate() === d;

          if (isSelected) {
            cell.classList.add('is-selected');
            activeCell = cell;
          }
          if (isToday) cell.classList.add('is-today');

          const span = document.createElement('span');
          span.textContent = d;
          cell.appendChild(span);

          cell.addEventListener('click', () => {
            pickerSelectedDate = new Date(year, month, d);
            grid.querySelectorAll('.mdc-date-picker__cell').forEach(c => c.classList.remove('is-selected'));
            cell.classList.add('is-selected');
            updateDemoThumbPosition(cell);

            if (dateEl) {
              const sMonth = pickerSelectedDate.getMonth();
              const sDay = pickerSelectedDate.getDate();
              const sW = isEn ? weekdaysEn[pickerSelectedDate.getDay()] : weekdaysZh[pickerSelectedDate.getDay()];
              dateEl.textContent = isEn ? `${sW}, ${monthsShortEn[sMonth]} ${sDay}` : `${sMonth + 1}月${sDay}日 ${sW}`;
            }
          });

          grid.appendChild(cell);
        }
      } 
      // 🌟 3. 渲染 12 个月月份网格 (Month View)
      else {
        for (let m = 0; m < 12; m++) {
          const monthCell = document.createElement('div');
          monthCell.className = 'mdc-date-picker__month-cell';
          if (pickerCurrentDate.getMonth() === m && pickerSelectedDate.getFullYear() === year) {
            monthCell.classList.add('is-selected');
            activeCell = monthCell;
          }
          monthCell.textContent = isEn ? monthsShortEn[m] : `${m + 1} 月`;

          monthCell.addEventListener('click', () => {
            pickerCurrentDate.setMonth(m);
            pickerSelectedDate.setFullYear(year);
            pickerSelectedDate.setMonth(m);
            toggleDemoDatePickerMode('day');
          });

          grid.appendChild(monthCell);
        }
      }

      // 🌟 4. 手风琴容器高度弹性拉伸过渡
      if (container && animateHeight && startH) {
        const targetH = container.scrollHeight;
        if (startH !== targetH) {
          container.style.height = `${startH}px`;
          requestAnimationFrame(() => {
            container.style.height = `${targetH}px`;
            setTimeout(() => {
              if (container) container.style.height = 'auto';
            }, 330);
          });
        }
      }

      requestAnimationFrame(() => {
        updateDemoThumbPosition(activeCell);
      });
    }

    const datePickerHeader = document.querySelector('#demoDatePicker .mdc-date-picker__header');
    const datePickerCurrentMonth = document.querySelector('#demoDatePicker .mdc-date-picker__current-month');
    if (datePickerHeader) {
      datePickerHeader.addEventListener('click', () => toggleDemoDatePickerMode());
    }
    if (datePickerCurrentMonth) {
      datePickerCurrentMonth.addEventListener('click', () => toggleDemoDatePickerMode());
    }

    const prevMonthBtn = document.querySelector('#demoDatePicker .mdc-date-picker__prev-btn');
    const nextMonthBtn = document.querySelector('#demoDatePicker .mdc-date-picker__next-btn');
    if (prevMonthBtn) {
      prevMonthBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (pickerMode === 'day') {
          pickerCurrentDate.setMonth(pickerCurrentDate.getMonth() - 1);
          renderDemoDatePicker('slide-right', '', true);
        } else {
          pickerCurrentDate.setFullYear(pickerCurrentDate.getFullYear() - 1);
          renderDemoDatePicker('', 'm29-year-anim-prev', true);
        }
      });
    }
    if (nextMonthBtn) {
      nextMonthBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (pickerMode === 'day') {
          pickerCurrentDate.setMonth(pickerCurrentDate.getMonth() + 1);
          renderDemoDatePicker('slide-left', '', true);
        } else {
          pickerCurrentDate.setFullYear(pickerCurrentDate.getFullYear() + 1);
          renderDemoDatePicker('', 'm29-year-anim-next', true);
        }
      });
    }

    function confirmDemoDate() {
      const y = pickerSelectedDate.getFullYear();
      const m = pickerSelectedDate.getMonth() + 1;
      const d = pickerSelectedDate.getDate();
      showDemoToast(`已选择日期: ${y}年${m}月${d}日`);
    }

    let timeMode = 'hour'; // 'hour' | 'minute'
    let timeHour = 9;
    let timeMinute = 30;
    let timeIsPM = false;
    let timeCurrentAngle = 270; // 9点对应 270度

    let demoNumbersBase = null;
    let demoInvertedMask = null;
    let demoClockHand = null;
    let demoCurrentDialMode = null;
    let demoCachedNodes = [];

    function setupDemoDialDOM() {
      const clockFace = document.querySelector('#demoTimePicker .mdc-time-picker__clock-face');
      if (!clockFace) return;
      clockFace.innerHTML = '';

      // 1. 底层暗色数字容器
      demoNumbersBase = document.createElement('div');
      demoNumbersBase.className = 'mdc-time-picker__numbers-base';
      clockFace.appendChild(demoNumbersBase);

      // 2. 中心点
      const centerPivot = document.createElement('div');
      centerPivot.className = 'mdc-time-picker__center-pivot';
      clockFace.appendChild(centerPivot);

      // 3. 旋转指针
      demoClockHand = document.createElement('div');
      demoClockHand.className = 'mdc-time-picker__clock-hand';

      // 4. 指针头部 34px 圆环滑块（局部遮罩剪裁器）
      const thumbCircle = document.createElement('div');
      thumbCircle.className = 'mdc-time-picker__thumb-circle';

      // 5. 逆向旋转反色白色数字镜像层
      demoInvertedMask = document.createElement('div');
      demoInvertedMask.className = 'mdc-time-picker__inverted-mask';
      thumbCircle.appendChild(demoInvertedMask);

      demoClockHand.appendChild(thumbCircle);
      clockFace.appendChild(demoClockHand);

      demoCurrentDialMode = null;
      demoCachedNodes = [];
    }

    let demoDisplayedHour = timeHour;
    let demoDisplayedMinute = timeMinute;

    function rollDemoDigitBox(box, fromVal, toVal, maxVal, stepSize, dragDirection, onFinished) {
      if (!box) return;
      if (fromVal === toVal) {
        box.innerHTML = `<span class="mdc-time-picker__digit-text">${String(toVal).padStart(2, '0')}</span>`;
        if (onFinished) onFinished();
        return;
      }

      const forwardDist = (toVal - fromVal + maxVal) % maxVal;
      const backwardDist = (fromVal - toVal + maxVal) % maxVal;

      let isUp;
      if (dragDirection !== undefined && dragDirection !== 0) {
        isUp = dragDirection > 0;
      } else {
        isUp = forwardDist <= backwardDist;
      }

      const intermediates = [];
      if (isUp) {
        let curr = fromVal;
        while (true) {
          const dist = (toVal - curr + maxVal) % maxVal;
          if (dist <= 0 || dist <= stepSize) break;
          curr = (curr + stepSize) % maxVal;
          intermediates.push(curr);
        }
      } else {
        let curr = fromVal;
        while (true) {
          const dist = (curr - toVal + maxVal) % maxVal;
          if (dist <= 0 || dist <= stepSize) break;
          curr = (curr - stepSize + maxVal) % maxVal;
          intermediates.push(curr);
        }
      }

      const token = Symbol();
      box._rollAnimToken = token;

      const itemHeight = box.clientHeight || 52;

      const track = document.createElement('div');
      track.className = 'mdc-time-picker__roller-track';
      track.style.position = 'absolute';
      track.style.left = '0';
      track.style.width = '100%';
      track.style.display = 'flex';
      track.style.flexDirection = 'column';
      track.style.willChange = 'transform';

      const createItem = (val, isInter) => {
        const el = document.createElement('div');
        el.className = 'mdc-time-picker__digit-text';
        el.style.height = `${itemHeight}px`;
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.width = '100%';
        el.textContent = String(val).padStart(2, '0');

        if (isInter) {
          // 🌟 中途步进时间变化：高透明度 (0.35) ✖ 80%字号 (32px) 显示
          el.style.opacity = '0.35';
          el.style.fontSize = '32px';
          el.style.transform = 'scale(0.8)';
        } else {
          el.style.opacity = '1';
          el.style.fontSize = '40px';
        }
        return el;
      };

      let startTranslateY = 0;
      let endTranslateY = 0;

      if (isUp) {
        track.style.top = '0';
        track.appendChild(createItem(fromVal, false));
        intermediates.forEach(v => track.appendChild(createItem(v, true)));
        track.appendChild(createItem(toVal, false));

        const totalDist = (intermediates.length + 1) * itemHeight;
        startTranslateY = 0;
        endTranslateY = -totalDist;
      } else {
        track.appendChild(createItem(toVal, false));
        intermediates.forEach(v => track.appendChild(createItem(v, true)));
        track.appendChild(createItem(fromVal, false));

        const totalDist = (intermediates.length + 1) * itemHeight;
        track.style.top = `-${totalDist}px`;
        startTranslateY = 0;
        endTranslateY = totalDist;
      }

      box.innerHTML = '';
      box.appendChild(track);

      // 🌟 过程与结果同时开始切换动画、同时结束切换动画（过程只作为动效用）
      const duration = Math.min(320, Math.max(220, 180 + intermediates.length * 28));

      const anim = track.animate([
        { transform: `translateY(${startTranslateY}px)` },
        { transform: `translateY(${endTranslateY}px)` }
      ], {
        duration: duration,
        easing: 'cubic-bezier(0.2, 0, 0, 1)',
        fill: 'forwards'
      });

      anim.onfinish = () => {
        if (box._rollAnimToken !== token) return;
        box.innerHTML = `<span class="mdc-time-picker__digit-text">${String(toVal).padStart(2, '0')}</span>`;
        if (onFinished) onFinished();
      };
    }

    function updateTimeDigitalDisplay(animate = false, onHourFinished = null) {
      const baseHour = document.querySelector('#demoTimePicker .mdc-time-picker__digital-content--base .mdc-time-picker__digit-hour');
      const baseMin = document.querySelector('#demoTimePicker .mdc-time-picker__digital-content--base .mdc-time-picker__digit-minute');
      const invHour = document.querySelector('#demoTimePicker .mdc-time-picker__digital-content--inverted .mdc-time-picker__digit-hour');
      const invMin = document.querySelector('#demoTimePicker .mdc-time-picker__digital-content--inverted .mdc-time-picker__digit-minute');
      const amBtn = document.querySelector('#demoTimePicker .mdc-time-picker__ampm-am');
      const pmBtn = document.querySelector('#demoTimePicker .mdc-time-picker__ampm-pm');

      const hStr = String(timeHour).padStart(2, '0');
      const mStr = String(timeMinute).padStart(2, '0');

      if (!animate) {
        if (baseHour) baseHour.innerHTML = `<span class="mdc-time-picker__digit-text">${hStr}</span>`;
        if (invHour) invHour.innerHTML = `<span class="mdc-time-picker__digit-text">${hStr}</span>`;
        if (baseMin) baseMin.innerHTML = `<span class="mdc-time-picker__digit-text">${mStr}</span>`;
        if (invMin) invMin.innerHTML = `<span class="mdc-time-picker__digit-text">${mStr}</span>`;
        demoDisplayedHour = timeHour;
        demoDisplayedMinute = timeMinute;
        if (onHourFinished) onHourFinished();
      } else {
        if (demoDisplayedHour !== timeHour) {
          const fromH = demoDisplayedHour;
          const toH = timeHour;
          demoDisplayedHour = timeHour;
          if (baseHour) rollDemoDigitBox(baseHour, fromH, toH, 24, 2, timeDragDirection, onHourFinished);
          if (invHour) rollDemoDigitBox(invHour, fromH, toH, 24, 2, timeDragDirection);
        } else {
          if (onHourFinished) onHourFinished();
        }
        if (demoDisplayedMinute !== timeMinute) {
          const fromM = demoDisplayedMinute;
          const toM = timeMinute;
          demoDisplayedMinute = timeMinute;
          if (baseMin) rollDemoDigitBox(baseMin, fromM, toM, 60, 5, timeDragDirection);
          if (invMin) rollDemoDigitBox(invMin, fromM, toM, 60, 5, timeDragDirection);
        }
      }

      if (amBtn) amBtn.classList.toggle('is-active', !timeIsPM);
      if (pmBtn) pmBtn.classList.toggle('is-active', timeIsPM);

      setDemoIndicatorPosition(timeMode);
    }

    function setDemoIndicatorPosition(mode) {
      const display = document.querySelector('#demoTimePicker .mdc-time-picker__digital-display');
      if (!display) return;
      const indicator = display.querySelector('.mdc-time-picker__digit-indicator');
      const invContent = display.querySelector('.mdc-time-picker__digital-content--inverted');
      const baseContent = display.querySelector('.mdc-time-picker__digital-content--base');
      if (!indicator || !invContent || !baseContent) return;

      const baseHour = baseContent.querySelector('.mdc-time-picker__digit-hour');
      const baseMin = baseContent.querySelector('.mdc-time-picker__digit-minute');
      if (!baseHour || !baseMin) return;

      const isMin = mode === 'minute';
      const targetBox = isMin ? baseMin : baseHour;
      const targetX = targetBox.offsetLeft;
      const baseW = targetBox.offsetWidth || (window.innerWidth < 600 ? 52 : 62);
      const baseH = targetBox.offsetHeight || (window.innerWidth < 600 ? 46 : 52);

      indicator.style.transform = `translateX(${targetX}px)`;
      indicator.style.width = `${baseW}px`;
      indicator.style.height = `${baseH}px`;
      invContent.style.transform = `translateX(${-targetX}px)`;
    }

    function animateDemoDigitIndicator(fromMode, toMode, onFinished) {
      const display = document.querySelector('#demoTimePicker .mdc-time-picker__digital-display');
      if (!display) return;
      const indicator = display.querySelector('.mdc-time-picker__digit-indicator');
      const invContent = display.querySelector('.mdc-time-picker__digital-content--inverted');
      const baseContent = display.querySelector('.mdc-time-picker__digital-content--base');
      if (!indicator || !invContent || !baseContent) return;

      const baseHour = baseContent.querySelector('.mdc-time-picker__digit-hour');
      const baseMin = baseContent.querySelector('.mdc-time-picker__digit-minute');
      if (!baseHour || !baseMin) return;

      const hourX = baseHour.offsetLeft;
      const minX = baseMin.offsetLeft;
      const isRight = toMode === 'minute';
      const startBox = isRight ? baseHour : baseMin;
      const endBox = isRight ? baseMin : baseHour;
      const baseW = endBox.offsetWidth || (window.innerWidth < 600 ? 52 : 62);
      const baseH = endBox.offsetHeight || (window.innerWidth < 600 ? 46 : 52);
      const stretchW = baseW + 34; // 冲刺拉伸宽度

      const startX = isRight ? hourX : minX;
      const endX = isRight ? minX : hourX;

      if (indicator._anim) indicator._anim.cancel();
      if (invContent._anim) invContent._anim.cancel();

      // 🌟 1.2s 非线性运动曲线：蓄力回缩 ➔ 冲刺大幅拉伸 ➔ 缓冲过冲与阻尼沉降归位
      let keyframes;
      if (isRight) {
        keyframes = [
          { transform: `translateX(${startX}px)`, width: `${baseW}px`, offset: 0, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
          // 蓄力压缩：向左回拉 5px，宽度压缩
          { transform: `translateX(${startX - 5}px)`, width: `${baseW - 6}px`, offset: 0.12, easing: 'cubic-bezier(0.2, 0, 0.1, 1)' },
          // 弹射拉伸：向右爆发冲刺，拉伸
          { transform: `translateX(${startX + (endX - startX) * 0.22}px)`, width: `${stretchW}px`, offset: 0.36, easing: 'cubic-bezier(0.1, 0.9, 0.2, 1)' },
          // 跨越冒号区
          { transform: `translateX(${startX + (endX - startX) * 0.65}px)`, width: `${stretchW - 4}px`, offset: 0.64, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
          // 缓冲过冲：向右探出 3px
          { transform: `translateX(${endX + 3}px)`, width: `${baseW + 2}px`, offset: 0.85, easing: 'cubic-bezier(0.2, 1, 0.3, 1)' },
          // 阻尼归位：锁定目标位置与尺寸
          { transform: `translateX(${endX}px)`, width: `${baseW}px`, offset: 1 }
        ];
      } else {
        keyframes = [
          { transform: `translateX(${startX}px)`, width: `${baseW}px`, offset: 0, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
          // 蓄力压缩：向右回拉 5px，宽度压缩
          { transform: `translateX(${startX + 5}px)`, width: `${baseW - 6}px`, offset: 0.12, easing: 'cubic-bezier(0.2, 0, 0.1, 1)' },
          // 弹射拉伸：向左爆发冲刺，拉伸
          { transform: `translateX(${startX - (startX - endX) * 0.38 - (stretchW - baseW)}px)`, width: `${stretchW}px`, offset: 0.36, easing: 'cubic-bezier(0.1, 0.9, 0.2, 1)' },
          // 跨越冒号区
          { transform: `translateX(${startX - (startX - endX) * 0.75 - (stretchW - 4 - baseW)}px)`, width: `${stretchW - 4}px`, offset: 0.64, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
          // 缓冲过冲：向左探出 3px
          { transform: `translateX(${endX - 3}px)`, width: `${baseW + 2}px`, offset: 0.85, easing: 'cubic-bezier(0.2, 1, 0.3, 1)' },
          // 阻尼归位：锁定目标位置与尺寸
          { transform: `translateX(${endX}px)`, width: `${baseW}px`, offset: 1 }
        ];
      }

      const invKeyframes = keyframes.map(kf => {
        const match = kf.transform.match(/translateX\(([-0-9.]+)px\)/);
        const x = match ? parseFloat(match[1]) : 0;
        return {
          transform: `translateX(${-x}px)`,
          offset: kf.offset,
          easing: kf.easing
        };
      });

      const animOptions = {
        duration: 800,
        fill: 'forwards'
      };

      indicator._animDirection = isRight ? 'toMinute' : 'toHour';
      indicator._anim = indicator.animate(keyframes, animOptions);
      invContent._anim = invContent.animate(invKeyframes, animOptions);

      indicator._anim.onfinish = () => {
        indicator.style.transform = `translateX(${endX}px)`;
        indicator.style.width = `${baseW}px`;
        indicator.style.height = `${baseH}px`;
        invContent.style.transform = `translateX(${-endX}px)`;
        if (onFinished) onFinished();
      };
    }

    // 🌟 打断动画机制：已执行动画反向执行 并且时长变为52%
    function interruptDemoIndicatorReverse(onFinished) {
      const display = document.querySelector('#demoTimePicker .mdc-time-picker__digital-display');
      if (!display) return false;
      const indicator = display.querySelector('.mdc-time-picker__digit-indicator');
      const invContent = display.querySelector('.mdc-time-picker__digital-content--inverted');
      if (!indicator || !invContent || !indicator._anim) return false;

      const anim = indicator._anim;
      const invAnim = invContent._anim;

      if (anim.playState === 'running' || anim.playState === 'paused') {
        const elapsed = anim.currentTime || 0;
        if (elapsed > 10) {
          // 速率设定为 -(1 / 0.52)，使倒放所需耗时恰好为已执行时间的 52%
          const reverseRate = - (1 / 0.52);
          anim.playbackRate = reverseRate;
          if (invAnim) invAnim.playbackRate = reverseRate;

          anim.onfinish = () => {
            anim.cancel();
            if (invAnim) invAnim.cancel();
            const startMode = indicator._animDirection === 'toMinute' ? 'hour' : 'minute';
            setDemoIndicatorPosition(startMode);
            if (onFinished) onFinished();
          };
          return true;
        }
      }
      return false;
    }

    function snapDemoTimeToCurrent(animate = false) {
      const targetDeg = timeMode === 'hour'
        ? (timeHour % 24) * 15
        : (timeMinute % 60) * 6;

      let currentMod = ((timeCurrentAngle % 360) + 360) % 360;
      let delta = targetDeg - currentMod;
      if (delta < -180) delta += 360;
      if (delta > 180) delta -= 360;
      timeCurrentAngle += delta;

      const transitionStyle = animate ? 'transform 0.29s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
      if (demoClockHand) {
        demoClockHand.style.transition = transitionStyle;
        demoClockHand.style.transform = `rotate(${timeCurrentAngle}deg)`;
      }
      if (demoInvertedMask) {
        demoInvertedMask.style.transition = transitionStyle;
        demoInvertedMask.style.transform = `rotate(${-timeCurrentAngle}deg)`;
      }

      renderDemoTimePicker(animate);
    }

    let timeDragDirection = 1;

    function renderDemoNumbers(isLiveDrag = false) {
      if (!demoNumbersBase || !demoInvertedMask) return;

      const isHour = timeMode === 'hour';

      // 1. 初始化或切换模式时重构持久化 DOM 节点（保持平滑 CSS 动画）
      if (demoCurrentDialMode !== timeMode) {
        demoCurrentDialMode = timeMode;
        demoNumbersBase.innerHTML = '';
        demoInvertedMask.innerHTML = '';
        demoCachedNodes = [];

        // 小时表盘：0 3 6 .. 架构（0, 3, 6, 9, 12, 15, 18, 21，共 8 个 45° 等距正八方位锚点）
        const anchorList = isHour
          ? [0, 3, 6, 9, 12, 15, 18, 21]
          : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

        anchorList.forEach(anchorVal => {
          const baseEl = document.createElement('div');
          baseEl.className = 'mdc-time-picker__number';
          demoNumbersBase.appendChild(baseEl);

          const invEl = document.createElement('div');
          invEl.className = 'mdc-time-picker__number';
          demoInvertedMask.appendChild(invEl);

          demoCachedNodes.push({ anchorVal, baseEl, invEl });
        });
      }

      const clockFace = document.querySelector('#demoTimePicker .mdc-time-picker__clock-face');
      const faceRect = clockFace ? clockFace.getBoundingClientRect() : null;
      const faceSize = (faceRect && faceRect.width > 50) ? faceRect.width : 230;
      const center = faceSize / 2;
      const radius = faceSize * (88 / 230);

      if (demoClockHand) {
        demoClockHand.style.height = `${radius}px`;
      }

      if (isHour) {
        // 🌟 小时模式：24小时 0 3 6 .. 架构 ✖ 动态数字平滑滑翔跟随（最大位移仅 15°）
        const currentHour = timeHour;
        const baseAnchor = Math.floor(currentHour / 3) * 3;
        const rem = currentHour % 3;
        const nextAnchor = (baseAnchor + 3) % 24;

        let closestAnchor;
        if (rem === 0) {
          closestAnchor = baseAnchor;
        } else if (rem === 1) {
          // 比如 1 (距离 0 只有 1 步)：由 0 滑翔至 1；4 由 3 滑翔至 4
          closestAnchor = baseAnchor;
        } else {
          // rem === 2，比如 2 (距离 3 只有 1 步)：由 3 滑翔至 2；5 由 6 滑翔至 5
          closestAnchor = nextAnchor;
        }

        demoCachedNodes.forEach(item => {
          const A = item.anchorVal;
          const isMorphing = (A === closestAnchor);

          let angleDeg;
          let text;

          if (isMorphing) {
            // 最近的基准刻度沿圆周滑翔至当前小时并显示当前小时数字
            angleDeg = (currentHour % 24) * 15;
            text = String(currentHour);
          } else {
            // 其余刻度静止在基准位置（0, 3, 6, 9, 12, 15, 18, 21）
            angleDeg = (A % 24) * 15;
            text = String(A);
          }

          const rad = (angleDeg - 90) * (Math.PI / 180);
          const x = center + radius * Math.cos(rad);
          const y = center + radius * Math.sin(rad);

          item.baseEl.style.left = `${x}px`;
          item.baseEl.style.top = `${y}px`;
          item.baseEl.textContent = text;

          item.invEl.style.left = `${x}px`;
          item.invEl.style.top = `${y}px`;
          item.invEl.textContent = text;
        });
      } else {
        // 🌟 分钟模式：方向感知迟滞（10->15在13切换，15->10在12切换）✖ 动态数字平滑变形跟随
        const currentMin = timeMinute;
        const base = Math.floor(currentMin / 5) * 5;
        const rem = currentMin - base;
        const next = (base + 5) % 60;

        let closestAnchor;
        if (rem === 0) {
          closestAnchor = base % 60;
        } else if (timeDragDirection >= 0) {
          // 顺时针（如 10->15）：10, 11, 12 使用 10；到 13 切换至 15
          closestAnchor = (rem < 3) ? (base % 60) : next;
        } else {
          // 逆时针（如 15->10）：15, 14, 13 使用 15；到 12 切换至 10
          closestAnchor = (rem > 2) ? next : (base % 60);
        }

        demoCachedNodes.forEach(item => {
          const A = item.anchorVal;
          const isMorphing = (A === closestAnchor);

          let angleDeg;
          let text;

          if (isMorphing) {
            // 最近的基准数字（如 15 或 20）平滑滑翔至指针当前分钟位置（如 16 或 19）并显示当前分钟
            angleDeg = (currentMin % 60) * 6;
            text = String(currentMin).padStart(2, '0');
          } else {
            // 其余数字安静停留在基准刻度位置
            angleDeg = (A % 60) * 6;
            text = String(A).padStart(2, '0');
          }

          const rad = (angleDeg - 90) * (Math.PI / 180);
          const x = center + radius * Math.cos(rad);
          const y = center + radius * Math.sin(rad);

          item.baseEl.style.left = `${x}px`;
          item.baseEl.style.top = `${y}px`;
          item.baseEl.textContent = text;

          item.invEl.style.left = `${x}px`;
          item.invEl.style.top = `${y}px`;
          item.invEl.textContent = text;
        });
      }
    }

    function renderDemoTimePicker(animateDigital = false) {
      updateTimeDigitalDisplay(animateDigital);

      if (demoClockHand) {
        demoClockHand.style.transform = `rotate(${timeCurrentAngle}deg)`;
      }
      if (demoInvertedMask) {
        demoInvertedMask.style.transform = `rotate(${-timeCurrentAngle}deg)`;
      }

      renderDemoNumbers(false);
    }

    const digitHour = document.querySelector('#demoTimePicker .mdc-time-picker__digit-hour');
    const digitMin = document.querySelector('#demoTimePicker .mdc-time-picker__digit-minute');
    const amBtnEl = document.querySelector('#demoTimePicker .mdc-time-picker__ampm-am');
    const pmBtnEl = document.querySelector('#demoTimePicker .mdc-time-picker__ampm-pm');
    const demoClockFace = document.querySelector('#demoTimePicker .mdc-time-picker__clock-face');
    let demoHourToMinuteTimer = null;
    let demoHourPauseTimer = null;

    if (digitHour) digitHour.addEventListener('click', () => {
      if (demoHourPauseTimer) {
        clearTimeout(demoHourPauseTimer);
        demoHourPauseTimer = null;
      }
      if (demoHourToMinuteTimer) {
        clearTimeout(demoHourToMinuteTimer);
        demoHourToMinuteTimer = null;
      }
      const wasInterrupted = interruptDemoIndicatorReverse();
      if (!wasInterrupted && timeMode !== 'hour') {
        animateDemoDigitIndicator('minute', 'hour');
      }
      timeMode = 'hour';
      snapDemoTimeToCurrent(true);
      updateTimeDigitalDisplay(false);
    });
    if (digitMin) digitMin.addEventListener('click', () => {
      if (demoHourPauseTimer) {
        clearTimeout(demoHourPauseTimer);
        demoHourPauseTimer = null;
      }
      if (demoHourToMinuteTimer) {
        clearTimeout(demoHourToMinuteTimer);
        demoHourToMinuteTimer = null;
      }
      const wasInterrupted = interruptDemoIndicatorReverse();
      if (!wasInterrupted && timeMode !== 'minute') {
        animateDemoDigitIndicator('hour', 'minute');
      }
      timeMode = 'minute';
      snapDemoTimeToCurrent(true);
      updateTimeDigitalDisplay(false);
    });
    if (amBtnEl) amBtnEl.addEventListener('click', () => {
      if (timeHour >= 12) {
        timeHour -= 12;
        timeIsPM = false;
        timeDragDirection = -1;
        if (timeMode === 'hour') {
          snapDemoTimeToCurrent(true);
        }
        updateTimeDigitalDisplay(true);
      } else {
        timeIsPM = false;
        updateTimeDigitalDisplay(false);
      }
    });
    if (pmBtnEl) pmBtnEl.addEventListener('click', () => {
      if (timeHour < 12) {
        timeHour += 12;
        timeIsPM = true;
        timeDragDirection = 1;
        if (timeMode === 'hour') {
          snapDemoTimeToCurrent(true);
        }
        updateTimeDigitalDisplay(true);
      } else {
        timeIsPM = true;
        updateTimeDigitalDisplay(false);
      }
    });

    // 🌟 表盘连续平滑跨越 00 ✖ 方向感知迟滞 ✖ 动态数字平滑变形移动 ✖ 0.29s 磁吸
    if (demoClockFace) {
      let isDragging = false;

      const updatePointer = (clientX, clientY) => {
        const rect = demoClockFace.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = clientX - centerX;
        const dy = clientY - centerY;

        let rawDeg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
        if (rawDeg < 0) rawDeg += 360;

        let currentMod = ((timeCurrentAngle % 360) + 360) % 360;
        let delta = rawDeg - currentMod;
        if (delta < -180) delta += 360;
        if (delta > 180) delta -= 360;

        if (Math.abs(delta) > 0.4) {
          timeDragDirection = delta > 0 ? 1 : -1;
        }

        timeCurrentAngle += delta;

        if (demoClockHand) {
          demoClockHand.style.transition = 'none';
          demoClockHand.style.transform = `rotate(${timeCurrentAngle}deg)`;
        }
        if (demoInvertedMask) {
          demoInvertedMask.style.transition = 'none';
          demoInvertedMask.style.transform = `rotate(${-timeCurrentAngle}deg)`;
        }

        const normAngle = ((timeCurrentAngle % 360) + 360) % 360;
        if (timeMode === 'hour') {
          // 24小时表盘：360° / 24 = 15° 每小时
          let h = Math.round(normAngle / 15);
          if (h >= 24) h = 0;
          timeHour = h;
          timeIsPM = timeHour >= 12;
        } else {
          let m = Math.round(normAngle / 6);
          if (m >= 60) m = 0;
          timeMinute = m;
        }
        renderDemoNumbers(true);
      };

      demoClockFace.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // 🌟 核心保护：只有在小时模式处于等待/过渡期间，触碰表盘才打断倒放回小时
        if (timeMode === 'hour') {
          const isTransitionPending = Boolean(demoHourPauseTimer || demoHourToMinuteTimer);
          if (demoHourPauseTimer) {
            clearTimeout(demoHourPauseTimer);
            demoHourPauseTimer = null;
          }
          if (demoHourToMinuteTimer) {
            clearTimeout(demoHourToMinuteTimer);
            demoHourToMinuteTimer = null;
          }
          if (isTransitionPending) {
            interruptDemoIndicatorReverse();
          }
        }
        // 🌟 如果已经切换到分钟模式 (timeMode === 'minute')：
        // 拖动绝对不会变回小时！保持 timeMode = 'minute'，指针与角度精确对应分钟！

        isDragging = true;
        try { demoClockFace.setPointerCapture(e.pointerId); } catch (_) {}
        updatePointer(e.clientX, e.clientY);
      });

      demoClockFace.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        e.stopPropagation();
        updatePointer(e.clientX, e.clientY);
      });

      const endPointer = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        e.stopPropagation();
        isDragging = false;
        try { demoClockFace.releasePointerCapture(e.pointerId); } catch (_) {}

        snapDemoTimeToCurrent(true);

        if (demoHourPauseTimer) {
          clearTimeout(demoHourPauseTimer);
          demoHourPauseTimer = null;
        }
        if (demoHourToMinuteTimer) {
          clearTimeout(demoHourToMinuteTimer);
          demoHourToMinuteTimer = null;
        }

        if (timeMode === 'hour') {
          // 🌟 1. 先把时的改变动画播放完
          updateTimeDigitalDisplay(true, () => {
            if (isDragging) return;

            // 🌟 2. 执行完等待 0.3s (300ms)
            demoHourPauseTimer = setTimeout(() => {
              if (isDragging) return;

              // 🌟 3. 然后开始 0.8s (800ms) 的时分切换动画
              animateDemoDigitIndicator('hour', 'minute');

              // 4. 给出 0.8s (800ms) 完整等待时间，期间维持小时表盘显示，滑块正在物理反色滑移
              demoHourToMinuteTimer = setTimeout(() => {
                demoHourToMinuteTimer = null;
                if (!isDragging) {
                  timeMode = 'minute';
                  snapDemoTimeToCurrent(true);
                  updateTimeDigitalDisplay(false);
                }
              }, 800);
            }, 300);
          });
        } else {
          updateTimeDigitalDisplay(true);
        }
      };

      demoClockFace.addEventListener('pointerup', endPointer);
      demoClockFace.addEventListener('pointercancel', endPointer);

      // 🌟 彻底隔离移动端与滚轮滚动，防止拖拽表盘时误触发页面滚动
      demoClockFace.addEventListener('touchstart', (e) => { e.preventDefault(); }, { passive: false });
      demoClockFace.addEventListener('touchmove', (e) => { e.preventDefault(); }, { passive: false });
      demoClockFace.addEventListener('wheel', (e) => { e.preventDefault(); e.stopPropagation(); }, { passive: false });

      // 🌟 尺寸响应式监听：表盘缩放时数字实时跟随缩放、当右侧可用空间少于 29% 时隐藏上午/下午
      const updateTimePickerNarrowState = () => {
        const pickerEl = document.getElementById('demoTimePicker');
        if (!pickerEl) return;

        const headerEl = pickerEl.querySelector('.mdc-time-picker__header');
        const displayEl = pickerEl.querySelector('.mdc-time-picker__digital-display');
        
        let shouldHide = false;
        if (headerEl && displayEl) {
          const headerWidth = headerEl.offsetWidth || pickerEl.offsetWidth;
          const displayRect = displayEl.getBoundingClientRect();
          const headerRect = headerEl.getBoundingClientRect();
          const rightSpace = headerRect.right - displayRect.right;
          const rightSpaceRatio = headerWidth > 0 ? (rightSpace / headerWidth) : 1;
          shouldHide = rightSpaceRatio < 0.32;
        } else {
          shouldHide = pickerEl.offsetWidth < 260;
        }

        if (shouldHide) {
          pickerEl.classList.add('is-narrow');
        } else {
          pickerEl.classList.remove('is-narrow');
        }
        renderDemoNumbers(false);
        setDemoIndicatorPosition(timeMode);
      };

      if (window.ResizeObserver) {
        const pickerEl = document.getElementById('demoTimePicker');
        const ro = new ResizeObserver(() => {
          updateTimePickerNarrowState();
        });
        if (pickerEl) ro.observe(pickerEl);
      }
      window.addEventListener('resize', updateTimePickerNarrowState);
    }

    function confirmDemoTime() {
      const h = String(timeHour).padStart(2, '0');
      const m = String(timeMinute === 60 ? '00' : timeMinute).padStart(2, '0');
      showDemoToast(`已选择时间: ${h}:${m}`);
    }

    // 初始化渲染 Pickers (原版全部细节动画与手势)
    renderDemoDatePicker();
    setupDemoDialDOM();
    renderDemoTimePicker();

    // =========================================================================
    // 🧩 自由拖拽调整组件栏宽度系统 (Resizer Handle)
    // =========================================================================
    function initComponentPanelResizer() {
      const panel = document.getElementById('app-component-panel');
      const resizer = document.getElementById('componentPanelResizer');
      if (!panel || !resizer) return;

      const DEFAULT_WIDTH = 290;
      const MIN_WIDTH = 220;

      // 从 localStorage 恢复宽度
      const savedWidth = localStorage.getItem('m29_component_panel_width');
      if (savedWidth) {
        const w = parseInt(savedWidth, 10);
        if (!isNaN(w) && w >= MIN_WIDTH && w <= window.innerWidth - 100) {
          document.documentElement.style.setProperty('--component-panel-width', `${w}px`);
        }
      }

      let isResizing = false;
      let startX = 0;
      let startWidth = DEFAULT_WIDTH;

      const startResize = (clientX, e) => {
        if (window.innerWidth < 768) return;
        if (e && e.preventDefault) e.preventDefault();
        if (e && e.stopPropagation) e.stopPropagation();
        isResizing = true;
        startX = clientX;
        startWidth = panel.offsetWidth || DEFAULT_WIDTH;
        document.body.classList.add('is-resizing-component-panel');
        document.body.style.cursor = 'col-resize';
      };

      const moveResize = (clientX, e) => {
        if (!isResizing) return;
        if (e && e.preventDefault) e.preventDefault();
        const isSwapped = document.body.classList.contains('layout-swap');
        const deltaX = isSwapped ? (clientX - startX) : (startX - clientX);
        let newWidth = startWidth + deltaX;
        const maxWidth = Math.min(window.innerWidth - 120, 840);
        newWidth = Math.max(MIN_WIDTH, Math.min(maxWidth, newWidth));
        document.documentElement.style.setProperty('--component-panel-width', `${newWidth}px`);
        if (typeof updateMainLayoutColumns === 'function') {
          updateMainLayoutColumns();
        }
        if (window.pageOverlayScrollbar && typeof window.pageOverlayScrollbar.update === 'function') {
          window.pageOverlayScrollbar.update();
        }
      };

      const stopResize = () => {
        if (!isResizing) return;
        isResizing = false;
        document.body.classList.remove('is-resizing-component-panel');
        document.body.style.cursor = '';
        const finalWidth = panel.offsetWidth || DEFAULT_WIDTH;
        localStorage.setItem('m29_component_panel_width', String(finalWidth));
        if (typeof updateMainLayoutColumns === 'function') {
          updateMainLayoutColumns();
        }
        if (window.pageOverlayScrollbar && typeof window.pageOverlayScrollbar.update === 'function') {
          window.pageOverlayScrollbar.update();
        }
        window.dispatchEvent(new Event('resize'));
      };

      // Pointer Events
      resizer.addEventListener('pointerdown', (e) => {
        startResize(e.clientX, e);
        try { resizer.setPointerCapture(e.pointerId); } catch (_) {}
      });

      resizer.addEventListener('pointermove', (e) => {
        moveResize(e.clientX, e);
      });

      window.addEventListener('pointermove', (e) => {
        if (isResizing) moveResize(e.clientX, e);
      });

      const endPointer = (e) => {
        if (!isResizing) return;
        try { resizer.releasePointerCapture(e.pointerId); } catch (_) {}
        stopResize();
      };
      resizer.addEventListener('pointerup', endPointer);
      resizer.addEventListener('pointercancel', endPointer);
      window.addEventListener('pointerup', endPointer);

      // Mouse Events
      resizer.addEventListener('mousedown', (e) => startResize(e.clientX, e));
      window.addEventListener('mousemove', (e) => {
        if (isResizing) moveResize(e.clientX, e);
      });
      window.addEventListener('mouseup', () => stopResize());

      // Touch Events
      resizer.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches[0]) startResize(e.touches[0].clientX, e);
      }, { passive: false });
      window.addEventListener('touchmove', (e) => {
        if (isResizing && e.touches && e.touches[0]) moveResize(e.touches[0].clientX, e);
      }, { passive: false });
      window.addEventListener('touchend', () => stopResize());
      window.addEventListener('touchcancel', () => stopResize());

      function updateComponentPanelWidthIcon() {
        const rawWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--component-panel-width'), 10);
        const currentWidth = (!isNaN(rawWidth) && rawWidth > 0) ? rawWidth : 290;
        const iconEl = document.getElementById('componentPanelWidthIcon');
        const btnEl = document.getElementById('btnTogglePanelWidth');
        const is2Col = currentWidth >= 460;
        if (iconEl) {
          // 🌟 纯正单双竖栏图标：单列使用 view_stream，双列使用 view_week
          iconEl.textContent = is2Col ? 'view_week' : 'view_stream';
        }
        if (btnEl) {
          const isEn = currentLang === 'en';
          btnEl.title = is2Col ? (isEn ? 'Current: Dual Columns 629px (Click for 290px Single Column)' : '当前: 双列 629px (点击切换为 290px 单列)') : (isEn ? 'Current: Single Column 290px (Click for 629px Dual Columns)' : '当前: 单列 290px (点击切换为 629px 双列)');
        }
      }

      function setComponentPanelWidth(width) {
        document.documentElement.style.setProperty('--component-panel-width', `${width}px`);
        localStorage.setItem('m29_component_panel_width', String(width));
        updateComponentPanelWidthIcon();
        if (typeof updateMainLayoutColumns === 'function') {
          updateMainLayoutColumns();
        }
        if (window.pageOverlayScrollbar && typeof window.pageOverlayScrollbar.update === 'function') {
          window.pageOverlayScrollbar.update();
        }
        window.dispatchEvent(new Event('resize'));
        showDemoToast(width >= 460 ? (currentLang === 'en' ? 'Component panel set to 629px (Dual Columns)' : '组件栏已切换为 629px 宽版双列') : (currentLang === 'en' ? 'Component panel set to 290px (Single Column)' : '组件栏已切换为 290px 标准单列'));
      }

      function toggleComponentPanelWidth() {
        const rawWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--component-panel-width'), 10);
        const currentWidth = (!isNaN(rawWidth) && rawWidth > 0) ? rawWidth : 290;
        const nextWidth = currentWidth >= 460 ? 290 : 629;
        setComponentPanelWidth(nextWidth);
      }
      window.setComponentPanelWidth = setComponentPanelWidth;
      window.toggleComponentPanelWidth = toggleComponentPanelWidth;
      window.updateComponentPanelWidthIcon = updateComponentPanelWidthIcon;

      function updateComponentPanelWidthIcon() {
        const rawWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--component-panel-width'), 10);
        const currentWidth = (!isNaN(rawWidth) && rawWidth > 0) ? rawWidth : 290;
        const iconEl = document.getElementById('componentPanelWidthIcon');
        const btnEl = document.getElementById('btnTogglePanelWidth');
        const is2Col = currentWidth >= 460;
        if (iconEl) {
          // 🌟 与侧边栏保持 100% 同款完全一致的图标：单列使用 view_agenda，双列使用 view_column
          iconEl.textContent = is2Col ? 'view_column' : 'view_agenda';
        }
        if (btnEl) {
          const lang = currentLang;
          const isEn = lang === 'en';
          const isJa = lang === 'ja' || lang === 'jp';
          btnEl.title = is2Col 
            ? (isEn ? 'Current: Dual Columns 629px (Click for 290px Single Column)' : (isJa ? '現在: 2列 629px (クリックで 290px 単列)' : '当前: 双列 629px (点击切换为 290px 单列)')) 
            : (isEn ? 'Current: Single Column 290px (Click for 629px Dual Columns)' : (isJa ? '現在: 単列 290px (クリックで 629px 2列)' : '当前: 单列 290px (点击切换为 629px 双列)'));
        }
      }

      function applyComponentPanelTheme(theme) {
        const panel = document.getElementById('app-component-panel');
        const iconEl = document.getElementById('componentPanelThemeIcon');
        const btnEl = document.getElementById('btnTogglePanelTheme');
        if (!panel) return;

        const effectiveTheme = theme || localStorage.getItem('m29_component_panel_theme') || 'auto';
        panel.classList.remove('dark-theme', 'light-theme');
        if (effectiveTheme === 'dark') {
          panel.classList.add('dark-theme');
        } else if (effectiveTheme === 'light') {
          panel.classList.add('light-theme');
        }

        const lang = currentLang;
        const isEn = lang === 'en';
        const isJa = lang === 'ja' || lang === 'jp';
        let icon = 'brightness_auto';
        let tip = '';

        if (effectiveTheme === 'auto') {
          icon = 'brightness_auto';
          tip = isEn ? 'Current: Auto (Follows Global Theme) · Click for Light Mode' : (isJa ? '現在: 自動モード（グローバル追従） · クリックでライトへ' : '当前: 自动模式 (跟随全局主题) · 点击切换为浅色');
        } else if (effectiveTheme === 'light') {
          icon = 'brightness_5';
          tip = isEn ? 'Current: Light Mode · Click for Dark Mode' : (isJa ? '現在: ライトモード · クリックでダークへ' : '当前: 浅色模式 · 点击切换为暗色');
        } else {
          icon = 'brightness_4';
          tip = isEn ? 'Current: Dark Mode · Click for Auto Mode' : (isJa ? '現在: ダークモード · クリックで自動へ' : '当前: 暗色模式 · 点击切换为自动跟随全局');
        }

        if (iconEl) {
          iconEl.textContent = icon;
        }
        if (btnEl) {
          btnEl.title = tip;
        }

        // 如果设置了独立配色，根据当前组件栏的深/浅色计算独立色彩阶
        const savedPanelColor = localStorage.getItem('m29_component_panel_color');
        if (savedPanelColor && savedPanelColor !== 'auto') {
          applyComponentPanelMonetTheme(savedPanelColor);
        }
      }

      function toggleComponentPanelTheme() {
        const panel = document.getElementById('app-component-panel');
        if (!panel) return;

        const currentTheme = localStorage.getItem('m29_component_panel_theme') || 'auto';
        let nextTheme = 'light';
        if (currentTheme === 'auto') {
          nextTheme = 'light';
        } else if (currentTheme === 'light') {
          nextTheme = 'dark';
        } else {
          nextTheme = 'auto';
        }

        localStorage.setItem('m29_component_panel_theme', nextTheme);
        applyComponentPanelTheme(nextTheme);
        const lang = currentLang;
        const isEn = lang === 'en';
        const isJa = lang === 'ja' || lang === 'jp';
        if (nextTheme === 'auto') {
          showDemoToast(isEn ? 'Component panel set to Auto (Follows Global Theme)' : (isJa ? 'パネルテーマを自動モード（グローバル追従）に設定しました' : '组件栏已切换为自动模式（跟随全局主题）'));
        } else if (nextTheme === 'light') {
          showDemoToast(isEn ? 'Component panel set to Light Mode' : (isJa ? 'パネルテーマを独立ライトモードに設定しました' : '组件栏已切换为独立浅色模式'));
        } else {
          showDemoToast(isEn ? 'Component panel set to Dark Mode' : (isJa ? 'パネルテーマを独立ダークモードに設定しました' : '组件栏已切换为独立暗色模式'));
        }
      }

      window.applyComponentPanelTheme = applyComponentPanelTheme;
      window.toggleComponentPanelTheme = toggleComponentPanelTheme;

      // 恢复组件栏独立主题设置 (默认 auto 跟随全局)
      const savedPanelTheme = localStorage.getItem('m29_component_panel_theme') || 'auto';
      applyComponentPanelTheme(savedPanelTheme);

      let paletteLongPressTimer = null;
      let isPaletteLongPressTriggered = false;

      function handleComponentPanelPaletteClick(event) {
        if (isPaletteLongPressTriggered) {
          isPaletteLongPressTriggered = false;
          return;
        }
        openComponentPanelThemePicker(event);
      }
      window.handleComponentPanelPaletteClick = handleComponentPanelPaletteClick;

      const paletteBtn = document.getElementById('btnTogglePanelPalette');
      if (paletteBtn) {
        // 鼠标右键：直接恢复跟随全局主题
        paletteBtn.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          e.stopPropagation();
          applyComponentPanelMonetTheme('auto');
        });

        // 触摸/鼠标长按 500ms 触发恢复跟随全局
        const startLongPress = () => {
          isPaletteLongPressTriggered = false;
          if (paletteLongPressTimer) clearTimeout(paletteLongPressTimer);
          paletteLongPressTimer = setTimeout(() => {
            isPaletteLongPressTriggered = true;
            applyComponentPanelMonetTheme('auto');
          }, 500);
        };

        const cancelLongPress = () => {
          if (paletteLongPressTimer) {
            clearTimeout(paletteLongPressTimer);
            paletteLongPressTimer = null;
          }
        };

        paletteBtn.addEventListener('mousedown', startLongPress);
        paletteBtn.addEventListener('mouseup', cancelLongPress);
        paletteBtn.addEventListener('mouseleave', cancelLongPress);
        paletteBtn.addEventListener('touchstart', startLongPress, { passive: true });
        paletteBtn.addEventListener('touchend', cancelLongPress);
        paletteBtn.addEventListener('touchcancel', cancelLongPress);
      }

      // 恢复组件栏独立配色设置 (默认跟随全局主题)
      const savedPanelColor = localStorage.getItem('m29_component_panel_color');
      if (savedPanelColor && savedPanelColor !== 'auto') {
        applyComponentPanelMonetTheme(savedPanelColor);
      } else {
        applyComponentPanelMonetTheme('auto');
      }

      // 启动时初始化图标
      updateComponentPanelWidthIcon();

      // 双击手柄在 290px (单列) 与 629px (双列) 两档之间智能切换
      resizer.addEventListener('dblclick', () => {
        toggleComponentPanelWidth();
      });
    }

    // =========================================================================
    // 🌟 M2.9 自研浮动悬浮滚动条 (Zero-Width Shared Overlay Scrollbar)
    // 零占用宽度：内容区域与组件栏在左侧分割线上共享一根轨道
    // 两侧滚动条均可根据各自独立配色独立淡入并在 6 秒内优雅共存
    // =========================================================================
    class M29SharedOverlayScrollbar {
      constructor() {
        this.panelContainer = null;
        this.track = null;
        this.windowThumb = null;
        this.panelThumb = null;
        this.windowHideTimer = null;
        this.panelHideTimer = null;
        this.isDraggingWindow = false;
        this.isDraggingPanel = false;
        this.dragStartY = 0;
        this.dragStartScrollTop = 0;
        this.init();
      }

      init() {
        this.panelContainer = document.querySelector('#app-component-panel .component-panel-body');

        this.track = document.createElement('div');
        this.track.className = 'm29-overlay-scrollbar-track is-window';

        this.windowThumb = document.createElement('div');
        this.windowThumb.className = 'm29-overlay-scrollbar-thumb is-window-thumb';
        this.windowThumb.title = '整页面滚动条 (Page Scroll)';

        this.panelThumb = document.createElement('div');
        this.panelThumb.className = 'm29-overlay-scrollbar-thumb is-panel-thumb';
        this.panelThumb.title = '组件栏滚动条 (Component Panel Scroll)';

        this.track.appendChild(this.windowThumb);
        this.track.appendChild(this.panelThumb);
        document.body.appendChild(this.track);

        this.bindEvents();
        this.updateWindow();
        this.updatePanel();
      }

      updateColors() {
        const globalPrimary = document.documentElement.style.getPropertyValue('--mdc-theme-primary') || getComputedStyle(document.documentElement).getPropertyValue('--mdc-theme-primary');
        if (globalPrimary && this.windowThumb) {
          this.windowThumb.style.backgroundColor = globalPrimary.trim();
        }
        const panel = document.getElementById('app-component-panel');
        if (panel && this.panelThumb) {
          const panelPrimary = panel.style.getPropertyValue('--mdc-theme-primary') || getComputedStyle(panel).getPropertyValue('--mdc-theme-primary');
          if (panelPrimary) {
            this.panelThumb.style.backgroundColor = panelPrimary.trim();
          }
        }
      }

      updatePanelColor(color) {
        if (this.panelThumb) {
          if (color) {
            this.panelThumb.style.backgroundColor = color.trim();
          } else {
            this.updateColors();
          }
        }
      }

      getWindowScrollInfo() {
        const doc = document.documentElement;
        const scrollHeight = Math.max(doc.scrollHeight, document.body.scrollHeight);
        const clientHeight = window.innerHeight;
        const scrollTop = window.scrollY || doc.scrollTop || document.body.scrollTop || 0;
        return { scrollHeight, clientHeight, scrollTop };
      }

      getPanelScrollInfo() {
        if (!this.panelContainer) {
          this.panelContainer = document.querySelector('#app-component-panel .component-panel-body');
        }
        if (!this.panelContainer) return { scrollHeight: 0, clientHeight: 0, scrollTop: 0 };
        return {
          scrollHeight: this.panelContainer.scrollHeight,
          clientHeight: this.panelContainer.clientHeight,
          scrollTop: this.panelContainer.scrollTop
        };
      }

      updateWindow() {
        if (!this.track || !this.windowThumb) return;
        const { scrollHeight, clientHeight, scrollTop } = this.getWindowScrollInfo();
        const trackHeight = this.track.clientHeight;
        if (scrollHeight <= clientHeight + 4 || trackHeight <= 0) {
          this.windowThumb.style.display = 'none';
          return;
        }
        this.windowThumb.style.display = 'block';
        const thumbHeight = Math.max(28, (clientHeight / scrollHeight) * trackHeight);
        const maxTop = trackHeight - thumbHeight;
        const maxScroll = scrollHeight - clientHeight;
        const thumbTop = maxScroll > 0 ? (scrollTop / maxScroll) * maxTop : 0;
        this.windowThumb.style.height = `${Math.round(thumbHeight)}px`;
        this.windowThumb.style.transform = `translateY(${Math.round(thumbTop)}px)`;
      }

      updatePanel() {
        if (!this.track || !this.panelThumb) return;
        const { scrollHeight, clientHeight, scrollTop } = this.getPanelScrollInfo();
        const trackHeight = this.track.clientHeight;
        if (scrollHeight <= clientHeight + 4 || trackHeight <= 0) {
          this.panelThumb.style.display = 'none';
          return;
        }
        this.panelThumb.style.display = 'block';
        const thumbHeight = Math.max(28, (clientHeight / scrollHeight) * trackHeight);
        const maxTop = trackHeight - thumbHeight;
        const maxScroll = scrollHeight - clientHeight;
        const thumbTop = maxScroll > 0 ? (scrollTop / maxScroll) * maxTop : 0;
        this.panelThumb.style.height = `${Math.round(thumbHeight)}px`;
        this.panelThumb.style.transform = `translateY(${Math.round(thumbTop)}px)`;
      }

      showWindow() {
        this.updateWindow();
        this.updateColors();
        this.windowThumb.classList.remove('is-dimmed');
        this.windowThumb.classList.add('is-visible', 'is-active-scrolling');
        this.panelThumb.classList.remove('is-active-scrolling');
        this.windowThumb.style.zIndex = '10';
        this.panelThumb.style.zIndex = '5';
        this.updateTrackState();
        this.updateActivePhase();

        if (this.windowDimTimer) clearTimeout(this.windowDimTimer);
        if (this.windowHideTimer) clearTimeout(this.windowHideTimer);

        if (!this.isDraggingWindow) {
          // 2.9s 自动变暗 (进入第二阶段，解除调节条锁定)
          this.windowDimTimer = setTimeout(() => {
            this.windowThumb.classList.remove('is-active-scrolling');
            this.windowThumb.classList.add('is-dimmed');
            this.updateActivePhase();
          }, 2900);

          // 5s 完全淡出
          this.windowHideTimer = setTimeout(() => {
            this.windowThumb.classList.remove('is-visible', 'is-active-scrolling', 'is-dimmed');
            this.updateTrackState();
            this.updateActivePhase();
          }, 5000);
        }
      }

      showPanel() {
        this.updatePanel();
        this.updateColors();
        this.panelThumb.classList.remove('is-dimmed');
        this.panelThumb.classList.add('is-visible', 'is-active-scrolling');
        this.windowThumb.classList.remove('is-active-scrolling');
        this.panelThumb.style.zIndex = '10';
        this.windowThumb.style.zIndex = '5';
        this.updateTrackState();
        this.updateActivePhase();

        if (this.panelDimTimer) clearTimeout(this.panelDimTimer);
        if (this.panelHideTimer) clearTimeout(this.panelHideTimer);

        if (!this.isDraggingPanel) {
          // 2.9s 自动变暗 (进入第二阶段，解除调节条锁定)
          this.panelDimTimer = setTimeout(() => {
            this.panelThumb.classList.remove('is-active-scrolling');
            this.panelThumb.classList.add('is-dimmed');
            this.updateActivePhase();
          }, 2900);

          // 5s 完全淡出
          this.panelHideTimer = setTimeout(() => {
            this.panelThumb.classList.remove('is-visible', 'is-active-scrolling', 'is-dimmed');
            this.updateTrackState();
            this.updateActivePhase();
          }, 5000);
        }
      }

      updateTrackState() {
        if (!this.track) return;
        const isAnyVisible = this.windowThumb.classList.contains('is-visible') || 
                             this.panelThumb.classList.contains('is-visible') ||
                             this.isDraggingWindow || 
                             this.isDraggingPanel;
        if (isAnyVisible) {
          this.track.classList.add('is-visible');
        } else {
          this.track.classList.remove('is-visible');
        }
      }

      updateActivePhase() {
        const isAnyPhase1 = (this.windowThumb && this.windowThumb.classList.contains('is-active-scrolling')) ||
                            (this.panelThumb && this.panelThumb.classList.contains('is-active-scrolling')) ||
                            this.isDraggingWindow ||
                            this.isDraggingPanel;
        if (isAnyPhase1) {
          document.body.classList.add('is-scrollbar-phase-active');
        } else {
          document.body.classList.remove('is-scrollbar-phase-active');
        }
      }

      bindEvents() {
        window.addEventListener('scroll', () => {
          this.showWindow();
        }, { passive: true });

        if (this.panelContainer) {
          this.panelContainer.addEventListener('scroll', () => {
            this.showPanel();
          }, { passive: true });
        }

        // Window Thumb Dragging
        this.windowThumb.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.isDraggingWindow = true;
          this.windowThumb.classList.add('is-dragging', 'is-active-scrolling');
          this.panelThumb.classList.remove('is-active-scrolling');
          this.windowThumb.style.zIndex = '10';
          this.panelThumb.style.zIndex = '5';
          this.track.classList.add('is-dragging');
          this.updateActivePhase();
          this.dragStartY = e.clientY;
          const { scrollTop } = this.getWindowScrollInfo();
          this.dragStartScrollTop = scrollTop;
          try { this.windowThumb.setPointerCapture(e.pointerId); } catch (_) {}
        });

        this.windowThumb.addEventListener('pointermove', (e) => {
          if (!this.isDraggingWindow) return;
          e.preventDefault();
          e.stopPropagation();
          const deltaY = e.clientY - this.dragStartY;
          const { scrollHeight, clientHeight } = this.getWindowScrollInfo();
          const trackHeight = this.track.clientHeight;
          const thumbHeight = this.windowThumb.offsetHeight;
          const maxTop = trackHeight - thumbHeight;
          const maxScroll = scrollHeight - clientHeight;
          if (maxTop > 0) {
            const scrollDelta = (deltaY / maxTop) * maxScroll;
            window.scrollTo({ top: this.dragStartScrollTop + scrollDelta, behavior: 'instant' });
          }
        });

        const endWindowDrag = (e) => {
          if (!this.isDraggingWindow) return;
          this.isDraggingWindow = false;
          this.windowThumb.classList.remove('is-dragging');
          this.track.classList.remove('is-dragging');
          try { this.windowThumb.releasePointerCapture(e.pointerId); } catch (_) {}
          this.showWindow();
        };
        this.windowThumb.addEventListener('pointerup', endWindowDrag);
        this.windowThumb.addEventListener('pointercancel', endWindowDrag);

        // Panel Thumb Dragging
        this.panelThumb.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.isDraggingPanel = true;
          this.panelThumb.classList.add('is-dragging', 'is-active-scrolling');
          this.windowThumb.classList.remove('is-active-scrolling');
          this.panelThumb.style.zIndex = '10';
          this.windowThumb.style.zIndex = '5';
          this.track.classList.add('is-dragging');
          this.updateActivePhase();
          this.dragStartY = e.clientY;
          const { scrollTop } = this.getPanelScrollInfo();
          this.dragStartScrollTop = scrollTop;
          try { this.panelThumb.setPointerCapture(e.pointerId); } catch (_) {}
        });

        this.panelThumb.addEventListener('pointermove', (e) => {
          if (!this.isDraggingPanel) return;
          if (!this.panelContainer) this.panelContainer = document.querySelector('#app-component-panel .component-panel-body');
          if (!this.panelContainer) return;
          e.preventDefault();
          e.stopPropagation();
          const deltaY = e.clientY - this.dragStartY;
          const { scrollHeight, clientHeight } = this.getPanelScrollInfo();
          const trackHeight = this.track.clientHeight;
          const thumbHeight = this.panelThumb.offsetHeight;
          const maxTop = trackHeight - thumbHeight;
          const maxScroll = scrollHeight - clientHeight;
          if (maxTop > 0) {
            const scrollDelta = (deltaY / maxTop) * maxScroll;
            this.panelContainer.scrollTop = this.dragStartScrollTop + scrollDelta;
          }
        });

        const endPanelDrag = (e) => {
          if (!this.isDraggingPanel) return;
          this.isDraggingPanel = false;
          this.panelThumb.classList.remove('is-dragging');
          this.track.classList.remove('is-dragging');
          try { this.panelThumb.releasePointerCapture(e.pointerId); } catch (_) {}
          this.showPanel();
        };
        this.panelThumb.addEventListener('pointerup', endPanelDrag);
        this.panelThumb.addEventListener('pointercancel', endPanelDrag);

        window.addEventListener('resize', () => {
          this.updateWindow();
          this.updatePanel();
          this.updateColors();
        }, { passive: true });

        if (window.ResizeObserver && this.panelContainer) {
          new ResizeObserver(() => {
            this.updatePanel();
          }).observe(this.panelContainer);
        }
      }
    }

    // =========================================================================
    // 🌟 M2.9 纯直角 Material 悬浮 Tooltip 引擎 (仅侧边栏底部 4 个控制按钮 ✖ 严格向上弹出)
    // =========================================================================
    class M29TooltipEngine {
      constructor() {
        this.el = document.createElement('div');
        this.el.className = 'm29-tooltip-popover';
        document.body.appendChild(this.el);
        this.timer = null;
        this.activeTarget = null;
        this.init();
      }

      init() {
        // 仅底部 4 个操作按钮与 Tab 选项卡允许触发 Tooltip 的白名单选择器
        const FOOTER_BTNS_SELECTOR = '.rail-footer-icon-btn, .rail-footer-compact-btn, .mobile-drawer-footer-btn, #btn-toggle-panel, #btn-toggle-lang, #btn-toggle-layout, #btn-toggle-dark, #btn-toggle-dark-compact, .m29-tab-item';

        document.addEventListener('pointerenter', (e) => {
          if (!e || !e.target || typeof e.target.closest !== 'function') return;
          const rawTarget = e.target.closest('[title], [data-tooltip]');
          if (rawTarget) {
            // 如果不是底部 4 个按钮，彻底清除其 title 属性，绝不弹出任何 tooltip 或原生弹窗
            if (typeof rawTarget.closest !== 'function' || !rawTarget.closest(FOOTER_BTNS_SELECTOR)) {
              rawTarget.removeAttribute('title');
              rawTarget.removeAttribute('data-tooltip');
              return;
            }
          }

          const target = e.target.closest(FOOTER_BTNS_SELECTOR);
          if (!target) return;

          // 提取 tooltip 内容并清空原生 title 避免浏览器弹出原生黄色系统提示框
          if (target.hasAttribute('title')) {
            const rawTitle = target.getAttribute('title');
            if (rawTitle && rawTitle.trim()) {
              target.setAttribute('data-tooltip', rawTitle.trim());
            }
            target.removeAttribute('title');
          }

          const text = target.getAttribute('data-tooltip');
          if (!text || !text.trim()) return;

          this.show(target, text.trim());
        }, { capture: true, passive: true });

        document.addEventListener('pointerleave', (e) => {
          if (!e || !e.target || typeof e.target.closest !== 'function') return;
          const target = e.target.closest(FOOTER_BTNS_SELECTOR);
          if (target && (target === this.activeTarget || target.contains(this.activeTarget))) {
            this.hide();
          }
        }, { capture: true, passive: true });

        window.addEventListener('scroll', () => this.hide(), { passive: true });
        window.addEventListener('wheel', () => this.hide(), { passive: true });
      }

      show(target, text) {
        if (this.timer) clearTimeout(this.timer);
        this.activeTarget = target;
        this.el.textContent = text;
        this.el.style.display = 'block';

        const rect = target.getBoundingClientRect();
        const tipRect = this.el.getBoundingClientRect();

        // 🌟 核心规范：所有底部按钮的 Tooltip 绝对严格往【上方】弹出居中
        const top = rect.top - tipRect.height - 10;
        let left = rect.left + (rect.width - tipRect.width) / 2;

        // 左右防溢出屏幕
        if (left < 6) left = 6;
        if (left + tipRect.width > window.innerWidth - 6) {
          left = window.innerWidth - tipRect.width - 6;
        }

        this.el.style.top = `${Math.round(top)}px`;
        this.el.style.left = `${Math.round(left)}px`;

        this.timer = setTimeout(() => {
          if (this.activeTarget === target) {
            this.el.classList.add('is-active');
          }
        }, 50);
      }

      hide() {
        if (this.timer) clearTimeout(this.timer);
        this.activeTarget = null;
        this.el.classList.remove('is-active');
        this.el.style.display = 'none';
        this.el.textContent = '';
      }
    }


    // =========================================================================
    // 🚀 初始化引擎与功能模块
    // =========================================================================
    
    // 初始化全局 M2.9 纯直角 Tooltip 引擎
    window.globalTooltipEngine = new M29TooltipEngine();

    // 初始化宽度调整手柄
    initComponentPanelResizer();

    // 初始化多语言文字与状态同步
    applyLanguage(currentLang, false);

    // 初始化全局页面与组件栏共享浮动滚动条 (共享同一根左侧轨道)
    window.sharedOverlayScrollbar = new M29SharedOverlayScrollbar();

    // =========================================================================
    // 🌐 全局暴露所有组件交互方法 (供 HTML 模块内部 inline onclick 正常调用)
    // =========================================================================
    window.extractFromSample = extractFromSample;
    window.setColorPaletteMode = setColorPaletteMode;
    window.switchM29Tab = switchM29Tab;
    window.initM29TabIndicator = initM29TabIndicator;
    window.setDeterminateProgress = setDeterminateProgress;
    window.toggleExpansion = toggleExpansion;
    window.toggleMdcSelect = toggleMdcSelect;
    window.selectMdcOption = selectMdcOption;
    window.openDemoDialog = openDemoDialog;
    window.closeDemoDialog = closeDemoDialog;
    window.showDemoToast = showDemoToast;
    window.hideDemoToast = hideDemoToast;
    window.toggleSegmented = toggleSegmented;
    window.confirmDemoDate = confirmDemoDate;
    window.confirmDemoTime = confirmDemoTime;
    window.openComponentPanel = openComponentPanel;
    window.closeComponentPanel = closeComponentPanel;
    window.openMobileDrawer = openMobileDrawer;
    window.closeMobileDrawer = closeMobileDrawer;
    window.openOverlay = openOverlay;
    window.closeOverlay = closeOverlay;
    window.toggleThemeMode = toggleThemeMode;
    window.toggleLanguage = toggleLanguage;
    window.toggleCardColumns = toggleCardColumns;
    window.toggleComponentPanelTrigger = toggleComponentPanelTrigger;
    window.handleSelectColor = handleSelectColor;
    window.handleSkipStep = handleSkipStep;
    window.finishMonetSelection = finishMonetSelection;
    window.applyMonetTheme = applyMonetTheme;
    window.renderTonalSwatches = renderTonalSwatches;
    window.toggleDemoDatePickerMode = toggleDemoDatePickerMode;
    window.renderDemoDatePicker = renderDemoDatePicker;
    window.renderDemoTimePicker = renderDemoTimePicker;
    window.initComponentPanelResizer = initComponentPanelResizer;
    window.setComponentPanelWidth = setComponentPanelWidth;
    window.toggleComponentPanelWidth = toggleComponentPanelWidth;
    window.applyComponentPanelTheme = applyComponentPanelTheme;
    window.toggleComponentPanelTheme = toggleComponentPanelTheme;
    window.M29OverlayScrollbar = M29OverlayScrollbar;
    window.M29TooltipEngine = M29TooltipEngine;
});