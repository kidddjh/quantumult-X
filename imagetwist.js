/*
 * ImageTwist All-in-One Resolver
 */
const url = $request.url;

if (url.includes('/th/')) {
    // 缩略图请求：直接尝试跳转到原图地址
    $done({ response: { status: 302, headers: { Location: url.replace('/th/', '/i/') } } });
} else if (url.match(/imagetwist\.com\/[a-z0-9]+\/[^/]+$/)) {
    // 查看页请求（解决预览图报错的核心）：后台解析 HTML 获取真实原图
    $httpClient.get(url, (error, response, data) => {
        if (!error && data) {
            const imgMatch = data.match(/<img[^>]+id="main-image"[^>]+src="([^"]+)"/);
            if (imgMatch && imgMatch[1]) {
                $done({ response: { status: 302, headers: { Location: imgMatch[1] } } });
                return;
            }
        }
        $done({});
    });
} else if (url.includes('/i/')) {
    // 原图请求：伪造 Referer 绕过防盗链
    $done({ headers: { ...$request.headers, 'Referer': 'https://imagetwist.com/' } });
} else {
    $done({});
}