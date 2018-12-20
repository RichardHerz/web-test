// by Richard K. Herz of www.ReactorLab.net
// 2015

// quick solution - have the data arrays as globals so they are
// persistant between display updates
var gBiomassData = new Array();
var gConcData = new Array();
var gFeedConcData = new Array();

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
  var newFeedConcData = gFeedConcData;
  var newConcData = gConcData;
  var newBiomassData  = gBiomassData;

  var tempFeedConcData = gFeedConcData; // new Array();
  var tempConcData = gConcData; // new Array();
  var tempBiomassData = gBiomassData; // new Array();

  if (resetFlag){

    // reset and fill data arrays with initial values
    // needed next two lines or got undefined error if start for at k=0
    newFeedConcData = [0, unit_1.conc]
    newConcData[0] = [0, unit_2.conc];
    newBiomassData[0] = [0, unit_2.biomass];
    for (k = 1; k <= gNumberPlotPoints; k++){
      newFeedConcData[k] = [k * gPointTimeInterval, unit_1.conc];
      newConcData[k] = [k * gPointTimeInterval, unit_2.conc];
      newBiomassData[k] = [k * gPointTimeInterval, unit_2.biomass];
    }

  } else {

    // delete oldest data points at start with array slice method
    tempFeedConcData = newFeedConcData.slice(1);
    tempConcData = newConcData.slice(1);
    tempBiomassData = newBiomassData.slice(1);

    // add the new points at end with array push method
    tempFeedConcData.push([gNumberPlotPoints-1, unit_1.conc]);
    tempConcData.push([gNumberPlotPoints-1, unit_2.conc]);
    tempBiomassData.push([gNumberPlotPoints-1, unit_2.biomass]);

    // re-number the x-axis values
    // so they stay the same after slicing and pushing
    for (k = 0; k <= gNumberPlotPoints; k++){
      tempFeedConcData[k][0] = k * gPointTimeInterval;
      tempConcData[k][0] = k * gPointTimeInterval;
      tempBiomassData[k][0] = k * gPointTimeInterval;
    }

    // copy arrays
    newFeedConcData = tempFeedConcData;
    newConcData = tempConcData;
    newBiomassData = tempBiomassData;

  } // END OF if (resetFlag)

  // copy arrays
  gFeedConcData = newFeedConcData;
  gConcData = newConcData;
  gBiomassData = newBiomassData;

  return [newFeedConcData, newConcData, newBiomassData];

} // END OF function getPlotData

function plotPlotData(pData){

  // SEE WEB SITE OF flot.js
  //     http://www.flotcharts.org/
  // SEE DOCUMENTATION FOR flot.js
  //     https://github.com/flot/flot/blob/master/API.md

  feedConcData = pData[0];
  concData = pData[1];
  biomassData = pData[2];

  // XXX not sure why right y-axis is yaxis:1 ??

  // COLORS IN LABEL ARE IN ORDER FROM TOP: YELLOW, BLUE, RED

  // dataToPlot = [ { data: feedConcData, label: "substrate feed conc.", yaxis:2 },
  //               { data: concData, label: "substrate conc.", yaxis:2  },
  //               { data: biomassData, label: "biomass conc.", yaxis:1 } ];

  dataToPlot = [ { data: biomassData, label: "biomass conc.", yaxis:1 },
                { data: concData, label: "substrate conc.", yaxis:1  },
                { data: feedConcData, label: "substrate feed conc.", yaxis:2 } ];

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
    xaxes: [ { min: 0, max: 180, axisLabel: "Time (hr), 0-180 hr span" } ],
    yaxes: [ { position: "right", min: 0, max: 20, axisLabel: "Conc in bioreactor (kg/m3)" },
        { position: "left", min: 0, max: 40, axisLabel: "Feed substrate conc (kg/m3)" } ],
    legend: { position: "nw" } // e.g., nw = north (top) west (left)
  };

  var plot = $.plot($("#plotCanvas"), dataToPlot, options);

} // END OF function plotPlotData

function copyData(){

	var tText; // we will put the data into this variable

  tText = '<p>Copy and paste these data into a text file for loading into your analysis program.</p>';
  tText += '<p>time (hr), feed substrate conc (kg/m<sup>3</sup>), substrate conc (kg/m<sup>3</sup>), biomass conc (kg/m<sup>3</sup>), </>'

  // gConcData, gTTempData, gJacketTTempDataINLET, gJacketTTempData
  // values must be numbers for .toFixed(2) to work, use Number() conversion
  // when getting values from input fields

  tText += '<p>';

  var k;
  var tItemDelimiter = ', &nbsp;'
  for (k = 1; k <= gNumberPlotPoints; k++){
    tText += gFeedConcData[k][0].toFixed(2) + tItemDelimiter + // [k][0] is time
             gFeedConcData[k][1].toFixed(2) + tItemDelimiter +
             gConcData[k][1].toFixed(2) + tItemDelimiter +
             gBiomassData[k][1].toFixed(2) +
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
