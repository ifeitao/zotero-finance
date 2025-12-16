{
	"translatorID": "e5f52c67-8b45-4d2a-9f3c-1a2b3c4d5e6f",
	"label": "EastMoney Notices",
	"creator": "Zotero Finance",
	"target": "^https?://data\\.eastmoney\\.com/notices/detail/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2025-12-15 02:18:19"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2025 Your Name
	
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
 * 简易版金融标题清洗器 (直接嵌入 Translator)
 * @param {string} title 原始标题
 * @return {string} 清洗后的英文 Slug
 */
function getFinancialSlug(title) {
	if (!title) return "Announcement";

	// 1. 预定义字典 (按优先级排列)
	// 可以在这里快速测试你的关键词覆盖率
	const dictionary = [
		// 定期报告
		{ slug: 'AnnualReport', regex: /(年度报告|年报)/ },
		{ slug: 'SemiAnnualReport', regex: /(半年度报告|半年报)/ },
		{ slug: 'Q1Report', regex: /(第一季度报告|一季报)/ },
		{ slug: 'Q3Report', regex: /(第三季度报告|三季报|九个月业绩)/ },
		{ slug: 'ESGReport', regex: /(社会责任报告|ESG)/ },
		{ slug: 'AuditReport', regex: /审计报告/ },

		// 资金与财务
		{ slug: 'CashMgmt', regex: /(现金管理|理财|闲置资金)/ },
		{ slug: 'Dividend', regex: /(分红|权益分派|派息)/ },
		{ slug: 'Pledge', regex: /(质押|解押)/ },
		{ slug: 'Guarantee', regex: /担保/ },
		{ slug: 'Loan', regex: /(借款|授信)/ },
		{ slug: 'CapitalIncrease', regex: /增资/ },

		// 公司治理
		{ slug: 'Resignation', regex: /(辞职|离职)/ },
		{ slug: 'Appointment', regex: /(聘任|选举|补选)/ },
		{ slug: 'Articles', regex: /章程/ },

		// 监管反馈
		{ slug: 'InquiryLetter', regex: /问询函/ },
		{ slug: 'Supervision', regex: /(监管函|警示函)/ },
		
		// 兜底
		{ slug: 'Announcement', regex: /公告/ }
	];

	// 2. 匹配逻辑
	for (let entry of dictionary) {
		if (entry.regex.test(title)) {
			return entry.slug;
		}
	}

	return "Announcement"; // 啥都没匹配到的默认值
}

function detectWeb(doc, url) {
	// 检测是否为东方财富公告详情页
	if (url.includes('/notices/detail/')) {
		return 'report';
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	// 用于列表页多选，当前translator主要针对单个公告页
	var items = {};
	var found = false;
	// 如果需要支持列表页，可以在这里实现
	return found ? items : false;
}

async function doWeb(doc, url) {
	if (detectWeb(doc, url) == 'report') {
		await scrape(doc, url);
	}
}

async function scrape(doc, url) {
	var item = new Zotero.Item('report');
	var extraLines = [];
	
	// 从URL提取股票代码和公告ID
	var urlMatch = url.match(/\/notices\/detail\/(\d+)\/(AN\d+)\.html/);
	var stockCode = '';
	var noticeId = '';
	if (urlMatch) {
		stockCode = urlMatch[1];
		noticeId = urlMatch[2];
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
	
	// 提取标题 - 从页面 title 获取，提取下划线之前的内容
	// 示例: "贵州茅台:贵州茅台2025年第一季度报告 _ 贵州茅台(600519) _ 公告正文"
	var pageTitle = doc.title || '';
	var title = pageTitle.split('-')[0].trim().split('_')[0].trim();
	var company = pageTitle.split('-')[0].trim().split('_')[1].trim(); //腾讯控股(00700) 
	var companyName = company.split('(')[0].trim();

	if(title.includes(':')==false && title.includes('：')==false) {
		title = companyName + ':' + title;
	}
	
	// 如果提取失败，使用默认标题
	if (!title) {
		title = '公告 ' + noticeId;
	}
	
	item.title = title;

	// 从标题提取公司名作为机构
	var companyMatch = item.title.match(/^(.+?)[:：]/);
	if (companyMatch) {
		item.institution = companyMatch[1].trim();
	}
	
	// 添加股票代码作为额外信息
	if (stockCode) {
		extraLines.push('Ticker: ' + stockCode);
	}

	// 提取日期 - 从公告ID提取 (格式: AN202504291664502895)
	var dateMatch = noticeId.match(/AN(\d{4})(\d{2})(\d{2})/);
	if (dateMatch) {
		item.date = dateMatch[1] + '-' + dateMatch[2] + '-' + dateMatch[3];
	}

	let semanticSlug = getFinancialSlug(item.title);
	var dateStr = dateMatch[1] + dateMatch[2] + dateMatch[3];
	extraLines.unshift('Citation Key: ' + stockCode + '-' + semanticSlug + '-' + dateStr);

	if (extraLines.length) {
		item.extra = extraLines.join('\n');
	}
	
	// 查找PDF链接
	var pdfLink = doc.querySelector('a[href*="pdf.dfcfw.com"]');
	if (pdfLink) {
		item.attachments.push({
			url: pdfLink.href,
			title: 'Full Text PDF',
			mimeType: 'application/pdf'
		});
	}
	
	// 添加原始网页作为附件
	item.attachments.push({
		title: 'Snapshot',
		document: doc
	});
	
	// 设置来源URL
	item.url = url;
	
	// 设置报告类型
	item.reportType = '上市公司公告';
	
	item.complete();
}

/** BEGIN TEST CASES **/
var testCases = [
	{
		"type": "web",
		"url": "https://data.eastmoney.com/notices/detail/600519/AN202504291664502895.html",
		"items": [
			{
				"itemType": "report",
				"title": "贵州茅台:贵州茅台2025年第一季度报告",
				"creators": [],
				"date": "2025-04-29",
				"extra": "Citation Key: 600519.SS-Q1Report-20250429\nTicker: 600519.SS",
				"institution": "贵州茅台",
				"libraryCatalog": "EastMoney Notices",
				"reportType": "上市公司公告",
				"shortTitle": "贵州茅台",
				"url": "https://data.eastmoney.com/notices/detail/600519/AN202504291664502895.html",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
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
	},
	{
		"type": "web",
		"url": "https://data.eastmoney.com/notices/detail/00700/AN202511131780580890.html",
		"items": [
			{
				"itemType": "report",
				"title": "腾讯控股:截至二零二五年九月三十日止三个月及九个月业绩公布",
				"creators": [],
				"date": "2025-11-13",
				"extra": "Citation Key: 0700.HK-Q3Report-20251113\nTicker: 0700.HK",
				"institution": "腾讯控股",
				"libraryCatalog": "EastMoney Notices",
				"reportType": "上市公司公告",
				"shortTitle": "腾讯控股",
				"url": "https://data.eastmoney.com/notices/detail/00700/AN202511131780580890.html",
				"attachments": [
					{
						"title": "Full Text PDF",
						"mimeType": "application/pdf"
					},
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
