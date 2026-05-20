/**
 * ImageTwist All-in-One 终极穿透脚本
 * 功能：1. 自动高清(th->i) 2. 修复预览大图路径(jpeg/文件名) 3. 绕过防盗链
 */

const isRequest = typeof $request !== "undefined";
const isResponse = typeof $response !== "undefined";

// --- 1. 处理请求 (Header 修改 & 自动高清跳转) ---
if (isRequest) {
    let url = $request.url;
    let headers = $request.headers;

    // A. 自动高清跳转 (th -> i)
    if (url.includes('/th/')) {
        let newUrl = url.replace('/th/', '/i/');
        $done({ response: { status: 302, headers: { Location: newUrl } } });
    } 
    // B. 防盗链绕过 (为所有原图请求注入 Referer)
    else if (url.includes('/i/')) {
        headers['Referer'] = 'https://imagetwist.com/';
        $done({ headers });
    } 
    else {
        $done({});
    }
}

// --- 2. 处理响应 (修复论坛页面中的预览大图链接) ---
if (isResponse) {
    let body = $response.body;
    if (body) {
        // 核心：扫描页面，把那些会报错的 ID.jpg 预览图地址，修正为带正确文件名和后缀的直连地址
        const regex = /<a href="(https?:\/\/imagetwist\.com\/([a-z0-9]+)\/([^"]+?)\.(jpe?g|png|gif))"[^>]*>\s*<img src="(https?:\/\/((?:img|s)\d+)\.imagetwist\.com)\/th\/(\d+)\/([a-z0-9]+)\.jpg"/gi;
        
        body = body.replace(regex, (match, pageUrl, id, filename, ext, baseUrl, server, folder, imgId) => {
            if (id === imgId) {
                // 拼接真实直连地址，解决 .jpeg 或文件名导致的 404 报错
                const directUrl = `${baseUrl}/i/${folder}/${id}.${ext}/${filename}.${ext}`;
                return `<a href="${directUrl}"><img src="${directUrl}" style="max-width:100%;"`;
            }
            return match;
        });
        $done({ body });
    } else {
        $done({});
    }
}