//Attributes required to update a pie chart properly. 
var selectedSector = null,
should_delete = false,
defaultPie = true,
defaultColorScale = d3.scale.ordinal().range(['#77AADD', '#EE8866', '#EEDD88', '#FFAABB', '#99DDFF', '#44BB99', '#BBCC33', '#AAAA00', '#DDDDDD']);
//The usual colourScale is d3.scale.category10() but this doesn't offer blindness accessability. 

//pie.js is run before force.js, so any shared variables are declared in pie.js.
//Use of the same colour scale variable appeared to be necessary upon coming across a bug whereby the same set of colours
//were used in both the RHS and corresponding LHS pie, but for different variable outcomes.
//The RHS pie was correctly following the colour ordering of category10 (id 1 is blue, 2 is orange, 3 is green etc.), while
//the LHS pie wasn't. Sharing a colour scheme fixed this issue. 

d3v5.select(window)
  .on("keydown", keydown)
  .on("keyup", keyup);

var pieContainer = d3v5.select("#pieChartDiv").append('svg')
  .attr("width", width)
  .attr("height", height)
  .append('g')
  .attr('transform', 'translate(' + (width/ 2) + ',' + (height/ 2) + ')')

var pieArc = d3v5.arc()
    .innerRadius(0)
    .outerRadius(radius);

var varPie = d3v5.pie()
  .value(function(d) { return math.number(d.value); })
  .sort(null);

function getPieValues(){
  var pieValues = [];
  for(var d = 0; d < pieDataset.length; d++){
      var sector  = pieDataset[d];
      pieValues.push(sector.value);
  }
  return pieValues;
}

function generatePieColourScale(dataSet){
  if (selectedSector){
    var colourArr = dataSet.map(function(currentDatum){
      if(currentDatum.id == 0){
        return '#ffffff';
      }
      else if (selectedSector.id === currentDatum.id){
        return defaultColorScale(currentDatum.id);
      }
      else{
        return "#a3a9a8";
      }
    });
  }
  else if(observedValue){
    var colourArr = dataSet.map(function(currentDatum){
      if(currentDatum.id === 0){
        return '#ffffff';
      }
      else if (observedValue.id === currentDatum.id){
        return defaultColorScale(currentDatum.id);
      }
      else{
        return "#a3a9a8";
      }
    });
  }
  else{ //Standard pie colour display
    var colourArr = dataSet.map(function(currentDatum){
      if(currentDatum.id === 0){ 
        //id = 0 indicates whitespace, as values add up to less than 1. 
        return '#ffffff';
      }
      else{
        return defaultColorScale(currentDatum.id);
      }
    });
  }
  var colorScale = d3.scale.ordinal().range(colourArr);
  return colorScale;
} 

function generatePie(typeOfUpdate){
  var valArray = pieDataset.map(function(sector){return sector.value})
  var sum = math.fraction(valArray.reduce((partialSum, n) => partialSum.add(new math.fraction(n)), math.fraction(0)));
  var fullCirclePieDataset = pieDataset.slice();
  var sumToOne = d3.select("#pieSumToOneIndicator");
  var HTMLsumToOne = document.getElementById("pieSumToOneIndicator");
  var sumDisplay = d3.select("#pieSum");
  if(math.fraction(1) > sum || math.fraction(1) < sum){ 
    //!== not supported in math.fraction
    if(pieDataset.length !== 0){
      sumToOne.text("\u2718");
      HTMLsumToOne.style.color = 'red';
      var fullyDecimal = valArray.every(val => typeof val === 'number');
      if(fullyDecimal){
        sumDisplay.text("(" + sum + ")");
      }
      else{
        sumDisplay.text("(" + sum.n + "/" + sum.d + ")");
      }
    }
    fullCirclePieDataset.push({"label": "", "id": 0, "value": 1 - sum});
  }
  else{
    sumToOne.text("\u2714");
    HTMLsumToOne.style.color = 'darkgreen';
    sumDisplay.text("");
    if(conditionalTable === null){ 
      if(typeOfUpdate){
        pieUpdated(); //Pie chart is valid, so update the graph accordingly. 
      //Conditoned on nodes don't change in pie form on the network.
      }
      if(typeOfUpdate == "delete" || typeOfUpdate == "add"){
        updateConditonalityFromPie();
      }
    }
  }

  processedPieDataset = new Array();
  for(var s = 0; s < fullCirclePieDataset.length; s++){
    var sector = fullCirclePieDataset[s];
    if(sector.value !== 0.0){
      processedPieDataset.push(sector);
    }
  }
  colorScale = generatePieColourScale(processedPieDataset); 
  
  piePath = pieContainer.selectAll('path')
    .data(varPie(processedPieDataset), function(d){return d.data.id})
    .enter()
    .append('path')
    .attr('d', pieArc)
    .attr('fill', function(d) {return colorScale(d.data.id);})
    .attr("stroke", "black")
    .style("stroke-width", "1px")
    .each(function(d) {this._current = d;})
    .classed("selected", function(d) {return d === selectedSector;});

  piePath
    .on('click', sectorClick);
  
  pieText = pieContainer.selectAll('labels')
    .data(varPie(processedPieDataset), function(d){return d.data.id})
    .enter()
    .append('text')
    .attr('d', pieArc)
    .text(function(d){return d.data.label}) 
    .attr("transform", function(d) { return "translate(" + pieArc.centroid(d) + ")"; })
    .attr("style", "font-family: arial; font-size: 20; fill: black; stroke: none; text-anchor: middle");
  
  var legendRectSize = 25; // defines the size of the colored squares in legend
  var legendSpacing = 6; // defines spacing between squares

  var legend = pieContainer.selectAll('.legend')
    .data(colorScale.domain())
    .enter() // creates placeholder
    .append('g') // replace placeholders with g elements
    .attr('class', 'legend') // each g is given a legend class
    .attr('transform', function(d, i) {                   
      var height = legendRectSize + legendSpacing; // height of element is the height of the colored square plus the spacing      
      var offset =  height * colorScale.domain().length / 2; // vertical offset of the entire legend = height of a single element & half the total number of elements  
      var horz = 18 * legendRectSize; // the legend is shifted to the left to make room for the text
      var vert = i * height - offset; // the top of the element is hifted up or down from the center using the offset defiend earlier and the index of the current element 'i'               
        return 'translate(' + horz + ',' + vert + ')'; //return translation       
     });
  
  // adding colored squares to legend
  legend.append('rect') // append rectangle squares to legend                                   
    .attr('width', legendRectSize) // width of rect size is defined above                        
    .attr('height', legendRectSize) // height of rect size is defined above                      
    .style('fill', colorScale) // each fill is passed a color
    .style('stroke', colorScale) // each stroke is passed a color
    .on('click', function(label) {
      var rect = d3.select(this); // this refers to the colored squared just clicked
      var enabled = true; // set enabled true to default 
    });
  
  // adding text to legend - seems to cause a lot of problems in code.
  //legend.append('text')                                    
  //  .attr('x', legendRectSize + legendSpacing)
  //  .attr('y', legendRectSize - legendSpacing)
  //  .text(function(d) { return d; }); // return label 

  singleValuePieCheck();
}

function decimalOrFraction(){
  var inputSwitchChecked = inputSwitchState_viewer();
  if(inputSwitchChecked){ //Fraction
    displayUpdate_viewer("sectorDecimal", "none");
    changeFraction_viewer("inline-block");
  } else {
    displayUpdate_viewer("sectorDecimal", "inline-block"); 
    changeFraction_viewer("none");
  }
}

function dropDownSectorSelected(){
  var optionSelected = this.options[this.selectedIndex].text;
  var selected = true;
  if(optionSelected === "None"){
    selectedSector = null;
    textUpdate_viewer("pieInstruction1", "To view/edit a pie sector, click on it or use the drop-down:"  + "\u00A0")
    if(!isConditional_model()){ 
      textUpdate_viewer("pieSectorAddOrModify", "Add");
      textUpdate_viewer("pieInstruction2", "To add a variable option, enter its value and probability: ");
    }
    else{
      textUpdate_viewer("pieInstruction2", "When done, press 'Update Table' to confirm any changes.");
    }
    inputsClear_viewer();
    resetPie();
    generatePie(null);
    transitionPie();
    setTimeout(function () {selected = false;}, 100);
    return;
  }
  pie.value(function(sector) {
    if(selected){
      if (sector.label === optionSelected){
        selectedSector = sector;
        inputsClear_viewer();
        sectorSelected();
        resetPie();
        generatePie(null);
        transitionPie();
        setTimeout(function () {selected = false;}, 100);
      }
    } 
    //Necessary as otherwise the D3 function run every time pie is updated, leading
    //to incorrect setting of SelectedSector. 
  });
}

function sectorSelected(){
  textUpdate_viewer("pieSectorAddOrModify", "Modify");
  textUpdate_viewer("pieInstruction1", "Press enter to select this as the observed value: " + "\u00A0");
  //\u00A0 is the unicode literal for a non breaking space. 
  textUpdate_viewer("pieInstruction2", "Modify this sector by changing its value or probability: ");
  valueUpdate_viewer("sectorName", selectedSector.label);
  //Get the sector's value from the dataset, as it'll indicate whether it was entered as a decimal or fraction. 
  for (var index = 0; index < pieDataset.length; ++index) { 
    var sector = pieDataset[index];
    if(sector.id === selectedSector.id){
      selectedSectorValue = sector.value;
    }
  }
  var inputSwitch = document.getElementById('switchCheckBox');
  if(typeof selectedSectorValue === 'number'){ //i.e. The value was entered as a decimal.
    valueUpdate_viewer("sectorDecimal", selectedSector.value);
    if(inputSwitch.checked){ //i.e. on fraction input currently
      document.getElementById('switchCheckBox').click();  
      inputSwitch.setAttribute("aria-valuenow", "Decimal");                      //<--------------
    }
  }
  else{ //The value was entered as a math.js fraction, which is an object.
    var fraction = selectedSector.value;
    valueUpdate_viewer('sectorNumerator', selectedSectorValue.n);
    valueUpdate_viewer('sectorDenominator', selectedSectorValue.d);
    if(!inputSwitch.checked){ //i.e. on decimal input currently
      document.getElementById('switchCheckBox').click();
      inputSwitch.setAttribute("aria-valuenow", "Fraction");
    }
  }
}

function sectorClick(clickedSector){ 
  console.log("selected sector" + selectedSector)
  if(clickedSector.data.id !== 0){ //As id = 0 indicates pie whitespace. 
    deletingAffectsGraph = false; 
    if(selectedSector === null){
      var label = clickedSector.data.label;
      sectorOptionSelected_viewer(label);
      selectedSector = clickedSector.data;
      sectorSelected();
    }
    else{
      if(clickedSector.data.id === selectedSector.id){
        selectedSector = null;
        sectorOptionSelected_viewer("None");
        inputsClear_viewer();
        if(!isConditional_model()){ 
          textUpdate_viewer("pieSectorAddOrModify", "Add");
          textUpdate_viewer("pieInstruction1", "To view/edit a pie sector, click on it or use the drop-down:");
          textUpdate_viewer("pieInstruction2", "To add a variable option, enter its value and probability: ");
        }
        else{
          textUpdate_viewer("pieInstruction1", "To view/edit a pie sector, click on it or use the drop-down:" + "\u00A0");
          textUpdate_viewer("pieInstruction2", "When done, press 'Update Table' to confirm any modifications.");
        }
      }
      else{
        var label = clickedSector.data.label;
        sectorOptionSelected_viewer(label);
        selectedSector = clickedSector.data;
        inputsClear_viewer();
        sectorSelected();
      }
    }
    resetPie();
    generatePie(null);
    transitionPie();
  }
} 

function transitionPie(){
  function arcTransition(a) {
    var i = d3v5.interpolate(this._current, a);
    this._current = i(0);
    return function(t) {
      return pieArc(i(t));
    };
  }

  piePath.transition() 
    .duration(750) 
    .attr('d', pieArc)
    .attr('fill', function(d) {return colorScale(d.data.id);})
    .attrTween("d", arcTransition);

  pieText.transition() 
    .duration(750) 
    .attr('d', pieArc)
    .text(function(d){return d.data.label}) // + ". " + math.format(d.data.value, 2)})
    .attr("transform", function(d) { return "translate(" + pieArc.centroid(d) + ")"; });
}

function resetPie(){
  piePath
    .data(varPie([]), function(datum){return datum.data.id})
    .exit()
    .remove();
  

  pieText
    .data(varPie([]), function(datum){return datum.data.id})
    .exit()
    .remove();

  var pieArc = d3v5.arc()
    .innerRadius(0)
    .outerRadius(radius);
}


function sectorAdd(){
  function nameUnique(sectorName){
    for (var i = 0; i < pieDataset.length; ++i) {
      var sector = pieDataset[i];
      if(sector.label === sectorName){
        return false;
      }
    }
    return true;
  }
  if(!isConditional_model()){ 
    //Can only add a sector if the node isn't conditional on others. 
    var sectorName = valueGet_viewer("sectorName");
    if(sectorName === ""){
      throwPieError_viewer("Please enter a value!");
      return;
    }
    if(!nameUnique(sectorName)){
      throwPieError_viewer("This value would be a duplicate on this pie chart!");
      inputsClear_viewer();
      return;
    }
    var sectorValue = valueGet_viewer("sectorDecimal");
    if(sectorValue === ""){ //Didn't enter a decimal - i.e. enter as fraction
      fractionClear_viewer();
      if(sectorDen === "" ||sectorNum === ""){
        throwPieError_viewer("Enter a decimal or fraction!");
        return;
      }
      if(+sectorNum >= +sectorDen){
        throwPieError_viewer("Fraction must be proper!");
        fractionClear_viewer();
        return;
      }
      var sectorValue = math.fraction(+sectorNum, +sectorDen); 
    }
    else{ //Entered Decimal
      sectorValue = +sectorValue;
      if(+sectorValue < 0 || +sectorValue > 1){
        throwPieError_viewer("The probability of a value occurring must be between 0 and 1!");
        valueUpdate_viewer('sectorDecimal', "");
        return;
      }
      fractionClear_viewer();
    }
    var currentids = new Set(pieDataset.map(function(d){return d.id;}));
    var nextid = 1;
    while(currentids.has(nextid)){
      nextid++;
    }
    var sector = {id: nextid, label: sectorName, value: sectorValue};
    pieDataset.push(sector);
    addVariableValue_model(sectorName);
    inputsClear_viewer();
    displaySectorOptions();
    resetPie();
    generatePie("add");
    transitionPie();
  }
  else{
    throwPieError_viewer("You cannot add values to a conditional node!");
  }
}

function sectorModify(){
  var sectorName = valueGet_viewer("sectorName");
  if(sectorName === ""){
    throwPieError_viewer("Enter a value!");
    return;
  }
  updateVariableValue_model(selectedSector.label, sectorName);
  selectedSector.label = sectorName;
  var inputSwitch = checkedGet_viewer("switchCheckBox");
  if(inputSwitch){ //Fraction
    var sectorNum = valueGet_viewer("sectorNumerator");
    var sectorDen = valueGet_viewer("sectorDenominator");
    if(sectorDen === "" ||sectorNum === ""){
      throwPieError_viewer("Enter a decimal or fraction!");
      return;
    }
    if(+sectorNum >= +sectorDen){
      throwPieError_viewer("Fraction must be proper!");
      fractionClear_viewer();
      return;
    }
    var sectorValue = math.fraction(+sectorNum, +sectorDen);   
  }
  else{
    var sectorValue = d3.select("#sectorDecimal").property('value');
    sectorValue = +sectorValue; //Convert from sting to numeric. 
    if(sectorValue < 0 || sectorValue > 1){
      throwPieError_viewer("The probability of a value occuring must be between 0 and 1.");
      valueUpdate_viewer('sectorDecimal',  "");
      return;
    }
    fractionClear_viewer();
  }
  if(pieDataset.length == 2){
    for (var index = 0; index < 2; ++index) {
      var sector = pieDataset[index];
      if(sector.id === selectedSector.id){
        sector.value = sectorValue;
        pieDataset[index] = sector;
      }
      else{
        if(typeof selectedSectorValue === 'number'){
          sector.value = 1.0 - sectorValue;
          pieDataset[index] = sector;
        }
        else{
          sector.value = math.fraction(1 - sectorValue);
          pieDataset[index] = sector;
        }
      }
    }
  }
  else{
    for (var index = 0; index < pieDataset.length; ++index) {
      var sector = pieDataset[index];
      if(sector.id === selectedSector.id){
        sector.value = sectorValue;
        pieDataset[index] = sector;
      }
    }
  }
  resetPie();
  generatePie("modify");
  transitionPie();
}

function renamePieOnClick(){
  var buttonText = textGet_viewer('renameButton');
  if(buttonText === "Rename Variable"){
    textUpdate_viewer("pieChartName", "");
    displayUpdate_viewer("pieChartNameInput", "inline-block");
    valueUpdate_viewer("pieChartNameInput", variableName);
    textUpdate_viewer("renameButton", "Confirm Rename");
  }
  else{
    var newPieName = valueGet_viewer("pieChartNameInput");
    if(newPieName === ""){
      throwPieError_viewer("Enter a name!");
      return;
    }
    if(!nameUnique(newPieName) && (newPieName !== variableName)){
      throwPieError_viewer("A variable named " + newPieName + " exists!");
      return;
    }
    variableName = newPieName;
    displayUpdate_viewer("pieChartName", "inline-block");
    textUpdate_viewer("pieChartName", variableName);
    displayUpdate_viewer("renameButton",  "none");
    displayUpdate_viewer('pieChartNameInput', "none");
    pieNameChange(newPieName);
    textUpdate_viewer("renameButton","Rename Variable");
  }
}

function addOrModifyOnClick(){
  var buttonText = textGet_viewer("pieSectorAddOrModify");
  if(pieDataset.length !== 0){
    if(buttonText === "Add"){
      sectorAdd();
    }
    else{
      sectorModify();
    }
  }
  else{
    throwPieError_viewer("Select a variable in the network.");
  }
}

function displayPie(d, upperInstruction, lowerInstruction){
  //Viewer Commands (reset from past pie display)
  inputsClear_viewer();
  if(d !== null){
    displayPie_viewer(d.name);
    displayRename_viewer();
  }
  else{
    displayPie_viewer("Variable Pie Chart Display");
  }
  pieInstructionsUpdate_viewer(upperInstruction, lowerInstruction);
  tableRemove_viewer()
  
  //State Commands
  if(d !== null){
    variableName = d.name;
    variableValuesInput_model(d.values);
    observedValue = d.observedValue;
  }
  else{
    variableName = ""; //Could be null? Check implications. 
    variableValuesInput_model(null);
    observedValue = null;
  }
  selectedSector = null;
  selectedCell = null;
}

function displayDefaultPie(upperInstruction, lowerInstruction){
  //Viewer Commands
  displayPie(null, upperInstruction, lowerInstruction);
  textUpdate_viewer("pieSectorAddOrModify", "Add");
  removeTable();
  
  //State commands    
  pieDataset = [];
  conditionedOnVariables = null;
  conditionedOnLabels = null;
  conditionalTableInput_model(null);
  sectorOptionsDropDownRemove_viewer();
  resetPie();
  generatePie(null);
  transitionPie();
  return false;
}

function displayUnconditionalPie(d){
  //Viewer Commands
  displayPie(d,
    "To view/edit a pie sector, click on it or use the drop-down:" + "\u00A0",
    "To add a variable option, enter it's value and probability: " + "\u00A0"
  );
  //\u00A0 is the unicode literal for a non breaking space.
  textUpdate_viewer("pieSectorAddOrModify", "Add");
  textUpdate_viewer("pieSumToOneText", "Probabilities sum to 1:" + "\u00A0");
  removeTable();

  //State Commands
  pieDataset = d.marginalTable.slice();
  conditionedOnVariables = null;
  conditionedOnLabels = null;
  conditionalTableInput_model(null);
  displaySectorOptions(); //From which viewer commands are called.
  resetPie();
  generatePie(null);
  transitionPie();
  return false;
}


function displayConditionalPie(d, conditionedOnPies, conditionedLabels){
  //Viewer Commands
  displayPie(d,
    "Click a table cell to bring up its pie chart.",
    "To add a variable option, enter its value and probability: " + "\u00A0"
  );
  textUpdate_viewer("pieSectorAddOrModify", "Modify");
  displayUnclickedTable();

  //State Commands
  pieDataset = [];
  conditionedOnVariables = conditionedOnPies;
  conditionedOnLabels = conditionedLabels;
  var conditionalTableCopy = d.conditionalTable.slice();
  conditionalTableInput_model(conditionalTableCopy);
  sectorOptionsDropDownRemove_viewer()
  resetPie();
  generatePie(null);
  transitionPie();
  generateTable();
  return false;
}

function displayConditionalPieGivenConditionals(depdencyIndicatorText, newPieDataset){
  //Viewer Commands
  pieInstructionsUpdate_viewer(
    "Modify the variable's values and press 'Update Table' when done:" + "\u00A0",
    "",
  );
  textUpdate_viewer("pieChartDependencyIndicator", depdencyIndicatorText);
  textUpdate_viewer("pieSumToOneText", "Probabilities sum to 1:" + "\u00A0");  
  inputsClear_viewer();
  
  //State Commands
  selectedSector = null;
  pieDataset = newPieDataset;
  resetPie();
  generatePie(false);
  transitionPie();
}

function singleValuePieCheck(){
  var numberOfZeroEntries = 0;
  var numberOfOneEntries = 0;
  var onlySector = null;
  for(var d = 0; d < pieDataset.length; d++){
    var data = pieDataset[d];
    if(math.number(data.value) == 0){
      numberOfZeroEntries++
    }
    else if(math.number(data.value) == 1){
      numberOfOneEntries++
      onlySector = data;
    }
  }
  if(numberOfZeroEntries == (pieDataset.length - 1) && numberOfOneEntries == 1){
    selectedSector = onlySector;
    sectorSelected();
  }
}

function keydown() {
  switch (d3v5.event.keyCode) {
    case 8: { //Delete
      if(shift && !deletingAffectsGraph){
        deleteSector();
      }
      break;
    }
    case 13:{ //Enter 
      if(!observedValue){ 
        observedValue = {"label": selectedSector.label, "id": selectedSector.id, "value": 1};
        pieUpdated();
      }
      else{
        if(observedValue.label !== selectedSector.label){
          observedValue = {"label": selectedSector.label, "id": selectedSector.id, "value": 1};
          pieUpdated();
        }
        else{
          observedValue = null;
          pieUpdated();
        }
      }
      break
    }
  }
}

function keyup() {
  switch (d3v5.event.keyCode) {
    case 16: { // shift
      shift = false;
    }
  }
}
  
function deleteSector(){
    if(!isConditional_model()){
      //Can only delete a sector if the node isn't conditional on others. 
      if(selectedSector){ 
        pieDataset = pieDataset.filter(function(currentDatum){return selectedSector.id !== currentDatum.id});
        var sectorName = selectedSector.label;
        removeVariableValue_model(sectorName);
        selectedSector = null;
        
        //Viewer
        textUpdate_viewer("pieSectorAddOrModify", "Add");
        inputsClear_viewer();

        //State 
        displaySectorOptions(); //From which viewer commands are called.
        resetPie();
        generatePie("delete");
        transitionPie();  
      }
    }
  else{
    throwPieErrow_viewer("A value can't be removed from a conditional node.");
  }
}

function checkProbabilitySum(){ 
  var sum = pieDataset.map(function(sector){return sector.value}).reduce((partialSum, n) =>  partialSum.add(new math.fraction(n)), math.fraction(0));
  //Convert all values to fractions to ensure accurate addition (e.g. 1/3 + 1/3 + 1/3 = 1, rather than a result just under 1 due to storage representations)
  if(math.fraction(1).equals(math.fraction(sum))){
    return true;
  }
  else{
    return false;
  }
}