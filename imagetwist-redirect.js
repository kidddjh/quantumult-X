// imagetwist-all-in-one.js
// 合并脚本：穿透 + 回退

// 处理请求：/th/ → /i/
if ($request && $request.url) {
  const url = $request.url;
  const match = url.match(/img(\d+)\.imagetwist\.com\/th\/(\d+)\/(.+)/);
  
  if (match) {
    const imgNum = match[1];
    const albumId = match[2];
    const filename = match[3];
    const nameWithoutExt = filename.replace(/\.jpe?g$/i, '');
    const redirectUrl = `https://img${imgNum}.imagetwist.com/i/${albumId}/${nameWithoutExt}.jpg`;
    $done({ redirect: redirectUrl });
    return;
  }
}

// 处理响应：占位图回退
if ($response && $response.headers) {
  const cl = parseInt($response.headers['Content-Length'] || '0');
  
  if (cl === 8183) {
    const m = $request.url.match(/img(\d+)\.imagetwist\.com\/i\/(\d+)\/(.+)/);
    if (m) {
      const imgNum = m[1];
      const albumId = m[2];
      const filename = m[3];
      const nameWithoutExt = filename.replace(/\.jpe?g$/i, '');
      const newExt = filename.endsWith('.jpg') ? '.jpeg' : '.jpg';
      const redirectUrl = `https://img${imgNum}.imagetwist.com/i/${albumId}/${nameWithoutExt}${newExt}`;
      $done({ redirect: redirectUrl });
      return;
    }
  }
}

$done({});
