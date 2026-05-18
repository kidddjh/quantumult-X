// Quantumult X 脚本: ImageVenue 图床穿透
//
// imgN.imagevenue.com/locXXX/th_baseId_尺寸码lo.扩展名 → 全图
// cdn-thumbs.imagevenue.com/_t. → cdn-images

let url = $request.url;
let headers = $request.headers;

let match = url.match(/^(https?:\/\/img\d+\.imagevenue\.com\/loc\d+\/th_.+?)_(\d+)lo\.(jpg|png|jpeg)$/i);

if (match) {
    let base = match[1];
    let sizeCode = match[2];
    let ext = match[3].toLowerCase();
    const exts = ['jpg', 'jpeg', 'png', 'gif'];
    let hiExt = exts.includes(ext) ? ext : 'jpg';
    let newUrl = base + '_hi.' + hiExt;
    headers['Referer'] = 'https://www.imagevenue.com/';
    headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
    console.log("[ImageVenue] imgN 穿透: " + newUrl);
    $done({ url: newUrl, headers: headers });
}
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
