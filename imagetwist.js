/**
 * ImageTwist Host-Centric Resolver (重构版)
 * 目标：不依赖论坛，直接在图床端解决：1.高清跳转 2.查看页解析 3.防盗链
 */

const isRequest = typeof $request !== "undefined";
const url = $request ? $request.url : "";

if (isRequest) {
    // 1. 缩略图穿透逻辑 (th -> i)
    // 匹配: imgN.imagetwist.com/th/FOLDER/ID.jpg
    if (url.includes('/th/')) {
        let newUrl = url.replace('/th/', '/i/');
        $done({ response: { status: 302, headers: { Location: newUrl } } });
    }

    // 2. 查看页深度解析逻辑 (解决预览大图后缀/文件名报错问题)
    // 匹配: imagetwist.com/ID/Filename.ext
    else if (url.match(/https?:\/\/(?:www\.)?imagetwist\.com\/[a-z0-9]+\/[^/]+$/)) {
        // 在后台静默抓取页面，寻找 id="main-image" 的真实地址
        $httpClient.get(url, (error, response, data) => {
            if (!error && data) {
                // 提取真实原图地址 (包含正确的后缀和文件名)
                const imgMatch = data.match(/<img[^>]+id="main-image"[^>]+src="([^"]+)"/);
                if (imgMatch && imgMatch[1]) {
                    console.log("[ImageTwist] 深度解析成功: " + imgMatch[1]);
                    $done({ response: { status: 302, headers: { Location: imgMatch[1] } } });
                    return;
                }
            }
            $done({}); // 抓取失败则保持现状
        });
    }

    // 3. 全局防盗链注入 (所有原图服务器)
    else if (url.includes('/i/')) {
        let headers = $request.headers;
        headers['Referer'] = 'https://imagetwist.com/';
        $done({ headers });
    }

    else {
        $done({});
    }
} else {
    $done({});
}