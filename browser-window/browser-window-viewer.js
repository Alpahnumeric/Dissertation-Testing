window.addEventListener('resize', resizeWindow);

function windowAddListener(onListener, functionToCall){
    window.addEventListener(onListener, functionToCall);
}

function windowWidth_viewer(){
    return window.innerWidth;
}

function windowHeight_viewer(){
    return window.innerHeight;
}