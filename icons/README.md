# Tab图标说明

为了实现tab选中/未选中状态，您需要准备以下PNG图标文件（尺寸建议：80x80像素或60x60像素）：

## 图标文件列表

1. `icons/home.png` - 首页tab未选中状态
2. `icons/home_selected.png` - 首页tab选中状态
3. `icons/calculator.png` - 计算器tab未选中状态
4. `icons/calculator_selected.png` - 计算器tab选中状态
5. `icons/profile.png` - 我的tab未选中状态
6. `icons/profile_selected.png` - 我的tab选中状态

## 图标设计建议

- 未选中状态：使用较浅的颜色（如 #7A7E83）
- 选中状态：使用主题色（如 #007aff）
- 图标应为透明背景
- 确保图标在小尺寸下清晰可辨

## 制作方法

您可以使用以下方式创建这些图标：

1. 使用设计工具（如Photoshop、Sketch、Figma等）创建80x80像素的PNG文件
2. 使用在线图标生成器
3. 使用微信小程序的canvas API动态生成
4. 使用开源图标库（如 Feather Icons、Font Awesome 等）并按需导出

## 使用说明

将这些图标文件放置在项目根目录下的 `icons` 文件夹中，确保文件路径与 `app.json` 中的配置一致。

app.json中的配置如下：
```
"tabBar": {
  "color": "#7A7E83",
  "selectedColor": "#007aff",
  "borderStyle": "black",
  "backgroundColor": "#ffffff",
  "list": [
    {
      "pagePath": "pages/index/index",
      "text": "首页",
      "iconPath": "icons/home.png",
      "selectedIconPath": "icons/home_selected.png"
    },
    {
      "pagePath": "pages/calculator/calculator",
      "text": "计算器",
      "iconPath": "icons/calculator.png",
      "selectedIconPath": "icons/calculator_selected.png"
    },
    {
      "pagePath": "pages/about/about",
      "text": "我的",
      "iconPath": "icons/profile.png",
      "selectedIconPath": "icons/profile_selected.png"
    }
  ]
},
```

## 预览图标

我们已创建了一个图标预览页面 (pages/icons/icons)，您可以在其中查看图标的样式和颜色效果。