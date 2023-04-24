d3.select("#networkSVG")
    .attr("width", windowWidth_viewer() * 0.6)
    .attr("height", windowHeight_viewer() * 0.75)
    .attr("class", "svg-style")
    .append("g");

d3.select("#networkSVGReaction")
    .attr("width", windowWidth_viewer() * 0.6)
    .attr("height", windowHeight_viewer() * 0.75)

function throwNetworkError_viewer(errorText){
    d3.select("#networkErrorAlert").text(errorText);
    setTimeout(function () {d3.select("#networkErrorAlert").text("");}, 3000);
}