/**
 * XXXClub RSS Full Content Script Pro (Precision Version)
 */

const request_limit = 5; 
const cache_key = "xxxclub_rss_v2";
let body = $response.body;

async function fetchFullContent() {
    let items = body.match(/<item>[\s\S]*?<\/item>/g) || [];
    let count = Math.min(items.length, request_limit);
    let cache = JSON.parse($prefs.valueForKey(cache_key) || "{}");

    for (let i = 0; i < count; i++) {
        let item = items[i];
        let titleMatch = item.match(/<title>(.*?)<\/title>/);
        if (!titleMatch) continue;
        
        let rawTitle = titleMatch[1];
        // 搜索词优化：只保留前 4 个单词，确保搜索成功率
        let searchTitle = rawTitle
            .replace(/1080p|720p|MP4|HEVC|x264|x265|\[.*?\]|\d{2}\s\d{2}\s\d{4}/gi, '')
            .split(/\s+/).slice(0, 4).join(' ').trim();

        if (cache[rawTitle]) {
            body = body.replace(item, cache[rawTitle]);
            continue;
        }

        try {
            // 搜索请求
            let searchRes = await httpGet(`https://xxxclub.to/torrents/search?q=${encodeURIComponent(searchTitle)}`);
            // 匹配详情页链接
            let detailPathMatch = searchRes.match(/\/torrents\/details\/\d+/);
            
            if (detailPathMatch) {
                let detailRes = await httpGet(`https://xxxclub.to${detailPathMatch[0]}`);
                
                // 1. 提取大封面
                let coverMatch = detailRes.match(/class="detailsimg"[\s\S]*?src="([^"]+)"/);
                let coverHtml = coverMatch ? `<img src="${coverMatch[1]}" /><br/><hr/>` : "";
                
                // 2. 提取描述区域 (Cast + Synopsis)
                let descMatch = detailRes.match(/class="description"[\s\S]*?>([\s\S]*?)<\/div>/);
                let descHtml = descMatch ? descMatch[1].trim() : "No details available.";
                
                // 3. 处理描述中的缩略图为大图 (如有)
                descHtml = descHtml.replace(/imgtraffic\.com\/1s\//g, "imgtraffic.com/1/");

                let fullContent = `<![CDATA[${coverHtml}${descHtml}]]>`;
                let newItem = item.replace(/<description\/>|<description>.*?<\/description>/, `<description>${fullContent}</description>`);
                
                cache[rawTitle] = newItem;
                body = body.replace(item, newItem);
            }
        } catch (e) {
            console.log(`[XXXClub] Failed: ${searchTitle}`);
        }
    }

    $prefs.setValueForKey(JSON.stringify(cache), cache_key);
    $done({ body });
}

function httpGet(url) {
    return new Promise((resolve) => {
        $httpClient.get({ 
            url, 
            headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" } 
        }, (err, resp, data) => resolve(data || ""));
    });
}

fetchFullContent();