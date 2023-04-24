function fractionValuesJSON(){
    function fractionConvert(){
      if(typeof sectorValue === 'string' || sectorValue instanceof String){
        return math.fraction(sectorValue);
      } else {
        return sectorValue; 
      }
    }
    for (var nodeIndex = 0; nodeIndex < nodes.length; ++nodeIndex) {
      var node = nodes[nodeIndex];
      var marginalTable = node.marginalTable;
      if(marginalTable !== null){
        for (var s = 0; s < marginalTable.length; ++s) { 
          var sector = marginalTable[s];
          var sectorValue = sector.value;
          if(typeof sectorValue === 'string' || sectorValue instanceof String){
            sector.value = fractionConvert(sectorValue);
          }
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
}

function exampleGraphSelected(event){
  var element = event.target;
  var example = null;
  while (element && !example) {
      if (element.matches("button")) {
          example = element;
      } else {
          // Not found
          if (element === this) {
              element = null;
          } else {
              element = element.parentNode;
          }
      }
  }
  if(example){
    var fileName = "./Examples/" + example.id + ".json";
    d3.json(fileName, function(json) {
      changeCBN(json.nodes, json.links);
    });
  }
}
