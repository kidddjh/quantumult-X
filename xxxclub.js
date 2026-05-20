/**
 * XXXClub All-in-One Script
 * 包含：RSS 全文改写 + 图片防盗链修复
 */

const request_limit = 6;
const cache_key = "xxxclub_full_v3";

// --- 逻辑分流 ---
if ($request.url.indexOf('.xml') !== -1) {
    // 情况 A：处理 RSS XML 响应内容
    fetchFullContent();
} else {
    // 情况 B：处理图片请求头（防盗链）
    fixReferer();
}

// 1. RSS 改写逻辑 (script-response-body)
async function fetchFullContent() {
    let body = $response.body;
    let items = body.match(/<item>[\s\S]*?<\/item>/g) || [];
    let count = Math.min(items.length, request_limit);
    let cache = JSON.parse($prefs.valueForKey(cache_key) || "{}");

    for (let i = 0; i < count; i++) {
        let item = items[i];
        let titleMatch = item.match(/<title>(.*?)<\/title>/);
        if (!titleMatch) continue;
        
        let rawTitle = titleMatch[1];
        if (cache[rawTitle]) {
            body = body.replace(item, cache[rawTitle]);
            continue;
        }

        let cleanTitle = rawTitle.replace(/\./g, ' ').replace(/1080p|720p|MP4|HEVC|x264|x265|\[.*?\]/gi, '').trim();
        let searchTitle = cleanTitle.split(/\s+/).slice(0, 5).join(' ');

        try {
            let searchRes = await httpGet(`https://xxxclub.to/torrents/search?q=${encodeURIComponent(searchTitle)}`);
            let detailPathMatch = searchRes.match(/\/torrents\/details\/\d+/);
            if (detailPathMatch) {
                let detailRes = await httpGet(`https://xxxclub.to${detailPathMatch[0]}`);
                let coverMatch = detailRes.match(/class="detailsimg"[\s\S]*?src="([^"]+)"/);
                let coverHtml = coverMatch ? `<img src="${coverMatch[1]}" style="width:100%;" /><br/><hr/>` : "";
                let descMatch = detailRes.match(/class="description"[\s\S]*?>([\s\S]*?)<\/div>/);
                let descContent = descMatch ? descMatch[1].trim().replace(/imgtraffic\.com\/1s\//g, "imgtraffic.com/1/") : "";

                let newItem = item.replace(/<description\/>|<description>.*?<\/description>/, `<description><![CDATA[${coverHtml}${descContent}]]></description>`);
                cache[rawTitle] = newItem;
                body = body.replace(item, newItem);
            }
        } catch (e) {}
    }
    $prefs.setValueForKey(JSON.stringify(cache), cache_key);
    $done({ body });
}

// 2. 防盗链修复逻辑 (script-request-header)
function fixReferer() {
    let headers = $request.headers;
    headers['Referer'] = 'https://xxxclub.to/';
    $done({ headers });
}

// 辅助 GET
function httpGet(url) {
    return new Promise((resolve) => {
        $httpClient.get({ url, headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" } }, (err, resp, data) => resolve(data || ""));
    });
}