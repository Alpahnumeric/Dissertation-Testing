//----------------------------------MODEL VIA PRESENTER------------------------------------
function conditionalTableInput_model(input){
    conditionalTable = input; 
}

function isConditional_model(){
    if(conditionalTable){
        return true;
    }
    else{
        return false;
    }
}
//----------------------------------------------------------------------------------------

var selectedCell = null;

function removeTable(){
    tableRemove_viewer();
    tableModificationRemove_viewer();
}

function displayUnclickedTable(){ table_viewer(); } 
//Required in the MVP model to ensure pie-presenter can't 
//directly call functions in table-viewer.

function generateTable(){
    var tableBody = tableBody_viewer();
    //1D Table
    if(conditionedOnVariables.length === 1){
      var numberOfEntries = conditionedOnLabels[0].length;
      var parentRow = row_viewer();
      var parentHeader = horizontalParentHeader_viewer(numberOfEntries);
      var parentHeaderText = horizontalParentHeaderText_viewer(conditionedOnVariables[0]);
      parentHeader.appendChild(parentHeaderText);
      parentRow.appendChild(parentHeader);
      tableBody.appendChild(parentRow);
      var row = row_viewer();
      for (let e = 0; e < numberOfEntries; e++) {
          cellPieData = conditionalTable[e];
          if(cellPieData.length == 0){
              var cell = cell_viewer(e, '#e0e0e0');
          }
          else{
              var cell = cell_viewer(e, '#f8f8f8');
          }
          var sectorLabel = conditionedOnLabels[0][e];
          var labelColour = defaultColorScale(sectorLabel.id);
          var textofCell = format1DCellText_viewer(conditionedOnVariables[0], sectorLabel.label, labelColour);
          + sectorLabel.label;
          var cellTextElement = cellText_viewer(textofCell);
          cell.append(cellTextElement);
          row.appendChild(cell);
      }
      tableBody.appendChild(row);
    }
    //2D Table
    if(conditionedOnVariables.length === 2){
      var numberOfRows = conditionedOnLabels[1].length;
      var numberOfColumns = conditionedOnLabels[0].length;

     //Create parent header value row
      var parentRow = row_viewer();
      var tableSpacing = TwoDimensionalTableGap();
      parentRow.appendChild(tableSpacing);
      var parentHeader = horizontalParentHeader_viewer(numberOfColumns);
      var parentHeaderText = horizontalParentHeaderText_viewer(conditionedOnVariables[0]);
      parentHeader.appendChild(parentHeaderText);
      parentRow.appendChild(parentHeader);
      tableBody.appendChild(parentRow);
      
      //Create header value row
      var headerRow = row_viewer();
      for(let c = 0; c < numberOfColumns; c++){
        var header = valueHeader_viewer();
        var sector = conditionedOnLabels[0][c];
        var headerText = cellText_viewer("Value: " + sector.label);
        header.append(headerText);
        headerRow.appendChild(header);
      }
      tableBody.appendChild(headerRow);

      //Create table rows
      for (let r = 0; r < numberOfRows; r++) {
        var row = row_viewer();
        if(r === 0){
            var parentHeader = verticalParentHeader_viewer(numberOfRows + 1);
            var parentHeaderText = verticalParentHeaderText_viewer(conditionedOnVariables[1]);
            parentHeader.appendChild(parentHeaderText);
            row.appendChild(parentHeader);
        }
        var header = valueHeader_viewer();
        var sector = conditionedOnLabels[1][r];
        var headerText = cellText_viewer("Value: " + sector.label);
        header.append(headerText);
        row.appendChild(header);
        for (let c = 0; c < numberOfColumns; c++) {
          // Create a <td> element and a text node, make the text
          // node the contents of the <td>, and put the <td> at
          // the end of the table row.
          var cellPieData = conditionalTable[c][r];
          var cellID = c +  "," + r; //Index of corresponding entry in conditionalTable. 
          if(cellPieData.length == 0){
              var cell = cell_viewer(cellID, '#e0e0e0');
          }
          else{
              var cell = cell_viewer(cellID, '#f8f8f8');
          }
          var sectorLabel1 = conditionedOnLabels[1][r];
          var labelColour1 = defaultColorScale(sectorLabel1.id);
          var sectorLabel2 = conditionedOnLabels[0][c];
          var labelColour2 = defaultColorScale(sectorLabel2.id);
          var textofCell = format2DCellText_viewer(
            conditionedOnVariables[1], sectorLabel1.label, labelColour1,
            conditionedOnVariables[0], sectorLabel2.label, labelColour2);
          var cellTextElement = cellText_viewer(textofCell);
          cell.append(cellTextElement);
          row.appendChild(cell);
        }
        //Add the row to the end of the table body
        tableBody.appendChild(row);
      }
    }
     //Put the <tbody> in the <table>
     table.appendChild(tableBody);
     //Appends <table> into <body>
     document.body.appendChild(table);
}
  
function tableClick(event){
    // Find out if the event targeted or bubbled through a `td` en route to this container element. 
    var element = event.target;
    var cell = null;
    while (element && !cell) {
        if (element.matches("td")) {
            //Found a `td` within the container.
            cell = element;
        } else {
            // Not found
            if (element === this) {
                // Reached the container, so stop. 
                element = null;
                return;
            } else {
                // Go to the next parent in the ancestry. 
                element = element.parentNode;
            }
        }
    }
    if (cell !== selectedCell) { 
        displaySectorOptions();
        var cellID = cell.id;
        backgroundColourUpdate_viewer(cell.id, '#90EE90');
        if(selectedCell){
            var selectedCellOriginalColour = selectedCell.getAttribute("colour");
            backgroundColourUpdate_viewer(selectedCell.id, selectedCellOriginalColour);
        }
        selectedCell = cell;
        var numberOfValues = variableValues.length;
        var tableIndicies = selectedCell.id.split(',');    
        if(conditionedOnVariables.length === 1){
            var cellPieData = conditionalTable[tableIndicies[0]];
        }
        else if(conditionedOnVariables.length === 2){
            var cellPieData = conditionalTable[tableIndicies[0]][tableIndicies[1]];
        }
        else if(conditionedOnVariables.length === 3){
            var cellPieData = conditionalTable[tableIndicies[0]][tableIndicies[1]][tableIndicies[2]];
        }
        if(cellPieData.length == 0){
        //Create default pie, with uniform sectors.
            var cellPieData = [];
            var sectorFraction = math.fraction(1, numberOfValues);
            for(var s = 0; s < numberOfValues; s++){
                cellPieData.push(sectorFraction);
            }
        }
        var newPieDataset = new Array;
        for (var s = 0; s < numberOfValues; s++){
            newPieDataset.push({"label": variableValues[s], "id": (s + 1), "value": cellPieData[s]});
        } 

        var cellText = cell.textContent;
        cellTextWithoutSquares = cellText.replace(/[\u25A0]/g,''); //Removes squares from text
        var dependencyText = "(" + cellTextWithoutSquares + ")";
        tableModification_viewer();
        displayConditionalPieGivenConditionals(dependencyText, newPieDataset);
    }
}

function tableUpdateButtonClick(){
    if(checkProbabilitySum()){
        updateTable();
    }
    else{
        textUpdate_viewer("pieErrorAlert", "Probabiltiies must sum to 1!");
        setTimeout(function () {textRemove_viewer("pieErrorAlert");}, 3000);
    }
}
  
function updateTable(){
    var text = "\u00A0 \u00A0 \u00A0 Updated";
    textUpdate_viewer("updatedTableIndicator", text);
    colourUpdate_viewer("updateTableArrow", "green");
    setTimeout(function () {
        textUpdate_viewer("updatedTableIndicator", "");  
        colourUpdate_viewer("updateTableArrow", "black");  
    }, 1000);
    var pieValues = getPieValues();
    var tableIndicies = selectedCell.id.split(',');
    if(conditionedOnVariables.length === 1){
        conditionalTable[tableIndicies[0]] = pieValues;
    }
    else if(conditionedOnVariables.length === 2){
        conditionalTable[tableIndicies[0]][tableIndicies[1]] = pieValues;
    }
    else if(conditionedOnVariables.length === 3){
        conditionalTable[tableIndicies[0]][tableIndicies[1]][tableIndicies[2]] = pieValues;
    }
    cellColour_viewer(selectedCell.id, "#f8f8f8");
    selectedCell = null;
    pieDataset = [];
    resetPie();
    generatePie(false);
    transitionPie();
}