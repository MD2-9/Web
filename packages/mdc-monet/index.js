/**
 * @license
 * Copyright 2026 安秋 <github.com/unjal29>
 * Licensed under the Apache License, Version 2.0
 */

export * from '../../src/monet-mdc.js';

export const MONET_PALETTES = [
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
  { cn: '樱花浅粉', en: 'Sakura Light', color: '#F48FB1', text: '#4A0021' },
  { cn: '薄荷淡青', en: 'Mint Pastel', color: '#80CBC4', text: '#00332C' },
  { cn: '晨曦暖黄', en: 'Morning Sun', color: '#FFE082', text: '#3E2723' },
  { cn: '天际蔚蓝', en: 'Sky Pastel', color: '#90CAF9', text: '#0D47A1' },
  { cn: '香芋淡紫', en: 'Taro Pastel', color: '#CE93D8', text: '#38004D' },
  { cn: '杏仁暖橘', en: 'Apricot Peach', color: '#FFCC80', text: '#4E2600' }
];

/**
 * 莫奈调色盘交互控制器 (3-Step Monet Color Picker)
 */
export class MdcMonetPicker {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('themeGrid');
    this.stepTitle = options.stepTitle || document.getElementById('pickerStepTitle');
    this.stepSub = options.stepSub || document.getElementById('pickerStepSub');
    this.onSelect = options.onSelect || null;
    this.currentStep = 1;
    this.selectedPrimary = '#6750A4';
    this.selectedSecondary = null;
    this.selectedTertiary = null;
  }

  render() {
    if (!this.container) return;
    this.container.innerHTML = '';
    this.container.scrollTop = 0;

    if (this.currentStep === 1) {
      if (this.stepTitle) this.stepTitle.textContent = '单色模式';
      if (this.stepSub) this.stepSub.textContent = '选择主色';
    } else if (this.currentStep === 2) {
      if (this.stepTitle) this.stepTitle.textContent = '双色模式';
      if (this.stepSub) this.stepSub.textContent = '选择次色';
    } else {
      if (this.stepTitle) this.stepTitle.textContent = '三色模式';
      if (this.stepSub) this.stepSub.textContent = '选择第三色';
    }

    MONET_PALETTES.forEach(t => {
      const tile = document.createElement('div');
      tile.className = 'theme-tile' + (t.color.toUpperCase() === this.selectedPrimary.toUpperCase() && this.currentStep === 1 ? ' active' : '');
      tile.style.backgroundColor = t.color;
      tile.style.color = t.text;
      tile.innerHTML = `<div class="theme-tile-cn">${t.cn}</div><div class="theme-tile-en">${t.en}</div>`;
      tile.onclick = () => this.handleSelectColor(t.color);
      this.container.appendChild(tile);
    });

    const specialTile = document.createElement('div');
    specialTile.className = 'theme-tile';
    if (this.currentStep === 1) {
      specialTile.style.backgroundColor = '#1D1B20';
      specialTile.style.color = '#FFFFFF';
      specialTile.innerHTML = '<div class="theme-tile-cn">默认黑白</div><div class="theme-tile-en">Black & White</div>';
      specialTile.onclick = () => {
        this.selectedPrimary = '#1D1B20';
        this.selectedSecondary = null;
        this.selectedTertiary = null;
        this.finish();
      };
    } else {
      specialTile.style.backgroundColor = '#FFFFFF';
      specialTile.style.color = '#1D1B20';
      specialTile.style.border = '1px dashed #79747E';
      specialTile.innerHTML = '<div class="theme-tile-cn">⏩ 直接跳过</div><div class="theme-tile-en">Skip All</div>';
      specialTile.onclick = () => this.finish();
    }
    this.container.appendChild(specialTile);
  }

  handleSelectColor(hex) {
    if (this.currentStep === 1) {
      this.selectedPrimary = hex;
      this.currentStep = 2;
      this.render();
    } else if (this.currentStep === 2) {
      this.selectedSecondary = hex;
      this.currentStep = 3;
      this.render();
    } else {
      this.selectedTertiary = hex;
      this.finish();
    }
  }

  finish() {
    if (this.onSelect) {
      this.onSelect({
        primary: this.selectedPrimary,
        secondary: this.selectedSecondary,
        tertiary: this.selectedTertiary
      });
    }
  }
}
