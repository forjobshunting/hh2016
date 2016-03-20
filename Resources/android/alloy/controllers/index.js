function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function testKeyboard() {
        $.testText.returnKeyType = Titanium.UI.RETURNKEY_NEXT;
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "index";
    this.args = arguments[0] || {};
    if (arguments[0]) {
        {
            __processArg(arguments[0], "__parentSymbol");
        }
        {
            __processArg(arguments[0], "$model");
        }
        {
            __processArg(arguments[0], "__itemTemplate");
        }
    }
    var $ = this;
    var exports = {};
    var __defers = {};
    $.__views.index = Ti.UI.createWindow({
        backgroundColor: "white",
        id: "index"
    });
    $.__views.index && $.addTopLevelView($.__views.index);
    $.__views.label = Ti.UI.createLabel({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        color: "#000",
        font: {
            fontSize: 16
        },
        text: "Hello, World",
        id: "label",
        top: "80",
        left: "200"
    });
    $.__views.index.add($.__views.label);
    $.__views.createPDF = Ti.UI.createButton({
        title: "Create PDF",
        id: "createPDF",
        top: "100",
        left: "200"
    });
    $.__views.index.add($.__views.createPDF);
    testKeyboard ? $.addListener($.__views.createPDF, "click", testKeyboard) : __defers["$.__views.createPDF!click!testKeyboard"] = true;
    $.__views.testText = Ti.UI.createTextArea({
        id: "testText",
        top: "300",
        left: "200",
        width: "100",
        height: "40",
        backgroundColor: "#00ff00"
    });
    $.__views.index.add($.__views.testText);
    exports.destroy = function() {};
    _.extend($, $.__views);
    require("jsPDFMod/TiJSPDF");
    Ti.Database.install("/EHS_CHILDCARE.sqlite", "EHS_CHILDCARE2");
    $.index.open();
    __defers["$.__views.createPDF!click!testKeyboard"] && $.addListener($.__views.createPDF, "click", testKeyboard);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;