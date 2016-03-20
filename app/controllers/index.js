var _jsPDF = require('jsPDFMod/TiJSPDF');
Ti.Database.install('/EHS_CHILDCARE.sqlite', 'EHS_CHILDCARE2');
var doc;

//this is feature123

function testKeyboard(){
	//$.testText.softKeyboardOnFocus =Ti.UI.Android.SOFT_KEYBOARD_SHOW_ON_FOCUS;
	$.testText.returnKeyType = Titanium.UI.RETURNKEY_NEXT;	
}

function doClick(e) {
	doc = new _jsPDF();
	doc.setFont('times');
	doc.setFontSize(8);	
	
	var db = Ti.Database.open('EHS_CHILDCARE2');
	var staffTB = db.execute('SELECT * FROM LKSTAFF');
	
	$.label.text="There are "+staffTB.rowCount+" rows in LKSTAFF table.";
	
	var x=20, y=20;
	
	while (staffTB.isValidRow()){
		var sen='FIRSTNAME : ' + staffTB.fieldByName('FIRSTNAME');
		var text= sen + " how long: "+getTextWidth(sen);
		
		doc.text(x,y+=10, text );
		//Ti.API.info(text);
		staffTB.next();
		if(x%800==0){
			doc.addPage();
			y=20;
		}
	}
	db.close();
	
	var testFile = Ti.Filesystem.getFile(Ti.Filesystem.getTempDirectory(), '_test.pdf');
	doc.save(testFile);

	var testPDF = Ti.Filesystem.getFile(Ti.Filesystem.getExternalStorageDirectory()  + 'test.pdf');
	testPDF.write(testFile.read());
    
}

var getTextWidth = function(text) {
	//var textWidth = 100;

	//doc.getTextDimensions('Text');
	var unitWidth = text.toString().length / 1.55;

	var textWidth = unitWidth * doc.internal.getFontSize() / doc.internal.scaleFactor;
	Ti.API.info("getFontSize: "+doc.internal.getFontSize() +" scaleFactor: "+ doc.internal.scaleFactor);

	return textWidth;
};

var writeLine = function(text, options) {
	if ( typeof text !== 'string') {
		return;
	}

	var defaults = {
		align : 'left', // Can be 'left', 'center', or 'right'
		style : 'normal', // Can be 'normal', 'bold', 'italic', or 'bolditalic'
		color : [0, 0, 0], // RGB color for text
		skipLines : 1, // The number of lines to advance the cursor afterward
		limitWidth : // Text will wrap after this width
		doc.internal.pageSize.width - settings.pageMargin * 2,
		xOffset : 0, // Offset the cursor horizontally
		yOffset : 0 // Offset the cursor vertically
	};

	var position = {
		x : settings.pageMargin,
		y : settings.verticalCursor
	};
	var opts = mergeObjects(defaults, options);
	var textWidth,
	    wrappedLines;

	// Set up options
	doc.setFontType(opts.style);
	doc.setTextColor(opts.color[0], opts.color[1], opts.color[2]);

	if (opts.align === 'center') {
		//position.x = 10;
		position.x = getTextCenter(text, doc);
	}

	if (opts.align === 'right') {
		//position.x = 10;
		position.x = getTextRight(text, doc);
	}

	// If text is horizontally offset, limit its width to 1/4 page unless explicitly set
	if (opts.limitWidth === doc.internal.pageSize.width && opts.xOffset > 0) {
		opts.limitWidth = doc.internal.pageSize.width / 4 - settings.pageMargin;
	}

	// Write the text
	if (settings.docMode === 'write') {
		doc.text(position.x + opts.xOffset, position.y + opts.yOffset, text);
	}

	// Advance the cursor
	textWidth = getTextWidth(text);

	if (textWidth <= opts.limitWidth && settings.addLines === 0) {
		settings.verticalCursor += opts.skipLines * settings.lineHeight;
	} else {
		// Text had to wrap, so the cursor needs to accommodate
		wrappedLines = Math.ceil(textWidth / opts.limitWidth);

		if (wrappedLines > settings.addLines) {
			settings.addLines = wrappedLines;
		}

		if (opts.skipLines > 0) {
			settings.verticalCursor += opts.skipLines * settings.lineHeight + settings.addLines * settings.wrapLineHeight;
			settings.addLines = 0;
		}
	}
};



$.index.open();
