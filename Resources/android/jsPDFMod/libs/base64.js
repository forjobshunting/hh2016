var Base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function(input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = Base64._utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = (3 & chr1) << 4 | chr2 >> 4;
            enc3 = (15 & chr2) << 2 | chr3 >> 6;
            enc4 = 63 & chr3;
            isNaN(chr2) ? enc3 = enc4 = 64 : isNaN(chr3) && (enc4 = 64);
            output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }
        return output;
    },
    decode: function(input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
            chr1 = enc1 << 2 | enc2 >> 4;
            chr2 = (15 & enc2) << 4 | enc3 >> 2;
            chr3 = (3 & enc3) << 6 | enc4;
            output += String.fromCharCode(chr1);
            64 != enc3 && (output += String.fromCharCode(chr2));
            64 != enc4 && (output += String.fromCharCode(chr3));
        }
        output = Base64._utf8_decode(output);
        return output;
    },
    _utf8_encode: function(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (128 > c) utftext += String.fromCharCode(c); else if (c > 127 && 2048 > c) {
                utftext += String.fromCharCode(c >> 6 | 192);
                utftext += String.fromCharCode(63 & c | 128);
            } else {
                utftext += String.fromCharCode(c >> 12 | 224);
                utftext += String.fromCharCode(c >> 6 & 63 | 128);
                utftext += String.fromCharCode(63 & c | 128);
            }
        }
        return utftext;
    },
    _utf8_decode: function(utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (128 > c) {
                string += String.fromCharCode(c);
                i++;
            } else if (c > 191 && 224 > c) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode((31 & c) << 6 | 63 & c2);
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode((15 & c) << 12 | (63 & c2) << 6 | 63 & c3);
                i += 3;
            }
        }
        return string;
    }
};