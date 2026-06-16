/**
 * 人人为我论坛 (2048 论坛) JS 反爬虫绕过脚本
 * 
 * 目标：https://0rsh.zskmqt.com/read.php?tid=24799181
 * 
 * 反爬原理分析：
 * 1. 服务器返回 JS 挑战页面，包含：
 *    - safeid (唯一标识 + 时间戳)
 *    - 加密字符串 str, str_0 ~ str_4
 *    - /safe/mainv2.js (Base64 解码 + Cookie 设置)
 *    - /safe/web.js (解密后渲染点击按钮，点击后设置 Cookie 并 reload)
 * 2. 浏览器执行 JS 后，设置 Cookie: _safe=<safeid>; Max-Age=86400; Path=/
 * 3. 携带 Cookie 重新请求即可获取真实内容
 *
 * 绕过原理：直接提取 safeid，设置 Cookie，即可跳过 JS 执行步骤
 */

// =============================================
// 方案一：Node.js 脚本 (推荐 - 无需浏览器环境)
// =============================================

const http = require('http');
const https = require('https');

const TARGET_URL = 'https://0rsh.zskmqt.com/read.php?tid=24799181';

/**
 * 通用 HTTP GET 请求 (支持 HTTPS + Cookie 处理)
 */
function httpGet(url, cookie = '') {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const mod = isHttps ? https : http;
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://0rsh.zskmqt.com/',
      }
    };
    
    // 处理 -k (忽略 SSL 证书错误)
    // Node.js 默认严格检查 SSL；对于过期证书可使用以下方式绕过
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    if (cookie) {
      options.headers['Cookie'] = cookie;
    }

    mod.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        body: data
      }));
    }).on('error', reject);
  });
}

/**
 * 从挑战页面提取 safeid
 */
function extractSafeId(html) {
  const match = html.match(/safeid='([^']+)'/);
  return match ? match[1] : null;
}

/**
 * 方案一执行步骤
 */
async function bypassSafe() {
  try {
    console.log('🔍 第1步: 获取挑战页面...');
    const challenge = await httpGet(TARGET_URL);
    
    const safeid = extractSafeId(challenge.body);
    if (!safeid) {
      throw new Error('未能提取 safeid，可能页面已变更');
    }
    console.log(`✅ 提取到 safeid: ${safeid}`);

    console.log('🔍 第2步: 携带 Cookie 获取真实内容...');
    const realPage = await httpGet(TARGET_URL, `_safe=${safeid}`);
    
    if (realPage.body.length > 5000) {
      console.log(`✅ 成功! 获取到真实页面 (${(realPage.body.length / 1024).toFixed(1)} KB)`);
      return realPage.body;
    } else {
      console.warn('⚠️ 返回内容较短，可能仍然是挑战页面，尝试重试...');
      // 某些情况下可能需要携带 Max-Age 参数
      const retry = await httpGet(TARGET_URL, `_safe=${safeid}; Max-Age=86400; Path=/`);
      if (retry.body.length > 5000) {
        console.log(`✅ 重试成功! (${(retry.body.length / 1024).toFixed(1)} KB)`);
        return retry.body;
      }
      throw new Error('获取真实页面失败');
    }
  } catch (err) {
    console.error('❌ 错误:', err.message);
    throw err;
  }
}

// 运行
// bypassSafe().then(html => {
//   // 处理页面内容...
//   console.log(html.substring(0, 500));
// }).catch(console.error);


// =============================================
// 方案二：Puppeteer / Playwright 浏览器自动化
// =============================================

/**
 * 如果网站升级了更复杂的 JS 验证 (如浏览器指纹检测)，
 * 可使用此方案，利用真实浏览器环境执行所有 JS。
 * 
 * 使用前需要安装: npm install puppeteer 或 npm install playwright
 */

async function bypassSafeWithBrowser() {
  // const puppeteer = require('puppeteer'); // 方案 A
  // const { chromium } = require('playwright'); // 方案 B
  
  // 以 playwright 为例:
  // const browser = await chromium.launch({ headless: false });
  // const page = await browser.newPage();
  // await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
  // 
  // 方式 1: 自动等待（页面可能自动验证）
  // await page.waitForSelector('#read_tpc', { timeout: 15000 });
  //
  // 方式 2: 手动点击（如果需要按钮点击触发验证）
  // const button = await page.waitForSelector('.enter-btn', { timeout: 5000 });
  // await button.click();
  // await page.waitForSelector('#read_tpc', { timeout: 10000 });
  //
  // const html = await page.content();
  // await browser.close();
  // return html;
  
  console.log('浏览器方案 - 请安装 puppeteer 或 playwright');
}


// =============================================
// 方案三：Tampermonkey / Greasemonkey 油猴脚本
// =============================================

/**
 * 用于浏览器内自动绕过挑战，在论坛内浏览时自动通过验证。
 * 原理：检测到 safeid 后立即设置 Cookie 并刷新页面。
 */

const TAMPERMONKEY_SCRIPT = `
// ==UserScript==
// @name         2048 论坛反爬自动绕过
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  自动检测并绕过 2048 论坛的 JS 挑战
// @author       You
// @match        https://0rsh.zskmqt.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    
    // 检测是否在挑战页面（包含 safeid 变量）
    const match = document.body.innerHTML.match(/safeid='([^']+)'/);
    if (match) {
        const safeid = match[1];
        // 设置 Cookie 并刷新
        document.cookie = "_safe=" + safeid + "; Max-Age=86400; Path=/";
        console.log('✅ 2048 绕过: 已设置 safe cookie:', safeid);
        location.reload();
    }
})();
`;


// =============================================
// 方案四：通用工具函数 - 可直接在浏览器控制台执行
// =============================================

const CONSOLE_SCRIPT = `
// 当你在浏览器中打开挑战页面时，在 F12 控制台执行以下代码：
// 自动提取 safeid -> 设置 Cookie -> 刷新页面

(function(){
    var match = document.body.innerHTML.match(/safeid='([^']+)'/);
    if (match) {
        document.cookie = "_safe=" + match[1] + "; Max-Age=86400; Path=/";
        console.log('✅ Cookie 已设置，即将刷新...');
        location.reload();
    } else {
        console.log('⚠️ 未检测到挑战, 可能已经通过了验证');
    }
})();
`;

// =============================================
// 方案五：Curl/Shell 脚本
// =============================================

const SHELL_SCRIPT = `
#!/bin/bash
# 2048 论坛反爬绕过 - Shell 版

URL="https://0rsh.zskmqt.com/read.php?tid=24799181"

# 第1步：获取挑战页面并提取 safeid
SAFEID=$(curl -s -k --noproxy "*" \\
  -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \\
  "$URL" 2>/dev/null | grep -o "safeid='[^']*'" | sed "s/safeid='//;s/'//")

echo "提取到 safeid: $SAFEID"

# 第2步：携带 Cookie 获取真实页面
curl -s -k --noproxy "*" \\
  -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \\
  -b "_safe=$SAFEID" \\
  -o real_page.html \\
  "$URL"

echo "下载完成! 文件大小: $(wc -c < real_page.html) bytes"
`;

// =============================================
// 导出
// =============================================
module.exports = {
  bypassSafe,
  bypassSafeWithBrowser,
  TAMPERMONKEY_SCRIPT,
  CONSOLE_SCRIPT,
  SHELL_SCRIPT
};


// =============================================
// 直接运行（如使用 node bypass_safe.js）
// =============================================
if (require.main === module) {
  console.log('🚀 开始绕过 2048 论坛反爬...\n');
  bypassSafe().then(html => {
    // 提取标题
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    if (titleMatch) {
      console.log(`\n📄 页面标题: ${titleMatch[1]}`);
    }
    
    // 提取磁链
    const magnetMatch = html.match(/magnet:\?xt=urn:btih:[a-zA-Z0-9]{40}/);
    if (magnetMatch) {
      console.log(`🔗 磁力链接: ${magnetMatch[0]}`);
    }
    
    // 输出内容到文件
    const fs = require('fs');
    const outputFile = '/tmp/2048_page.html';
    fs.writeFileSync(outputFile, html);
    console.log(`💾 页面已保存到: ${outputFile}`);
  }).catch(console.error);
}
