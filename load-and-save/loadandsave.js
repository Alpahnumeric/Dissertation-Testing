//----------------------------------VIEWER -> PRESENTER-----------------------------------
clickListener_viewer("exportOptions", exportSelected);
d3.select("#uploadFile").on("change", uploadJSON);
//----------------------------------VIEWER <- PRESENTER-----------------------------------
function exportSelected(event){
    var element = event.target;
    var exportAction = null;
    while (element && !exportAction) {
        if (element.matches("button")) {
            exportAction = element;
        } else {
            // Not found
            if (element === this) {
                element = null;
            } else {
                element = element.parentNode;
            }
        }
    }
    if(exportAction){
        if(exportAction.id == "toPNG"){
            saveSvgAsPng(svg[0][0], "BayesianNetwork.png");
            //Using getSVG() from force-presenter does not recognise links/arrows. 
        }
        else if(exportAction.id == "toJSON"){
           var CBNData = generateJSON();
            var blob = new Blob([CBNData], {type:"text/plain;charset=utf-8"});
            saveAs(blob, "BayesianNetwork.json");	
        }
        else if(exportAction.id === "fromJSON"){
            document.getElementById("uploadFile").click();
        }
    }
}

function generateJSON(){
    //Gets a copy of the back-end CBN data structure from force-presenter
    var nodesCopy = getNodes();
    var linksCopy = getLinks();

    var nodeNames = new Array(); //Used to set links back to a {source: 0, target: 1} format. 
    //For Nodes change any fraction objects into a string representation. 

    function fractionConvert(sectorValue){
      console.log(sectorValue);
      console.log(typeof sectorValue);
        if(typeof sectorValue !== 'number'){
            var fractionString =  String(sectorValue.n + "/" + sectorValue.d);
            return fractionString;
        }
        else {
            return sectorValue; 
        }
    }

    for (var nodeIndex = 0; nodeIndex < nodesCopy.length; ++nodeIndex) {
      var node = nodesCopy[nodeIndex];
      delete node.weight;
      delete node.fixed;
      delete node.px;
      delete node.py;
      delete node.index;
      var nodeName = node.name;
      nodeNames.push(nodeName);
      var marginalTable = node.marginalTable;
      if(marginalTable !== null){
        for (var s = 0; s < marginalTable.length; ++s) { 
          var sector = marginalTable[s];
          var sectorValue = sector.value;
          sector.value = fractionConvert(sectorValue);
        }
      }
      else{
        var conditionalTable = node.conditionalTable;
        if(conditionalTable[0][0].constructor === Array){
          if(conditionalTable[0][0][0].constructor === Array){
            //4D array (for 3 conditionals)
            conditionalTable.map(function(conditional1) {
              return conditional1.map(function (conditional2){
                return conditional2.map(function (conditional3){
                  return conditional3.map(function (v){fractionConvert(v)});
                });
              });
            })
          }else{
            //3D array (for 2 conditionals)
            conditionalTable.map(function(conditional1) {
              return conditional1.map(function (conditional2){
                return conditional2.map(function (v){fractionConvert(v)});
              });
            })
          } 
        }
        else{
           //2D array, for 1 conditional
           conditionalTable.map(function(conditional1) {
            return conditional1.map(function (v){fractionConvert(v)}
            );
          })
        }
      }
    }

    for (var linkIndex = 0; linkIndex < linksCopy.length; ++linkIndex) {
        var link = linksCopy[linkIndex];
        var linkSource = link.source.name;
        var linkSourceIndex = nodeNames.indexOf(linkSource);
        var linkTarget = link.target.name;
        var linkTargetIndex = nodeNames.indexOf(linkTarget);
        linksCopy[linkIndex] = {"source": linkSourceIndex, "target": linkTargetIndex};
    }
    var CBNData = JSON.stringify({
        "nodes": nodesCopy,
        "links": linksCopy
    }, null, 2);
    return CBNData;
}

function uploadJSON(){
  if(window.Blob && window.File && window.FileReader && window.FileList) {
    var fileReader = new FileReader();
    var fileUploaded = d3.select("#uploadFile").node().files[0];
    if(fileUploaded.type !== "application/json"){
        throwNetworkBasedError("The file must be a JSON file!");
    }
    fileReader.readAsText(fileUploaded); 
    //The FileReader API is asynchronous so attach an onload event handler to the reader object.
    fileReader.onload = function() {
      try {
        var jsonFile = JSON.parse(fileReader.result);
      }
      catch(err) {
        throwNetworkBasedError("An error occured whilst reading the file.");
        return;
      }
      var nodeInput = jsonFile.nodes;
      var linkInput = jsonFile.links;
      if(nodeInput=== "undefined"){
        throwNetworkBasedError("The file doesn't contain nodes.");
      }
      var linkInput = jsonFile.links;
      if(linkInput === "undefined"){
        throwNetworkBasedError("The file doesn't contain links.");
      }
      try{
        changeCBN(jsonFile.nodes, jsonFile.links);
      }
      catch(err) {
        throwNetworkBasedError("Inputted file is wrongly formatted");
        return;
      }
    }; 
  }
}