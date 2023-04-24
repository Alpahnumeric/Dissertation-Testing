function actionListener_viewer(action, elementID, functionToCall){
    var element = document.getElementById(elementID);
    element.addEventListener(action, functionToCall);
}

function clickListener_viewer(elementID, functionToCall){
    actionListener_viewer("click", elementID, functionToCall);
}

function textUpdate_viewer(elementID, text){
    var element = document.getElementById(elementID);
    //Whether it's textContent/innerText is browser-dependant.
    element.textContent = text;
    element.innerText = text;
    return element;
}

function textRemove_viewer(elementID){
    var element = document.getElementById(elementID);
    //Whether it's textContent/innerText is browser-dependant.
    element.textContent = "";
    element.innerText = "";
    return element;
}

function textGet_viewer(elementID){
    var element = document.getElementById(elementID);
    //Whether it's textContent/innerText is browser-dependant.
    return element.textContent || element.innerText;
}

function colourUpdate_viewer(elementID, colour){
    var element = document.getElementById(elementID);
    element.style.color = colour;
    return element;
}

function backgroundColourUpdate_viewer(elementID, backgroundColour){
    var element = document.getElementById(elementID);
    element.style.background = backgroundColour;
    return element;
}

function displayUpdate_viewer(elementID, display){
    var element = document.getElementById(elementID);
    element.style.display = display; 
    return element;
}