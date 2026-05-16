/**
 * Quantumult X 脚本: ImageVenue 图床穿透
 * 
 * 逻辑: 
 * 1. 识别 cdn-thumbs.imagevenue.com 缩略图
 * 2. 转换为 cdn-images.imagevenue.com 原图地址并去除 _t 后缀
 * 3. 强制注入 Referer: https://www.imagevenue.com/ 绕过防盗链
 */

let url = $request.url;
let headers = $request.headers;

// 检查是否为 ImageVenue 缩略图
if (url.includes("cdn-thumbs.imagevenue.com") && url.includes("_t.")) {
    
    // 1. 构造原图 URL (cdn-thumbs -> cdn-images, 去除 _t)
    let newUrl = url.replace("cdn-thumbs", "cdn-images").replace("_t.", ".");
    
    // 2. 伪造 Referer 绕过防盗链
    headers['Referer'] = 'https://www.imagevenue.com/';
    
    // 3. 伪造 User-Agent (模拟真实浏览器)
    headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36';

    console.log("[ImageVenue] 穿透成功: " + newUrl);
    
    $done({
        url: newUrl,
        headers: headers
    });
} else {
    $done({});
}