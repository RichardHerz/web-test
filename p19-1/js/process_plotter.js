// by Richard K. Herz of www.ReactorLab.net
// 2015, 2016

// ----- INITIALIZE PERSISTENT 3D ARRAY plotData TO HOLD DATA TO PLOT ---------

var plotData = initPlotData();

function initPlotData() {
  // goal is 3D array to hold plot data, where
  //    index 1 specifies the variable,
  //    index 2 specifies the data point pair
  //    index 3 specifies x or y in x,y data point pair
  // returns array with all elements for plot filled with zero
  var plotList = simParams.plotVariables; // list of variables to plot
  var numVar = plotList.length; // number of variables to plot
  var numPlotPoints = simParams.numPlotPoints;
  var v;
  var p;
  var plotDataStub = new Array();
  for (v = 0; v < numVar; v += 1) {
    plotDataStub[v] = new Array();
    for (p = 0; p <= numPlotPoints; p += 1) { // NOTE = AT p <=
      plotDataStub[v][p] = new Array();
      plotDataStub[v][p][0] = 0;
      plotDataStub[v][p][1] = 0;
    }
  }
  return plotDataStub;
  // Note above initialize values for
  //    plotDataStub [0 to numVar-1][ 0 to numPlotPoints] [0 & 1]
  // If want later outside this constructor to add new elements,
  // then you can do easily for 3rd index, e.g.,
  //    plotDataStub [v] [p] [2] = 0;
  // But can NOT do assignment for [v] [p+1] [0] since p+1 element does not yet
  // exist, where here p = numPlotPoints+1.
  // Would have to first create new p+1 array
  //    plotDataStub [v] [p+1] = new Array();
  // Then can do
  //    plotDataStub [v] [p+1] [0] = 0;
  //    plotDataStub [v] [p+1] [1] = 0; // etc.
} // end function initPlotData

// ----- FUNCTION TO GET DATA ---------

function getPlotData(resetFlag) {
  // updates data in 3D array plotData
  // uses parameter values from object simParams defined in file proces_units.js

  // on resetFlag = 1, fill arrays with initial values of process variables
  // on resetFlag = 0, drop 1st point at start of each variable's array and add new point at end

  // make copy for use in updating arrays
  var newPlotData = plotData;

  var p = 0; // used as index to select the variable
  var k = 0; // used as index to select data point pair
  var pv = []; // array to hold info about a variable
  var currentVarValues = []; // array to hold current plot data
  var numPlotPoints = simParams.numPlotPoints;
  var plotList = simParams.plotVariables;
  var numVar = plotList.length;
  var tmpFunc = new Function("return null;"); // tmpFunc used below

  // get current values of process variables
  plotList.forEach(fGetData);
  function fGetData(pv,p) {  // p is index of "pv" array in plotVariables array
	  // pv = entire individual array element of plotList array
  	let puName = pv[0]; // get process unit name
  	let varName = pv[1]; // get variable object name
    // now need to get var value, units, etc. from puName.varName object
    tmpFunc = new Function("return " + puName + "." + varName + ".value;");
    currentVarValues[p] = tmpFunc();
  }

  // update plotData array

  if (resetFlag) {

    // reset and fill data array with initial values
    for (p = 0; p < numVar; p += 1) {
      for (k = 0; k <= numPlotPoints; k += 1) { // note = in k <= numPlotPoints
        // note want k <= numPlotPoints so get # 0 to # numPlotPoints of points
        newPlotData[p][k][0] = k; // arbitrary, will be updated below to time values
        newPlotData[p][k][1] = currentVarValues[p];
      }
    }

  } else {

    // update plotData with new data
    for (p = 0; p < numVar; p += 1) {
      let tempArray = newPlotData[p]; // work on one plot variable at a time
      // delete first and oldest element which is an [x,y] pair array
      tempArray.shift();
      // add the new [x.y] pair array at end
      tempArray.push( [ numPlotPoints-1 , currentVarValues[p] ] );
      // update the variable being processed
      newPlotData[p] = tempArray;
    }

  } // END OF if (resetFlag)

  // re-number the x-axis values to equal time values
  // so they stay the same after updating y-axis values
  var timeStep = simParams.dt * simParams.stepRepeats;
  for (p = 0; p < numVar; p += 1) {
    for (k = 0; k <= numPlotPoints; k += 1) { // note = in k <= numPlotPoints
      // note want k <= numPlotPoints so get # 0 to  # numPlotPoints of points
      newPlotData[p][k][0] = k * timeStep;
    }
  }

  // finally, save new array in global plotData for use in next time step
  plotData = newPlotData;

  // and then return the new array as function result
  return newPlotData;

} // END OF function getPlotData

// ----- FUNCTION TO PLOT DATA ---------

function plotPlotData(pData) {

  // SEE WEB SITE OF flot.js
  //     http://www.flotcharts.org/
  // SEE DOCUMENTATION FOR flot.js
  //     https://github.com/flot/flot/blob/master/API.md
  // axisLabels REQUIRES LIBRARY flot.axislabels.js, SEE
  //     https://github.com/markrcote/flot-axislabels

  // get info about the variables

  var plotList = simParams.plotVariables;
  var p = 0; // used as index to select the variable
  var pv = []; // array to hold info about plot variables
  var vLabel = []; // array to hold variable names for plot legend
  var yAxis = []; // array to hold y-axis, "left" or "right"
  var vShow = []; // array to hold "show" or "hide" (hide still in copy-save data)
  plotList.forEach(fGetAxisData);
  function fGetAxisData(pv,p) {
	  // pv = entire individual array element of plotList array
    // p is index of "pv" array in plotVariables array
    let puName = pv[0]; // get process unit name
    let varName = pv[1]; // get variable object name
    // now need to get var value, units, etc. from puName.varName object
    tmpFunc = new Function("return " + puName + "." + varName + ".label;");
    vLabel[p] = tmpFunc();
    yAxis[p] = pv[2]; // get "left" or "right" for plot y axis
    vShow[p] = pv[3]; // get "show" or "hide"

  }

  // put data in form needed by flot.js

  var plotCanvasHtmlID = simParams.plotCanvasHtmlID;
  var dataToPlot = [];
  var numVar = plotList.length;
  var numToShow = 0; // index for variables to show on plot
  // only variables with property "show" will appear on plot
  for (p = 0; p < numVar; p += 1) {
    // add object for each plot variable to array dataToPlot
    // e.g., { data: y1Data, label: y1DataLabel, yaxis: 1 },
    if (vShow[p] === "show") {
      let newobj = {};
      newobj.data = pData[p];
      newobj.label = vLabel[p];
      if (yAxis[p] === "right") {newobj.yaxis = 1;} else {newobj.yaxis = 2;}
      dataToPlot[numToShow] = newobj;
      numToShow += 1;
    }
  }

  // set up the plot axis labels and plot legend

  var xLabel = simParams.xAxisLabel;
  var xMin = 0;
  var xMax = simParams.dt * simParams.stepRepeats * simParams.numPlotPoints;
  var yLeftLabel = simParams.yLeftAxisLabel;
  var yLeftMin = simParams.yLeftAxisMin;
  var yLeftMax = simParams.yLeftAxisMax;
  var yRightLabel = simParams.yRightAxisLabel;
  var yRightMin = simParams.yRightAxisMin;
  var yRightMax = simParams.yRightAxisMax;
  var plotLegendPosition = simParams.plotLegendPosition;
  var options = {
    // axisLabels REQUIRES LIBRARY flot.axislabels.js, SEE
    //     https://github.com/markrcote/flot-axislabels
    axisLabels : {show: true},
    xaxes: [ { min: xMin, max: xMax, axisLabel: xLabel } ],
    yaxes: [
      // yaxis object listed first is "yaxis: 1" in dataToPlot, second is 2
      {position: "right", min: yRightMin, max: yRightMax, axisLabel: yRightLabel },
      {position: "left", min: yLeftMin, max: yLeftMax, axisLabel: yLeftLabel },
    ],
    legend: { position: plotLegendPosition }
  };

  var plot = $.plot($(plotCanvasHtmlID), dataToPlot, options);

} // END OF function plotPlotData

// ----- FUNCTION TO COPY PLOT DATA TO TEXT IN WINDOW ---------

function copyData() {
  // opens child window with data in plot + hidden variables in simParams.plotList
  // uses data from 3D array plotData and also
  // uses data from simParams object in file proces_units.js

  // if simulation is running, pause it so user can make notes
  var runningFlag = simParams.runningFlag;
  if (runningFlag) {runThisLab();}

  var p = 0; // used as index to select the variable
  var k = 0; // used as index to select data point pair
  var pv = []; // array to hold info about plot variables
  var plotList = simParams.plotVariables;
  var numVar = plotList.length;
  var plotVarName = [];
  var plotVarUnits = [];
  var tmpFunc = new Function("return null;"); // tmpFunc used below

  // get current values name and units of process variables
  plotList.forEach(fGetData);
  function fGetData(pv,p) {  // p is index of "pv" array in plotVariables array
	  // pv = entire individual array element of plotList array
  	let puName = pv[0]; // get process unit name
  	let varName = pv[1]; // get variable object name
    // now need to get var label, units, etc. from puName.varName object
    tmpFunc = new Function("return " + puName + "." + varName + ".name;");
    plotVarName[p] = tmpFunc();
    tmpFunc = new Function("return " + puName + "." + varName + ".units;");
    plotVarUnits[p] = tmpFunc();
  }

  var numPlotPoints = simParams.numPlotPoints;
  var tText; // we will put the data into this variable
  var tItemDelimiter = ", &nbsp;"

  // Some labels & data variables may contain no data because they are not
  // specified in simParams object as plot variables.

  tText = "<p>Copy and paste these data into a text file for loading into your analysis program.</p>";
  tText += "<p>time (s)";
  for (p = 0; p < numVar; p += 1) {
    if (plotVarName[p] !== "") {tText += tItemDelimiter + plotVarName[p] + "&nbsp;" + plotVarUnits[p];}
  }
  tText += "</>";

  // use !== undefined below because !== "" is not true (== "" is true) for zero numeric value
  // values must be numbers for .toFixed() or .toPrecision() to work,
  // so use Number() conversion here (and when getting data from html input fields)

  // xxx WOULD IT BE FASTER to check only 1st array element and set flags
  //     and then only check flags in repeat loop?

  tText += "<p>";
  for (k = 0; k <= numPlotPoints; k += 1) {
      // process row of data
      // get time of row of data from 1st [0] variable's data
      if (plotData[0][k][0] !== undefined) {tText += Number(plotData[0][k][0]).toPrecision(3);}
      // get the value [1] for each variable for this row
      for (p = 0; p < numVar; p += 1) {
        if (plotData[p][k][1] !== undefined) {tText += tItemDelimiter + Number(plotData[p][k][1]).toPrecision(3);}
      }
    tText += "<br>" // use <br> not <p> or get empty line between each row
  }

  tText += "</p>";

  // for window.open, see http://www.w3schools.com/jsref/met_win_open.asp
  dataWindow = window.open("", "Copy data",
        "height=600, left=20, resizable=1, scrollbars=1, top=40, width=600");
  dataWindow.document.writeln("<html><head><title>Copy data</title></head>" +
         "<body>" +
         tText +
         "</body></html>");
  dataWindow.document.close();

 } // end of function copyData
