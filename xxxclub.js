/**
 * XXXClub RSS Full Content Script for Quantumult X
 * 功能：将只有磁力链接的 RSS 改写为包含封面图、正文和标签的全文 RSS
 */

const request_limit = 8; // 限制处理前几个条目，避免脚本执行超时
let body = $response.body;

async function fetchFullContent() {
    // 1. 匹配所有的 item
    let items = body.match(/<item>[\s\S]*?<\/item>/g) || [];
    let count = Math.min(items.length, request_limit);
    
    console.log(`开始处理 XXXClub RSS, 共有 ${items.length} 个条目，处理前 ${count} 个`);

    for (let i = 0; i < count; i++) {
        let item = items[i];
        // 提取标题
        let titleMatch = item.match(/<title>(.*?)<\/title>/);
        if (!titleMatch) continue;
        
        let title = titleMatch[1];
        let searchTitle = encodeURIComponent(title.replace(/1080p|720p|MP4|\[.*?\]/gi, '').trim());
        let searchUrl = `https://xxxclub.to/search/${searchTitle}/`;

        try {
            // 2. 搜索详情页链接
            let searchRes = await httpGet(searchUrl);
            let detailPathMatch = searchRes.match(/<a href="(\/torrent\/\d+\/.*?\.html)"/);
            
            if (detailPathMatch) {
                let detailUrl = `https://xxxclub.to${detailPathMatch[1]}`;
                
                // 3. 抓取详情页内容
                let detailRes = await httpGet(detailUrl);
                
                // 提取封面 (通常在 id="torrent-cover" 附近或 meta 标签)
                let imgMatch = detailRes.match(/<img[^>]*src="(https:\/\/imgxclub\.com\/images\/[^"]+)"[^>]*id="torrent-cover"/);
                let coverHtml = imgMatch ? `<img src="${imgMatch[1]}" /><br/>` : "";
                
                // 提取剧情 (Story)
                let storyMatch = detailRes.match(/<div[^>]*id="story"[^>]*>([\s\S]*?)<\/div>/);
                let storyHtml = storyMatch ? `<h3>Story:</h3><p>${storyMatch[1].trim()}</p>` : "";
                
                // 提取标签 (Tags)
                let tagsMatch = detailRes.match(/<div[^>]*class="tags"[^>]*>([\s\S]*?)<\/div>/);
                let tagsHtml = tagsMatch ? `<p><b>Tags:</b> ${tagsMatch[1].replace(/<[^>]+>/g, ' ').trim()}</p>` : "";

                // 4. 组合内容并注入 description
                let description = `<![CDATA[${coverHtml}${storyHtml}${tagsHtml}]]>`;
                let newItem = item.replace(/<description\/>|<description>.*?<\/description>/, `<description>${description}</description>`);
                
                body = body.replace(item, newItem);
            }
        } catch (e) {
            console.log(`处理条目失败: ${title}, 错误: ${e}`);
        }
    }

    $done({ body });
}

// 辅助函数：封装 QX 的异步 GET 请求
function httpGet(url) {
    return new Promise((resolve, reject) => {
        $httpClient.get({ url }, (err, resp, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

fetchFullContent();