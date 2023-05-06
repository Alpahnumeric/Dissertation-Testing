//----------------------------------MODEL VIA PRESENTER------------------------------------
function variableValuesInput_model(input){
  variableValues = input; 
}

function removeVariableValue_model(value){
  var i = variableValues.indexOf(value);
  variableValues.splice(i, 1);
}

function addVariableValue_model(value){
  variableValues.push(value);
}

function updateVariableValue_model(oldValue, newValue){
  var sectorIndex = variableValues.indexOf(oldValue);
  variableValues[sectorIndex] = newValue;
}
//----------------------------------------------------------------------------------------

function displaySectorOptions(){
  sectorOptionsDropDownRemove_viewer();
  var sectorSelectionContainer = sectorOptionsDropDownContainer_viewer();
  sectorOptionsDropDown_viewer();
  sectorSelectionContainer.appendChild(sectorOptionsDropDown);
  sectorOption_viewer("None"); //i.e. no sector is selected.
  sectorOptionSelected_viewer("None");
  for (var value = 0;  value < variableValues.length; value++){
    var sector = variableValues[value];
    sectorOption_viewer(sector);
  }
}