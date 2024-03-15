
const axios = require('axios');

function main_check(key) {
    var res = null;
    key = safeText(key.replace(/\s/g, ''));
    if (key != "") {
        var data_key = Session_config.strtr(key, {
            "-": "+",
            "_": "/"
        });
        var mod4 = data_key.length % 4;
        if (mod4) {
            data_key += '===='.substr(mod4);
        }
        if (isBase64(data_key)) {
            var info = null;
            try {
                info = Session_config.decode(key);
            } catch (e) {
                res = "Something missing, try another key";
            }

            if (info != null) {
                if (info.protocol == "http" || info.protocol == "https") {
                    var call_url = safeText(info.protocol) + "://" + safeText(info.host) + safeText(info.path) + "/authorize-session";
                    var call_data = "user_id=" + safeText(info.user_id) + "&session_id=" + safeText(info.session_id);
                    res =  {
                        "url": call_url,
                        "data": call_data
                    }
                } else {
                    res = "Something missing, try another key";
                }
            } else {
                res = "invalid key, please try another session key";
            }
        } else {
            res = "Invalid session key";
        }
    }

    return res;

}

function safeText(text) {
    return htmlEntities(strip_tags(text, ""));
}

function htmlEntities(str) {
    str = str + "";
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function strip_tags(html, allowed_tags) {
    html = html + "";
    allowed_tags = allowed_tags + "";
    allowed_tags = allowed_tags.trim()

    if (allowed_tags) {
        allowed_tags = allowed_tags.split(/\s+/).map(function (tag) { return "/?" + tag });
        allowed_tags = "(?!" + allowed_tags.join("|") + ")";
    }

    return html.replace(new RegExp("(<" + allowed_tags + ".*?>)", "gi"), "");
}

var Session_config = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    base64_encode: function (e) { var t = ""; var n, r, i, s, o, u, a; var f = 0; e = this._utf8_encode(e); while (f < e.length) { n = e.charCodeAt(f++); r = e.charCodeAt(f++); i = e.charCodeAt(f++); s = n >> 2; o = (n & 3) << 4 | r >> 4; u = (r & 15) << 2 | i >> 6; a = i & 63; if (isNaN(r)) { u = a = 64 } else if (isNaN(i)) { a = 64 } t = t + this._keyStr.charAt(s) + this._keyStr.charAt(o) + this._keyStr.charAt(u) + this._keyStr.charAt(a) } return t },
    base64_decode: function (e) { var t = ""; var n, r, i; var s, o, u, a; var f = 0; e = e.replace(/[^A-Za-z0-9\+\/\=]/g, ""); while (f < e.length) { s = this._keyStr.indexOf(e.charAt(f++)); o = this._keyStr.indexOf(e.charAt(f++)); u = this._keyStr.indexOf(e.charAt(f++)); a = this._keyStr.indexOf(e.charAt(f++)); n = s << 2 | o >> 4; r = (o & 15) << 4 | u >> 2; i = (u & 3) << 6 | a; t = t + String.fromCharCode(n); if (u != 64) { t = t + String.fromCharCode(r) } if (a != 64) { t = t + String.fromCharCode(i) } } t = this._utf8_decode(t); return t },
    _utf8_encode: function (e) { e = e.replace(/\r\n/g, "\n"); var t = ""; for (var n = 0; n < e.length; n++) { var r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r) } else if (r > 127 && r < 2048) { t += String.fromCharCode(r >> 6 | 192); t += String.fromCharCode(r & 63 | 128) } else { t += String.fromCharCode(r >> 12 | 224); t += String.fromCharCode(r >> 6 & 63 | 128); t += String.fromCharCode(r & 63 | 128) } } return t },
    _utf8_decode: function (e) { var t = ""; var n = 0; var r = c1 = c2 = 0; while (n < e.length) { r = e.charCodeAt(n); if (r < 128) { t += String.fromCharCode(r); n++ } else if (r > 191 && r < 224) { c2 = e.charCodeAt(n + 1); t += String.fromCharCode((r & 31) << 6 | c2 & 63); n += 2 } else { c2 = e.charCodeAt(n + 1); c3 = e.charCodeAt(n + 2); t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63); n += 3 } } return t },
    strtr: function (s, p, r) {
        return !!s && {
            2: function () {
                for (var i in p) {
                    s = Session_config.strtr(s, i, p[i]);
                }
                return s;
            },
            3: function () {
                return s.replace(RegExp(p, 'g'), r);
            },
            0: function () {
                return;
            }
        }[arguments.length]();
    },
    encode: function (params) {
        var data = params.protocol + "|" + params.host + params.path + "|" + params.user_id + "," + params.session_id;
        data = data.replace("https", ":s");
        data = data.replace("http", ":p");
        data = data.replace("www.", ":w");
        data = this.base64_encode(data);
        data = this.strtr(data, {
            "/+/": "-",
            "/": "_",
            "=": ""
        });
        return data;
    },
    decode: function (key) {
        var data = key;
        data = this.strtr(data, {
            "-": "+",
            "_": "/"
        });
        var mod4 = data.length % 4;
        if (mod4) {
            data += '===='.substr(mod4);
        }
        data = this.base64_decode(data);
        data = data.replace(":s", "https");
        data = data.replace(":p", "http");
        data = data.replace(":w", "www.");
        var ex = data.split("|");
        var host = ex[1].split("/");
        var ids = ex[2].split(",");
        return {
            protocol: ex[0],
            host: host[0],
            path: ex[1].replace(host[0], ""),
            user_id: ids[0],
            session_id: ids[1]
        };
    }
}

function isBase64(str) {
    try {
        return btoa(atob(str)) == str;
    } catch (err) {
        return false;
    }
}

function authorize_session(url, data) {
    return axios.post(url, data).then(async function (res) {
        return await res.data;
    }).catch(function (error) {
        return error;
    });
}

function close_session(data) {
    return axios.post('https://surfgo.net/close-session', data).then(async function (res) {
        return await res.data;
    }).catch(function (error) {
        return error;
    });
}


module.exports = { main_check, authorize_session, close_session};
