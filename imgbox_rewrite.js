/*
 * Quantumult X Script: ImgBox Image Host Rewrite
 * Removes _th from URL to get direct link
 *
 * Usage:
 * 1. Add quantumultx_imagehost_rewrite.conf to Rewrite
 * 2. Save this file to: iCloud/Quantumult X/Scripts/imgbox_rewrite.js
 * 3. Enable in Quantumult X → Scripts
 */

const url = $request.url;

// ImgBox thumbnail:  https://X.images.imgbox.com/XX/XX/XXXX_th.jpg
// Direct link:       https://X.images.imgbox.com/XX/XX/XXXX.jpg

if (/imgbox\.com/.test(url) && /_th\.\w+$/.test(url)) {
    const newUrl = url.replace(/_th(\.\w+)$/, '$1');
    $done({ url: newUrl });
} else {
    $done({});
}
