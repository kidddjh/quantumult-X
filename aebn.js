/**
 * @fileoverview Quantumult X Script for pic.aebn.net
 * 
 * 功能：
 * 1. 高清穿透：自动识别并去除图片 URL 中的尺寸缩放参数（如 ?s=180h），强制请求原始高清大图。
 * 2. 绕过防盗链：为图片请求自动注入合法的 Referer 头部，解决 403 Forbidden 裂图问题。
 * 
 * [rewrite_local]
 * ^https?://pic\.aebn\.net/ url script-request-header https://raw.githubusercontent.com/你的用户名/仓库名/main/aebn_img.js
 * 
 * [mitm]
 * hostname = pic.aebn.net
 */

let url = $request.url;
let headers = $request.headers;

// 1. 处理高清穿透：去掉 URL 中的查询参数（即去掉 s=180h 等缩放指令获取原图）
if (url.indexOf('?') !== -1) {
    url = url.split('?')[0];
}

// 2. 处理防盗链：强制注入官方 Referer
headers['Referer'] = 'https://m.aebn.net/';
headers['User-Agent'] = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

// 返回修改后的请求对象
$done({
    url: url,
    headers: headers
});
