!function(jsPDFAPI) {
    "use strict";
    var namespace = "addImage_";
    var putImage = function(img) {
        var objectNumber = this.internal.newObject(), out = this.internal.write, putStream = this.internal.putStream;
        img["n"] = objectNumber;
        out("<</Type /XObject");
        out("/Subtype /Image");
        out("/Width " + img["w"]);
        out("/Height " + img["h"]);
        if ("Indexed" === img["cs"]) out("/ColorSpace [/Indexed /DeviceRGB " + (img["pal"].length / 3 - 1) + " " + (objectNumber + 1) + " 0 R]"); else {
            out("/ColorSpace /" + img["cs"]);
            "DeviceCMYK" === img["cs"] && out("/Decode [1 0 1 0 1 0 1 0]");
        }
        out("/BitsPerComponent " + img["bpc"]);
        "f" in img && out("/Filter /" + img["f"]);
        "dp" in img && out("/DecodeParms <<" + img["dp"] + ">>");
        if ("trns" in img && img["trns"].constructor == Array) {
            var trns = "";
            for (var i = 0; i < img["trns"].length; i++) {
                trns += img[trns][i] + " " + img["trns"][i] + " ";
                out("/Mask [" + trns + "]");
            }
        }
        "smask" in img && out("/SMask " + (objectNumber + 1) + " 0 R");
        out("/Length " + img["data"].length + ">>");
        putStream("#image " + img["data"] + "#");
        out("endobj");
    }, putResourcesCallback = function() {
        var images = this.internal.collections[namespace + "images"];
        for (var i in images) putImage.call(this, images[i]);
    }, putXObjectsDictCallback = function() {
        var image, images = this.internal.collections[namespace + "images"], out = this.internal.write;
        for (var i in images) {
            image = images[i];
            out("/I" + image["i"], image["n"], "0", "R");
        }
    };
    jsPDFAPI.addImage = function(imageData, format, x, y, w, h) {
        if ("JPEG" !== format.toUpperCase()) throw new Error("addImage currently only supports format 'JPEG', not '" + format + "'");
        var imageIndex, images = this.internal.collections[namespace + "images"], coord = this.internal.getCoordinateString, vcoord = this.internal.getVerticalCoordinateString;
        if (images) imageIndex = Object.keys ? Object.keys(images).length : function(o) {
            var i = 0;
            for (var e in o) o.hasOwnProperty(e) && i++;
            return i;
        }(images); else {
            imageIndex = 0;
            this.internal.collections[namespace + "images"] = images = {};
            this.internal.events.subscribe("putResources", putResourcesCallback);
            this.internal.events.subscribe("putXobjectDict", putXObjectsDictCallback);
        }
        var dims = [ w, h ];
        var info = {
            w: dims[0],
            h: dims[1],
            cs: "DeviceRGB",
            bpc: 8,
            f: "DCTDecode",
            i: imageIndex,
            data: imageData
        };
        images[imageIndex] = info;
        if (!w && !h) {
            w = -96;
            h = -96;
        }
        0 > w && (w = -1 * info["w"] * 72 / w / this.internal.scaleFactor);
        0 > h && (h = -1 * info["h"] * 72 / h / this.internal.scaleFactor);
        0 === w && (w = h * info["w"] / info["h"]);
        0 === h && (h = w * info["h"] / info["w"]);
        this.internal.write("q", coord(w), "0 0", coord(h), coord(x), vcoord(y + h), "cm /I" + info["i"], "Do Q");
        return this;
    };
}(jsPDF.API);