# Zotero Finance 插件

[![zotero target version](https://img.shields.io/badge/Zotero-7-green?style=flat-square&logo=zotero&logoColor=CC2936)](https://www.zotero.org)

一个用于 Zotero 的金融文献自动抓取插件，支持从东方财富网自动抓取上市公司公告和研究报告。

## ✨ 功能特性

- 📰 **公司公告抓取** - 自动抓取上市公司公告信息
- 📊 **研究报告抓取** - 自动抓取券商研报和行业分析报告
- 🔄 **自动管理** - Translator 自动安装和更新
- 🌐 **完整信息** - 提取标题、日期、作者、评级、目标价等关键信息
- 📎 **附件下载** - 自动下载 PDF 附件和保存网页快照

## 📥 安装

1. 从 [Releases 页面](https://github.com/ifeitao/zotero-finance/releases) 下载最新的 `.xpi` 文件
2. 在 Zotero 中选择 `工具` → `插件`
3. 点击齿轮图标 ⚙️，选择 `Install Add-on From File...`
4. 选择下载的 `.xpi` 文件
5. 重启 Zotero

## 🚀 使用方法

### 抓取公司公告

1. 在浏览器中打开东方财富公告详情页  
   例如：`https://data.eastmoney.com/notices/detail/600519/AN202504291664502895.html`
2. 点击浏览器地址栏的 Zotero 图标
3. 公告信息会自动保存到 Zotero

**提取的信息**：公告标题、发布日期、股票代码、公司名称、PDF 附件

### 抓取研究报告

1. 在浏览器中打开东方财富研报详情页
   - 个股研报：`https://data.eastmoney.com/report/info/AP202512121799134995.html`
   - 行业研报：`https://data.eastmoney.com/report/zw_industry.jshtml?infocode=AP202512131799528181`
2. 点击浏览器地址栏的 Zotero 图标
3. 研报信息会自动保存到 Zotero

**提取的信息**：研报标题、发布日期、发布机构、分析师、股票代码、投资评级、目标价格、行业分类、研报摘要、PDF 附件

**支持的研报类型**：

- 投资评级：买入/增持/中性/减持/卖出
- 研究类型：深度研究、首次覆盖、跟踪报告、快评、业绩预告、事件评论
- 行业分析：行业研究、专题分析、策略报告、宏观报告

### 抓取 Robo 研报（需要油猴脚本）

**Robo 研报页面的 PDF 在动态加载的"原文" tab 中，需要配合油猴脚本使用：**

1. **安装油猴脚本**（一次性设置）：
   - 安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展
   - 双击打开 `userscripts/robo-auto-original-simple.user.js` 安装脚本
   - 详细说明见 [userscripts/README.md](userscripts/README.md)

2. **使用方法**：
   - 访问 Robo 研报页面（如 `https://robo.datayes.com/v2/details/report/5713026`）
   - 油猴脚本会自动切换到"原文" tab
   - 等待 PDF 加载后，点击 Zotero 图标保存

**手动方式**（不安装油猴）：

- 在 URL 后添加 `?tab=original` 参数访问
- 或点击页面上的"打开原文PDF"按钮
- 等待 PDF 加载后，点击 Zotero 图标

## ⚙️ 配置选项

在 Zotero 中打开 `编辑` → `首选项` → `Zotero Finance`：

- **启用插件**：开启/关闭插件功能
- **自动更新 Translators**：自动检查并更新 translators（默认开启）

## 🔧 故障排除

### Translator 未生效

1. 重启 Zotero
2. 在 Zotero 中打开 `工具` → `首选项` → `高级` → `文件和文件夹`，点击 `重置 Translators`
3. 如果问题仍存在，尝试重新安装插件

### 查看调试日志

1. 在 Zotero 中打开 `帮助` → `调试输出记录`
2. 点击 `启用`
3. 进行相关操作后，点击 `查看输出`

### 常见问题

**Q: 地址栏没有显示 Zotero 图标？**  
A: 确认访问的是支持的页面格式，刷新页面后再试。

**Q: 某些字段没有被提取？**  
A: 某些研报可能缺少部分信息（如目标价、评级等），这是正常现象。

**Q: 如何批量抓取？**  
A: 目前需要逐个打开详情页进行抓取，暂不支持批量操作。

## 🤝 贡献

欢迎贡献代码或提出建议！请查看 [CONTRIBUTING.md](CONTRIBUTING.md) 了解开发和测试方法。

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件
