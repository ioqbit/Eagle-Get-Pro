// ==UserScript==
// @name         Eagle Get Weibo
// @namespace    https://github.com/ioqbit/Eagle-Get-Pro
// @version      2024-12-10-15-27
// @description  Eagle 下载微博图片时，设置微博发布时间为图片标题，并将微博内容增加到图片注释
// @author       ioqbit
// @match        https://weibo.com/*
// @icon         https://icons.duckduckgo.com/ip2/weibo.com.ico
// @updateURL    https://raw.githubusercontent.com/ioqbit/Eagle-Get-Pro/refs/heads/main/Eagle-Get-Weibo.js
// @downloadURL  https://raw.githubusercontent.com/ioqbit/Eagle-Get-Pro/refs/heads/main/Eagle-Get-Weibo.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 获取微博发布时间
    function getWeiboTime() {
        const timeLink = document.querySelector('a.head-info_time_6sFQg');
        const timeText = timeLink
            ? timeLink.textContent.trim()
                .replace(/:/g, '·')   // 替换时间的冒号为·
                .replace(/\s+/g, ' ')  // 标准化空白字符
            : '微博图片'; // 默认值
        return timeText;
    }

    // 获取微博内容，并将 <br> 标签替换为换行符
    function getWeiboText() {
        const weiboTextElement = document.querySelector('.detail_wbtext_4CRf9');
        let annotationText = weiboTextElement ? weiboTextElement.innerHTML.trim() : '微博内容';

        // 将 <br> 标签替换为换行符
        annotationText = annotationText.replace(/<br\s*\/?>/g, '\r\n');

        return annotationText;
    }

    // 添加Eagle下载属性
    function addEagleAttributes() {
        const images = document.querySelectorAll('img[src*="sinaimg.cn"]');
        const timeText = getWeiboTime();  // 获取发布时间
        const annotationText = getWeiboText();  // 获取微博内容

        // 遍历并添加自定义属性到图片元素
        images.forEach(img => {
            if (img.src.includes('sinaimg.cn')) {
                const extension = img.src.split('.').pop().split('?')[0];  // 获取文件扩展名
                const fileName = `${timeText}.${extension}`;

                img.setAttribute('eagle-title', timeText);
                img.setAttribute('eagle-annotation', annotationText);
                img.setAttribute('eagle-link', window.location.href);
                img.setAttribute('eagle-tags', '微博');
                img.setAttribute('download', fileName); // 修正文件名
            }
        });

        // 如果是直接图片页面
        if (window.location.href.includes('sinaimg.cn')) {
            const extension = window.location.href.split('.').pop().split('?')[0]; // 获取扩展名
            const fileName = `${timeText}.${extension}`;
            document.body.innerHTML = `
                <img src="${window.location.href}"
                     eagle-title="${timeText}"
                     eagle-annotation="${annotationText}"
                     eagle-link="${window.location.href}"
                     eagle-tags="微博"
                     download="${fileName}">
            `;
        }
    }

    // 初始化
    function init() {
        addEagleAttributes();
        // 监听动态内容变化
        const observer = new MutationObserver(addEagleAttributes);
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 页面加载后执行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
