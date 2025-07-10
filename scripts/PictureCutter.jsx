function PictureCutter() {
	this.config = {
		'windowsTitle': 'LumaSoul Picture Cutter Tool'
	};
	this.variants = [
		{
			'name': 'Standardowa piątka', 'width': 200, 'height': 100, 'coordinates': [
				{ 'x': 0.1, 'y': 0.5, 'width': 0.2, 'height': 0.6 },
				{ 'x': 0.3, 'y': 0.5, 'width': 0.2, 'height': 0.8 },
				{ 'x': 0.5, 'y': 0.5, 'width': 0.2, 'height': 1.0 },
				{ 'x': 0.7, 'y': 0.5, 'width': 0.2, 'height': 0.8 },
				{ 'x': 0.9, 'y': 0.5, 'width': 0.2, 'height': 0.6 },
			]
		},
		{
			'name': 'Równa trójka', 'width': 120, 'height': 80, 'coordinates': [
				{ 'x': 2 / 12, 'y': 0.5, 'width': 1 / 3, 'height': 1.0 },
				{ 'x': 0.5, 'y': 0.5, 'width': 1 / 3, 'height': 1.0 },
				{ 'x': 1 - 2 / 12, 'y': 0.5, 'width': 1 / 3, 'height': 1.0 },
			]
		}
	];
	this.document;
	this.errorWindow = function (message) {
		alert(message, this.config.windowsTitle, true);
	}
	this.windowDefinition = function () {
		return "dialog {\
			text: '"+ this.config.windowsTitle + "',\
			orientation: 'column',\
			alignChildren: 'fill',\
			variants: Panel {\
				text: 'Układy',\
				orientation: 'column',\
				alignChildren: 'fill'\
			},\
			options: Panel {\
				text: 'Opcje',\
				orientation: 'column',\
				alignChildren: 'fill',\
				newDocument: Checkbox {text: 'Utwórz nowy dokument', variableName: 'newDocument', value: true, helpTip: 'Tworzy nowy dokument i umieszcza w nim wycięte części'},\
				enabled: false,\
			},\
			buttons: Group {\
				ok: Button {text: 'OK', enabled: false},\
				cc: Button {text: 'Anuluj'}\
			}\
		}";
	}
	this.window = function () {
		var windowDefinition, window, a, variant;

		windowDefinition = this.windowDefinition();
		window = new Window(windowDefinition);
		window.defaultElement = window.buttons.ok;
		window.cancelElement = window.buttons.cc;

		window.result = { 'variantId': null, 'options': {} };

		for (a = 0; a < this.variants.length; a++) {
			variant = window.variants.add('radiobutton', undefined, this.variants[a].name);
			variant.onClick = function () {
				window.options.enabled = true;
				window.defaultElement.enabled = true;
			}
		}

		window.defaultElement.onClick = function () {
			var a;

			for (a = 0; a < window.variants.children.length; a++) {
				if (window.variants.children[a].value === true) {
					window.result.variantId = a;
					break;
				}
			}

			for (a = 0; a < window.options.children.length; a++)
				window.result.options[window.options.children[a].variableName] = window.options.children[a].value;

			window.close();
		}

		window.center();
		window.show();

		return window;
	}
	this.calculateBounds = function (document, variant) {
		var ratio, horizontalShift, verticalShift, bounds, a, coordinate;

		ratio = Math.max(variant.width / document.width.as('cm'), variant.height / document.height.as('cm'));
		horizontalShift = (document.width.as('cm') * ratio - variant.width) * 0.5;
		verticalShift = (document.height.as('cm') * ratio - variant.height) * 0.5;
		bounds = [];

		for (a = 0; a < variant.coordinates.length; a++) {
			coordinate = variant.coordinates[a];
			bounds.push([
				UnitValue(variant.width * coordinate.x + horizontalShift - variant.width * coordinate.width * 0.5, 'cm') / ratio,
				UnitValue(variant.height * coordinate.y + verticalShift - variant.height * coordinate.height * 0.5, 'cm') / ratio,
				UnitValue(variant.width * coordinate.x + horizontalShift + variant.width * coordinate.width * 0.5, 'cm') / ratio,
				UnitValue(variant.height * coordinate.y + verticalShift + variant.height * coordinate.height * 0.5, 'cm') / ratio
			]);
		}

		return bounds;
	}
	this.boundsToPoints = function (bounds) {
		return [
			[bounds[0].as('px'), bounds[1].as('px')],
			[bounds[2].as('px'), bounds[1].as('px')],
			[bounds[2].as('px'), bounds[3].as('px')],
			[bounds[0].as('px'), bounds[3].as('px')]
		];
	}
	this.createNewDocument = function (document) {
		return app.documents.add(
			null,
			null,
			document.resolution,
			document.name.substr(0, document.name.lastIndexOf('.')) + '_CUTTED' + document.name.substr(document.name.lastIndexOf('.')),
			NewDocumentMode.RGB,
			DocumentFill.TRANSPARENT,
			1,
			document.bitsPerChannel,
			'Adobe RGB (1998)'
		);
	}
	this.zoom = function () {
		var id57 = charIDToTypeID("slct");
		var desc15 = new ActionDescriptor();
		var id58 = charIDToTypeID("null");
		var ref6 = new ActionReference();
		var id59 = charIDToTypeID("Mn  ");
		var id60 = charIDToTypeID("MnIt");
		var id61 = charIDToTypeID("FtOn");
		ref6.putEnumerated(id59, id60, id61);
		desc15.putReference(id58, ref6);
		executeAction(id57, desc15, DialogModes.NO);
	}
	this.cutDocument = function (document, variant, options) {
		var newDocument, bounds, a, points, layer, group;

		if (options && options.newDocument && options.newDocument === true)
			newDocument = this.createNewDocument(document);

		bounds = this.calculateBounds(document, variant);

		for (a = 0; a < bounds.length; a++) {
			points = this.boundsToPoints(bounds[a]);

			if (app.activeDocument !== document)
				app.activeDocument = document;

			document.selection.select(points, SelectionType.REPLACE, 0, false);
			document.selection.copy(true);
			document.selection.deselect();

			if (newDocument) {
				if (app.activeDocument !== newDocument)
					app.activeDocument = newDocument;

				layer = newDocument.paste();
				layer.translate(bounds[a][0] - layer.bounds[0], bounds[a][1] - layer.bounds[1]);
				layer.move(newDocument, ElementPlacement.PLACEATEND);
			}
			else {
				if (app.activeDocument !== document)
					app.activeDocument = document;

				try { group = document.layerSets.getByName('CUTTED'); }
				catch (error) { group = document.layerSets.add(); }

				group.name = 'CUTTED';
				group.move(document, ElementPlacement.PLACEATBEGINNING);

				layer = document.paste();
				layer.translate(bounds[a][0] - layer.bounds[0], bounds[a][1] - layer.bounds[1]);
				layer.move(group, ElementPlacement.PLACEATEND);
			}
		}

		if (newDocument) {
			if (app.activeDocument !== newDocument)
				app.activeDocument = newDocument;

			newDocument.revealAll();
			newDocument.trim(TrimType.TRANSPARENT);
			newDocument.resizeImage(null, null, newDocument.resolution / Math.min(variant.width / newDocument.width.as('cm'), variant.height - newDocument.height.as('cm')), ResampleMethod.NONE);
			this.zoom();
		}
	}
	this.perform = function () {
		var input;

		input = this.window().result;
		// input = { 'variantId': 1, 'options': { 'newDocument': true } };

		if (input.variantId != null)
			this.cutDocument(app.activeDocument, this.variants[input.variantId], input.options);
	}
	this.run = function () {
		var dd, ru, uv;

		if (app.documents.length >= 1) {
			try {
				dd = app.displayDialogs;
				ru = app.preferences.rulerUnits;
				uv = UnitValue.baseUnit;

				app.displayDialogs = DialogModes.NO;
				app.preferences.rulerUnits = Units.CM;
				UnitValue.baseUnit = UnitValue(1 / app.activeDocument.resolution, 'in');

				this.perform();
			}
			catch (error) {
				this.errorWindow('ERROR!\n' + File(error.fileName).name + ', line ' + error.line + ':\n' + error.message);
			}
			finally {
				app.displayDialogs = dd;
				app.preferences.rulerUnits = ru;
				UnitValue.baseUnit = uv;
			}
		}
		else
			this.errorWindow('Brak otwartych dokumentów');
	}
	this.run();
}

// while (app.documents.length > 0)
// 	app.documents[0].close(SaveOptions.DONOTSAVECHANGES);

// app.open(File(File($.fileName).parent.parent + '/tmp/lakeview.psd'));

new PictureCutter();
