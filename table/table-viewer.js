var table = document.getElementById("conditionalProbabilityTable");

//----------------------------------VIEWER -> PRESENTER------------------------------------
clickListener_viewer("conditionalProbabilityTable", tableClick);

clickListener_viewer("updateTableButton", tableUpdateButtonClick);

//----------------------------------VIEWER <- PRESENTER------------------------------------
function table_viewer(){ 
    textUpdate_viewer("probTableLabel", "Conditional Probability Table");
    textUpdate_viewer("probTableArrow", "↴");
    tableBorder_viewer("2");
    //updateTableButton and updateTableArrow are only displayed once a cell is clicked.
    return table;
}

function tableEmpty_viewer(){
    table.innerHTML = "";  
    return table;
}

function tableRemove_viewer(){
    tableEmpty_viewer();
    textRemove_viewer("probTableLabel");
    textRemove_viewer("probTableArrow");
    tableBorder_viewer("0");
    return table;
}

function tableModification_viewer(){
    textUpdate_viewer("updateTableArrow", "🠛"); //HTML code &#129051;
    displayUpdate_viewer("updateTableButton", "block");

}

function tableModificationRemove_viewer(){
    textRemove_viewer("updateTableArrow");
    displayUpdate_viewer("updateTableButton", "none");
    return table;
}

function tableBody_viewer(){
    var tableBody = document.createElement("tbody");
    return tableBody;
}

function tableBorder_viewer(border){
    table.setAttribute("border", border);
    return table;
}

function row_viewer(){
    var row = document.createElement("tr");
    return row;
}

function cellText_viewer(text){
    var cellText = document.createElement("p");
    cellText.classList.add("tabletext");
    cellText.innerHTML = text;
    return cellText;
}

function format1DCellText_viewer(cellVariable, cellValue, cellColour){
    var textOfCell =  cellVariable + "</strong>" + ": "    //\u{25A0} is ■
    + " <span class = 'tabletext square' style ='color:" +  cellColour + "'> \u{25A0}</span>" 
    + cellValue
    return textOfCell;
}

function format1DCellTextBold_viewer(cellVariable, cellValue, cellColour){
    var textOfCell = "<strong>" + cellVariable + "</strong>" + ": " 
    + " <span class = 'tabletext square' style ='color:" +  cellColour + "'> \u{25A0}</span>" 
    + cellValue
    return textOfCell;
}

function format2DCellText_viewer(variable1, value1, colour1, variable2, value2, colour2){
    var textOfCell = format1DCellTextBold_viewer(variable1, value1, colour1)
    + ", " 
    + format1DCellTextBold_viewer(variable2, value2, colour2);
    return textOfCell
}

function cell_viewer(elementID, backgroundColour){
    var cell = document.createElement("td");
    cell.id = elementID;
    cell.style.background = backgroundColour;
    cell.setAttribute("colour", backgroundColour); 
    cell.setAttribute("text-align", "center");
    cell.tabIndex = 0;
    return cell;
}

function cellColour_viewer(elementID, backgroundColour){
    var cell = document.getElementById(elementID);
    cell.setAttribute("colour", backgroundColour);
    cell.style.background = backgroundColour;
    return cell;
}

function elementHeirarchy_viewer(parentID, childID){
    var parentElement = document.getElementById(parentID);
    var childElement = document.getElementById(childID);
    parentElement.append(childElement);
}