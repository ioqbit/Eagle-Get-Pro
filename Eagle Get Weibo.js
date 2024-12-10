// ==UserScript==
// @name         Eagle Get Weibo
// @namespace    http://tampermonkey.net/
// @version      2024-12-09-11
// @description  Eagle 下载微博图片时，设置微博发布时间为图片标题，并将微博内容增加到图片注释
// @author       ioqbit
// @match        https://weibo.com/*
// @icon         https://icons.duckduckgo.com/ip2/weibo.com.ico
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 日志函数
    function logMessage(type, message) {
        console[type](`[Eagle Get Weibo] ${message}`);
    }

    // 获取微博发布时间
    function getWeiboTime() {
        const timeLink = document.querySelector('a.head-info_time_6sFQg');
        if (!timeLink) {
            logMessage('warn', '微博发布时间未找到，使用默认值');
            return '未知时间';
        }
        return timeLink.textContent.trim()
            .replace(/:/g, '·')  // 替换时间的冒号为·
            .replace(/\s+/g, ' '); // 标准化空白字符
    }

    // 获取微博内容
    function getWeiboText() {
        const weiboTextElement = document.querySelector('[class*="detail_wbtext"]');
        if (!weiboTextElement) {
            logMessage('warn', '微博内容未找到，使用默认值');
            return '微博内容';
        }
        return weiboTextElement.textContent.trim();
    }

    // 添加Eagle下载属性
    function addEagleAttributes() {
        // 获取页面上的所有图片
        const images = document.querySelectorAll('img[src*="sinaimg.cn"]');
        const timeText = getWeiboTime();  // 获取发布时间
        const annotationText = getWeiboText();  // 获取微博内容

        // 遍历并添加自定义属性到图片元素
        images.forEach(img => {
            if (img.src.includes('sinaimg.cn') && !img.hasAttribute('eagle-title')) { // 避免重复设置属性
                const extension = img.src.split('.').pop().split('?')[0];  // 获取文件扩展名
                const fileName = `${timeText}.${extension}`;

                img.setAttribute('eagle-title', timeText);
                img.setAttribute('eagle-annotation', annotationText);
                img.setAttribute('eagle-link', window.location.href);
                img.setAttribute('eagle-tags', '微博');
                img.setAttribute('download', fileName);
            }
        });

        // 如果是直接图片页面
        if (window.location.href.includes('sinaimg.cn')) {
            const extension = window.location.href.split('.').pop().split('?')[0];  // 获取扩展名
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

    // 初始化观察者
    function initObserver() {
        const targetNode = document.querySelector('.Feed_body_3R0rO'); // 替换为微博正文的实际容器类名
        if (!targetNode) return;

        const observer = new MutationObserver(addEagleAttributes);
        observer.observe(targetNode, {
            childList: true,
            subtree: true
        });
    }

    // 初始化函数
    function init() {
        addEagleAttributes();  // 添加下载属性
        initObserver();  // 启动动态内容监控

        // 监听页面加载后的动态内容
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
