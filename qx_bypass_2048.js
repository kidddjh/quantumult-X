// ============================================================
// 2048 论坛通用 safeid 绕过脚本（for Quantumult X / Surge）
// 通吃所有 2048 镜像站：ewtvpm.com / lurj7988.com / zskmqt.com 等
//
// 安装方式（二选一）：
//
// QX: [rewrite_remote] 下加两条或合一条用
//   ^https?:\/\/.*\/read\.php\?tid=\d+ url script-request-header 2048_safeid_bypass.js
//   ^https?:\/\/.*\/read\.php\?tid=\d+ url script-response-body 2048_safeid_bypass.js
//
// Surge: [MITM] + [Script] 段
//   http-response ^https?:\/\/.*\/read\.php\?tid=\d+ requires-body=1,max-size=0,script-path=2048_safeid_bypass.js
//   http-request ^https?:\/\/.*\/read\.php\?tid=\d+ script-path=2048_safeid_bypass.js
// ============================================================

// 持久化存储的 key 名
const SAFEID_KEY = '2048_safeid';

(function () {
  const url = $request.url;
  const isRequest = typeof $response === 'undefined';

  if (isRequest) {
    // ===================== 请求阶段 =====================
    // 从持久化存储中取出之前捕获的 safeid
    const savedSafeid = $prefs.valueForKey(SAFEID_KEY);
    if (savedSafeid) {
      const headers = $request.headers;
      const existingCookie = headers['Cookie'] || '';
      if (existingCookie.indexOf('_safe=') === -1) {
        // 还没有 _safe cookie，注入
        headers['Cookie'] = existingCookie
          ? `${existingCookie}; _safe=${savedSafeid}`
          : `_safe=${savedSafeid}`;
      }
      $done({ headers });
    } else {
      // 还没捕获到 safeid，直接放行（等响应阶段捕获）
      $done({});
    }
  } else {
    // ===================== 响应阶段 =====================
    const body = typeof $response.body === 'string' ? $response.body : '';

    // 如果页面标题是单个人名（"孔子"、"墨子"等），说明触发了 safeid 挑战
    // 直接匹配 safeid 变量
    const match = body.match(/safeid='([^']+)'/);
    if (match) {
      const freshSafeid = match[1];
      $prefs.setValueForKey(freshSafeid, SAFEID_KEY);
      console.log(`[2048 Bypass] 捕获到 safeid: ${freshSafeid}`);
      // 注意：此处不修改 body，QX 会自动用新注入的 cookie 重发请求
    }

    $done({ body });
  }
})();

