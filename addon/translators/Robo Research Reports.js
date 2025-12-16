{
	"translatorID": "b8g74e89-0d67-5f4c-9g5e-3c4d5e8f9a0b",
	"label": "Robo Research Reports",
	"creator": "Zotero Finance",
	"target": "^https?://robo\\.datayes\\.com/v2/details/report/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2025-12-16 06:38:08"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2025 ZotFin
	
	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/

/**
 * 研报类型关键词映射
 * @param {string} title 研报标题
 * @return {string} 研报类型标签
 */
function getReportTypeSlug(title) {
	if (!title) return "Research";

	const typeDict = [
		// 评级类
		{ slug: 'BuyRating', regex: /(买入|增持|强烈推荐|推荐)/ },
		{ slug: 'HoldRating', regex: /(中性|持有|观望)/ },
		{ slug: 'SellRating', regex: /(卖出|减持)/ },
		
		// 报告类型
		{ slug: 'InitCoverage', regex: /(首次覆盖|首次评级)/ },
		{ slug: 'DeepDive', regex: /(深度|深度研究|深度报告)/ },
		{ slug: 'UpdateReport', regex: /(跟踪|跟踪报告|更新)/ },
		{ slug: 'QuickComment', regex: /(快评|点评|简评)/ },
		{ slug: 'EarningsPreview', regex: /(业绩预告|业绩快报|业绩点评)/ },
		{ slug: 'EventDriven', regex: /(事件点评|事件驱动)/ },
		
		// 行业研究
		{ slug: 'IndustryReport', regex: /(行业|产业|板块)/ },
		{ slug: 'ThematicReport', regex: /(专题|主题)/ },
		{ slug: 'StrategyReport', regex: /(策略|配置)/ },
		{ slug: 'MacroReport', regex: /(宏观|经济)/ },
		
		// 兜底
		{ slug: 'Research', regex: /研报|研究/ }
	];

	for (let entry of typeDict) {
		if (entry.regex.test(title)) {
			return entry.slug;
		}
	}

	return "Research";
}

/**
 * 将证券机构名称转换为标准代码
 * @param {string} institutionName 机构名称
 * @return {string} 机构代码
 */
function getInstitutionCode(institutionName) {
	if (!institutionName) return 'Unknown';
	
	const institutionMap = {
		// 主要券商及其代码（按首字母排序）
		'安信证券': 'ESSENCE',
		'财通证券': 'CTSEC',
		'长城证券': 'CGWS',
		'长江证券': 'CJSC',
		'东北证券': 'NESC',
		'东方证券': 'DFZQ',
		'东吴证券': 'DWZQ',
		'东兴证券': 'DXZQ',
		'方正证券': 'FOUNDERSC',
		'光大证券': 'EBSCN',
		'广发证券': 'GF',
		'国海证券': 'GHZQ',
		'国泰君安': 'GTJA',
		'国信证券': 'GUOSEN',
		'海通证券': 'HAITONG',
		'恒泰证券': 'HTSC',
		'华泰证券': 'HTSC',
		'华西证券': 'HX',
		'湘财证券': 'XCFW',
		'信达证券': 'XD',
		'兴业证券': 'XYZQ',
		'银河证券': 'YINHE',
		'招商证券': 'ZS',
		'中信建投': 'CITIC',
		'中信证券': 'CITICSC',
		'中天证券': 'ZTSC',
		'中银证券': 'CYSC',
		'申万宏源': 'SW',
		'华创证券': 'HCCS',
	};
	
	// 精确匹配
	if (institutionMap[institutionName]) {
		return institutionMap[institutionName];
	}
	
	// 模糊匹配（包含关系）
	for (let key of Object.keys(institutionMap)) {
		if (institutionName.includes(key)) {
			return institutionMap[key];
		}
	}
	
	// 如果都不匹配，使用机构名称的前几个字符（避免生成乱码）
	return institutionName.substring(0, Math.min(6, institutionName.length));
}

/**
 * 辅助函数：补零
 */
function pad2(num) {
	return String(num).padStart(2, '0');
}

/**
 * 从 infocode 解析日期信息
 * infocode 格式: AP[年][月][日][序列号]
 * 例如: AP202512121799134995
 */
function parseInfoCode(infocode) {
	var result = {
		date: null,
		dateStr: 'YYYYMMDD'
	};
	
	if (!infocode || infocode.length < 10) {
		return result;
	}
	
	try {
		// 跳过 'AP' 前缀，提取日期部分
		var dateCode = infocode.substring(2, 10);
		if (/\d{8}/.test(dateCode)) {
			var year = dateCode.substring(0, 4);
			var month = dateCode.substring(4, 6);
			var day = dateCode.substring(6, 8);
			
			// 验证日期的有效性
			var testDate = new Date(year, parseInt(month) - 1, day);
			if (testDate.getFullYear() == year && testDate.getMonth() == parseInt(month) - 1 && testDate.getDate() == day) {
				result.date = year + '-' + pad2(month) + '-' + pad2(day);
				result.dateStr = year + pad2(month) + pad2(day);
			}
		}
	} catch (e) {
		// 日期解析失败，保持默认值
	}
	
	return result;
}

function detectWeb(doc, url) {
	if (url.includes('robo.datayes.com/v2/details/report/')) {
		return 'report';
	}
	return false;
}

async function doWeb(doc, url) {
	if (detectWeb(doc, url) == 'report') {
		await scrape(doc, url);
	}
}

async function scrape(doc, url) {
	var item = new Zotero.Item('report');
	var extraLines = [];
	
	// 提取标题、公司名和股票代码
	// 格式："安克创新（300866）：显微镜下的Anker投资价值-研报摘要pdf - 萝卜投研"
	var pageTitle = doc.title || '';
	var titlePart = pageTitle.split('-')[0].trim(); // 移除 "萝卜投研"
	
	var companyName = '';
	var stockCode = '';
	var reportTitle = '';
	
	// 匹配 "公司名（股票代码）：报告标题" 格式
	var match = titlePart.match(/^(.+?)（(\d+)）[：:]\s*(.+)$/);
	if (match) {
		companyName = match[1].trim();
		stockCode = match[2].trim();
		reportTitle = match[3].trim();
	} else {
		// 如果不匹配标准格式，使用整个标题
		reportTitle = titlePart;
	}

	// 按Yahoo财经格式优化股票代码
	if(stockCode.length == 5) { //处理港股
		stockCode = stockCode.substring(1, 5) + '.HK';
	}		
	else if (stockCode.startsWith('6')) {
		stockCode += '.SS'; // 上海主板
	} else if (stockCode.startsWith('0')) {
		stockCode += '.SZ'; // 深圳主板
	} else if (stockCode.startsWith('3')) {
		stockCode += '.SZ'; // 创业板
	} else if (stockCode.startsWith('8')) {
		stockCode += '.BJ'; // 北京交易所
	} else if (stockCode.startsWith('4')) {
		stockCode += '.OTC'; // 新三板
	}
	
	item.title = reportTitle || titlePart;
	
	// 将公司名和股票代码添加到 Extra
	if (companyName) {
		extraLines.push('Company: ' + companyName);
	}
	if (stockCode) {
		extraLines.push('Stock Code: ' + stockCode);
	}
	// 从 ReportHeader__StyledMeta 容器中提取所有信息
	var metaContainer = doc.querySelector('[class*="ReportHeader__StyledMeta"]');
	
	if (metaContainer) {
		// 提取机构名称：第一个直接子 span
		var institutionEl = metaContainer.querySelector(':scope > span:first-child');
		if (institutionEl) {
			var institutionText = institutionEl.textContent.trim();
			if (institutionText && institutionText.length < 100) {
				item.institution = institutionText;
			}
		}
		
		// 提取报告类型：a 标签内包含 StyledTag 的 span
		var reportTypeEl = metaContainer.querySelector('a [class*="StyledTag"]');
		if (reportTypeEl) {
			var reportTypeText = reportTypeEl.textContent.trim();
			if (reportTypeText) {
				item.reportType = reportTypeText;
			}
		}
		
		// 提取作者：通过 "···" 元素定位作者容器
		var dotElement = metaContainer.querySelector('[class*="AuthorList__StyledDot"]');
		if (dotElement && dotElement.parentElement) {
			var authorContainer = dotElement.parentElement;
			var authorSpans = Array.from(authorContainer.children).filter(function(child) {
				return child.tagName === 'SPAN' && !child.className.includes('AuthorList__StyledDot');
			});
			authorSpans.forEach(function(authorSpan) {
				var authorName = authorSpan.textContent.trim();
				if (authorName && authorName.length > 0 && authorName.length < 30) {
					item.creators.push({
						firstName: '',
						lastName: authorName,
						creatorType: 'author'
					});
				}
			});
		}
		
		// 提取页数：包含"页"的 span
		var pageEl = metaContainer.querySelector('span');
		var allSpans = metaContainer.querySelectorAll(':scope > span');
		for (let span of allSpans) {
			let text = span.textContent.trim();
			if (text.includes('页')) {
				let pageMatch = text.match(/(\d+)页/);
				if (pageMatch) {
					extraLines.push('Pages: ' + pageMatch[1]);
				}
				break;
			}
		}
		
		// 提取发布日期：float: right 的 span 或最后一个 span
		var dateEl = metaContainer.querySelector('span[style*="float: right"]');
		if (!dateEl) {
			var allSpans = metaContainer.querySelectorAll(':scope > span');
			dateEl = allSpans[allSpans.length - 1];
		}
		if (dateEl) {
			var dateStr = dateEl.textContent.trim();
			var dateMatch = dateStr.match(/(\d{4})[-年](\d{1,2})[-月]?(\d{1,2})/);
			if (dateMatch) {
				item.date = dateMatch[1] + '-' + pad2(dateMatch[2]) + '-' + pad2(dateMatch[3]);
			}
		}
	}
	
	// 如果没有提取到报告类型，使用默认值
	if (!item.reportType) {
		item.reportType = '证券研究报告';
	}
	
	// 添加 URL
	item.url = url;

	// 生成 Citation Key: 股票代码-主题-研究机构-日期
	var institutionCode = getInstitutionCode(item.institution);
	var dateStr = item.date.replace(/-/g, '');
	var keyPrefix = stockCode || 'Industry';
	var reportTypeSlug = getReportTypeSlug(item.title);
	extraLines.unshift('Citation Key: ' + keyPrefix + '-' + reportTypeSlug + '-' + institutionCode + '-' + dateStr);
	
	// 合并 Extra 字段
	if (extraLines.length) {
		item.extra = extraLines.join('\n');
	}
	
	// ====== PDF 获取策略 ======
	// 重要：robo.datayes.com 的 PDF 在 ?tab=original 页面的 iframe 中
	// 需要配合油猴脚本使用，或手动切换到 ?tab=original 页面
	
	var pdfResolved = false;
	var iframes = doc.querySelectorAll('iframe');
	
	for (let iframe of iframes) {
		let src = iframe.src || iframe.getAttribute('data-src');
		
		// 排除扩展自身的 iframe 和空 src，查找 PDF iframe
		if (src && !src.includes('chrome-extension://') && !src.includes('about:') && 
			(src.includes('pdf') || src.includes('viewer') || src.includes('.PDF') || src.match(/\.(pdf|PDF)/))) {
			item.attachments.push({
				url: src,
				title: 'Full Text PDF',
				mimeType: 'application/pdf'
			});
			pdfResolved = true;
			break;
		}
	}
	
	// 如果未找到 PDF
	if (!pdfResolved) {
		Zotero.debug('PDF not found. Please install userscript: https://github.com/ifeitao/zotero-finance/tree/main/userscripts');
		
		// 只在未找到 PDF 时才保存快照作为兜底
		item.attachments.push({
			document: doc,
			title: 'Snapshot',
			mimeType: 'text/html'
		});
	}

	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://robo.datayes.com/v2/details/report/5713026",
		"items": [
			{
				"itemType": "report",
				"title": "安克创新（300866）：显微镜下的Anker投资价值-研报摘要pdf",
				"creators": [],
				"date": "2024-08-07",
				"libraryCatalog": "Robo Research Reports",
				"reportType": "证券研究报告",
				"url": "https://robo.datayes.com/v2/details/report/5713026",
				"attachments": [
					{
						"title": "Snapshot",
						"mimeType": "text/html"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	}
]
/** END TEST CASES **/
