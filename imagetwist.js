/**
 * @fileoverview ImageTwist 家族 Referer & UA 伪造脚本
 * 用于解决 Quantumult X 穿透高清图时的 403 Forbidden 问题
 */

var modifiedHeaders = $request.headers;
const url = $request.url;

// 1. 智能判定并伪造 Referer
if (url.indexOf("imagetwist.com") !== -1) {
    modifiedHeaders['Referer'] = 'https://imagetwist.com/';
} else if (url.indexOf("imgflare.com") !== -1) {
    modifiedHeaders['Referer'] = 'https://imgflare.com/';
} else if (url.indexOf("imgfile.com") !== -1) {
    modifiedHeaders['Referer'] = 'https://imgfile.com/';
} else if (url.indexOf("imgdrive.net") !== -1) {
    modifiedHeaders['Referer'] = 'https://imgdrive.net/';
} else {
    modifiedHeaders['Referer'] = 'https://imagetwist.com/';
}

// 2. 伪造桌面端 Chrome User-Agent
modifiedHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

// 3. 移除可能暴露身份的 Header
delete modifiedHeaders['X-Forwarded-For'];

$done({headers : modifiedHeaders});
