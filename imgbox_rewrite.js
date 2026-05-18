// Quantumult X Script: ImgBox Image Host Rewrite
// imgbox.com _th. → 去掉 _th 获取直链

const url = $request.url;

if (/imgbox\.com/.test(url) && /_th\.\w+$/.test(url)) {
    const newUrl = url.replace(/_th(\.\w+)$/, '$1');
    $done({ url: newUrl });
} else {
    $done({});
}
