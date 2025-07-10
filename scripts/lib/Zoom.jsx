function Zoom() {
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
