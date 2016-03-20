var jsPDF = function() {
    "use strict";
    function jsPDF(orientation, unit, format) {
        orientation = "undefined" == typeof orientation ? "p" : orientation.toString().toLowerCase();
        "undefined" == typeof unit && (unit = "pt");
        "undefined" == typeof format && (format = "a4");
        var activeFontKey, pageHeight, pageWidth, k, format_as_string = format.toString().toLowerCase(), version = "20120619", content = [], content_length = 0, pdfVersion = "1.3", pageFormats = {
            a3: [ 841.89, 1190.55 ],
            a4: [ 595.28, 841.89 ],
            a5: [ 420.94, 595.28 ],
            letter: [ 612, 792 ],
            legal: [ 612, 1008 ]
        }, textColor = "0 g", drawColor = "0 G", page = 0, pages = [], objectNumber = 2, outToPages = false, offsets = [], fonts = {}, fontmap = {}, activeFontSize = 16, lineWidth = .200025, documentProperties = {
            title: "",
            subject: "",
            author: "",
            keywords: "",
            creator: ""
        }, lineCapID = 0, lineJoinID = 0, API = {}, events = new PubSub(API), fit = "H";
        if ("pt" == unit) k = 1; else if ("mm" == unit) k = 72 / 25.4; else if ("cm" == unit) k = 72 / 2.54; else {
            if ("in" != unit) throw "Invalid unit: " + unit;
            k = 72;
        }
        if (format_as_string in pageFormats) {
            pageHeight = pageFormats[format_as_string][1] / k;
            pageWidth = pageFormats[format_as_string][0] / k;
        } else try {
            pageHeight = format[1];
            pageWidth = format[0];
        } catch (err) {
            throw "Invalid format: " + format;
        }
        if ("p" === orientation || "portrait" === orientation) {
            orientation = "p";
            if (pageWidth > pageHeight) {
                var tmp = pageWidth;
                pageWidth = pageHeight;
                pageHeight = tmp;
            }
        } else {
            if ("l" !== orientation && "landscape" !== orientation) throw "Invalid orientation: " + orientation;
            orientation = "l";
            if (pageHeight > pageWidth) {
                var tmp = pageWidth;
                pageWidth = pageHeight;
                pageHeight = tmp;
            }
        }
        var f2 = function(number) {
            return number.toFixed(2);
        }, f3 = function(number) {
            return number.toFixed(3);
        }, padd2 = function(number) {
            var n = number.toFixed(0);
            return 10 > number ? "0" + n : n;
        }, padd10 = function(number) {
            if ("number" == typeof number) {
                var n = number.toFixed(0);
                return n.length < 10 ? new Array(11 - n.length).join("0") + n : n;
            }
        }, out = function(string) {
            if (outToPages) pages[page].push(string); else {
                content.push(string);
                content_length += string.length + 1;
            }
        }, newObject = function() {
            objectNumber++;
            offsets[objectNumber] = content_length;
            out(objectNumber + " 0 obj");
            return objectNumber;
        }, putPages = function() {
            var wPt = pageWidth * k;
            var hPt = pageHeight * k;
            var n, p;
            for (n = 1; page >= n; n++) {
                newObject();
                out("<</Type /Page");
                out("/Parent 1 0 R");
                out("/Resources 2 0 R");
                out("/Contents " + (objectNumber + 1) + " 0 R>>");
                out("endobj");
                p = pages[n].join("\n");
                newObject();
                out("<</Length " + p.length + ">>");
                putStream(p);
                out("endobj");
            }
            offsets[1] = content_length;
            out("1 0 obj");
            out("<</Type /Pages");
            var kids = "/Kids [";
            for (var i = 0; page > i; i++) kids += 3 + 2 * i + " 0 R ";
            out(kids + "]");
            out("/Count " + page);
            out("/MediaBox [0 0 " + f2(wPt) + " " + f2(hPt) + "]");
            out(">>");
            out("endobj");
        }, putStream = function(str) {
            out("stream");
            out(str);
            out("endstream");
        }, putResources = function() {
            putFonts();
            events.publish("putResources");
            offsets[2] = content_length;
            out("2 0 obj");
            out("<<");
            putResourceDictionary();
            out(">>");
            out("endobj");
        }, putFonts = function() {
            for (var fontKey in fonts) fonts.hasOwnProperty(fontKey) && putFont(fonts[fontKey]);
        }, putFont = function(font) {
            font.objectNumber = newObject();
            out("<</BaseFont/" + font.PostScriptName + "/Type/Font");
            "string" == typeof font.encoding && out("/Encoding/" + font.encoding);
            out("/Subtype/Type1>>");
            out("endobj");
        }, addToFontDictionary = function(fontKey, fontName, fontStyle) {
            var undef;
            fontmap[fontName] === undef && (fontmap[fontName] = {});
            fontmap[fontName][fontStyle] = fontKey;
        }, addFont = function(PostScriptName, fontName, fontStyle, encoding) {
            var fontKey = "F" + (getObjectLength(fonts) + 1).toString(10);
            var font = fonts[fontKey] = {
                id: fontKey,
                PostScriptName: PostScriptName,
                fontName: fontName,
                fontStyle: fontStyle,
                encoding: encoding,
                metadata: {}
            };
            addToFontDictionary(fontKey, fontName, fontStyle);
            events.publish("addFont", font);
            return fontKey;
        }, addFonts = function() {
            var HELVETICA = "helvetica", TIMES = "times", COURIER = "courier", NORMAL = "normal", BOLD = "bold", ITALIC = "italic", BOLD_ITALIC = "bolditalic", encoding = "StandardEncoding", standardFonts = [ [ "Helvetica", HELVETICA, NORMAL ], [ "Helvetica-Bold", HELVETICA, BOLD ], [ "Helvetica-Oblique", HELVETICA, ITALIC ], [ "Helvetica-BoldOblique", HELVETICA, BOLD_ITALIC ], [ "Courier", COURIER, NORMAL ], [ "Courier-Bold", COURIER, BOLD ], [ "Courier-Oblique", COURIER, ITALIC ], [ "Courier-BoldOblique", COURIER, BOLD_ITALIC ], [ "Times-Roman", TIMES, NORMAL ], [ "Times-Bold", TIMES, BOLD ], [ "Times-Italic", TIMES, ITALIC ], [ "Times-BoldItalic", TIMES, BOLD_ITALIC ] ];
            var i, l, fontKey, parts;
            for (i = 0, l = standardFonts.length; l > i; i++) {
                fontKey = addFont(standardFonts[i][0], standardFonts[i][1], standardFonts[i][2], encoding);
                parts = standardFonts[i][0].split("-");
                addToFontDictionary(fontKey, parts[0], parts[1] || "");
            }
            events.publish("addFonts", {
                fonts: fonts,
                dictionary: fontmap
            });
        }, putResourceDictionary = function() {
            out("/ProcSet [/PDF /Text /ImageB /ImageC /ImageI]");
            out("/Font <<");
            for (var fontKey in fonts) fonts.hasOwnProperty(fontKey) && out("/" + fontKey + " " + fonts[fontKey].objectNumber + " 0 R");
            out(">>");
            out("/XObject <<");
            putXobjectDict();
            out(">>");
        }, putXobjectDict = function() {
            events.publish("putXobjectDict");
        }, putInfo = function() {
            out("/Producer (jsPDF " + version + ")");
            documentProperties.title && out("/Title (" + pdfEscape(documentProperties.title) + ")");
            documentProperties.subject && out("/Subject (" + pdfEscape(documentProperties.subject) + ")");
            documentProperties.author && out("/Author (" + pdfEscape(documentProperties.author) + ")");
            documentProperties.keywords && out("/Keywords (" + pdfEscape(documentProperties.keywords) + ")");
            documentProperties.creator && out("/Creator (" + pdfEscape(documentProperties.creator) + ")");
            var created = new Date();
            out("/CreationDate (D:" + [ created.getFullYear(), padd2(created.getMonth() + 1), padd2(created.getDate()), padd2(created.getHours()), padd2(created.getMinutes()), padd2(created.getSeconds()) ].join("") + ")");
        }, putCatalog = function() {
            out("/Type /Catalog");
            out("/Pages 1 0 R");
            out("/OpenAction [3 0 R /Fit" + fit + " null]");
            out("/PageLayout /OneColumn");
        }, putTrailer = function() {
            out("/Size " + (objectNumber + 1));
            out("/Root " + objectNumber + " 0 R");
            out("/Info " + (objectNumber - 1) + " 0 R");
        }, beginPage = function() {
            page++;
            outToPages = true;
            pages[page] = [];
        }, _addPage = function() {
            beginPage();
            out(f2(lineWidth * k) + " w");
            out(drawColor);
            0 !== lineCapID && out(lineCapID.toString(10) + " J");
            0 !== lineJoinID && out(lineJoinID.toString(10) + " j");
            events.publish("addPage", {
                pageNumber: page
            });
        }, getFont = function(fontName, fontStyle) {
            var key, undef;
            fontName === undef && (fontName = fonts[activeFontKey]["fontName"]);
            fontStyle === undef && (fontStyle = fonts[activeFontKey]["fontStyle"]);
            try {
                key = fontmap[fontName][fontStyle];
            } catch (e) {
                key = undef;
            }
            if (!key) throw new Error("Unable to look up font label for font '" + fontName + "', '" + fontStyle + "'. Refer to getFontList() for available fonts.");
            return key;
        }, buildDocument = function() {
            outToPages = false;
            content = [];
            offsets = [];
            out("%PDF-" + pdfVersion);
            putPages();
            putResources();
            newObject();
            out("<<");
            putInfo();
            out(">>");
            out("endobj");
            newObject();
            out("<<");
            putCatalog();
            out(">>");
            out("endobj");
            var o = content_length;
            out("xref");
            out("0 " + (objectNumber + 1));
            out("0000000000 65535 f ");
            for (var i = 1; objectNumber >= i; i++) out(padd10(offsets[i]) + " 00000 n ");
            out("trailer");
            out("<<");
            putTrailer();
            out(">>");
            out("startxref");
            out(o);
            out("%%EOF");
            outToPages = true;
            return content.join("\n");
        }, to8bitStream = function(text, flags) {
            var i, l, undef;
            flags === undef && (flags = {});
            var encodingBlock, newtext, isUnicode, ch, bch, sourceEncoding = flags.sourceEncoding ? sourceEncoding : "Unicode", outputEncoding = flags.outputEncoding;
            if ((flags.autoencode || outputEncoding) && fonts[activeFontKey].metadata && fonts[activeFontKey].metadata[sourceEncoding] && fonts[activeFontKey].metadata[sourceEncoding].encoding) {
                encodingBlock = fonts[activeFontKey].metadata[sourceEncoding].encoding;
                !outputEncoding && fonts[activeFontKey].encoding && (outputEncoding = fonts[activeFontKey].encoding);
                !outputEncoding && encodingBlock.codePages && (outputEncoding = encodingBlock.codePages[0]);
                "string" == typeof outputEncoding && (outputEncoding = encodingBlock[outputEncoding]);
                if (outputEncoding) {
                    isUnicode = false;
                    newtext = [];
                    for (i = 0, l = text.length; l > i; i++) {
                        ch = outputEncoding[text.charCodeAt(i)];
                        newtext.push(ch ? String.fromCharCode(ch) : text[i]);
                        newtext[i].charCodeAt(0) >> 8 && (isUnicode = true);
                    }
                    text = newtext.join("");
                }
            }
            i = text.length;
            while (isUnicode === undef && 0 !== i) {
                text.charCodeAt(i - 1) >> 8 && (isUnicode = true);
                i--;
            }
            if (isUnicode) {
                newtext = flags.noBOM ? [] : [ 254, 255 ];
                for (i = 0, l = text.length; l > i; i++) {
                    ch = text.charCodeAt(i);
                    bch = ch >> 8;
                    if (bch >> 8) throw new Error("Character at position " + i.toString(10) + " of string '" + text + "' exceeds 16bits. Cannot be encoded into UCS-2 BE");
                    newtext.push(bch);
                    newtext.push(ch - (bch << 8));
                }
                return String.fromCharCode.apply(undef, newtext);
            }
            return text;
        }, pdfEscape = function(text, flags) {
            return to8bitStream(text, flags).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
        }, getStyle = function(style) {
            var op = "S";
            "F" === style ? op = "f" : ("FD" === style || "DF" === style) && (op = "B");
            return op;
        };
        API.internal = {
            pdfEscape: pdfEscape,
            getStyle: getStyle,
            getFont: function() {
                return fonts[getFont.apply(API, arguments)];
            },
            getFontSize: function() {
                return activeFontSize;
            },
            btoa: btoa,
            write: function() {
                out(1 === arguments.length ? arguments[0] : Array.prototype.join.call(arguments, " "));
            },
            getCoordinateString: function(value) {
                return f2(value * k);
            },
            getVerticalCoordinateString: function(value) {
                return f2((pageHeight - value) * k);
            },
            collections: {},
            newObject: newObject,
            putStream: putStream,
            events: events,
            scaleFactor: k,
            pageSize: {
                width: pageWidth,
                height: pageHeight
            }
        };
        API.addPage = function() {
            _addPage();
            return this;
        };
        API.text = function(text, x, y, flags) {
            var undef;
            var _first, _second, _third;
            if ("number" == typeof arguments[0]) {
                _first = arguments[2];
                _second = arguments[0];
                _third = arguments[1];
                text = _first;
                x = _second;
                y = _third;
            }
            "string" == typeof text && text.match(/[\n\r]/) && (text = text.split(/\r\n|\r|\n/g));
            if ("undefined" == typeof flags) flags = {
                noBOM: true,
                autoencode: true
            }; else {
                flags.noBOM === undef && (flags.noBOM = true);
                flags.autoencode === undef && (flags.autoencode = true);
            }
            var newtext, str;
            if ("string" == typeof text) str = pdfEscape(text, flags); else {
                if (!(text instanceof Array)) throw new Error('Type of text must be string or Array. "' + text + '" is not recognized.');
                newtext = text.concat();
                for (var i = newtext.length - 1; -1 !== i; i--) newtext[i] = pdfEscape(newtext[i], flags);
                str = newtext.join(") Tj\nT* (");
            }
            out("BT\n/" + activeFontKey + " " + activeFontSize + " Tf\n" + activeFontSize + " TL\n" + textColor + "\n" + f2(x * k) + " " + f2((pageHeight - y) * k) + " Td\n(" + str + ") Tj\nET");
            return this;
        };
        API.line = function(x1, y1, x2, y2) {
            out(f2(x1 * k) + " " + f2((pageHeight - y1) * k) + " m " + f2(x2 * k) + " " + f2((pageHeight - y2) * k) + " l S");
            return this;
        };
        API.lines = function(lines, x, y, scale, style) {
            var undef;
            var _first, _second, _third;
            if ("number" == typeof arguments[0]) {
                _first = arguments[2];
                _second = arguments[0];
                _third = arguments[1];
                lines = _first;
                x = _second;
                y = _third;
            }
            style = getStyle(style);
            scale = scale === undef ? [ 1, 1 ] : scale;
            out(f3(x * k) + " " + f3((pageHeight - y) * k) + " m ");
            var leg, x2, y2, x3, y3, scalex = scale[0], scaley = scale[1], i = 0, l = lines.length, x4 = x, y4 = y;
            for (;l > i; i++) {
                leg = lines[i];
                if (2 === leg.length) {
                    x4 = leg[0] * scalex + x4;
                    y4 = leg[1] * scaley + y4;
                    out(f3(x4 * k) + " " + f3((pageHeight - y4) * k) + " l");
                } else {
                    x2 = leg[0] * scalex + x4;
                    y2 = leg[1] * scaley + y4;
                    x3 = leg[2] * scalex + x4;
                    y3 = leg[3] * scaley + y4;
                    x4 = leg[4] * scalex + x4;
                    y4 = leg[5] * scaley + y4;
                    out(f3(x2 * k) + " " + f3((pageHeight - y2) * k) + " " + f3(x3 * k) + " " + f3((pageHeight - y3) * k) + " " + f3(x4 * k) + " " + f3((pageHeight - y4) * k) + " c");
                }
            }
            out(style);
            return this;
        };
        API.rect = function(x, y, w, h, style) {
            var op = getStyle(style);
            out([ f2(x * k), f2((pageHeight - y) * k), f2(w * k), f2(-h * k), "re", op ].join(" "));
            return this;
        };
        API.triangle = function(x1, y1, x2, y2, x3, y3, style) {
            this.lines([ [ x2 - x1, y2 - y1 ], [ x3 - x2, y3 - y2 ], [ x1 - x3, y1 - y3 ] ], x1, y1, [ 1, 1 ], style);
            return this;
        };
        API.ellipse = function(x, y, rx, ry, style) {
            var op = getStyle(style), lx = 4 / 3 * (Math.SQRT2 - 1) * rx, ly = 4 / 3 * (Math.SQRT2 - 1) * ry;
            out([ f2((x + rx) * k), f2((pageHeight - y) * k), "m", f2((x + rx) * k), f2((pageHeight - (y - ly)) * k), f2((x + lx) * k), f2((pageHeight - (y - ry)) * k), f2(x * k), f2((pageHeight - (y - ry)) * k), "c" ].join(" "));
            out([ f2((x - lx) * k), f2((pageHeight - (y - ry)) * k), f2((x - rx) * k), f2((pageHeight - (y - ly)) * k), f2((x - rx) * k), f2((pageHeight - y) * k), "c" ].join(" "));
            out([ f2((x - rx) * k), f2((pageHeight - (y + ly)) * k), f2((x - lx) * k), f2((pageHeight - (y + ry)) * k), f2(x * k), f2((pageHeight - (y + ry)) * k), "c" ].join(" "));
            out([ f2((x + lx) * k), f2((pageHeight - (y + ry)) * k), f2((x + rx) * k), f2((pageHeight - (y + ly)) * k), f2((x + rx) * k), f2((pageHeight - y) * k), "c", op ].join(" "));
            return this;
        };
        API.circle = function(x, y, r, style) {
            return this.ellipse(x, y, r, r, style);
        };
        API.setProperties = function(properties) {
            for (var property in documentProperties) documentProperties.hasOwnProperty(property) && properties[property] && (documentProperties[property] = properties[property]);
            return this;
        };
        API.addImage = function() {
            return this;
        };
        API.setFontSize = function(size) {
            activeFontSize = size;
            return this;
        };
        API.setFont = function(fontName, fontStyle) {
            activeFontKey = getFont(fontName, fontStyle);
            return this;
        };
        API.setFontStyle = API.setFontType = function(style) {
            var undef;
            activeFontKey = getFont(undef, style);
            return this;
        };
        API.getFontList = function() {
            var fontName, fontStyle, tmp, list = {};
            for (fontName in fontmap) if (fontmap.hasOwnProperty(fontName)) {
                list[fontName] = tmp = [];
                for (fontStyle in fontmap[fontName]) fontmap[fontName].hasOwnProperty(fontStyle) && tmp.push(fontStyle);
            }
            return list;
        };
        API.setLineWidth = function(width) {
            out((width * k).toFixed(2) + " w");
            return this;
        };
        API.setDrawColor = function(r, g, b) {
            var color;
            color = 0 === r && 0 === g && 0 === b || "undefined" == typeof g ? f3(r / 255) + " G" : [ f3(r / 255), f3(g / 255), f3(b / 255), "RG" ].join(" ");
            out(color);
            return this;
        };
        API.setFillColor = function(r, g, b) {
            var color;
            color = 0 === r && 0 === g && 0 === b || "undefined" == typeof g ? f3(r / 255) + " g" : [ f3(r / 255), f3(g / 255), f3(b / 255), "rg" ].join(" ");
            out(color);
            return this;
        };
        API.setTextColor = function(r, g, b) {
            textColor = 0 === r && 0 === g && 0 === b || "undefined" == typeof g ? f3(r / 255) + " g" : [ f3(r / 255), f3(g / 255), f3(b / 255), "rg" ].join(" ");
            return this;
        };
        API.CapJoinStyles = {
            0: 0,
            butt: 0,
            but: 0,
            bevel: 0,
            1: 1,
            round: 1,
            rounded: 1,
            circle: 1,
            2: 2,
            projecting: 2,
            project: 2,
            square: 2,
            milter: 2
        };
        API.setLineCap = function(style) {
            var undefined, id = this.CapJoinStyles[style];
            if (id === undefined) throw new Error("Line cap style of '" + style + "' is not recognized. See or extend .CapJoinStyles property for valid styles");
            lineCapID = id;
            out(id.toString(10) + " J");
            return this;
        };
        API.setLineJoin = function(style) {
            var undefined, id = this.CapJoinStyles[style];
            if (id === undefined) throw new Error("Line join style of '" + style + "' is not recognized. See or extend .CapJoinStyles property for valid styles");
            lineJoinID = id;
            out(id.toString(10) + " j");
            return this;
        };
        API.output = function(type) {
            var undef;
            switch (type) {
              case undef:
                return buildDocument();

              case "datauristring":
              case "dataurlstring":
                return "data:application/pdf;base64," + btoa(buildDocument());

              case "datauri":
              case "dataurl":
                document.location.href = "data:application/pdf;base64," + btoa(buildDocument());
                break;

              default:
                throw new Error('Output type "' + type + '" is not supported.');
            }
        };
        for (var plugin in jsPDF.API) jsPDF.API.hasOwnProperty(plugin) && ("events" === plugin && jsPDF.API.events.length ? !function(events, newEvents) {
            var eventname, handler_and_args;
            for (var i = newEvents.length - 1; -1 !== i; i--) {
                eventname = newEvents[i][0];
                handler_and_args = newEvents[i][1];
                events.subscribe.apply(events, [ eventname ].concat("function" == typeof handler_and_args ? [ handler_and_args ] : handler_and_args));
            }
        }(events, jsPDF.API.events) : API[plugin] = jsPDF.API[plugin]);
        addFonts();
        activeFontKey = "F1";
        _addPage();
        events.publish("initialized");
        return API;
    }
    if ("undefined" == typeof btoa) var btoa = function(data) {
        var o1, o2, o3, h1, h2, h3, h4, bits, b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", b64a = b64.split(""), i = 0, ac = 0, enc = "", tmp_arr = [];
        do {
            o1 = data.charCodeAt(i++);
            o2 = data.charCodeAt(i++);
            o3 = data.charCodeAt(i++);
            bits = o1 << 16 | o2 << 8 | o3;
            h1 = bits >> 18 & 63;
            h2 = bits >> 12 & 63;
            h3 = bits >> 6 & 63;
            h4 = 63 & bits;
            tmp_arr[ac++] = b64a[h1] + b64a[h2] + b64a[h3] + b64a[h4];
        } while (i < data.length);
        enc = tmp_arr.join("");
        var r = data.length % 3;
        return (r ? enc.slice(0, r - 3) : enc) + "===".slice(r || 3);
    };
    var getObjectLength = "function" == typeof Object.keys ? function(object) {
        return Object.keys(object).length;
    } : function(object) {
        var i = 0;
        for (var e in object) object.hasOwnProperty(e) && i++;
        return i;
    };
    var PubSub = function(context) {
        this.topics = {};
        this.context = context;
        this.publish = function(topic, args) {
            if (this.topics[topic]) {
                var fn, i, l, pair, currentTopic = this.topics[topic], args = Array.prototype.slice.call(arguments, 1), toremove = [];
                for (i = 0, l = currentTopic.length; l > i; i++) {
                    pair = currentTopic[i];
                    fn = pair[0];
                    if (pair[1]) {
                        pair[0] = function() {};
                        toremove.push(i);
                    }
                    fn.apply(this.context, args);
                }
                for (i = 0, l = toremove.length; l > i; i++) currentTopic.splice(toremove[i], 1);
            }
        };
        this.subscribe = function(topic, callback, once) {
            this.topics[topic] ? this.topics[topic].push([ callback, once ]) : this.topics[topic] = [ [ callback, once ] ];
            return {
                topic: topic,
                callback: callback
            };
        };
        this.unsubscribe = function(token) {
            if (this.topics[token.topic]) {
                var currentTopic = this.topics[token.topic];
                for (var i = 0, l = currentTopic.length; l > i; i++) currentTopic[i][0] === token.callback && currentTopic.splice(i, 1);
            }
        };
    };
    jsPDF.API = {
        events: []
    };
    return jsPDF;
}();