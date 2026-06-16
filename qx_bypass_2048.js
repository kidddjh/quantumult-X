// ============================================================
// qx_bypass_2048.js — Quantumult X 脚本
// 功能: 永久绕过 2048 论坛 (0rsh.zskmqt.com) 的 JS 反爬机制
//
// GitHub 远程引用方式:
// ------------------------------------------------------------
// [rewrite_local]
// ^https:\/\/0rsh\.zskmqt\.com\/read\.php\?tid=\d+ url script-response-body https://raw.githubusercontent.com/kidddjh/quantumult-X/main/qx_bypass_2048.js
// ^https:\/\/0rsh\.zskmqt\.com\/read\.php\?tid=\d+ url script-request-header https://raw.githubusercontent.com/kidddjh/quantumult-X/main/qx_bypass_2048.js
//
// [mitm]
// hostname = %APPEND% 0rsh.zskmqt.com
// ============================================================

const STORAGE_KEY = '2048_safe_cookie';
const DOMAIN = '0rsh.zskmqt.com';

function handleResponse() {
  const ct = ($response.headers['Content-Type'] || $response.headers['content-type'] || '').toLowerCase();
  if (!ct.includes('text/html')) {
    $done({});
    return;
  }
  const body = typeof $response.body === 'string' ? $response.body : '';
  const match = body.match(/safeid='([^']+)'/);
  if (!match) {
    $done({});
    return;
  }
  const safeid = match[1];
  $prefs.setValueForKey(safeid, STORAGE_KEY);
  $done({
    status: 302,
    headers: {
      'Location': $request.url,
      'Set-Cookie': `_safe=${safeid}; Max-Age=86400; Path=/; Domain=${DOMAIN}`,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}

function handleRequest() {
  const savedSafeId = $prefs.valueForKey(STORAGE_KEY);
  if (!savedSafeId) {
    $done({});
    return;
  }
  let headers = { ...$request.headers };
  const existing = headers['Cookie'] || headers['cookie'] || '';
  if (existing.includes('_safe=')) {
    $done({});
    return;
  }
  headers['Cookie'] = existing
    ? `${existing}; _safe=${savedSafeId}`
    : `_safe=${savedSafeId}`;
  $done({
    request: {
      url: $request.url,
      method: $request.method,
      headers: headers,
      body: $request.body
    }
  });
}

try {
  if (typeof $response !== 'undefined' && $response !== null) {
    handleResponse();
  } else {
    handleRequest();
  }
} catch (e) {
  if (typeof $notification !== 'undefined') {
    $notification.post('2048 绕过', '❌ 脚本错误', e.message);
  }
  $done({});
}
