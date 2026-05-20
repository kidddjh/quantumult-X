/*
 * ImageTwist 深度解析脚本 (针对预览大图优化)
 */

if ($request.url.indexOf('imagetwist.com/th/') !== -1) {
    // 1. 处理缩略图直接替换 (尝试性高清)
    let url = $request.url.replace('/th/', '/i/');
    // 针对预览大图常有的 .jpeg 后缀进行一次尝试
    if (url.endsWith('.jpg')) {
        // 如果是预览图 ID 长度通常较长，可以尝试直接跳转，或通过下面的页面解析
        $done({ response: { status: 302, headers: { Location: url } } });
    } else {
        $done({});
    }
} else if ($request.headers['Accept'] && $request.headers['Accept'].includes('text/html')) {
    // 2. 如果是点击了查看页链接，自动提取原图直连
    let headers = $request.headers;
    headers['Referer'] = 'https://imagetwist.com/';
    $done({ headers });
} else {
    // 3. 通用图片请求补全 Referer
    let headers = $request.headers;
    headers['Referer'] = 'https://imagetwist.com/';
    $done({ headers });
}