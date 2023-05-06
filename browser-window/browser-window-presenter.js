function resizeWindow(){
    windowWidth = windowWidth_viewer();
    windowHeight = windowHeight_viewer();

    var svg = document.getElementById("networkSVG");
    svg.setAttribute("width", windowWidth * 0.6);
    svg.setAttribute("height", windowHeight * 0.75);
    
    //The svg's rectangle, used to distinguish dragging, zooming and clicking actions
    //must also be scaled to ensure the svg remains fully responsive. 
    
    svgReaction = document.getElementById("networkSVGReaction");
    svgReaction.setAttribute("width", windowWidth * 0.6);
    svgReaction.setAttribute("height", windowHeight * 0.75);
}