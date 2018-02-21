// by Richard K. Herz of www.ReactorLab.net
// 2015

// quick solution - have the data arrays as globals so they are
// persistant between display updates
var gConcData = new Array();
var gTTempData = new Array();
var gJacketTTempDataINLET = new Array();
var gJacketTTempData = new Array();

var gNumberPlotPoints = 45;
var gPointTimeInterval = 4; // xxx temporary, = main.js, = dt*stepRepeats


// ----- FUNCTIONS WITH SPECIFIC UNIT VARIABLE NAMES ---------

// functions getPlotData and plotPlotData refer
// to specific unit names and variables defined
// in file process_units.js

function getPlotData(resetFlag){

  // on resetFlag = 1, fill arrays with initial values
  // on resetFlag = 0, drop first point at start of array and add new point at end

  // NEED TO RETAIN DATA ARRAYS BETWEEN DISPLAY UPDATES
  // quick solution is to use GLOBALS
  // gConcData holds unit_2.conc
  // gTTempData holds unit_2.TTemp

  // sample structure of these data arrays:
  // gTTempData = [[1, 300], [2, 600], [3, 550], [4, 400], [5, 300]];
  // gConcData = [[1, 0], [2, 0.25], [3, 0.5], [4, 0.6], [5, 0.4]];

  var k;
  var newConcData = gConcData;
  var newTTempData = gTTempData;
  var newJacketTTempDataINLET = gJacketTTempDataINLET;
  var newJacketTTempData = gJacketTTempData;

  var tempConcData = gConcData; // new Array();
  var tempTTempData = gTTempData; // new Array();
  var tempJacketTTempDataINLET = gJacketTTempDataINLET; // new Array();
  var tempJacketTTempData = gJacketTTempData; // new Array();

  if (resetFlag){

    // reset and fill data arrays with initial values
    // needed next two lines or got undefined error if start for at k=0
    newConcData[0] = [0, unit_2.conc];
    newTTempData[0] = [0, unit_2.TTemp];
    newJacketTTempDataINLET[0] = [0, unit_3.TTemp];
    newJacketTTempData[0] = [0, unit_4.TTemp];
    for (k = 1; k <= gNumberPlotPoints; k++){
      newConcData[k] = [k * gPointTimeInterval, unit_2.conc];
      newTTempData[k] = [k * gPointTimeInterval, unit_2.TTemp];
      newJacketTTempDataINLET[k] = [k * gPointTimeInterval, unit_3.TTemp];
      newJacketTTempData[k] = [k * gPointTimeInterval, unit_4.TTemp];
    }

  } else {

    // delete oldest data points at start with array slice method
    tempConcData = newConcData.slice(1);
    tempTTempData = newTTempData.slice(1);
    tempJacketTTempDataINLET = newJacketTTempDataINLET.slice(1);
    tempJacketTTempData = newJacketTTempData.slice(1);

    // add the new points at end with array push method
    tempConcData.push([gNumberPlotPoints-1, unit_2.conc]);
    tempTTempData.push([gNumberPlotPoints-1, unit_2.TTemp]);
    tempJacketTTempDataINLET.push([gNumberPlotPoints-1, unit_3.TTemp]);
    tempJacketTTempData.push([gNumberPlotPoints-1, unit_4.TTemp]);

    // re-number the x-axis values
    // so they stay the same after slicing and pushing
    for (k = 0; k <= gNumberPlotPoints; k++){
      tempConcData[k][0] = k * gPointTimeInterval;
      tempTTempData[k][0] = k * gPointTimeInterval;
      tempJacketTTempDataINLET[k][0] = k * gPointTimeInterval;
      tempJacketTTempData[k][0] = k * gPointTimeInterval;
    }

    // copy arrays
    newConcData = tempConcData;
    newTTempData = tempTTempData;
    newJacketTTempDataINLET = tempJacketTTempDataINLET;
    newJacketTTempData = tempJacketTTempData;

  } // END OF if (resetFlag)

  // copy arrays
  gConcData = newConcData;
  gTTempData = newTTempData;
  gJacketTTempDataINLET = newJacketTTempDataINLET;
  gJacketTTempData = newJacketTTempData;

  return [newConcData, newTTempData, newJacketTTempDataINLET, newJacketTTempData];

} // END OF function getPlotData

function plotPlotData(pData){

  // SEE WEB SITE OF flot.js
  //     http://www.flotcharts.org/
  // SEE DOCUMENTATION FOR flot.js
  //     https://github.com/flot/flot/blob/master/API.md

  concData = pData[0];
  TTempData = pData[1];
  jacketTTempDataINLET = pData[2];

  // XXX not sure why right y-axis is yaxis:1 ??
  dataToPlot = [ { data: concData, label: "Reactant conc.", yaxis:2 },
                { data: TTempData, label: "Reactor T", yaxis:1 },
                { data: jacketTTempDataINLET, label: "Jacket inlet T", yaxis:1 } ];

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
    xaxes: [ { min: 0, max: 180, axisLabel: "Time (s), 0-180 s span" } ],
    yaxes: [ { position: "right", min: 300, max: 400, axisLabel: "Temperature (K)" },
        { position: "left", min: 0, max: 400, axisLabel: "Reactant Concentration" } ],
    legend: { position: "nw" } // e.g., nw = north (top) west (left)
  };

  var plot = $.plot($("#div_PLOTDIV_plotData"), dataToPlot, options);

} // END OF function plotPlotData

function copyData(){

	var tText; // we will put the data into this variable

  tText = '<p>Copy and paste these data into a text file for loading into your analysis program.</p>';
  tText += '<p>time (s), reactant conc (mol/m<sup>3</sup>), reactor T (K), jacket inlet T (K), jacket T (K)</>'

  // gConcData, gTTempData, gJacketTTempDataINLET, gJacketTTempData
  // values must be numbers for .toFixed(2) to work, use Number() conversion
  // when getting values from input fields

  tText += '<p>';

  var k;
  var tItemDelimiter = ', &nbsp;'
  for (k = 1; k <= gNumberPlotPoints; k++){
    tText += gConcData[k][0].toFixed(2) + tItemDelimiter + // [k][0] is time
             gConcData[k][1].toFixed(2) + tItemDelimiter +
             gTTempData[k][1].toFixed(2) + tItemDelimiter +
             gJacketTTempDataINLET[k][1].toFixed(2) + tItemDelimiter +
             gJacketTTempData[k][1].toFixed(2) +
             '<br>' // use <br> not <p> or get empty line between each row
  }

  tText += '</p>';

  // for window.open, see http://www.w3schools.com/jsref/met_win_open.asp
  dataWindow = window.open('', 'Copy data',
        'height=600, left=20, resizable=1, scrollbars=1, top=40, width=600');
  dataWindow.document.writeln('<html><head><title>Copy data</title></head>' +
         '<body>' +
         tText +
         '</body></html>');
  dataWindow.document.close();

 } // end of function copyData
