/**
 * Quantumult X 脚本: ImageVenue 图床穿透 (增强版)
 * 
 * 支持三种格式:
 * 1. cdn-thumbs.imagevenue.com 缩略图 → cdn-images 原图
 * 2. www.imagevenue.com/view/o? 查询页面 → cdno-data 原图
 * 3. imgN.imagevenue.com 子域名 → 去掉 _t 后缀
 * 
 * 逻辑: 强制注入 Referer: https://www.imagevenue.com/ 绕过防盗链
 */

let url = $request.url;
let headers = $request.headers;

// 格式 1: cdn-thumbs 缩略图穿透
if (url.includes("cdn-thumbs.imagevenue.com") && url.includes("_t.")) {
    
    // 构造原图 URL (cdn-thumbs -> cdn-images, 去除 _t)
    let newUrl = url.replace("cdn-thumbs", "cdn-images").replace("_t.", ".");
    
    // 伪造 Referer 绕过防盗链
    headers['Referer'] = 'https://www.imagevenue.com/';
    headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

    console.log("[ImageVenue] cdn-thumbs 穿透: " + newUrl);
    
    $done({
        url: newUrl,
        headers: headers
    });
}
// 格式 2: www.imagevenue.com/view/o? 查询页面穿透
else if (url.includes("www.imagevenue.com/view/o") && url.includes("?")) {
    
    // 提取查询参数
    let urlObj = new URL(url);
    let h = urlObj.searchParams.get('h');  // 服务器编号 (如 img146)
    let i = urlObj.searchParams.get('i');  // 图片 ID
    
    if (h && i) {
        // 构造 cdno-data 原图 URL
        // 格式: https://cdno-data.imagevenue.com/html.{h}/upload{数字}/loc{数字}/{i}
        // 使用通用路径 (upload2328/loc460 是常见值)
        let newUrl = `https://cdno-data.imagevenue.com/html.${h}/upload2328/loc460/${i}`;
        
        // 伪造 Referer 和 User-Agent
        headers['Referer'] = 'https://www.imagevenue.com/';
        headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
        
        console.log("[ImageVenue] view/o 穿透: " + newUrl);
        
        $done({
            url: newUrl,
            headers: headers
        });
    } else {
        $done({});
    }
}
// 格式 3: imgN.imagevenue.com 子域名穿透
else if (url.includes("imagevenue.com") && url.includes("_t.jpg")) {
    
    // 去掉 _t 后缀
    let newUrl = url.replace("_t.jpg", ".jpg");
    
    headers['Referer'] = 'https://www.imagevenue.com/';
    headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    
    console.log("[ImageVenue] imgN 穿透: " + newUrl);
    
    $done({
        url: newUrl,
        headers: headers
    });
}
else {
    $done({});
}