/**
 * Quantumult X 脚本: ImageVenue 图床穿透
 *
 * 支持:
 * imgN.imagevenue.com/locXXX/th_baseId_尺寸码lo.扩展名 → 全图
 * 例: img7.imagevenue.com/loc537/th_657276930_..._537lo.jpg
 *     img40.imagevenue.com/loc335/th_865728057_..._thumbs_..._123_335lo.jpg
 *
 * 目标: th_baseId_尺寸码hi.扩展名 (lo→hi, 尝试常见扩展名)
 */

let url = $request.url;
let headers = $request.headers;

// 匹配 imgN.imagevenue.com 缩略图: th_ + baseId + _数字lo.扩展名
// 非贪婪 (.+?) 避免 baseId 内的下划线被过度消费
let match = url.match(/^(https?:\/\/img\d+\.imagevenue\.com\/loc\d+\/th_.+?)_(\d+)lo\.(jpg|png|jpeg)$/i);

if (match) {
    let base = match[1];    // https://imgN.imagevenue.com/locXXX/th_baseId_尺寸码
    let sizeCode = match[2]; // 537 / 335 等
    let ext = match[3].toLowerCase(); // jpg/png/jpeg

    // 构造全图: lo → hi, 扩展名尝试 jpg → jpeg → png → gif
    const exts = ['jpg', 'jpeg', 'png', 'gif'];
    let hiExt = exts.includes(ext) ? ext : 'jpg';
    let newUrl = base + '_hi.' + hiExt;

    headers['Referer'] = 'https://www.imagevenue.com/';
    headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    console.log("[ImageVenue] imgN 穿透: " + newUrl);
    $done({ url: newUrl, headers: headers });
}
// cdn-thumbs 缩略图穿透
else if (url.includes("cdn-thumbs.imagevenue.com") && url.includes("_t.")) {
    let newUrl = url.replace("cdn-thumbs", "cdn-images").replace("_t.", ".");
    headers['Referer'] = 'https://www.imagevenue.com/';
    headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    console.log("[ImageVenue] cdn-thumbs 穿透: " + newUrl);
    $done({ url: newUrl, headers: headers });
}
else {
    $done({});
}
