// imagetwist-redirect.js
// 缩略图穿透：自动尝试 .jpg 和 .jpeg 后缀

const url = $request.url;
const match = url.match(/img(\d+)\.imagetwist\.com\/th\/(\d+)\/(.+)/);

if (match) {
  const imgNum = match[1];
  const albumId = match[2];
  const filename = match[3];
  const nameWithoutExt = filename.replace(/\.jpe?g$/i, '');
  
  // 先尝试 .jpg
  const tryJpg = `https://img${imgNum}.imagetwist.com/i/${albumId}/${nameWithoutExt}.jpg`;
  
  $done({ redirect: tryJpg });
} else {
  $done({});
}
