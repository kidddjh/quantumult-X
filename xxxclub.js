/**
 * XXXClub RSS Full Content Script - Ultimate Version
 * 
 * 功能：
 * 1. 自动清洗带点标题，通过搜索定位详情页。
 * 2. 抓取高清封面、演员表（Cast）和剧情（Synopsis）。
 * 3. 自动将 ImgTraffic 缩略图转化为高清图。
 * 4. 内置本地缓存，防止重复请求，提升加载速度。
 * 
 * 配置建议：
 * [rewrite_local]
 * ^https?:\/\/xxxclub\.to\/feed\/.*\.xml url script-response-body https://raw.githubusercontent.com/kidddjh/quantumult-X/refs/heads/main/xxxclub.js
 * 
 * [mitm]
 * hostname = %APPEND% xxxclub.to
 */

const request_limit = 6; // 每次刷新处理的新条目数
const cache_key = "xxxclub_full_content_v3";
let body = $response.body;

async function fetchFullContent() {
    let items = body.match(/<item>[\s\S]*?<\/item>/g) || [];
    let count = Math.min(items.length, request_limit);
    
    // 加载缓存
    let cache = {};
    try {
        cache = JSON.parse($prefs.valueForKey(cache_key) || "{}");
    } catch (e) {
        cache = {};
    }

    console.log(`[XXXClub] 开始处理 RSS, 共有 ${items.length} 条, 准备改写前 ${count} 条`);

    for (let i = 0; i < count; i++) {
        let item = items[i];
        let titleMatch = item.match(/<title>(.*?)<\/title>/);
        if (!titleMatch) continue;
        
        let rawTitle = titleMatch[1];

        // 1. 检查缓存，如果改写过则直接替换
        if (cache[rawTitle]) {
            body = body.replace(item, cache[rawTitle]);
            continue;
        }

        // 2. 清洗标题：将点号换成空格，去掉年份和规格后缀
        let cleanTitle = rawTitle
            .replace(/\./g, ' ') // 关键：把 Tushy.26.05 变成 Tushy 26 05
            .replace(/\d{2}\s\d{2}\s\d{2,4}/g, '') // 去掉日期
            .replace(/1080p|720p|MP4|HEVC|x264|x265|\[.*?\]/gi, '') // 去掉规格
            .replace(/\b(P2P|VSEX|XC)\b/gi, '') // 去掉发布组
            .trim();

        // 取前 5 个单词作为搜索词，增加命中率
        let searchTitle = cleanTitle.split(/\s+/).slice(0, 5).join(' ');

        try {
            // 3. 执行搜索获取详情页链接
            let searchUrl = `https://xxxclub.to/torrents/search?q=${encodeURIComponent(searchTitle)}`;
            let searchRes = await httpGet(searchUrl);
            let detailPathMatch = searchRes.match(/\/torrents\/details\/\d+/);
            
            if (detailPathMatch) {
                let detailUrl = `https://xxxclub.to${detailPathMatch[0]}`;
                let detailRes = await httpGet(detailUrl);
                
                // 4. 提取详情内容
                // A. 封面图
                let coverMatch = detailRes.match(/class="detailsimg"[\s\S]*?src="([^"]+)"/);
                let coverHtml = coverMatch ? `<img src="${coverMatch[1]}" style="width:100%; max-width:400px;" /><br/><hr/>` : "";
                
                // B. 描述区域 (演员 + 剧情)
                let descMatch = detailRes.match(/class="description"[\s\S]*?>([\s\S]*?)<\/div>/);
                let descContent = descMatch ? descMatch[1].trim() : "No details found.";
                
                // C. 优化缩略图 (ImgTraffic 1s -> 1)
                descContent = descContent.replace(/imgtraffic\.com\/1s\//g, "imgtraffic.com/1/");

                // 5. 组合并改写 XML
                let fullCdata = `<![CDATA[${coverHtml}${descContent}]]>`;
                let newItem = item.replace(/<description\/>|<description>.*?<\/description>/, `<description>${fullCdata}</description>`);
                
                // 写入缓存并执行替换
                cache[rawTitle] = newItem;
                body = body.replace(item, newItem);
                console.log(`[XXXClub] 成功改写: ${searchTitle}`);
            }
        } catch (e) {
            console.log(`[XXXClub] 改写失败: ${rawTitle}, 错误: ${e}`);
        }
    }

    // 6. 维护缓存容量（保留最近 100 条）
    let keys = Object.keys(cache);
    if (keys.length > 100) {
        let newCache = {};
        keys.slice(-100).forEach(k => newCache[k] = cache[k]);
        $prefs.setValueForKey(JSON.stringify(newCache), cache_key);
    } else {
        $prefs.setValueForKey(JSON.stringify(cache), cache_key);
    }

    $done({ body });
}

// 辅助函数：异步 GET 请求
function httpGet(url) {
    return new Promise((resolve) => {
        $httpClient.get({ 
            url, 
            headers: { 
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" 
            } 
        }, (err, resp, data) => resolve(data || ""));
    });
}

fetchFullContent();