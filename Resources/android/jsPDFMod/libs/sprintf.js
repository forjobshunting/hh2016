function sprintf() {
    var regex = /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuidfegEG])/g;
    var a = arguments, i = 0, format = a[i++];
    var pad = function(str, len, chr, leftJustify) {
        chr || (chr = " ");
        var padding = str.length >= len ? "" : Array(1 + len - str.length >>> 0).join(chr);
        return leftJustify ? str + padding : padding + str;
    };
    var justify = function(value, prefix, leftJustify, minWidth, zeroPad, customPadChar) {
        var diff = minWidth - value.length;
        diff > 0 && (value = leftJustify || !zeroPad ? pad(value, minWidth, customPadChar, leftJustify) : value.slice(0, prefix.length) + pad("", diff, "0", true) + value.slice(prefix.length));
        return value;
    };
    var formatBaseX = function(value, base, prefix, leftJustify, minWidth, precision, zeroPad) {
        var number = value >>> 0;
        prefix = prefix && number && {
            "2": "0b",
            "8": "0",
            "16": "0x"
        }[base] || "";
        value = prefix + pad(number.toString(base), precision || 0, "0", false);
        return justify(value, prefix, leftJustify, minWidth, zeroPad);
    };
    var formatString = function(value, leftJustify, minWidth, precision, zeroPad, customPadChar) {
        null != precision && (value = value.slice(0, precision));
        return justify(value, "", leftJustify, minWidth, zeroPad, customPadChar);
    };
    var doFormat = function(substring, valueIndex, flags, minWidth, _, precision, type) {
        var number;
        var prefix;
        var method;
        var textTransform;
        var value;
        if ("%%" == substring) return "%";
        var leftJustify = false, positivePrefix = "", zeroPad = false, prefixBaseX = false, customPadChar = " ";
        var flagsl = flags.length;
        for (var j = 0; flags && flagsl > j; j++) switch (flags.charAt(j)) {
          case " ":
            positivePrefix = " ";
            break;

          case "+":
            positivePrefix = "+";
            break;

          case "-":
            leftJustify = true;
            break;

          case "'":
            customPadChar = flags.charAt(j + 1);
            break;

          case "0":
            zeroPad = true;
            break;

          case "#":
            prefixBaseX = true;
        }
        minWidth = minWidth ? "*" == minWidth ? +a[i++] : "*" == minWidth.charAt(0) ? +a[minWidth.slice(1, -1)] : +minWidth : 0;
        if (0 > minWidth) {
            minWidth = -minWidth;
            leftJustify = true;
        }
        if (!isFinite(minWidth)) throw new Error("sprintf: (minimum-)width must be finite");
        precision = precision ? "*" == precision ? +a[i++] : "*" == precision.charAt(0) ? +a[precision.slice(1, -1)] : +precision : "fFeE".indexOf(type) > -1 ? 6 : "d" == type ? 0 : void 0;
        value = valueIndex ? a[valueIndex.slice(0, -1)] : a[i++];
        switch (type) {
          case "s":
            return formatString(String(value), leftJustify, minWidth, precision, zeroPad, customPadChar);

          case "c":
            return formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, zeroPad);

          case "b":
            return formatBaseX(value, 2, prefixBaseX, leftJustify, minWidth, precision, zeroPad);

          case "o":
            return formatBaseX(value, 8, prefixBaseX, leftJustify, minWidth, precision, zeroPad);

          case "x":
            return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad);

          case "X":
            return formatBaseX(value, 16, prefixBaseX, leftJustify, minWidth, precision, zeroPad).toUpperCase();

          case "u":
            return formatBaseX(value, 10, prefixBaseX, leftJustify, minWidth, precision, zeroPad);

          case "i":
          case "d":
            number = parseInt(+value);
            prefix = 0 > number ? "-" : positivePrefix;
            value = prefix + pad(String(Math.abs(number)), precision, "0", false);
            return justify(value, prefix, leftJustify, minWidth, zeroPad);

          case "e":
          case "E":
          case "f":
          case "F":
          case "g":
          case "G":
            number = +value;
            prefix = 0 > number ? "-" : positivePrefix;
            method = [ "toExponential", "toFixed", "toPrecision" ]["efg".indexOf(type.toLowerCase())];
            textTransform = [ "toString", "toUpperCase" ]["eEfFgG".indexOf(type) % 2];
            value = prefix + Math.abs(number)[method](precision);
            return justify(value, prefix, leftJustify, minWidth, zeroPad)[textTransform]();

          default:
            return substring;
        }
    };
    return format.replace(regex, doFormat);
}