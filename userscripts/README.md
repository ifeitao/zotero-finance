# 油猴脚本：Robo 研报自动显示原文

## 📦 功能

自动在 Robo 研报页面切换到"原文" tab，让 Zotero 能直接抓取 PDF 链接，无需手动操作。

## 🚀 安装步骤

### 1. 安装油猴扩展

首先需要安装 Tampermonkey（油猴）浏览器扩展：

- **Chrome/Edge**: [Chrome 网上应用店](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- **Firefox**: [Firefox 附加组件](https://addons.mozilla.org/firefox/addon/tampermonkey/)
- **Safari**: [App Store](https://apps.apple.com/app/tampermonkey/id1482490089)

### 2. 安装脚本

**方法 A：直接打开脚本文件（推荐）**

1. 在文件管理器中双击 `robo-auto-original-simple.user.js`
2. Tampermonkey 会自动检测并弹出安装页面
3. 点击"安装"按钮

**方法 B：从 Greasy Fork 安装**

访问 [Greasy Fork 脚本页面](https://greasyfork.org/)（即将上线）

**方法 C：手动复制安装**

1. 点击浏览器工具栏的 Tampermonkey 图标
2. 选择"管理面板" / "Dashboard"
3. 点击左侧的"+"号（新建脚本）
4. 删除默认内容
5. 复制 `robo-auto-original-simple.user.js` 的全部内容并粘贴
6. 按 `Ctrl + S` (Windows) 或 `Cmd + S` (Mac) 保存

## 📖 使用说明

安装后，脚本会**自动运行**：

1. 访问任何 Robo 研报页面，例如：

   ```
   https://robo.datayes.com/v2/details/report/5713026
   ```

2. 脚本会自动：
   - 查找"原文" tab
   - 自动点击切换到原文页面
   - 等待 PDF iframe 加载

3. 看到 PDF viewer 后，点击 Zotero Connector 图标即可保存

## 🔍 调试

如果脚本没有生效：

1. **打开浏览器控制台**：
   - Windows/Linux: `F12` 或 `Ctrl + Shift + I`
   - Mac: `Cmd + Option + I`

2. **查看 Console 标签**，应该看到：

   ```
   [Robo Auto] Script loaded
   [Robo Auto] Found and clicking "原文" tab: <element>
   [Robo Auto] ✅ Successfully clicked "原文" tab
   ```

3. **如果看到警告**：
   ```
   [Robo Auto] ⚠️ Could not find "原文" tab after 10 attempts
   ```
   说明页面结构可能变化，需要更新脚本。

## 工作原理

脚本的工作流程：

```
1. 检测当前 URL 是否为 Robo 研报页面
   ↓
2. 检查是否已在"原文" tab（避免重复操作）
   ↓
3. 查找页面中的"原文" tab 元素
   ↓
4. 模拟点击（elem.click()）
   ↓
5. 等待 PDF iframe 加载
   ↓
6. 用户可以使用 Zotero 抓取
```

## 🤝 配合 Zotero Translator 使用

1. **安装油猴脚本**（本指南）
2. **安装 Zotero Translator**：`Robo Research Reports.js`
3. **正常浏览研报**，脚本会自动切换到原文页面
4. **点击 Zotero 图标**，Translator 会自动提取 PDF 链接

## ⚠️ 注意事项

- 脚本只在 `robo.datayes.com/v2/details/report/*` 页面运行
- 需要登录 Robo 账号才能查看原文
- 如果页面加载很慢，脚本可能需要等待 5-10 秒
- 不会影响页面的其他功能

## 🐛 故障排除

### 问题 1：脚本没有运行

**解决方法**：

- 检查 Tampermonkey 是否已启用（图标应该是彩色的）
- 检查脚本是否已启用（管理面板中脚本前面应该有绿色开关）
- 刷新页面重试

### 问题 2：找不到"原文" tab

**解决方法**：

- 打开控制台查看错误信息
- 网站可能更新了 DOM 结构，需要更新脚本
- 可以手动点击"原文"或"打开原文PDF"按钮

### 问题 3：点击后没有反应

**解决方法**：

- 等待 3-5 秒让页面完全加载
- 检查是否已登录 Robo 账号
- 尝试刷新页面重试

## 📄 许可证

MIT License - 自由使用和修改

## 🔗 相关链接

- [Tampermonkey 官网](https://www.tampermonkey.net/)
- [Zotero 官网](https://www.zotero.org/)
- [项目仓库](https://github.com/ifeitao/zotero-finance)
