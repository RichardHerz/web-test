// by Richard K. Herz of www.ReactorLab.net
// 2015

// quick solution - have the data arrays as globals so they are
// persistant between display updates
var gInletFlowData = new Array();
var gHeightData = new Array();

// ----- FUNCTIONS WITH SPECIFIC UNIT VARIABLE NAMES ---------

// functions getPlotData and plotPlotData refer
// to specific unit names and variables defined
// in file process_units.js

function getPlotData(resetFlag){

  // on resetFlag = 1, fill arrays with initial values
  // on resetFlag = 0, drop first point at start of array and add new point at end

  // NEED TO RETAIN DATA ARRAYS BETWEEN DISPLAY UPDATES
  // quick solution is to use GLOBALS
  // gInletFlowData holds unit_1.rate
  // gHeightData holds unit_2.height

  // sample structure of these data arrays:
  // gHeightData = [[1, 300], [2, 600], [3, 550], [4, 400], [5, 300]];
  // gInletFlowData = [[1, 0], [2, 0.25], [3, 0.5], [4, 0.6], [5, 0.4]];

  var k;
  var numberPlotPoints = 30;
  var newInletFlowData = gInletFlowData;
  var newHeightData = gHeightData;
  var tempInletFlowData = gInletFlowData; // new Array();
  var tempHeightData = gHeightData; // new Array();

  if (resetFlag){

    // reset and fill data arrays with initial values
    // needed next two lines or got undefined error if start for at k=0
    newInletFlowData[0] = [0, unit_1.rate];
    newHeightData[0] = [0, unit_2.height];
    for (k = 1; k < numberPlotPoints; k++){
      newInletFlowData[k] = [k, unit_1.rate];
      newHeightData[k] = [k, unit_2.height];
    }

  } else {

    // delete oldest data points at start with array slice method
    tempInletFlowData = newInletFlowData.slice(1);
    tempHeightData = newHeightData.slice(1);

    // add the new points at end with array push method
    tempInletFlowData.push([numberPlotPoints-1, unit_1.rate]);
    tempHeightData.push([numberPlotPoints-1, unit_2.height]);

    // re-number the x-axis values
    // so they stay the same after slicing and pushing
    for (k = 0; k < numberPlotPoints; k++){
      tempInletFlowData[k][0] = k;
      tempHeightData[k][0] = k;
    }

    // copy arrays
    newInletFlowData = tempInletFlowData;
    newHeightData = tempHeightData;

  } // END OF if (resetFlag)

  // copy arrays
  gInletFlowData = newInletFlowData;
  gHeightData = newHeightData;

  return [newInletFlowData, newHeightData];

} // END OF function getPlotData

function plotPlotData(pData){

  // SEE WEB SITE OF flot.js
  //     http://www.flotcharts.org/
  // SEE DOCUMENTATION FOR flot.js
  //     https://github.com/flot/flot/blob/master/API.md

  inletFlowData = pData[0];
  heightData = pData[1];

  // XXX not sure why right y-axis is yaxis:1 ??
  dataToPlot = [ { data: inletFlowData, label: "Inlet Flow Rate", yaxis:2 },
                { data: heightData, label: "Water Level", yaxis:1 } ];

  // QUESTION: can you set up a plot variable with options
  //     when initializing the plot, then only change the data plotted?
  //     plot.setData(dataToPlot);
  //         // since the axes don't change, we don't need to call plot.setupGrid()
  //     plot.draw();
  // does that way plot faster?
  // SEE https://github.com/flot/flot/blob/958e5fd43c6dff4bab3e1fd5cb6109df5c1e8003/examples/realtime/index.html

  options = {
    // axisLabels needs library flot.axislabels.js,
    // see https://github.com/markrcote/flot-axislabels
    axisLabels: {show: true},
    xaxes: [ { min: 0, max: 30, axisLabel: "Time" } ],
    yaxes: [ { position: "right", min: 0, max: 2, axisLabel: "Water Level" },
        { position: "left", min: 0, max: 3, axisLabel: "Inlet Flow Rate" } ],
    legend: { position: "nw" } // e.g., nw = north (top) west (left)
  };

  var plot = $.plot($("#plotCanvas"), dataToPlot, options);

} // END OF function plotPlotData
