/*
  Design, text, images and code by Richard K. Herz, 2017-2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// SEE PLOT DEFINITIONS IN FILE process_plot_info.js

// ----- GET DATA IN FORM NEEDED FOR PLOTTING ---------

function getPlotData(plotsObjNum) {
  //
  // input argument plotsObjNum refers to plot number in object plotsObj
  // which is defined in file process_plot_info.js
  //
  // uses plotsObj and plotArrays objects defined in file process_plot_info.js

  var v = 0; // used as index to select the variable
  var p = 0; // used as index to select data point pair
  var n = 0; // used as index
  var sf = 1; // scale factor used below

  var numPlotPoints = plotsObj[plotsObjNum]['numberPoints'];
  // plot will have 0 to numberPoints for total of numberPoints + 1 points
  var varNumbers = plotsObj[plotsObjNum]['var'];
  var numVar = varNumbers.length;
  var varUnitIndex;
  var plotData = initPlotData(numVar,numPlotPoints);

  // get data for plot
  for (v = 0; v < numVar; v += 1) {

    // get unit index and array name for this variable
    varUnitIndex = plotsObj[plotsObjNum]['varUnitIndex'][v];
    // get number n of variable listed in unit's data array
    n = varNumbers[v];
    // copy variable in array from unit
    // need to do this separately for each variable because they
    // may be from different units

    // IF REQUIRES unit local array name to be profileData or stripData
    if (plotsObj[plotsObjNum]['type'] == 'profile') {
      plotData[v] = processUnits[varUnitIndex]['profileData'][n];
    } else if (plotsObj[plotsObjNum]['type'] == 'strip') {
      plotData[v] = processUnits[varUnitIndex]['stripData'][n];
    } else {
      alert('in getPlotData, unknown plot type');
    }

    // NOTE: if I go back to earlier scheme I might be able to use some of the
    // strategy here in copying entire var vectors in order to eliminate
    // some steps in this 'for' repeat...
  }

  // scale y-axis values if scale factor not equal to 1
  for (v = 0; v < numVar; v += 1) {
    sf = plotsObj[plotsObjNum]['varYscaleFactor'][v];
    if (sf != 1) {
      for (p = 0; p <= numPlotPoints; p += 1) {
        plotData[v][p][1] = sf * plotData[v][p][1];
      }
    }
  }

  return plotData;

} // END OF function getPlotData

// ----- FUNCTION TO PLOT DATA ---------

function plotPlotData(pData,pNumber) {

  // SEE WEB SITE OF flot.js
  //     http://www.flotcharts.org/
  // SEE DOCUMENTATION FOR flot.js
  //     https://github.com/flot/flot/blob/master/API.md
  // axisLabels REQUIRES LIBRARY flot.axislabels.js, SEE
  //     https://github.com/markrcote/flot-axislabels

  // input pData holds the data to plot
  // input pNumber is number of plot as 1st index in plotsObj

  // var plot = [];

  // get info about the variables

  var plotList = plotsObj[pNumber]['var'];
  // plotList is array whose elements are the values of the
  // first index in pData array which holds the x,y values to plot

  var k = 0; // used as index in plotList
  var v = 0; // value of element k in plotList
  var vLabel = []; // array to hold variable names for plot legend
  var yAxis = []; // array to hold y-axis, "left" or "right"
  var vShow = []; // array to hold "show" or "hide" (hide still in copy-save data)
  plotList.forEach(fGetAxisData);
  function fGetAxisData(v,k) {
	  // v = value of element k of plotList array
    // k is index of plotList array
    yAxis[k] = plotsObj[pNumber]['varYaxis'][k]; // get "left" or "right" for plot y axis
    vShow[k] = plotsObj[pNumber]['varShow'][k]; // get "show" or "hide"
    vLabel[k] = plotsObj[pNumber]['varLabel'][k];
  }

  // put data in form needed by flot.js

  var plotCanvasHtmlID = plotsObj[pNumber]['canvas'];

  var dataToPlot = [];
  var numVar = plotList.length;
  var numToShow = 0; // index for variables to show on plot
  // KEEP numToShow as well as for index k because not all k vars will show!
  // only variables with property "show" will appear on plot
  for (k = 0; k < numVar; k += 1) {
    // add object for each plot variable to array dataToPlot
    // e.g., { data: y1Data, label: y1DataLabel, yaxis: 1 }
    let newobj = {};
    if (vShow[k] === 'show') {
      // NOTE: THIS CHECK OF "SHOW" COULD BE MOVED UP INTO
      // getPlotData FUNCTION WHERE DATA SELECTED TO PLOT
      // SINCE BOTH FUNCTIONS ARE CALLED EACH PLOT UPDATE...
      // pData is not full profileData nor full stripData
      // pData has the variables specified in plotsObj[pNumber]['var']
      // now want to select the vars in pData with "show" property true
      // *BUT* see "else" condition below
      newobj.data = pData[k];
      newobj.label = vLabel[k];
      if (yAxis[k] === 'right') {newobj.yaxis = 1;} else {newobj.yaxis = 2;}
      dataToPlot[k] = newobj;
    } else if (vShow[k] == 'tabled') {
      // do not plot this variable and do not add to legend
    } else {
      // do not plot this variable
      // *BUT* need to add a single point in case no vars on this axis to show
      // in which case no axis labels will show without this single point
      newobj.data = [plotsObj[pNumber]['xAxisMax'],plotsObj[pNumber]['yLeftAxisMax']];
      newobj.label = vLabel[k];
      if (yAxis[k] === 'right') {newobj.yaxis = 1;} else {newobj.yaxis = 2;}
      dataToPlot[k] = newobj;
    }
  } // END OF for (k = 0; k < numVar; k += 1) {

  // set up the plot axis labels and plot legend

    var xShow = plotsObj[pNumber]['xAxisShow'];
    var xLabel = plotsObj[pNumber]['xAxisLabel'];;
    var xMin= plotsObj[pNumber]['xAxisMin'];
    var xMax = plotsObj[pNumber]['xAxisMax'];
    var yLeftLabel = plotsObj[pNumber]['yLeftAxisLabel'];
    var yLeftMin = plotsObj[pNumber]['yLeftAxisMin'];
    var yLeftMax = plotsObj[pNumber]['yLeftAxisMax'];
    var yRightLabel = plotsObj[pNumber]['yRightAxisLabel'];
    var yRightMin = plotsObj[pNumber]['yRightAxisMin'];
    var yRightMax = plotsObj[pNumber]['yRightAxisMax'];
    var plotLegendPosition = plotsObj[pNumber]['plotLegendPosition'];
    var plotLegendShow = plotsObj[pNumber]['plotLegendShow']; // Boolean 0,1
    var plotGridBgColor = plotsObj[pNumber]['plotGridBgColor'];
    var plotDataSeriesColors = plotsObj[pNumber]['plotDataSeriesColors'];

    var options = {
      // axisLabels REQUIRES LIBRARY flot.axislabels.js, SEE
      //     https://github.com/markrcote/flot-axislabels
      axisLabels : {show: true},
      xaxes: [ { show: xShow, min: xMin, max: xMax, axisLabel: xLabel } ],
      yaxes: [
      // yaxis object listed first is "yaxis: 1" in dataToPlot, second is 2
        {position: 'right', min: yRightMin, max: yRightMax, axisLabel: yRightLabel },
        {position: 'left', min: yLeftMin, max: yLeftMax, axisLabel: yLeftLabel },
      ],
    legend: { show: plotLegendShow },
    legend: { position: plotLegendPosition },
    grid: { backgroundColor: plotGridBgColor },
    colors: plotDataSeriesColors
  };

  // check if want to reverse data left-right on x-axis
  // when reversed, xmax is on left, xmin on right
  if (plotsObj[pNumber]['xAxisReversed']) {
    options.xaxis = {
      transform: function (v) { return -v; },
      inverseTransform: function (v) { return -v; }
    }
  }

  // only draw plot with axes and all options the first time /
  // after that just setData and re-draw;
  // plot[pNumber] saves data for each plot between display updates
  // plotFlag[pNumber] telling whether or not to redraw axes & labels
  // since plot[] must save data between display updates, it is a GLOBAL
  // for example, for 4 plots on page, this ran in 60% of time for full refresh
  // see object plotArrays below for intialization of plot[] and plotFlag[]

  if (plotArrays['plotFlag'][pNumber] == 0) {
    plotArrays['plotFlag'][pNumber] = 1;
    plotArrays['plot'][pNumber] = $.plot($(plotCanvasHtmlID), dataToPlot, options);
  } else {
    plotArrays['plot'][pNumber].setData(dataToPlot);
    plotArrays['plot'][pNumber].draw();
  }

} // END OF function plotPlotData

// ----- OBJECT USED TO HOLD PLOT DEFINITIONS BETWEEN DISPLAY UPDATES ---

var plotArrays = {

  // DEFINE plot array used to save complete description of plot between updates
  // plot array used in function plotPlotData
  plot : [],

  // DEFINE plotFlag array so don't have to generate entire plot
  // everytime want to just change data and not axes, etc.
  // for example, for 4 plots on page, this ran in 60% of time for full refresh
  // plotFlag array used in function plotPlotData
  //
  plotFlag : [], // tells whether or not to update only curves or complete plot

  initialize : function() {
    // uses length of plotObs so must be called after plotsObj has been initialized
    let npl = Object.keys(plotsObj).length; // number of plots
    this.plotFlag = [0];
    for (p = 1; p < npl; p += 1) {
      this.plotFlag.push(0);
    }
  } // END of method initialize()

} // END of object plotArrays

// ----- FUNCTION USED BY UNITS TO INITIALIZE LOCAL DATA ARRAYS -----

function initPlotData(numVars,numPlotPoints) {
  // returns 3D array to hold x,y scatter plot data for multiple variables
  // inputs are list of variables and # of x,y point pairs per variable
  // returns array with all elements for plot filled with zero
  //    index 1 specifies the variable [0 to numVars-1],
  //    index 2 specifies the data point pair [0 to & including numPlotPoints]
  //    index 3 specifies x or y in x,y data point pair [0 & 1]
  var v;
  var p;
  var plotDataStub = new Array();
  for (v = 0; v < numVars; v += 1) {
    plotDataStub[v] = new Array();
    for (p = 0; p <= numPlotPoints; p += 1) { // NOTE = AT p <=
      plotDataStub[v][p] = new Array();
      plotDataStub[v][p][0] = 0;
      plotDataStub[v][p][1] = 0;
    }
  }
  return plotDataStub;
  // Note above initialize values for
  //    plotDataStub [0 to numVars-1] [0 to numPlotPoints] [0 & 1]
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

// ----- FUNCTIONS TO COPY DATA TO TABLE ---------

function formatNum(n) {
  var nn = n;
  if ((nn > 1000) || (nn < -1000)) {
    nn = nn.toExponential(3);
  } else if ((nn > 100) || (nn < -100)) {
  	nn = nn.toFixed(1);
  } else if ((nn > 10) || (nn < -10)) {
    nn = nn.toFixed(2);
  } else if ((nn > 1) || (nn < -1)) {
  	nn = nn.toFixed(3);
  } else if ((nn > 0.01) || (nn < -0.01)) {
    nn = nn.toFixed(4);
  } else {
    nn = nn.toExponential(3);
  }
  return nn;
}

function copyData(plotIndex){
  // plotIndex is the index of the plotsObj object of the desired plot to copy
  // as specified in process_plot_info.js

  // if sim is running, pause the sim
  // copy grabs what is showing on plot when copy button clicked
  // so want user to be able to take screenshot to compare with data copied
  var runningFlag = simParams.runningFlag;
  if (runningFlag) {
    runThisLab(); // toggles running state
  }

  var n; // index
  var v; // variable index
  var k; // points index
  var numUnits;
  var numVar;
  var varIndex; // index of selected variable in unit local data array
  var varUnitIndex; // index of unit from which variable is to be obtained
  var tText; // we will put the data into this variable
  var tItemDelimiter = ', &nbsp;'
  var tVarLabelLen = plotsObj[plotIndex]['varLabel'].length; // length for loops below

  tText = '<p>Web Labs at ReactorLab.net &nbsp; &gt; &nbsp;' + simParams.title + '</p>';

  // list current input values
  tText += '<p>Simulation time of data capture = ' + simParams.simTime + ' s <br>';
  tText += 'Values of input parameters at time of data capture:<br>';
  // list inputs for all units since, other units may affect these results
  numUnits = Object.keys(processUnits).length;
  for (n = 0; n < numUnits; n += 1) {
    tText += '* ' + processUnits[n]['name'] + '<br>';
    numVar = processUnits[n]['VarCount'];
    for (v = 0; v <= numVar; v += 1) { // NOTE: <=
      tText += '&nbsp; &nbsp;' + processUnits[n]['dataHeaders'][v] + ' = '
              + processUnits[n]['dataValues'][v] + '&nbsp;'
              + processUnits[n]['dataUnits'][v] + '<br>';
    }
  }
  tText += '</p>';

  tText += '<p>' + plotsObj[plotIndex]['title'] + '</p>';

  // column headers
  tText += '<p>';
  // first, x-axis variable name for table
  tText += plotsObj[plotIndex]['xAxisTableLabel'] + tItemDelimiter;
  // then other column names for y-axis variables
  for (v = 0; v < tVarLabelLen; v += 1) {
    tText += plotsObj[plotIndex]['varLabel'][v];
    tText += ' (' + plotsObj[plotIndex]['varDataUnits'][v] + ')';
    if (v < (tVarLabelLen - 1)) {
      tText += tItemDelimiter;
    }
  }
  tText += '</p>';

  // data values must be numbers for .toFixed(2) to work, use Number() conversion
  // when getting values from input fields
  //    index 1 specifies the variable [0 to numVars-1],
  //    index 2 specifies the data point pair [0 to & including numPlotPoints]
  //    index 3 specifies x or y in x,y data point pair [0 & 1]

  // initiate string that holds the data table
    tText += '<p>';

  var plotType = plotsObj[plotIndex]['type']; // profile or strip
  var dataName = plotType + 'Data'; // profileData or stripData
  if ((plotType == 'profile') || (plotType == 'strip')) {
    // repeat to make each line in table for each data point
    for (k = 0; k <= plotsObj[plotIndex]['numberPoints']; k += 1) {
      // first get x value in [k][0], get it from ['var'][0]
      // x values should be same for all units for this plot
      varIndex = plotsObj[plotIndex]['var'][0];
      varUnitIndex = plotsObj[plotIndex]['varUnitIndex'][0];
      tText += formatNum(processUnits[varUnitIndex][dataName][varIndex][k][0]) + tItemDelimiter;
        // get y value for each variable in [k][1]
        for (v = 0; v < tVarLabelLen; v += 1) {
          varIndex = plotsObj[plotIndex]['var'][v];
          varUnitIndex = plotsObj[plotIndex]['varUnitIndex'][v];
          tText += formatNum(processUnits[varUnitIndex][dataName][varIndex][k][1]); // [k][1] is y value
          if (v < (tVarLabelLen - 1)) {tText += tItemDelimiter;}
        }
      tText += '<br>'; // use <br> not <p> or get empty line between each row
    }
  } else {
    alert('unknown plot type');
    return;
  }

  // terminate string that holds the data table
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
