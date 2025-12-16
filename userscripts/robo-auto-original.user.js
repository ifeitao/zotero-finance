// ==UserScript==
// @name         Robo 研报自动显示原文
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  访问 Robo 研报时自动切换到"原文" tab，方便 Zotero 抓取 PDF
// @author       Zotero Finance
// @match        https://robo.datayes.com/v2/details/report/*
// @icon         https://robo.datayes.com/favicon.ico
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function () {
  "use strict";

  console.log("[Robo Auto] Script loaded");

  // 如果已经在 original tab，跳过
  if (window.location.href.includes("tab=original")) {
    console.log("[Robo Auto] Already on original tab");
    return;
  }

  // 查找并点击"原文" tab
  function clickOriginalTab() {
    // 方法 1：查找文本为"原文"的 tab 元素
    const allElements = document.querySelectorAll("*");
    for (let elem of allElements) {
      const text = (elem.textContent || "").trim();
      // 精确匹配"原文"，避免误点
      if (text === "原文" || text === "原文PDF") {
        const style = window.getComputedStyle(elem);
        if (
          style.cursor === "pointer" ||
          elem.tagName === "BUTTON" ||
          elem.tagName === "A"
        ) {
          console.log('[Robo Auto] Found and clicking "原文" tab:', elem);
          elem.click();
          return true;
        }
      }
    }
    return false;
  }

  // 尝试点击，失败则重试
  let attempts = 0;
  const maxAttempts = 10;

  function tryClick() {
    if (clickOriginalTab()) {
      console.log('[Robo Auto] ✅ Successfully clicked "原文" tab');
    } else if (attempts < maxAttempts) {
      attempts++;
      console.log("[Robo Auto] Retry", attempts, "/", maxAttempts);
      setTimeout(tryClick, 500);
    } else {
      console.warn(
        '[Robo Auto] ⚠️ Could not find "原文" tab after',
        maxAttempts,
        "attempts",
      );
      console.warn(
        '[Robo Auto] You may need to manually click the "原文" or "打开原文PDF" button',
      );
    }
  }

  // 页面加载后开始尝试
  setTimeout(tryClick, 1000);
})();
