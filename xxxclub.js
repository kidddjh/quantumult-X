/**
 * XXXClub RSS Full Content - Precision Hash Search Version
 * 逻辑：利用磁力链接中的 btih (Hash) 进行 100% 精准匹配抓取
 */

const request_limit = 5; 
const cache_key = "xxxclub_hash_v1";

if ($request.url.includes('.xml')) {
    console.log("[XXXClub] 检测到 RSS 请求，开始利用 Hash 进行精准改写...");
    fetchFullContent();
} else {
    $done({});
}

async function fetchFullContent() {
    let body = $response.body;
    if (!body) return $done({});

    let items = body.match(/<item>[\s\S]*?<\/item>/g) || [];
    let count = Math.min(items.length, request_limit);
    let cache = JSON.parse($prefs.valueForKey(cache_key) || "{}");

    for (let i = 0; i < count; i++) {
        let item = items[i];
        let titleMatch = item.match(/<title>(.*?)<\/title>/);
        let linkMatch = item.match(/<link>(.*?)<\/link>/);
        
        if (!titleMatch || !linkMatch) continue;
        
        let rawTitle = titleMatch[1];
        let magnetLink = linkMatch[1];

        // 检查缓存
        if (cache[rawTitle]) {
            body = body.replace(item, cache[rawTitle]);
            continue;
        }

        // --- 核心逻辑：提取哈希值 ---
        // 磁力链接格式：magnet:?xt=urn:btih:HASH_VALUE&...
        let hashMatch = magnetLink.match(/btih:([a-fA-F0-9]{40})/);
        let query = "";
        
        if (hashMatch) {
            query = hashMatch[1]; // 使用 40 位哈希值进行精准搜索
            console.log(`[XXXClub] 提取到 Hash: ${query}`);
        } else {
            // 如果没找到 Hash，回退到标题清洗搜索
            query = rawTitle.replace(/\./g, ' ').replace(/1080p|720p|MP4|HEVC|x264|x265|\[.*?\]/gi, '').split(/\s+/).slice(0, 5).join(' ');
            console.log(`[XXXClub] 未提取到 Hash，回退到标题搜索: ${query}`);
        }

        try {
            // 利用 Hash 搜索通常能直接跳到详情页或显示唯一结果
            let searchRes = await httpGet(`https://xxxclub.to/torrents/search?q=${query}`);
            
            // 匹配详情页 ID
            let detailPathMatch = searchRes.match(/\/torrents\/details\/\d+/);
            if (detailPathMatch) {
                console.log(`[XXXClub] 匹配成功: ${detailPathMatch[0]}`);
                let detailRes = await httpGet(`https://xxxclub.to${detailPathMatch[0]}`);
                
                // 抓取正文描述
                let descMatch = detailRes.match(/class="description"[\s\S]*?>([\s\S]*?)<\/div>/);
                let content = descMatch ? descMatch[1].trim() : "Details missing on site.";

                // 注入 description 标签
                let fullDesc = `<description><![CDATA[${content}]]></description>`;
                let newItem;
                if (item.includes('<description')) {
                    newItem = item.replace(/<description\/>|<description>[\s\S]*?<\/description>/, fullDesc);
                } else {
                    newItem = item.replace('</item>', `${fullDesc}</item>`);
                }

                cache[rawTitle] = newItem;
                body = body.replace(item, newItem);
            }
        } catch (e) {
            console.log(`[XXXClub] 处理失败: ${rawTitle}`);
        }
    }

    $prefs.setValueForKey(JSON.stringify(cache), cache_key);
    $done({ body });
}

function httpGet(url) {
    return new Promise((resolve) => {
        $httpClient.get({ url, headers: { "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" } }, (err, resp, data) => resolve(data || ""));
    });
}