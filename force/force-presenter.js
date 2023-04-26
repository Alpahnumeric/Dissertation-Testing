var radius = 70,
shift = false,
zoom = d3.behavior.zoom().scaleExtent([0.5,1.5]),
zoomAmount = 1.0,
isZoomingKey = false,
zoomingAllowed = true,
svg,
graphEntranceAnimation = true,
nodes,
links,
selectedNode,
selectedTargetNode,
selectedLink,
deletingLink = new Array(), 
hoveredLink,
newLine, 
drawingLine = false,
resettingPie = false,
deletingAffectsGraph = true, 
//Required to associate the "delete" button with both the network and pie, without affecting both when pressing it. 
//When false, the pie is instead eligible for deletions. It's value is based on what the user last clicked on.
pieNode,
pieNameLabel = null;

var networkForce = d3.layout.force() //Explore best params
  .charge(-100)  
  .linkStrength(1)
  .friction(0) //Freeze particles
  .gravity(0.1)
  .distance(100)
  .charge(1000)
  .linkDistance(4 * radius)
  .size([windowWidth_viewer() * 0.6, windowHeight_viewer() * 0.75])
  .alpha(0.5);

svg = d3.select("#networkSVG")
  .attr("width", windowWidth_viewer() * 0.6)
  .attr("height", windowHeight_viewer() * 0.75)
  .attr("class", "svg-style")
  .call(zoom.on("zoom", function () {
    if(zoomingAllowed && isZoomingKey){
      svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");
      zoomAmount = String(d3.event.scale.toFixed(2));
      textUpdate_viewer("zoomAmountLabel", zoomAmount);
      updateGraph();
    }
  }))
  .append("g");

d3.select(window)
  .on("keydown", keydown)
  .on("keyup", keyup)
  .on("mousemove", mousemove)
  .on("mouseup", mouseup);

var reaction =  svg.append("rect")
  .attr("width", windowWidth_viewer() * 0.6)
  .attr("height", windowHeight_viewer() * 0.75)
  .on("mousedown", svgMousedown)
  .style("fill-opacity", 0.0);
 
// You can't define a single SVG marker and change its colour dynamically.
// Instead, you need to define the marker in a function.
function generateArrow(d){
  if(deletingLink.includes(d)){
    fill = "#CC0000";
  }
  else{
    if(d === selectedLink){
      fill = "#000000";
    }
    else{
      if(d === hoveredLink){
        fill = "#484848";
      }
      else{
        fill = "#808080"
      }
    }
  }
  
  var arrowID = 'arrowhead' + fill;
  svg.append('defs')
    .append('marker') 
    .attrs({'id': arrowID,
    'viewBox':'-0 -5 10 10',
    'refX': 32.2,
    'refY': 0,
    'orient':'auto',
    'markerWidth': 5,
    'markerHeight': 5,
    'preserveAspectRatio': 'xMidYMid meet',
    'markerUnits': 'strokeWidth',
    'xoverflow':'visible'})
    .attr("class", "tooltip arrow")
    .append('svg:path')
    .attr('d', 'M0, -5L10,0L0, 5')
    .attr('fill', fill)
  return "url(#" + arrowID + ")";
}

var pie = d3.layout.pie()
  .value(function(d) {return math.number(d.value)})
  .sort(null); //Sorted by value by default.

var arc = d3.svg.arc()
  .outerRadius(radius)
  .innerRadius(0);

var linesg = svg.append("g");
var piesg = svg.append("g");

nodes = [
    {
      "name": "Tea",
      "values": [
        "Yes",
        "No"
      ],
      "marginalTable": [
        {
          "label": "Yes",
          "id": 1,
          "value": 0.6
        },
        {
          "label": "No",
          "id": 2,
          "value": 0.4
        }
      ],
      "observedValue": null,
      "conditionalTable": null,
      "index": 0,
      "x": 603.2729776413328,
      "y": 441.1747234786682,
      "px": 603.2729776413328,
      "py": 441.1747234786682
    },
    {
      "name": "Scone",
      "values": [
        "Yes",
        "No"
      ],
      "marginalTable": null,
      "observedValue": null,
      "conditionalTable": [
        [
          0.5,
          0.5
        ],
        [
          0.25,
          0.75
        ]
      ],
      "index": 1,
      "x": 424.80799445690974,
      "y": 262.14080817974815
    }
  ]

links = [{
  "source": 0,
  "target": 1
}];

function startForce(){
  fractionValuesJSON();
  networkForce = networkForce
  .nodes(nodes)
  .links(links)
  networkForce.start();
  updateGraph();
  setTimeout(function () {
    graphEntranceAnimation = false;
    updateGraph();
  }, 1000);
}

function nodeMouseOver(d){
  if (drawingLine && d !== selectedNode) {
    selectedTargetNode = d;
  }
}

function nodeMouseOut(d){
  if (drawingLine) {
    selectedTargetNode = null;
  }
  if(pieNameLabel !== null){
    pieNameLabel.remove();
    pieNameLabel = null;
  }
}

function nodeMouseDown(d){
  zoomingAllowed = false;
  deletingAffectsGraph = true;
  if(pieNameLabel !== null){
    pieNameLabel.remove();
    pieNameLabel = null;
  }
  if (!drawingLine) {
    selectedNode = d;
    displayVariableOnPie(d);
    selectedLink = null;
  }
  if (!shift) {
    drawingLine = true;
  } 
  networkForce.stop();
  updateGraph();
  setTimeout(function () {zoomingAllowed = true;}, 3000);
}

function lineMouseOver(d){
  hoveredLink = d;
  updateGraph();
}

function lineMouseOut(d){
  hoveredLink = null;
  updateGraph();
}

function lineMouseDown(d){
  zoomingAllowed = false;
  selectedLink = d;
  selectedNode = null;
  deletingAffectsGraph = true;
  updateGraph();
  setTimeout(function () {zoomingAllowed = true;}, 3000);
}

function placeGraph(){
  var xs = [0.12, 0.29, 0.46];
  var ys = [0.14, 0.37, 0.61];
  //Calculated based on the following numbers:
  //radius-width ratio: 0.0976 || radius-height ratio: 0.2010
  //svg-width: 0.58 || svg-height: 0.75
  //To acheive a 3x3 grid of pies
  //Allowing for enough space for links & pie names
  //with pies suitably sized for ease of clicking & value reading. 
  //These numbers match up with values calculated via obervation.
  var nodePlacement = new Array();
  var unconditionalNodes = new Array();
  for(var n = 0; n < nodes.length; n++){
    var node = nodes[n];
    if(node.conditionalTable = null){
      unconditionalNodes.push(node);
    }
  }
  var secondLevelNodes = new Array();
  for(var l = 0; l < links.length; l++){
    link = links[l];
    if(unconditionalNodes.includes(link.source)){
      secondLevelNodes.push(link.target);
    }
  }
  var thirdLevelNodes = new Array();
  for(var l = 0; l < links.length; l++){
    link = links[l];
    if(secondLevelNodes.includes(link.source) && !secondLevelNodes.includes(link.target)){
      thirdLevelNodes.push(link.target);
    }
  }  
}

function updateGraph(){
  function dragstart(d) {
    if(shift){
      if(pieNameLabel !== null){
        pieNameLabel.remove();
        pieNameLabel = null;
      }
      networkForce.stop();
    }
  }

  function dragmove(d) {
    if(shift){
      //To modify the node's short-term position (whilst dragging)
      d.px += d3.event.dx;
      d.py += d3.event.dy;
      //To modify the node's long-term position (post-drag)
      d.x += d3.event.dx;
      d.y += d3.event.dy; 
      ticked(); //Key to make it work together with updating both px,py and x,y on d.
    }
  }

  function dragend(d) {
    if(shift){
      ticked();
      networkForce.resume();
    }
  }

  var node = piesg.selectAll(".node")
    .data(nodes, function(d){return d.name})
    .classed("selected", function(d) {return d === selectedNode; })
    .classed("selectedTarget", function(d) {return d === selectedTargetNode; })

  node
    .exit()
    .remove();

  nodeg = node.enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"; });

  var node_drag = d3.behavior.drag()
    .on("dragstart", dragstart)
    .on("drag", dragmove)
    .on("dragend", dragend);

  nodeg
    .on("mouseover", nodeMouseOver)
    .on("mouseout", nodeMouseOut)
    .on("mousedown", nodeMouseDown)
    .call(node_drag);

  function create_pie(){
    var pieName = "";
    pathsOfPies[index] = d3.select(this).selectAll("path")
      .data(function(d) {
        pieName = d.name; 
        if(d.observedValue !== null){
          return pie([d.observedValue]);
        }
        else{
          if(d.conditionalTable !== null){
          return pie([{"label": "Conditional", "id": 10, "value": 1}]);
          } 
          else {
            return pie(d.marginalTable);
          }  
        }
      });
    textOfPies[index] = d3.select(this).selectAll("text")
      .data(function(d) {
        if(d.observedValue !== null){
          return pie([d.observedValue]);
        }
        else if(d.conditionalTable !== null){
          return pie([{"label": "Conditional", "id": 10, "value": 1}]);
        }
        else{
          return pie(d.marginalTable);
        }
      });
    pathsOfPies[index]
      .enter()
      .append("path")
      .attr("d", arc)
      .style("fill", function(d) {return defaultColorScale(d.data.id);})
      .attr("stroke", "black")
      .transition()
      .style("stroke-width", "1px")
    textOfPies[index]
      .enter()
      .append("text")
      .attr("d", arc)
      .text(function(d, i){ return d.data.label})
      .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
      .attr("style", "font-family: arial; font-size: 14; fill: black; stroke: none; text-anchor: middle");
    if(resettingPie){
      pathsOfPies[index]
        .data(pie([]))
        .exit()
        .remove();

      textOfPies[index]
        .data(pie([]))
        .exit()
        .remove();   
    }
    index = index + 1;
  }
  function addNameLabel(d){
    var pieLabel = document.getElementById("label: " + d.name);
    if(pieLabel){
      pieLabel.style.left = d.px + "px";
      pieLabel.style.top = d.py + "px";
      pieLabel.style.fontSize = String(15 * zoomAmount) + 'px';
    }
    else{ 
      if(!graphEntranceAnimation){
        d3.select("#pieLabels")
        .append("div")
        .attr("height", "100%")
        .attr('pointer-events', 'none')
        .attr("class", "tooltip")
        .attr("id", "label: " + d.name)
        .html(d.name)
        .style("left", d.x + "px") 
        .style("top", d.y + "px")
      }
    } 
  }

  textOfPies = [];
  pathsOfPies = [];
  var index = 0;
  node.each(create_pie);
  node.each(addNameLabel);
  resettingPie = false;

  var link = linesg.selectAll("line.link")
    .data(links)
    .attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; })
    .classed("selected", function(d) { return d === selectedLink; })
    .classed("deleting", function(d) { return deletingLink.includes(d);});
    
  link
    .exit()
    .remove();
  
  link
    .enter()
    .append("line")
    .attr("class", "link");
    
  link.each(function(d){
    d3.select(this)
      .attr("marker-end", generateArrow(d));
  });

  link
    .on("mousedown", lineMouseDown)
    .on("mouseover", lineMouseOver)
    .on("mouseout", lineMouseOut);

  function ticked() {
    link
      .attr("x1", function(d) {return d.source.x;})
      .attr("y1", function(d) {return d.source.y;})
      .attr("x2", function(d) {return d.target.x;})
      .attr("y2", function(d) {return d.target.y;});
    node
      .attr('transform', function(d) {
        if(!graphEntranceAnimation){
          d.fixed = true;
        }
        return 'translate(' + d.x + ',' + d.y + ')';});
  };

  networkForce = networkForce
    .nodes(nodes)
    .links(links);
  networkForce.on("tick", ticked);
}

function displayVariableOnPie(d){
  pieNode = d;
  if(d.conditionalTable === null){
    displayUnconditionalPie(d);
  }
  else{
    var conditionedOnLabels = [];
    var conditionedOnPies = [];
    links.forEach(function(l) {
      if (l.target === d) {
        var conditionedOnVariable = l.source
        var pieDataset = conditionedOnVariable.marginalTable;
        conditionedOnPies.push(conditionedOnVariable.name);
        var sectorLabelInfo = new Array();
        if(conditionedOnVariable.conditionalTable){
          var sectorLabels = conditionedOnVariable.values;   
          for(l = 0; l < sectorLabels.length; l++){  
            sectorLabelInfo.push({"label" : sectorLabels[l], "id": l+1});
          }
        }else{
          for(l = 0; l < pieDataset.length; l++){  
            var sector = pieDataset[l];
            sectorLabelInfo.push({"label" : sector.label, "id": sector.id});
          }
        }
        conditionedOnLabels.push(sectorLabelInfo)
      }
    });
    displayConditionalPie(d, conditionedOnPies, conditionedOnLabels);
  }
}

function keyup() {
  switch (d3.event.keyCode) {
    case 90: { //z
      isZoomingKey = false;
      break;
    }
    case 16: { // shift
      shift = false;
      updateGraph();
      networkForce.start();
    }
  }
}

function nameUnique(varName){
  for (var index = 0; index < nodes.length; ++index) {
    var n = nodes[index];
    if(n.name == varName){
      return false;
    }
  }
  return true;
}

// add a new disconnected node
function generateNode(mouse, isConditional){
  function hasDuplicates(array) {
    return (new Set(array)).size !== array.length;
  }

  function addNodeConditional(varName, valuesInputArray){
    var marginalTable = [];
    var nodeConditionalTable = new Array();
    marginalTable = [{"label": "Conditional", "id": 10, "value": 1}];
    for (var index = 0; index < nodes.length; ++index) {
      var n = nodes[index];
      if(n.name == selectedNode.name){
        var conditonalValues = n.values;
        var conditonalsNumber = conditonalValues.length;
        break;
      }
    }
    for(var i = 0; i < conditonalsNumber; i++){
      nodeConditionalTable.push([]);
    }
    var generatedNode = {x: mouse[0], y: mouse[1], values: valuesInputArray, marginalTable: marginalTable, observedValue: null, conditionalTable: nodeConditionalTable, name: varName};
    nodes.push(generatedNode);
    selectedLink = null;
    return generatedNode;
  }

  function addNodeUnconditional(varName, valuesInputArray, probInputArray){
    var marginalTable = [];
    var numberOfValuesInput = valuesInputArray.length;
    for(var s = 0; s < parseInt(numberOfValuesInput); s++){
      marginalTable.push({"label": valuesInputArray[s], "id": (s + 1), "value": math.fraction(probInputArray[s])});
    }
    var generatedNode = {x: mouse[0], y: mouse[1], values: valuesInputArray, marginalTable: marginalTable, observedValue: null, conditionalTable: null, name: varName};
    nodes.push(generatedNode);
    selectedLink = null;
    return generatedNode;
  }

  function getVarName(){
    while (cancel !== true){
      var varName = prompt(promptText);  
      if(varName !== null){
        if(varName.trim().length !== 0){ //I.e. if the varName doesn't just contain spaces. 
          if(nameUnique(varName)){
            //Success
            return varName;
          } 
          else{
            promptText ="A variable named" + varName + " already exists!\nEnter another variable name or cancel adding a node:"
          }
        } 
      }
      else{
        cancel = true;
      }
    }
    return null;
  }

  function getvaluesInputArray(varName){
    var promptText = "Enter the values " +  varName + " can take, each seperated by a comma. \nFor example, 'red,blue,green'. \nEach variable can take between 1 and 10 values."
    while (cancel !== true){
      var valuesInput = prompt(promptText);
      if(valuesInput !== null){
        if(valuesInput.trim().length !== 0){
          var valuesInputArray = valuesInput.split(',');
          var duplicates = hasDuplicates(valuesInputArray);
          if(!duplicates){
            var numberOfValuesInput = valuesInputArray.length;
            var numberOfValuesInput = numberOfValuesInput.toString();
            if(numberOfValuesInput > 0 && numberOfValuesInput < 11  && Math.floor(numberOfValuesInput) === +numberOfValuesInput){ //i.e. Natural number 1, 2 or 3
              var EmptyValues = false;
              for(var valueIndex = 0; valueIndex < numberOfValuesInput; valueIndex++){
                var value = valuesInputArray[valueIndex];
                if(value.trim().length === 0){
                  EmptyValues = true;
                }
              }
              if(!EmptyValues){
                //Success
                return valuesInputArray;
              }
              else{
                promptText ="Value names must not be blank.\nEnter a new value list:"
              }  
            }
            else{
              promptText ="The number of values " +  varName + " can take must be a natural number between 1 and 10. \nEnter a new value list:"
            }
          }
          else{
            var promptText = "Your value list contained duplicated entries! \nEnter a new value list:"
          }
        }
      } else{
        cancel = true;
      }
    }
    return null;
  }

  function getProbabilitiesInputArray(valuesInputArray, varName){
    var promptText = "Enter the probabilties that your values '" +  valuesInputArray.toString() + "' can take, each seperated by a comma. For example, '0.2,0.3,0.5'. \n        OR        \n Press 'OK' for uniform probabilities."
    while (cancel !== true){
      var probInput = prompt(promptText);
      if(probInput !== null){
        if(probInput.trim().length !== 0){
          var probInputArray = probInput.split(',');
          if(!probInputArray.some(isNaN)){
            var sum = probInputArray.reduce((partialSum, p) => partialSum + parseFloat(p), 0);
            if(sum == 1.0){
              if(valuesInputArray.length == probInputArray.length){
                return probInputArray;
              }
              else{
                promptText = "You entered " + probInputArray.length + " probabilties rather than the " + valuesInputArray.length + " required for your entered values:";
              }
            }
            else{
              promptText = "Your probabilties must sum to 1, as " + varName + " must take one of the values of " +  valuesInputArray.toString() + ":";
            }
          }
          else{
            promptText = "Your probabilties must be decimals: ";
          }
        }
        else{ //Uniform probabilities
          var numberOfValues = valuesInputArray.length;
          var fraction = math.fraction(1, numberOfValues);
          probInputArray = Array(numberOfValues).fill(fraction);
          return probInputArray;
        }
      } else{
        cancel = true;
      }
    }
    return null;
  }

  var cancel = false;
  var promptText = "You're adding a variable pie.\nVariable's Name:"
  var varName = getVarName();
  var valuesInputArray = getvaluesInputArray(varName);
  if(isConditional){
    if(varName !== null && valuesInputArray !== null){
      var nodeGenerated = addNodeConditional(varName, valuesInputArray);
      return nodeGenerated;
    } 
    return null;
  }
  else{
    if(varName !== null && valuesInputArray !== null){
      var probInputArray = getProbabilitiesInputArray(valuesInputArray, varName);
      if(probInputArray !== null){
        var nodeGenerated = addNodeUnconditional(varName, valuesInputArray, probInputArray);
        return nodeGenerated;
      }
    }
    return null;
  }
}

function addConditionality(sourceNode, targetNode){
  var conditionedOnValues = sourceNode.values;
  var nodeConditionalTable = targetNode.conditionalTable;
  var newNodeConditionalTable = new Array();
  if(!nodeConditionalTable){ // 0 conditionals -> 1 conditional
    var marginalTable = targetNode.marginalTable;
    var distribution = new Array();
    for(var i = 0; i < marginalTable.length; i++){
      var sector = marginalTable[i];
      distribution.push(sector.value);
    }
    for(var v = 0; v < conditionedOnValues.length; v++){
      newNodeConditionalTable.push(distribution);
    }
    targetNode.marginalTable = null;
  }
  else{// 1 conditonal -> 2 conditionals
    for(var i = 0; i < nodeConditionalTable.length; i++){
      var conditionalTableRow = new Array();
      for(var j = 0; j < conditionedOnValues.length; j++){
        conditionalTableRow.push(nodeConditionalTable[i].slice());
      }
      newNodeConditionalTable.push(conditionalTableRow);
    }
  }
  targetNode.conditionalTable = newNodeConditionalTable.slice();
  networkForce.stop();
  for(var i = 0; i < 10; i++){
    //As each node can have up to 10 sectors, and each update adds or deletes a sector.
    resettingPie = true;
    updateGraph();
  }
  networkForce.start();
}

function svgMousedown(){
  var mouse = d3.mouse(svg.node());
  generateNode(mouse, false);
  networkForce.stop();
  updateGraph();
  networkForce.start();
}

function mousemove(){
  if (drawingLine && !shift) {
    var mouse = d3.mouse(svg.node());
    var x = Math.max(0, Math.min(windowWidth_viewer(), mouse[0]));
    var y = Math.max(0, Math.min(windowHeight_viewer(), mouse[1]));
    //Debounce - only start drawing line if it gets of a sufficient size.
    var dx = selectedNode.x - x;
    var dy = selectedNode.y - y;
    if (Math.sqrt(dx * dx + dy * dy) > 10) {
      //Draw a line
      if (!newLine) {
        newLine = linesg.append("line").attr("class", "newLine");
      }
      newLine.attr("x1", function(d) { return selectedNode.x; })
        .attr("y1", function(d) { return selectedNode.y; })
        .attr("x2", function(d) { return x; })
        .attr("y2", function(d) { return y; });
    }
  }
  updateGraph();
}

function mouseup(){ //Add link
  drawingLine = false;
  if (newLine) {
    if (selectedTargetNode) { //Connect link to existing node.
      conditionsOnTargetNode = 0;
      for(var l = 0; l < links.length; l++){
        linkbeingChecked = links[l];
        if (linkbeingChecked.target === selectedTargetNode) { 
          ++conditionsOnTargetNode;
          if(linkbeingChecked.source === selectedNode){
            throwNetworkError_viewer("This edge is a duplicate!");
            finishLinkAdd();
            return;
          }
        }
      }
      if(conditionsOnTargetNode < 2){ 
        //The maximum links into the node is 2, as another is about to be added.
        selectedTargetNode.fixed = false;
        var newLink = {source: selectedNode, target: selectedTargetNode};
        links.push({source: selectedNode, target: selectedTargetNode});
        var cycle = isCyclic();
        if(cycle){
          links.pop();
          throwNetworkError_viewer("This would add a cycle which isn't allowed in a Bayesian network!");
          finishLinkAdd();
          return;
        }  
        else{
          addConditionality(selectedNode, selectedTargetNode);
          //resettingPie = true;
        }            
        if(pieNode === selectedTargetNode){
          displayConditionalPie(selectedTargetNode);
        }
      }  
      else{
        throwNetworkError_viewer("A variable can be conditional on at most 2 variables. Adding a link to " + selectedTargetNode.name + " would violate this!");
      }
    }
    else { //Connect link to new node.
      var mouse = d3.mouse(svg.node());
      var newNode = generateNode(mouse, true);
      if(newNode !== null){
        links.push({source: selectedNode, target: newNode});
      }
    }
    finishLinkAdd();  
  }

  function finishLinkAdd(){
    selectedNode.fixed = false;
    selectedNode =  null;
    selectedTargetNode = null;
    updateGraph();
    newLine.remove();
    newLine = null;
    networkForce.start();
  }
}

function pieNameChange(newName){
  var pieLabel = document.getElementById("label: " + pieNode.name)
  pieLabel.setAttribute("id", "label: " + newName);
  pieLabel.innerHTML = newName; 
  for (var index = 0; index < nodes.length; ++index) {
    var n = nodes[index];
    if(n.name == pieNode.name){
      n.name = newName;
      nodes[index] = n;
      break;
    }
  }
}

function pieUpdated(){  
  for (var index = 0; index < nodes.length; ++index) {
    var n = nodes[index];
    if(n.name == pieNode.name){
      n.values = variableValues;
      n.marginalTable = pieDataset;
      n.observedValue = observedValue;  
      n.conditionalTable = conditionalTable; 
      nodes[index] = n;
      break;
    }
  }
  networkForce.stop();
  for(var i = 0; i < 10; i++){
    //As each node can have up to 10 sectors, and each update adds or deletes a sector.
    resettingPie = true;
    updateGraph();
  }
  networkForce.start();
  updateGraph();
}

function updateConditonalityFromPie(){
  for(var l = 0; l < links.length; l++){
    linkbeingChecked = links[l];
    if (linkbeingChecked.source == pieNode) { 
      var affectedNode = linkbeingChecked.target;
      updateConditionalTable(affectedNode);
    }
  }
}

d3.select("#pieUpdated").on('click', function(){    
  if(checkProbabilitySum()){
    pieUpdated();
  }
  else{
    throwPieError_viewer("Probabilities must sum to 1!");
  }
});  

function deleteNodePrompt(remainingLinksAfterDelete, deletedLinksAfterDelete){
  var deletionConfirmation = confirm("You're deleting " + selectedNode.name + " which also removes all of its links.\nThis cannot be undone.");
  deletingLink = new Array();
  if(deletionConfirmation){
    var displayDifferentPie = false;
    if(selectedNode === pieNode){
      displayDefaultPie("Select a node from the graph to view/modify it", "");
    }
    var i = nodes.indexOf(selectedNode);
    nodes.splice(i, 1);
    if(pieNameLabel !== null){
      pieNameLabel.remove();
      pieNameLabel = null;
    }
    var nodeLabel = document.getElementById("label: " + selectedNode.name);
    nodeLabel.remove();
    //Delete connected links:
    deletedLinksAfterDelete.forEach(deleteLink);
    links = remainingLinksAfterDelete;    
    //selectedLink = links.length ? links[i > 0 ? i - 1 : 0] : null;
    defaultPie = true;
    pieNode = null;
    displayDefaultPie("Add a node to the graph.");
    //The following commented code displays another node on the pie display. 
    //This could confuse the user as to whether the delete has occured,
    //and the choice of node would need to carefully studied. 
        //e.g. last added, closest physically, conditional relations etc. 
  // selectedNode = nodes.length ? nodes[i > 0 ? i - 1 : 0] : null;
  // if(selectedNode){
  //   defaultPie = false;
  //   pieNode = selectedNode;
  //   displayPie(pieNode);
  // } else{ //Graph is empty, so display default network!
  //   defaultPie = true;
  //   pieNode = null;
  //   displayDefaultPie("Select a node from the graph to view/modify it", "");
  //}
  }
}

function updateConditionalTable(affectedNode){
  conditionsOnAffectedNode = [];
  for(var l = 0; l < links.length; l++){
    linkbeingChecked = links[l];
    if (linkbeingChecked.target == affectedNode) { 
      var conditionedOnNode = linkbeingChecked.source;
      conditionsOnAffectedNode.push(conditionedOnNode);
    }
  }
  if(conditionsOnAffectedNode.length === 0){
    //No more conditionals
    var affectedNodeValues = affectedNode.values;
    var sectorFraction = math.fraction(1, affectedNodeValues.length);
    var newPieDataset = new Array();
    for(var s = 0; s < affectedNodeValues.length; s++){
      newPieDataset.push({"label": affectedNodeValues[s], "id": (s + 1), "value": sectorFraction});
    }
    affectedNode.marginalTable = newPieDataset;
    affectedNode.conditionalTable = null;
    resettingPie = true;
  }
  else{
    affectedNode.conditionalTable = null;
    if(conditionsOnAffectedNode.length >= 1){
      var variableConditionedOn = conditionsOnAffectedNode[0];
      addConditionality(variableConditionedOn, affectedNode);
    }
    if (conditionsOnAffectedNode.length == 2){
      var variableConditionedOn = conditionsOnAffectedNode[1];
      addConditionality(variableConditionedOn, affectedNode);
    }
  }
  if(affectedNode == pieNode){
    displayVariableOnPie(affectedNode);
  }
  networkForce.stop();
  updateGraph();
  networkForce.start();
  updateGraph();
}

function deleteLinkPrompt(){
  var linkSourceNode = selectedLink.source;
  var linkTargetNode = selectedLink.target;
  var deletionConfirmation = confirm("You're deleting the " + linkSourceNode.name + " -> " + linkTargetNode.name + " link. \nThis cannot be undone.");
  if(deletionConfirmation){
    deleteLink(selectedLink);
  }
  else{
    deletingLink = new Array();
  }
}

function deleteLink(link){
  const linkIndex = links.indexOf(link);
  links.splice(linkIndex, 1);
  var affectedNode = link.target; 
  //Will have had its conditionals reduced.
  updateConditionalTable(affectedNode);
  const deleteIndex = deletingLink.indexOf(link);
  deletingLink.splice(deleteIndex, 1);
}

function keydown(){ //https://www.toptal.com/developers/keycode
  switch (d3.event.keyCode) {
    //Can only have either shift or isZooming as they'd be a drag-panning conflict. 
    case 90: { //Z key
      if(!shift){
        isZoomingKey = true;
      }
      break;
    }
    case 16: { // shift
      if(!isZoomingKey){
        shift = true;
      }
      break;
    }
    case 8: { // delete
      if(deletingAffectsGraph && shift){
        if (selectedNode) { //Node
          //Highlighting the links associated with this link delete:
          var remainingLinksAfterDelete = [];
          var deletedLinksAfterDelete = [];
          links.forEach(function(l) {
            if (l.source !== selectedNode && l.target !== selectedNode) {
              remainingLinksAfterDelete.push(l);
            }
            else{
              deletedLinksAfterDelete.push(l);
            }
          });
          deletingLink = deletedLinksAfterDelete.slice();
          updateGraph();
          setTimeout(function () {deleteNodePrompt(remainingLinksAfterDelete, deletedLinksAfterDelete);}, 25);
          
        } else if (selectedLink) {  //Link
          deletingLink = [selectedLink];
          updateGraph();
          setTimeout(function () {deleteLinkPrompt();}, 25);
        }
        updateGraph();
      }
    }
  }
}

function isCyclic(){ //true means contains a cycle. 
  function isCyclicRec(n, nodeBeingChecked){
		if (stack[n]){
      return true;
    }
		if (visited[n]){
      return false;	
    }
		visited[n] = true;
		stack[n] = true;

    for(var l = 0; l < links.length; l++){
      linkbeingChecked = links[l];
      if (linkbeingChecked.source == nodeBeingChecked) { 
          var child = linkbeingChecked.target;
          var inx = nodes.indexOf(child);
          var cycle = isCyclicRec(inx, child);
          
          if (cycle){
            return true;
          }      
      }
    }

		stack[n] = false;
		return false;
  }

  let visited = new Array(nodes.length);
  let stack = new Array(nodes.length);
  for(var n = 0; n < nodes.length; n++){
    visited[n] = false;
    stack[n] = false;
  }	
  for (var n = 0; n < nodes.length; n++){
    nodeBeingChecked = nodes[n];
    var cycles = isCyclicRec(n, nodeBeingChecked);
    if (cycles){
      return true;
    }
  }
  return false;
}

//----------------------------------PRESENTER -> PRESENTER----------------------------------
function getLinks(){
  //This creates a deep copy - i.e. a seperate Object
  var copyOfLinks = JSON.parse(JSON.stringify(links));
  return copyOfLinks;
}

function getNodes(){
  var copyOfNodes = JSON.parse(JSON.stringify(nodes));
  return copyOfNodes;
}

function getSVG(){
  return svg[0][0];
}

function throwNetworkBasedError(errorText){
  throwNetworkError_viewer(errorText)
}

function changeCBN(nodeInput, linkInput){
  for(var i = 0; i < nodes.length; i++){
    var node = nodes[i];
    var pieLabel = document.getElementById("label: " + node.name);
    pieLabel.remove();
  }
  nodes = nodeInput;
  links = linkInput;
  fractionValuesJSON();
  networkForce = networkForce
    .nodes(nodes)
    .links(links);
  networkForce.start();
  graphEntranceAnimation = true;
  updateGraph(); 
  setTimeout(function () { 
    graphEntranceAnimation = false;
    updateGraph();
  }, 1000);
}