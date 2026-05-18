/**
 * Quantumult X 脚本: ImageBam 图床穿透
 *
 * 支持两种格式:
 * 1. thumbsN.imagebam.com/.../ID_t.jpg → www.imagebam.com/images/ID
 * 2. thumbnailsN.imagebam.com/数字/ID.jpg → www.imagebam.com/images/ID
 */

let url = $request.url;
let headers = $request.headers;

// 格式 1: thumbsN.imagebam.com + _t.jpg
if (url.includes("imagebam.com") && url.includes("_t.jpg")) {
    let match = url.match(/\/([a-zA-Z0-9]+)_t\.jpg$/);
    if (match) {
        let imageId = match[1];
        let newUrl = `https://www.imagebam.com/images/${imageId}`;
        headers['Referer'] = 'https://www.imagebam.com/';
        headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36';
        delete headers['X-Requested-With'];
        console.log("[ImageBam] _t.jpg 穿透: " + newUrl);
        $done({ url: newUrl, headers: headers });
    } else {
        $done({});
    }
}
// 格式 2: thumbnailsN.imagebam.com/数字/ID.jpg (无 _t 后缀)
else if (/thumbnails\d+\.imagebam\.com\/\d+\/[a-zA-Z0-9]+\.jpg$/i.test(url)) {
    let match = url.match(/\/(\d+)\/([a-zA-Z0-9]+)\.jpg$/i);
    if (match) {
        let imageId = match[2];
        let newUrl = `https://www.imagebam.com/images/${imageId}`;
        headers['Referer'] = 'https://www.imagebam.com/';
        headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36';
        delete headers['X-Requested-With'];
        console.log("[ImageBam] thumbnails 穿透: " + newUrl);
        $done({ url: newUrl, headers: headers });
    } else {
        $done({});
    }
}
else {
    $done({});
}
