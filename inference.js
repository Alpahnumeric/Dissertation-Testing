//var bayesjs = require("bayesjs");
import bayesjs from 'bayesjs';

// export to 
window.inference = inference;

function inference(){
    var CBNandObserved = convertToBayesJSFormat();
    var CBN = CBNandObserved[0];
    var given = CBNandObserved[1];
    var inferenceResults = bayesjs.inferAll(CBN, given, { force: true });
    //updateCBN(inferenceResults);
}

function convertToBayesJSFormat(){
    var CBN = {};
    var observedVariables = {};
    for(var n = 0; n < nodes.length; n++){
        var nodeEntry = {};
        var node = nodes[n];
        var nodeName = node.name;
        nodeEntry["id"] = nodeName
        nodeEntry["states"] = node.values;
        if(node.observedValue){
        var observedValue = node.observedValue;
        observedVariables[nodeName] = observedValue;
        }
        else if(node.conditionalTable === null){
            var emptyParentArray = new Array();
            nodeEntry["parents"] = emptyParentArray;
            var cpt = exogenousCPT(node);
            nodeEntry["cpt"] = cpt;
        }
        else{
            var conditionality = extractConditionality(node);
            var conditionedOnLabels = conditionality[0];
            var conditionedOnVariables = conditionality[1];
            nodeEntry["parents"] = conditionedOnVariables;
            var cpt = endogenousCPT(node, conditionedOnLabels, conditionedOnVariables);
            nodeEntry["cpt"] = cpt;
        }
        CBN[nodeName] = nodeEntry;
    }
    var results = new Array();
    results.push(CBN);
    results.push(observedVariables);
    return results;
}

function exogenousCPT(node){
    var cpt = {};
    var marginalTable = node.marginalTable;
    for(var i = 0; i < marginalTable.length; i++){
        var sector = marginalTable[i];
        var valueName = sector.label;
        var probability = sector.value;
        cpt[valueName] = probability;
    }
    return cpt;
}

function endogenousCPT(node, conditionedOnLabels, conditionedOnVariables){
    var cpt = new Array();
    var conditionalTable = node.conditionalTable;
    //1D Table
    if(conditionedOnVariables.length === 1){
        var cptEntry = {};
        var parent = conditionedOnVariables[0];
        var numberOfEntries = conditionedOnLabels[0].length;
        for (let e = 0; e < numberOfEntries; e++) {
            var whenCPT = {};
            var thenCPT = {};
            cellPieData = conditionalTable[e];
            var sectorLabel = conditionedOnLabels[0][e];
            whenCPT[parent] = sectorLabel.label;
            var cellPieData = conditionalTable[e]; //Probabilities 
            var values = node.values;
            for(var v = 0; v < values.length; v++){
                var valueName = values[v];
                var probability = cellPieData[v];
                thenCPT[valueName] = probability;
            }
            cptEntry = {"when": whenCPT, "then": thenCPT};
            cpt.push(cptEntry);
        }
    } 
    //2D Table
    if(conditionedOnVariables.length === 2){
         //Parents are conditionedOnVariables[1], conditionedOnVariables[0]
        //labels come from conditionedOnLabels[1][c] conditionedOnLabels[0][r];
        var numberOfRows = conditionedOnLabels[1].length;
        var numberOfColumns = conditionedOnLabels[0].length;
        var parent1 = conditionedOnVariables[1];
        var parent2 = conditionedOnVariables[0];
        for (let r = 0; r < numberOfRows; r++) {
            for (let c = 0; c < numberOfColumns; c++) {
                var whenCPT = {};
                var thenCPT = {};
                var sectorLabel1 = conditionedOnLabels[1][r];
                whenCPT[parent1] = sectorLabel1.label;
                var sectorLabel2 = conditionedOnLabels[0][c];    
                whenCPT[parent2] = sectorLabel2.label;
                var cellPieData = conditionalTable[c][r];
                var values = node.values;
                for(var v = 0; v < values.length; v++){
                    var valueName = values[v];
                    var probability = cellPieData[v];
                    thenCPT[valueName] = probability;
                }
                cptEntry = {"when": whenCPT, "then": thenCPT};
                cpt.push(cptEntry);
            }
        }
    } 
    return cpt;
}

function updateCBN(inferrenceResults){
    var nodesInferred = NOD;
    for(var n = 0; n < nodesInferred.length; n++){
      var node = nodes[n];
      if(node.conditionalTable){
        node.conditionalTable = null;
        var marginalTable = new Array();
        var values = node.values;
        for(v = 0; v < values.length; v++){
            var label = values[v];
            var inferredProbability = inferrenceResults[label];
            marginalTable.push({"label": label, "id": i+1, "value": inferredProbability});
        }
        console.log("Marginal Table: " + marginalTable);
        node.marginalTable = marginalTable;
      }
      else{
        var marginalTable = node.marginalTable;
        for(s = 0; s < marginalTable.length; s++){
            var sector = marginalTable[s];
            var label = sector.label;
            var inferredProbability = inferrenceResults[label];
            sector.value = inferredProbability;
        }
      }
    }
}