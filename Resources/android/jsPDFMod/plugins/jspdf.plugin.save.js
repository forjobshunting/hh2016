!function(jsPDFAPI) {
    "use strict";
    jsPDFAPI.save = function(file) {
        file.exists() && file.deleteFile();
        var res = this.output();
        var parts = res.split(/#image\s([^#]*)#/gim);
        var imgFile, intNode = 0, intNodes = parts.length;
        for (intNode = 0; intNodes > intNode; intNode += 1) switch (intNode % 2 ? false : true) {
          case true:
            file.write(parts[intNode], true);
            break;

          case false:
            imgFile = Ti.Filesystem.getFile(parts[intNode]);
            imgFile.exists() && file.write(imgFile.read(), true);
        }
        return this;
    };
}(jsPDF.API);

!function(jsPDFAPI) {
    "use strict";
    jsPDFAPI.test = function() {
        this.addPage();
        return this;
    };
}(jsPDF.API);