{
	"translatorID": "a7f63d78-9c56-4e3b-8f4d-2b3c4d5e7f8a",
	"label": "EastMoney Reports",
	"creator": "Zotero Finance",
	"target": "^https?://data\\.eastmoney\\.com/report/(info/|zw_)",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2025-12-13 11:43:27"
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
		'国金证券': 'GJZQ',
		'国泰君安': 'GTJA',
		'国信证券': 'GUOSEN',
		'国元证券': 'GYZQ',
		'海通证券': 'HTSEC',
		'华安证券': 'HAZQ',
		'华宝证券': 'CNBM',
		'华创证券': 'SYWG',
		'华福证券': 'HFZQ',
		'华金证券': 'HJZQ',
		'华林证券': 'HLZQ',
		'华泰证券': 'HTSC',
		'华西证券': 'HXZQ',
		'华鑫证券': 'SHRS',
		'江海证券': 'JHZQ',
		'民生证券': 'MSZQ',
		'平安证券': 'PAZQ',
		'浙商证券': 'ZSZQ',
		'申万宏源': 'SWHY',
		'太平洋证券': 'TPYZQ',
		'天风证券': 'TFZQ',
		'万联证券': 'WLZQ',
		'西部证券': 'XBZQ',
		'西南证券': 'XNZQ',
		'湘财证券': 'XCSC',
		'新时代证券': 'XSDZQ',
		'信达证券': 'CINDASC',
		'兴业证券': 'XYZ',
		'银河证券': 'CHINASTOCK',
		'英大证券': 'YDSC',
		'源达信息': 'YDXX',
		'粤开证券': 'YKZQ',
		'招商证券': 'CMS',
		'浙商证券': 'ZSZQ',
		'中金公司': 'CICC',
		'中信建投': 'CSC',
		'中信证券': 'CITICS',
		'中银国际': 'BOCI',
		'中银证券': 'BOCS',
		'中邮证券': 'CNPSEC',
		'中原证券': 'CCNEW',
		'中泰证券': 'ZTZQ',
		'中国银河': 'CHINASTOCK'
	};
	
	// 精确匹配
	if (institutionMap[institutionName]) {
		return institutionMap[institutionName];
	}
	
	// 部分匹配（如果机构名称包含关键词）
	for (let key in institutionMap) {
		if (institutionName.includes(key)) {
			return institutionMap[key];
		}
	}
	
	// 如果没有匹配，返回拼音缩写（取前4个汉字的首字母）
	return institutionName.substring(0, 4).toUpperCase();
}

/**
 * 从研报代码提取信息
 * @param {string} infocode 研报代码 (例如: AP202512131799528181)
 * @return {object} 包含日期等信息的对象
 */
function parseInfoCode(infocode) {
	if (!infocode) return {};
	
	// 处理可能缺少 AP 前缀的情况
	var codeToMatch = infocode.indexOf('AP') === 0 ? infocode : ('AP' + infocode);
	
	// AP + YYYYMMDD + 其他数字
	var match = codeToMatch.match(/AP(\d{4})(\d{2})(\d{2})/);
	if (match) {
		return {
			date: match[1] + '-' + match[2] + '-' + match[3],
			dateStr: match[1] + match[2] + match[3]
		};
	}
	return {};
}

function pad2(num) {
	const str = String(num);
	return str.length === 1 ? '0' + str : str;
}

function detectWeb(doc, url) {
	// 检测个股研报详情页
	if (url.includes('/report/info/') && url.includes('.html')) {
		return 'report';
	}
	// 检测行业研报页面（需要进一步处理）
	if (url.includes('/report/zw_industry.jshtml') && url.includes('infocode=')) {
		return 'report';
	}
	// 检测个股研报 encodeUrl 页面
	if (url.includes('/report/zw_stock.jshtml') && url.includes('encodeUrl=')) {
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
	var pdfLink = doc.querySelector('a[href*=".pdf"], a[href*="pdf.dfcfw.com"]');
	
	// 提取研报代码 (infocode)
	var infocode = '';
	var infocodeMatch = url.match(/infocode=(AP\d+)/);
	if (infocodeMatch) {
		infocode = infocodeMatch[1];
	} else {
		infocodeMatch = url.match(/\/info\/(AP\d+)\.html/);
		if (infocodeMatch) {
			infocode = infocodeMatch[1];
		}
	}

	// encodeUrl 页面从 PDF 链接兜底提取 infocode
	if (!infocode && pdfLink && pdfLink.href) {
		var pdfCodeMatch = pdfLink.href.match(/AP\d+/);
		if (pdfCodeMatch) {
			infocode = pdfCodeMatch[0];
		}
	}
	
	// 从infocode解析日期
	var dateInfo = parseInfoCode(infocode);
	if (dateInfo.date) {
		item.date = dateInfo.date;
	}
	// 如果页面包含中文日期，作为兜底
	if (!item.date && doc.body && doc.body.textContent) {
		var dateMatch = doc.body.textContent.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
		if (dateMatch) {
			item.date = dateMatch[1] + '-' + pad2(dateMatch[2]) + '-' + pad2(dateMatch[3]);
		}
	}
	
	// 提取标题 - 从页面 title 获取，提取下划线之前的内容
	// 示例: "磷酸盐主业稳根基，磷矿石资源助增长- 宏观研究报告 _ 数据中心 _ 东方财富网"
	var pageTitle = doc.title || '';
	var title = pageTitle.split('-')[0].trim().split('_')[0].trim();
	if (!title) {
		var headingEl = doc.querySelector('h1, .title, .report-title, [class*="title"]');
		if (headingEl) {
			title = headingEl.textContent.trim();
		}
	}
		
	// 如果提取失败，使用默认标题
	if (!title) {
		title = '研报 ' + infocode;
	}
	
	item.title = title;
	
	// 提取股票代码（个股研报）
	
	var stockStr = doc.querySelector('#ctx-content > p:nth-child(1)'); //　　贵州茅台(600519)
	var stockCode = '';
	if (stockStr) {
		var stockCodeMatch = stockStr.textContent.match(/\((\d{6})\)/);		
		if (stockCodeMatch) {
			stockCode = stockCodeMatch[1];
		}
	}

	// 按Yahoo财经格式优化股票代码
	if (stockCode.startsWith('6')) {
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
	
	// 提取机构名称
	var institutionEl = doc.querySelector('.c-infos > span:nth-child(3)');
	if (institutionEl) {
		var institutionText = institutionEl.textContent.trim();
		if (institutionText && institutionText.length < 100) {  // 避免提取过长的文本
			item.institution = institutionText;
		}
	}
	
	// 提取研究员/作者
	var authorEl = doc.querySelector('.c-infos > span:nth-child(4)');
	if (authorEl) {
		var authors = authorEl.textContent.trim().split(/[,，、]/);
		authors.forEach(function(author) {
			author = author.trim();
			if (author && author.length > 0 && author.length < 30 && item.creators) {
				item.creators.push({
					firstName: '',
					lastName: author,
					creatorType: 'author'
				});
			}
		});
	}
	
	// 提取评级信息
	var ratingEl = doc.querySelector('.rating, .invest-rating, [class*="rating"], [class*="invest"]');
	if (ratingEl) {
		var ratingText = ratingEl.textContent.trim();
		if (ratingText && ratingText.length < 50) {
			extraLines.push('Rating: ' + ratingText);
		}
	}
	
	// 提取目标价
	var targetPriceEl = doc.querySelector('.target-price, .price-target, [class*="target"], [class*="price"]');
	if (targetPriceEl) {
		var priceMatch = targetPriceEl.textContent.match(/([\d.]+)/);
		if (priceMatch) {
			extraLines.push('Target Price: ' + priceMatch[1]);
		}
	}
	
	// 提取行业信息（行业研报）
	var industryEl = doc.querySelector('.industry, .sector, [class*="industry"], [class*="sector"]');
	if (industryEl) {
		var industryText = industryEl.textContent.trim();
		if (industryText && industryText.length < 100) {
			extraLines.push('Industry: ' + industryText);
			if (!item.institution) {
				item.institution = industryText;
			}
		}
	}
	
	// 生成 Citation Key: 股票代码-研究机构-日期
	var institutionCode = getInstitutionCode(item.institution);
	var dateStr = dateInfo.dateStr || 'YYYYMMDD';
	var keyPrefix = stockCode || 'Industry';
	extraLines.unshift('Citation Key: ' + keyPrefix + '-research-' + institutionCode + '-' + dateStr);
	
	// 添加研报代码
	if (infocode) {
		extraLines.push('Report ID: ' + infocode);
	}
	
	// 设置报告类型
	item.reportType = '证券研究报告';
	
	// 添加 URL
	item.url = url;
	
	// 合并 Extra 字段
	if (extraLines.length) {
		item.extra = extraLines.join('\n');
	}
	
	// 查找 PDF 附件
	if (pdfLink && pdfLink.href) {
		item.attachments.push({
			url: pdfLink.href,
			title: 'Full Text PDF',
			mimeType: 'application/pdf'
		});
	} else {
		// 添加网页快照
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
		"url": "https://data.eastmoney.com/report/info/AP202512121799134995.html",
		"items": [
			{
				"itemType": "report",
				"title": "磷酸盐主业稳根基，磷矿石资源助增长",
				"creators": [
					{
						"firstName": "",
						"lastName": "杨林",
						"creatorType": "author"
					},
					{
						"firstName": "",
						"lastName": "余双雨",
						"creatorType": "author"
					}
				],
				"date": "2025-12-12",
				"extra": "Citation Key: 002895.SZ-Research-20251212\nReport ID: AP202512121799134995",
				"institution": "国信证券",
				"libraryCatalog": "EastMoney Reports",
				"reportType": "证券研究报告",
				"url": "https://data.eastmoney.com/report/info/AP202512121799134995.html",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://data.eastmoney.com/report/zw_industry.jshtml?infocode=AP202512131799528181",
		"items": [
			{
				"itemType": "report",
				"title": "消费电子产业链跟踪：阿里夸克AI眼镜热销",
				"creators": [
					{
						"firstName": "",
						"lastName": "高峰",
						"creatorType": "author"
					},
					{
						"firstName": "",
						"lastName": "刘来珍",
						"creatorType": "author"
					}
				],
				"date": "2025-12-13",
				"extra": "Citation Key: Industry-UpdateReport-20251213\nIndustry: 电子元件\nReport ID: AP202512131799528181",
				"institution": "中国银河",
				"libraryCatalog": "EastMoney Reports",
				"reportType": "证券研究报告",
				"url": "https://data.eastmoney.com/report/zw_industry.jshtml?infocode=AP202512131799528181",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					}
				],
				"tags": [],
				"notes": [],
				"seeAlso": []
			}
		]
	},
	{
		"type": "web",
		"url": "https://data.eastmoney.com/report/zw_stock.jshtml?encodeUrl=MrPjTj36C6tPERUlBhSkPJrvVWA+UX4FFeifGokJFZs=",
		"items": [
			{
				"itemType": "report",
				"title": "股东大会强调高质量发展，聚焦渠道稳定性，稳步推进改革",
				"creators": [
					{
						"firstName": "",
						"lastName": "邓天娇",
						"creatorType": "author"
					}
				],
				"date": "2025-12-09",
				"extra": "Citation Key: 600519.SS-Research-20251209\nReport ID: AP202512091796958027",
				"institution": "中银证券",
				"libraryCatalog": "EastMoney Reports",
				"reportType": "证券研究报告",
				"url": "https://data.eastmoney.com/report/zw_stock.jshtml?encodeUrl=MrPjTj36C6tPERUlBhSkPJrvVWA+UX4FFeifGokJFZs=",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
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
