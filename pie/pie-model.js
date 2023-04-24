//Attributes modelling a pie chart physically
var colorScale;
var width = 300;
var height = 300;
var radius = Math.min(width, height) / 2;
var path;

//Attributes modelling a pie chart mathematically
var variableName = null,
conditionedOnVariables = null,
conditionedOnLabels = null,
observedValue = null,
pieDataset = [];

//conditionalProbabilityTable managed by table.model
//variableValues managed by variableValues.model