# 贡献指南

感谢你对 Zotero Finance 插件的关注！本文档将帮助你了解如何参与项目的开发和测试。

## 🛠️ 开发环境设置

### 前置要求

- Node.js 16+ 和 npm
- Git
- Zotero 7+
- 代码编辑器（推荐 VS Code）

### 克隆仓库

```bash
git clone https://github.com/ifeitao/zotero-finance.git
cd zotero-finance
```

### 安装依赖

```bash
npm install
```

### 项目结构

```
zotero-finance/
├── src/                    # TypeScript 源代码
│   ├── addon.ts           # 插件主入口
│   ├── hooks.ts           # 生命周期钩子
│   └── modules/
│       └── translators.ts # Translator 管理模块
├── addon/                  # 插件资源文件
│   ├── bootstrap.js       # 插件引导程序
│   ├── manifest.json      # 插件清单
│   ├── prefs.js          # 偏好设置
│   ├── translators/      # Zotero Translators
│   │   ├── EastMoney Notices.js
│   │   └── EastMoney Reports.js
│   ├── content/          # UI 资源
│   └── locale/           # 本地化文件
│       ├── en-US/
│       └── zh-CN/
├── test/                  # 测试文件
└── typings/              # TypeScript 类型定义
```

## 🔨 开发流程

### 开发模式

启动开发模式会自动监视文件变化并重新构建：

```bash
npm start
```

### 生产构建

```bash
npm run build
```

构建后的 XPI 文件位于 `.scaffold/build/zotero-finance.xpi`

### 代码检查

```bash
# 运行 ESLint
npm run lint

# TypeScript 类型检查
npm run typecheck
```

### 测试

```bash
npm test
```

## 📝 添加新的 Translator

### 1. 创建 Translator 文件

在 `addon/translators/` 目录下创建新的 `.js` 文件，例如 `NewSource.js`

### 2. 定义 Translator 元数据

每个 Translator 必须包含 JSON 格式的元数据块：

```javascript
{
  "translatorID": "唯一的 UUID",  // 使用 uuidgen 命令生成
  "label": "数据源名称",
  "creator": "作者名",
  "target": "^https?://example\\.com/",  // 匹配的 URL 正则
  "minVersion": "3.0",
  "maxVersion": "",
  "priority": 100,
  "inRepository": true,
  "translatorType": 4,
  "browserSupport": "gcsibv",
  "lastUpdated": "2025-12-13 14:00:00"
}
```

### 3. 实现核心函数

#### detectWeb()

检测当前页面是否支持抓取：

```javascript
function detectWeb(doc, url) {
  // 检查页面是否匹配
  if (url.includes("/detail/")) {
    return "report"; // 或 'document', 'journalArticle' 等
  }
  return false;
}
```

#### doWeb()

执行抓取操作：

```javascript
async function doWeb(doc, url) {
  if (detectWeb(doc, url)) {
    await scrape(doc, url);
  }
}
```

#### scrape()

提取数据并创建 Zotero 条目：

```javascript
async function scrape(doc, url) {
  var item = new Zotero.Item("report");

  // 提取标题
  var titleEl = doc.querySelector(".title");
  if (titleEl) {
    item.title = titleEl.textContent.trim();
  }

  // 提取日期
  item.date = "2025-12-13";

  // 提取作者
  item.creators.push({
    firstName: "张三",
    lastName: "",
    creatorType: "author",
  });

  // 添加附件
  item.attachments.push({
    url: url,
    title: "Snapshot",
    mimeType: "text/html",
  });

  // 完成抓取
  await item.complete();
}
```

### 4. 注册 Translator

在 `src/modules/translators.ts` 的 `knownTranslators` 数组中添加新文件名：

```typescript
const knownTranslators = [
  "EastMoney Notices.js",
  "EastMoney Reports.js",
  "NewSource.js", // 添加这里
];
```

### 5. 构建和测试

```bash
# 构建插件
npm run build

# 在 Zotero 中安装测试
# Tools → Add-ons → Install from File → 选择 .scaffold/build/zotero-finance.xpi
```

## 🧪 测试 Translator

### 使用 Scaffold (Translator Editor) 测试

[Scaffold](https://www.zotero.org/support/dev/translators/scaffold) 是 Zotero 内置的 Translator IDE（集成开发环境），从 Zotero 7 开始已内置在客户端中，无需单独安装。

#### 打开 Scaffold

在 Zotero 中选择 `Tools` → `Developer` → `Translator Editor`

#### 首次使用设置

第一次打开 Scaffold 时，需要选择 translator 开发目录：

1. **推荐方式**：克隆 [Zotero translators 仓库](https://github.com/zotero/translators)

   ```bash
   git clone https://github.com/zotero/translators.git
   ```

   然后在 Scaffold 中选择该目录

2. **本地开发**：也可以选择本项目的 `addon/translators/` 目录进行开发

#### 使用 Scaffold 测试 Translator

##### 1. 加载 Translator

- 点击顶部 `Open` 按钮
- 从列表中选择已安装的 translator
- 或选择本地开发的 translator 文件（如 `addon/translators/EastMoney Reports.js`）

##### 2. Scaffold 界面说明

**顶部按钮**：

- **Open**：打开已安装的 translator
- **Save**：保存当前 translator（提供唯一的 label 和 ID）
- **Save to Zotero**：保存到 Zotero 数据目录的 translators 子目录，使其在客户端和 Connector 中可用
- **Run detect\***：运行 `detectWeb`/`detectImport`/`detectSearch` 函数
- **Run do\***：运行 `doWeb`/`doImport`/`doSearch` 函数

**选项卡**：

- **Metadata**：显示 translator 元数据（ID、target 正则表达式等）
- **Code**：JavaScript 代码编辑器，支持语法高亮、代码折叠、ESLint 集成等
- **Tests**：translator 的测试列表和预期输出
- **Test Data**：import 和 search translator 的输入数据
- **Browser**：浏览网站并测试检测和数据提取

**Debug Output 面板**：显示实时调试输出

##### 3. 测试 Web Translator

1. **切换到 Browser 选项卡**
2. **在浏览器中访问目标网页**（例如东方财富网的研报页面）
3. **测试检测功能**：
   - 点击 `Run detectWeb` 按钮
   - Debug Output 会显示检测到的条目类型，例如：
     ```
     detectWeb returned type "report"
     ```

4. **测试数据提取**：
   - 点击 `Run doWeb` 按钮
   - Debug Output 会显示提取的所有元数据：
     ```
     Returned item:
       'itemType' => "report"
       'title' => "消费电子产业链跟踪：阿里夸克AI眼镜热销"
       'creators' => ...
       'date' => "2025-12-13"
       'attachments' => ...
     Translation successful
     ```

5. **快速迭代**：
   - 在 Code 选项卡中修改代码
   - 点击 `Save` 或 `Save to Zotero`
   - 重新运行测试，立即看到效果

##### 4. 添加调试输出

在代码中使用 `Zotero.debug()` 输出调试信息：

```javascript
var pageTitle = doc.title || "";
Zotero.debug("原始页面标题: " + pageTitle);

var title = pageTitle.split("_")[0].trim();
Zotero.debug("分割后的标题: " + title);

title = title
  .replace(/[-\s]*[—\-](研究报告正文|宏观研究报告|研报|报告|正文).*$/i, "")
  .trim();
Zotero.debug("清理后的标题: " + title);
```

Debug Output 面板会实时显示这些信息。

##### 5. 测试正则表达式

在 Metadata 选项卡中：

1. 确保 Browser 选项卡加载了目标网页
2. 点击 `Test Regex` 按钮
3. Debug Output 显示正则是否匹配：
   ```
   ===>true<===(boolean)
   ```

#### Scaffold 开发技巧

**代码编辑器特性**：

- 语法高亮和代码折叠
- 搜索和替换
- 基本类型推断
- 代码建议
- 鼠标悬停时显示条目类型提示
- ESLint 集成（首次使用时会提示设置）

**测试最佳实践**：

- 准备多个测试 URL，覆盖不同的页面结构
- 使用 `Zotero.debug()` 输出关键变量值
- 验证所有必填字段（title、creators、date 等）
- 测试附件是否正确（注意：Scaffold 不实际保存条目，仅显示输出）

**常见调试场景**：

1. **检查 DOM 选择器**

   ```javascript
   var titleEl = doc.querySelector(".title");
   Zotero.debug("标题元素: " + (titleEl ? titleEl.textContent : "null"));
   ```

2. **日期格式转换**

   ```javascript
   var dateText = doc.querySelector(".date")?.textContent;
   Zotero.debug("原始日期: " + dateText);
   var date = ZU.strToISO(dateText);
   Zotero.debug("ISO 日期: " + date);
   ```

3. **验证附件 URL**
   ```javascript
   var pdfUrl = doc.querySelector("a.pdf")?.href;
   Zotero.debug("PDF URL: " + pdfUrl);
   ```

### 手动测试

1. 安装构建的 XPI 文件到 Zotero
2. 在浏览器中访问目标网站
3. 点击地址栏的 Zotero 图标
4. 检查是否正确提取了所有字段
5. 验证附件是否正确下载

### 调试技巧

#### 查看浏览器控制台

按 F12 打开开发者工具，在 Console 中可以看到：

- Translator 加载信息
- JavaScript 错误
- 自定义日志输出

#### 查看 Zotero 调试日志

1. 在 Zotero 中打开 `帮助` → `调试输出记录`
2. 点击 `启用`
3. 执行抓取操作
4. 点击 `查看输出`

#### 添加调试日志

在 Translator 代码中添加：

```javascript
Zotero.debug("调试信息: " + someVariable);
```

### CSS 选择器技巧

使用浏览器开发者工具来确定正确的选择器：

1. 右键点击页面元素 → "检查"
2. 在 Elements 面板中找到目标元素
3. 右键点击元素 → Copy → Copy selector

推荐使用灵活的选择器模式：

```javascript
// ❌ 太具体，容易失效
doc.querySelector(".article-title-main");

// ✅ 更灵活
doc.querySelector('.title, .article-title, [class*="title"]');
```

## 🎯 代码规范

### TypeScript/JavaScript

- 使用 2 空格缩进
- 使用单引号
- 函数名使用驼峰命名法
- 为复杂逻辑添加注释

### Translator 最佳实践

1. **容错处理** - 总是检查元素是否存在

```javascript
var titleEl = doc.querySelector(".title");
if (titleEl) {
  item.title = titleEl.textContent.trim();
}
```

2. **长度验证** - 避免提取过长的文本

```javascript
var text = element.textContent.trim();
if (text && text.length < 100) {
  item.field = text;
}
```

3. **多种选择器** - 提供备选方案

```javascript
var titleEl = doc.querySelector(".title, .article-title, h1");
```

4. **日期格式** - 使用 ISO 8601 格式

```javascript
item.date = "2025-12-13"; // YYYY-MM-DD
```

5. **作者信息** - 正确设置作者类型

```javascript
item.creators.push({
  firstName: "名",
  lastName: "姓",
  creatorType: "author", // 或 'editor', 'contributor'
});
```

## 📚 参考资源

### Zotero 官方文档

- [Zotero Translator 开发文档](https://www.zotero.org/support/dev/translators)
- [Translator 编写指南](https://www.zotero.org/support/dev/translators/coding)
- [Zotero API 文档](https://www.zotero.org/support/dev/client_coding)

### 工具

- [Zotero Scaffold](https://www.zotero.org/support/dev/translators/scaffold) - Translator 开发和测试工具
- [Zotero Plugin Template](https://github.com/windingwind/zotero-plugin-template) - 本项目使用的模板

## 🐛 提交 Issue

如果发现 bug 或有功能建议，请在 [GitHub Issues](https://github.com/ifeitao/zotero-finance/issues) 提交，并包含：

- Zotero 版本
- 浏览器版本
- 问题的详细描述
- 重现步骤
- 相关的错误日志或截图

## 🔄 提交 Pull Request

1. Fork 本仓库
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`
5. 创建 Pull Request

### PR 检查清单

- [ ] 代码通过 `npm run lint`
- [ ] 代码通过 `npm run typecheck`
- [ ] 已测试新功能
- [ ] 更新了相关文档
- [ ] 提交信息清晰明了

## 📄 许可证

本项目采用 MIT 许可证。提交代码即表示你同意将代码以该许可证发布。
