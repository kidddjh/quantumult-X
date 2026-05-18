/**
 * Quantumult X 脚本: ImageBam 图床穿透
 *
 * 逻辑:
 * 1. 识别 thumbsN.imagebam.com 缩略图请求
 * 2. 提取图片 ID
 * 3. 构造原图 URL: https://www.imagebam.com/images/ID
 * 4. 注入必要的 Referer 和 User-Agent 绕过防盗链
 */

let url = $request.url;
let headers = $request.headers;

// 匹配 thumbsN.imagebam.com 缩略图格式
// 例: https://thumbs4.imagebam.com/31/7c/6a/ME1CT54J_t.jpg
if (url.includes("imagebam.com") && url.includes("_t.jpg")) {

    // 提取图片 ID (最后一个 / 和 _t.jpg 之间的部分)
    let match = url.match(/\/([a-zA-Z0-9]+)_t\.jpg$/);

    if (match) {
        let imageId = match[1];

        // 构造原图 URL
        let newUrl = `https://www.imagebam.com/images/${imageId}`;

        // 伪造 Referer (模拟从 ImageBam 页面访问)
        headers['Referer'] = 'https://www.imagebam.com/';

        // 伪造 User-Agent (模拟真实浏览器)
        headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36';

        // 移除可能导致问题的 Header
        delete headers['X-Requested-With'];

        console.log("[ImageBam] 穿透成功: " + newUrl);

        $done({
            url: newUrl,
            headers: headers
        });
    } else {
        $done({});
    }
} else {
    $done({});
}
