var sectorOptionsDropDown = null; //Initially there's no sectorOptions. 
//----------------------------------VIEWER -> PRESENTER------------------------------------
function sectorOptionChanger_viewer(){
    sectorOptionsDropDown.addEventListener('change', dropDownSectorSelected);
}
//----------------------------------VIEWER <- PRESENTER------------------------------------
function sectorOptionsDropDownContainer_viewer(){
    var container = document.getElementById("sectorSelectionContainer");
    return container;
}

function sectorOptionsDropDownRemove_viewer(){
    if(sectorOptionsDropDown){sectorOptionsDropDown.remove();}
}

function sectorOptionSelected_viewer(option){
    sectorOptionsDropDown.value = option;
    sectorOptionsDropDown.selected = option;
}

function sectorOptionsDropDown_viewer(){
    sectorOptionsDropDown = document.createElement("select");
    sectorOptionsDropDown.classList.add("inline");
    sectorOptionChanger_viewer();
    return sectorOptionsDropDown;
} 

function sectorOption_viewer(sector){
    var option = document.createElement('option');
    option.value = sector;
    option.innerHTML = sector;
    sectorOptionsDropDown.appendChild(option);
    return option;
}