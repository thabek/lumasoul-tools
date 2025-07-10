function Redraw() {
	var eventWait = charIDToTypeID("Wait");
	var enumRedrawComplete = charIDToTypeID("RdCm");
	var typeState = charIDToTypeID("Stte");
	var keyState = charIDToTypeID("Stte");
	var desc = new ActionDescriptor();
	desc.putEnumerated(keyState, typeState, enumRedrawComplete);
	executeAction(eventWait, desc, DialogModes.NO);
}
