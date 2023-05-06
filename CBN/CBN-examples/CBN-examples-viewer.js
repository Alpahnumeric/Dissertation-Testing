//----------------------------------VIEWER -> PRESENTER-----------------------------------
clickListener_viewer("exampleGraphOptions", exampleGraphSelected);
//----------------------------------VIEWER <- PRESENTER-----------------------------------
function home_viewer(){
    displayUpdate_viewer("pieContainer", "block");
    displayUpdate_viewer("instructionsContainer", "none");
}
    
function displayInstructions_viewer(){
    displayUpdate_viewer("pieContainer", "none");
    displayUpdate_viewer("instructionsContainer", "block");
}