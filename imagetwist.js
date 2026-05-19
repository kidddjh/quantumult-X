/*
 * ImageTwist Referer Fix for Quantumult X
 */
let headers = $request.headers;
headers['Referer'] = 'https://imagetwist.com/';
$done({ headers });