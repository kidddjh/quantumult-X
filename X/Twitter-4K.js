/**
 * Quantumult X 脚本: Twitter/X 强制 4K 原图加载
 * 
 * 逻辑:
 * 1. 拦截 pbs.twimg.com 图片请求
 * 2. 强制添加 ?name=orig 参数 (最高质量)
 * 3. 移除所有限制参数，确保直接加载原图
 */

let url = $request.url;
let headers = $request.headers;

// 匹配 Twitter/X 图片 URL
if (url.includes("pbs.twimg.com/media")) {
    
    // 移除现有的 ?name= 参数，强制使用 orig
    let newUrl = url.replace(/\?name=\w+/, '?name=orig');
    
    // 如果没有 ?name= 参数，直接添加
    if (!newUrl.includes('?name=')) {
        newUrl = url + (url.includes('?') ? '&' : '?') + 'name=orig';
    }
    
    // 伪造 User-Agent (模拟桌面浏览器)
    headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    
    // 移除可能限制加载的 Header
    delete headers['X-Requested-With'];
    delete headers['Accept-Encoding'];
    
    console.log("[Twitter/X] 强制 4K 加载: " + newUrl);
    
    $done({
        url: newUrl,
        headers: headers
    });
} else {
    $done({});
}
