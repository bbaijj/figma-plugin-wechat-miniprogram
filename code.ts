// This plugin will generate a sample codegen plugin
// that appears in the Element tab of the Inspect panel.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// 单位转换函数：将px转换为rpx
function pxToRpx(value: number, conversionRate: number): number {
  return value * conversionRate;
}


// 获取节点样式并生成微信小程序代码
function generateWechatMiniProgramCode(node: SceneNode, conversionRate: number): string {
  const styles: string[] = [];

  // 处理宽度和高度
  if ('width' in node) {
    const widthRpx = pxToRpx(node.width, conversionRate);
    styles.push(`width: ${widthRpx}rpx`);
  }

  if ('height' in node) {
    const heightRpx = pxToRpx(node.height, conversionRate);
    styles.push(`height: ${heightRpx}rpx`);
  }

  // 处理布局属性 - display
  if ('layoutMode' in node) {
    const layoutMode = (node as any).layoutMode;
    if (layoutMode === 'HORIZONTAL' || layoutMode === 'VERTICAL') {
      styles.push(`display: flex`);

      // flex-direction
      if (layoutMode === 'HORIZONTAL') {
        styles.push(`flex-direction: row`);
      } else {
        styles.push(`flex-direction: column`);
      }

      // justify-content (primary axis alignment)
      if ('primaryAxisAlignItems' in node) {
        const alignment = (node as any).primaryAxisAlignItems;
        const justifyContentMap: Record<string, string> = {
          'MIN': 'flex-start',
          'CENTER': 'center',
          'MAX': 'flex-end',
          'SPACE_BETWEEN': 'space-between'
        };
        if (justifyContentMap[alignment]) {
          styles.push(`justify-content: ${justifyContentMap[alignment]}`);
        }
      }

      // align-items (counter axis alignment)
      if ('counterAxisAlignItems' in node) {
        const alignment = (node as any).counterAxisAlignItems;
        const alignItemsMap: Record<string, string> = {
          'MIN': 'flex-start',
          'CENTER': 'center',
          'MAX': 'flex-end',
          'BASELINE': 'baseline'
        };
        if (alignItemsMap[alignment]) {
          styles.push(`align-items: ${alignItemsMap[alignment]}`);
        }
      }

      // gap (item spacing)
      if ('itemSpacing' in node && typeof (node as any).itemSpacing === 'number' && (node as any).itemSpacing > 0) {
        const gapRpx = pxToRpx((node as any).itemSpacing, conversionRate);
        styles.push(`gap: ${gapRpx}rpx`);
      }
    }
  }

  // 处理外边距
  const marginProperties = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'];
  let hasMargin = false;

  for (const prop of marginProperties) {
    if (prop in node && typeof (node as any)[prop] === 'number' && (node as any)[prop] !== 0) {
      hasMargin = true;
      break;
    }
  }

  if (hasMargin) {
    const marginTop = 'marginTop' in node && typeof (node as any).marginTop === 'number' ? pxToRpx((node as any).marginTop, conversionRate) : 0;
    const marginRight = 'marginRight' in node && typeof (node as any).marginRight === 'number' ? pxToRpx((node as any).marginRight, conversionRate) : 0;
    const marginBottom = 'marginBottom' in node && typeof (node as any).marginBottom === 'number' ? pxToRpx((node as any).marginBottom, conversionRate) : 0;
    const marginLeft = 'marginLeft' in node && typeof (node as any).marginLeft === 'number' ? pxToRpx((node as any).marginLeft, conversionRate) : 0;

    if (marginTop === marginRight && marginTop === marginBottom && marginTop === marginLeft) {
      // 四个方向相同，使用简写
      styles.push(`margin: ${marginTop}rpx`);
    } else if (marginTop === marginBottom && marginLeft === marginRight) {
      // 上下相同，左右相同
      styles.push(`margin: ${marginTop}rpx ${marginRight}rpx`);
    } else {
      // 四个方向都不同
      styles.push(`margin: ${marginTop}rpx ${marginRight}rpx ${marginBottom}rpx ${marginLeft}rpx`);
    }
  }

  // 处理内边距
  const paddingProperties = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'padding'];
  let hasPadding = false;

  for (const prop of paddingProperties) {
    if (prop in node && typeof (node as any)[prop] === 'number' && (node as any)[prop] > 0) {
      hasPadding = true;
      break;
    }
  }

  if (hasPadding) {
    // 处理统一的 padding
    if ('padding' in node && typeof (node as any).padding === 'number' && (node as any).padding > 0) {
      const paddingRpx = pxToRpx((node as any).padding, conversionRate);
      styles.push(`padding: ${paddingRpx}rpx`);
    } else {
      // 分别处理四个方向的 padding
      const paddingTop = 'paddingTop' in node && typeof (node as any).paddingTop === 'number' ? pxToRpx((node as any).paddingTop, conversionRate) : 0;
      const paddingRight = 'paddingRight' in node && typeof (node as any).paddingRight === 'number' ? pxToRpx((node as any).paddingRight, conversionRate) : 0;
      const paddingBottom = 'paddingBottom' in node && typeof (node as any).paddingBottom === 'number' ? pxToRpx((node as any).paddingBottom, conversionRate) : 0;
      const paddingLeft = 'paddingLeft' in node && typeof (node as any).paddingLeft === 'number' ? pxToRpx((node as any).paddingLeft, conversionRate) : 0;

      if (paddingTop === paddingRight && paddingTop === paddingBottom && paddingTop === paddingLeft) {
        // 四个方向相同，使用简写
        styles.push(`padding: ${paddingTop}rpx`);
      } else if (paddingTop === paddingBottom && paddingLeft === paddingRight) {
        // 上下相同，左右相同
        styles.push(`padding: ${paddingTop}rpx ${paddingRight}rpx`);
      } else {
        // 四个方向都不同
        styles.push(`padding: ${paddingTop}rpx ${paddingRight}rpx ${paddingBottom}rpx ${paddingLeft}rpx`);
      }
    }
  }

  // 处理圆角
  if ('cornerRadius' in node && node.cornerRadius !== undefined) {
    const cornerRadius = node.cornerRadius;

    // 检查是否是数字（统一圆角）
    if (typeof cornerRadius === 'number') {
      const borderRadiusRpx = pxToRpx(cornerRadius, conversionRate);
      styles.push(`border-radius: ${borderRadiusRpx}rpx`);
    }
    // 检查是否是圆角对象（分别设置四个角）
    else if (cornerRadius !== null && typeof cornerRadius === 'object') {
      // 安全地访问属性，使用类型断言
      const cornerRadiusObj = cornerRadius as any;
      if ('topLeft' in cornerRadiusObj && typeof cornerRadiusObj.topLeft === 'number') {
        const topLeft = pxToRpx(cornerRadiusObj.topLeft, conversionRate);
        const topRight = pxToRpx(cornerRadiusObj.topRight || 0, conversionRate);
        const bottomRight = pxToRpx(cornerRadiusObj.bottomRight || 0, conversionRate);
        const bottomLeft = pxToRpx(cornerRadiusObj.bottomLeft || 0, conversionRate);
        styles.push(`border-radius: ${topLeft}rpx ${topRight}rpx ${bottomRight}rpx ${bottomLeft}rpx`);
      }
    }
  }

  // 处理填充色
  if ('fills' in node && Array.isArray(node.fills) && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.type === 'SOLID') {
      const color = rgbToHex(fill.color);
      styles.push(`background-color: ${color}`);
    }
  }

  // 处理边框
  if ('strokes' in node && Array.isArray(node.strokes) && node.strokes.length > 0) {
    const stroke = node.strokes[0];
    if (stroke.type === 'SOLID') {
      const color = rgbToHex(stroke.color);
      styles.push(`border-color: ${color}`);
    }
  }

  if ('strokeWeight' in node && typeof node.strokeWeight === 'number') {
    const borderWidthRpx = pxToRpx(node.strokeWeight, conversionRate);
    styles.push(`border-width: ${borderWidthRpx}rpx`);
    styles.push(`border-style: solid`);
  }

  // 处理文本样式
  const textStyleProperties = [
    'fontSize', 'fontWeight', 'fontFamily', 'lineHeight',
    'letterSpacing', 'textAlignHorizontal', 'textAlignVertical',
    'textDecoration', 'textCase'
  ];

  let hasTextStyle = false;
  for (const prop of textStyleProperties) {
    if (prop in node && (node as any)[prop] !== undefined && (node as any)[prop] !== null) {
      hasTextStyle = true;
      break;
    }
  }

  if (hasTextStyle) {
    // 字体大小
    if ('fontSize' in node && typeof (node as any).fontSize === 'number' && (node as any).fontSize > 0) {
      const fontSizeRpx = pxToRpx((node as any).fontSize, conversionRate);
      styles.push(`font-size: ${fontSizeRpx}rpx`);
    }

    // 字体粗细
    if ('fontWeight' in node && typeof (node as any).fontWeight === 'number') {
      const weight = (node as any).fontWeight;
      let fontWeight = weight.toString();
      if (weight === 400) fontWeight = 'normal';
      if (weight === 700) fontWeight = 'bold';
      styles.push(`font-weight: ${fontWeight}`);
    }

    // 字体家族
    if ('fontFamily' in node && typeof (node as any).fontFamily === 'string') {
      styles.push(`font-family: "${(node as any).fontFamily}"`);
    }

    // 行高
    if ('lineHeight' in node) {
      const lineHeight = (node as any).lineHeight;
      if (typeof lineHeight === 'number' && lineHeight > 0) {
        const lineHeightRpx = pxToRpx(lineHeight, conversionRate);
        styles.push(`line-height: ${lineHeightRpx}rpx`);
      } else if (typeof lineHeight === 'object' && lineHeight !== null) {
        if (lineHeight.unit === 'PIXELS' && typeof lineHeight.value === 'number') {
          const lineHeightRpx = pxToRpx(lineHeight.value, conversionRate);
          styles.push(`line-height: ${lineHeightRpx}rpx`);
        } else if (lineHeight.unit === 'PERCENT' && typeof lineHeight.value === 'number') {
          styles.push(`line-height: ${lineHeight.value}%`);
        }
      }
    }

    // 字间距
    if ('letterSpacing' in node) {
      const letterSpacing = (node as any).letterSpacing;
      if (typeof letterSpacing === 'number') {
        const letterSpacingRpx = pxToRpx(letterSpacing, conversionRate);
        styles.push(`letter-spacing: ${letterSpacingRpx}rpx`);
      } else if (typeof letterSpacing === 'object' && letterSpacing !== null) {
        if (letterSpacing.unit === 'PIXELS' && typeof letterSpacing.value === 'number') {
          const letterSpacingRpx = pxToRpx(letterSpacing.value, conversionRate);
          styles.push(`letter-spacing: ${letterSpacingRpx}rpx`);
        } else if (letterSpacing.unit === 'PERCENT' && typeof letterSpacing.value === 'number') {
          styles.push(`letter-spacing: ${letterSpacing.value}%`);
        }
      }
    }

    // 文本对齐
    if ('textAlignHorizontal' in node && typeof (node as any).textAlignHorizontal === 'string') {
      const align = (node as any).textAlignHorizontal.toLowerCase();
      styles.push(`text-align: ${align}`);
    }

    // 文本装饰
    if ('textDecoration' in node && typeof (node as any).textDecoration === 'string') {
      const decoration = (node as any).textDecoration.toLowerCase();
      styles.push(`text-decoration: ${decoration}`);
    }

    // 文本大小写
    if ('textCase' in node && typeof (node as any).textCase === 'string') {
      const textCase = (node as any).textCase.toLowerCase();
      if (textCase === 'upper') {
        styles.push(`text-transform: uppercase`);
      } else if (textCase === 'lower') {
        styles.push(`text-transform: lowercase`);
      } else if (textCase === 'title') {
        styles.push(`text-transform: capitalize`);
      }
    }
  }

  // 处理透明度
  if ('opacity' in node && typeof node.opacity === 'number') {
    styles.push(`opacity: ${node.opacity}`);
  }

  // 将样式数组连接为字符串，每行一个样式
  return styles.join(';\n') + (styles.length > 0 ? ';' : '');
}

// 将RGB颜色对象转换为十六进制颜色代码
function rgbToHex(color: { r: number; g: number; b: number }): string {
  const r = Math.round(color.r * 255);
  const g = Math.round(color.g * 255);
  const b = Math.round(color.b * 255);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

// 默认转换倍率：1px = 2rpx
const DEFAULT_CONVERSION_RATE = 2;

// 当前转换倍率
let currentConversionRate = DEFAULT_CONVERSION_RATE;

// 加载保存的转换倍率
async function loadConversionRate() {
  try {
    const savedRate = await figma.clientStorage.getAsync('conversionRate');
    if (savedRate !== undefined) {
      currentConversionRate = savedRate;
    }
  } catch (error) {
    console.error('加载转换倍率失败:', error);
  }
}

// 保存转换倍率
async function saveConversionRate(rate: number) {
  try {
    await figma.clientStorage.setAsync('conversionRate', rate);
    currentConversionRate = rate;
    return true;
  } catch (error) {
    console.error('保存转换倍率失败:', error);
    return false;
  }
}

// 初始化加载设置
loadConversionRate();

// 处理插件命令
figma.on('run', ({ command }) => {
  if (command === 'show-settings') {
    // 显示设置界面
    figma.showUI(__html__, { width: 400, height: 700 });

    // 处理来自UI的消息
    figma.ui.onmessage = async (msg) => {
      if (msg.type === 'saveSettings') {
        const success = await saveConversionRate(msg.conversionRate);
        if (success) {
          figma.ui.postMessage({
            type: 'settingsSaved',
            conversionRate: msg.conversionRate
          });
        }
      } else if (msg.type === 'loadSettings') {
        await loadConversionRate();
        figma.ui.postMessage({
          type: 'settingsLoaded',
          conversionRate: currentConversionRate
        });
      }
    };
  } else if (command === 'about') {
    figma.notify('微信小程序单位转换插件 v1.0 - 将Figma中的px转换为微信小程序的rpx单位');
  }
});

// This provides the callback to generate the code.
figma.codegen.on('generate', (event) => {
  const node = event.node;

  // 使用当前转换倍率
  const code = generateWechatMiniProgramCode(node, currentConversionRate);

  return [
    {
      language: 'CSS',
      code: code,
      title: '微信小程序样式 (WXSS)',
    },
  ];
});
