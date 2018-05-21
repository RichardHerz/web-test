/*
  Design, text, images and code by Richard K. Herz, 2017-2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// WARNING: number plot points here should match number plot points in
//          unit that generates the plot data
//          where number plot points + 1 for origin are plotted
//
// WARNING: unit local data array names for plotting must be
//          'profileData' for ['type'] = 'profile'
//          'stripData' for ['type'] = 'strip'
//          'colorCanvasData' for ['type'] = 'canvas'

// THIS FILE USED FOR DEFINITION OF PROFILE, STRIP CHART & COLOR CANVAS PLOTS

// NOTE: processUnits[0] is plug flow reactor in this web lab
//
var unum = 0; // useful when only one unit in lab, processUnits[unum]

// COMMON VALUES FOR PROFILE PLOTS (static x,y plots)
// these vars used several places below in this file
var numProfileVars = 2;
var numProfilePts = processUnits[unum]['numNodes'];

// COMMON VALUES FOR STRIP CHART PLOTS (scrolling x,y plots)
// these vars used several places below in this file
var numStripVars = 0;
var numStripPts = 0;

// COMMON VALUES FOR SPACE-TIME, COLOR-CANVAS PLOTS
// if want square canvas 'pixels' set time/space pt ratio = canvas width/height ratio
// these vars used several places below in this file
var numSpaceTimeVars = 2;
var numTimePts = processUnits[unum]['numNodes'];
var numSpacePts = 1; // 1 for one, number is numSpacePts

// WE CURRENTLY USE FLOT.JS FOR PLOTTING PROFILE & STRIP PLOTS
// some options below such as plotDataSeriesColors are optional for flot.js
// and flot.js will use default values for those options

// DECLARE PARENT OBJECT TO HOLD PLOT INFO
// the object properties are used by plotting functions
// in file process_plotter.js
// more than one plot can be put one one web page by
// defining multiple object children, where the first index
// plotsObj[0] is the plot number index (starting at 0)
//
var plotsObj = new Object();
  //
  // USE THIS TO GET NUMBER OF plots, i.e., top-level children of plotsObj
  //    Object.keys(plotsObj).length;
  // except this will include any additional top level children
  //
  // WARNING: some of these object properties may be changed during
  //          operation of the program, e.g., show, scale
  //
  // plot 0 info
  plotsObj[0] = new Object();
  plotsObj[0]['type'] = 'profile';
  plotsObj[0]['title'] = 'PFR profiles';
  plotsObj[0]['canvas'] = '#div_PLOTDIV_PFR_plot'; // flot.js wants ID with prefix #
  plotsObj[0]['numberPoints'] = processUnits[unum]['numNodes']; // should match numNodes in process unit
  // plot has numberPoints + 1 pts!
  plotsObj[0]['xAxisLabel'] = 'position';
  plotsObj[0]['xAxisTableLabel'] = 'Position'; // label for copy data table
  // xAxisShow false does not show numbers, nor label, nor grid for x-axis
  // might be better to cover numbers if desire not to show numbers
  plotsObj[0]['xAxisShow'] = 1; // 0 false, 1 true
  plotsObj[0]['xAxisMin'] = 0;
  plotsObj[0]['xAxisMax'] = 1;
  plotsObj[0]['xAxisReversed'] = 0; // 0 false, 1 true, when true, xmax on left
  plotsObj[0]['yLeftAxisLabel'] = 'Trxr (K)'; // or d'less (T - TinCold)/(TinHot - TinCold)
  plotsObj[0]['yLeftAxisMin'] = processUnits[unum]['minTrxr'];
  plotsObj[0]['yLeftAxisMax'] = processUnits[unum]['maxTrxr'];
  plotsObj[0]['yRightAxisLabel'] = 'Ca (mol/m3)';
  plotsObj[0]['yRightAxisMin'] = 0;
  plotsObj[0]['yRightAxisMax'] = processUnits[unum]['Cain'];
  plotsObj[0]['plotLegendShow'] = 1;  // Boolean, '' or 0 for no show, 1 or "show"
  plotsObj[0]['plotLegendPosition'] = 'nw';
  plotsObj[0]['plotGridBgColor'] = 'white';
  // colors can be specified rgb, rgba, hex, and color names
  // for flot.js colors, only basic color names appear to work, e.g., white, blue, red
  // for all html color names to hex see http://www.color-hex.com
  // for all color names to hex see https://www.w3schools.com/colors/colors_picker.asp
  plotsObj[0]['plotDataSeriesColors'] = ['#ff6347','#1e90ff']; // optional, in variable order 0, 1, etc.
  // ['#ff6347','#1e90ff'] is Tomato and DodgerBlue
  plotsObj[0]['varUnitIndex'] = new Array();
    plotsObj[0]['varUnitIndex'][0] = unum; // value is index of unit in processUnits object
    plotsObj[0]['varUnitIndex'][1] = unum;
  plotsObj[0]['var'] = new Array();
    // VALUES are data array var # to be put on plot & legend + those only in data table
    // these values may not start at 0, e.g., one plot has 0,1, another has 2,3
    plotsObj[0]['var'][0] = 0; // values are curve data number to be put on plot
    plotsObj[0]['var'][1] = 1; // listed in order of varLabel order, etc.
  plotsObj[0]['varLabel'] = new Array();
    // list labels in 'varLabel' in order of corresonding 'var' VALUES above
    plotsObj[0]['varLabel'][0] = 'Trxr'; // 1st var
    plotsObj[0]['varLabel'][1] = 'Ca';
  plotsObj[0]['varShow'] = new Array();
    // values are 'show' to show on plot and legend,
    // 'tabled' to not show on plot nor legend but list in copy data table
    // and any other value, e.g., 'hide' to not show on plot but do show in legend
    // value can be changed by javascript if want to show/hide curve with checkbox
    plotsObj[0]['varShow'][0] = 'show'; // 1st var
    plotsObj[0]['varShow'][1] = 'show';
  plotsObj[0]['varYaxis'] = new Array();
    plotsObj[0]['varYaxis'][0] = 'left'; // 1st var
    plotsObj[0]['varYaxis'][1] = 'right';
  plotsObj[0]['varYscaleFactor'] = new Array();
    plotsObj[0]['varYscaleFactor'][0] = 1; // 1st var
    plotsObj[0]['varYscaleFactor'][1] = 1;
  // ALTERNATIVE to separate arrays for variable number, show, axis
  //    might be to have one array per variable equal to an array of info...?

  // plot 1 info
  plotsObj[1] = new Object();
  plotsObj[1]['type'] = 'canvas';
  plotsObj[1]['title'] = 'reactor color canvas';
  plotsObj[1]['canvas'] = 'canvas_CANVAS_reactor'; // without prefix #
    plotsObj[1]['varUnitIndex'] = unum; // index of unit in processUnits object
  plotsObj[1]['var'] = 0; // variable number in array spaceTimeData, 0, 1, etc.
  plotsObj[1]['varValueMin'] = processUnits[unum]['minTrxr'];
  plotsObj[1]['varValueMax'] = processUnits[unum]['maxTrxr'];
  plotsObj[1]['xAxisReversed'] = 0; // 0 false, 1 true, when true, xmax on left

  // plot 2 info
  plotsObj[2] = new Object();
  plotsObj[2]['type'] = 'canvas';
  plotsObj[2]['title'] = 'jacket color canvas';
  plotsObj[2]['canvas'] = 'canvas_CANVAS_jacket'; // without prefix #
  plotsObj[2]['varUnitIndex'] = unum; // index of unit in processUnits object
  plotsObj[2]['var'] = 1; // variable number in array spaceTimeData, 0, 1, etc.
  plotsObj[2]['varValueMin'] = processUnits[unum]['minTrxr'];
  plotsObj[2]['varValueMax'] = processUnits[unum]['maxTrxr'];
  plotsObj[2]['xAxisReversed'] = 0; // 0 false, 1 true, when true, xmax on left

  // DEFINE plotFlag ARRAY so don't have to generate entire
  // profile or strip plot everytime want to just change data and not axes, etc.
  // for example, for 4 plots on page, this ran in 60% of time for full refresh
  // plotFlag array used in function plotPlotData
  //
  // WARNING: plotFlag ARRAY MUST BE DEFINED AFTER ALL plotsObj CHILDREN
  //
  var npl = Object.keys(plotsObj).length; // number of plots
  var p; // used as index
  var plotFlag = [0];
  for (p = 1; p < npl; p += 1) {
    plotFlag.push(0);
  }

  // BELOW ARE FUNCTIONS USED BY PROCESS UNITS TO INITIALIZE THEIR LOCAL DATA ARRAYS

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

  function initColorCanvasArray(numVars,numXpts,numYpts) {
    // returns 3D array to hold data for multiple variables for COLOR CANVAS
    // plots, e.g., space-time plots
    // returns array with all elements for plot filled with zero
    //    index 1 specifies the variable [0 to numVars-1]
    //    index 2 specifies the x-axis (time) point [0 to & INCLUDING numXpts]
    //    index 3 specifies the y-axis (space) point [0 to numYpts-1]
    //    the element value at plotDataStub[v][x][y] will be the value
    //      to be shown for that variable at that x,y location
    var v;
    var x;
    var y;
    var plotDataStub = new Array();
    for (v = 0; v < numVars; v += 1) {
      plotDataStub[v] = new Array();
        for (x = 0; x <= numXpts; x += 1) { // NOTE = AT <=
        plotDataStub[v][x] = new Array();
        for (y = 0; y < numYpts; y += 1) {
          plotDataStub[v][x][y] = 0;
        }
      }
    }
    // document.getElementById("dev01").innerHTML = "hello";
    return plotDataStub;
  } // end function initColorCanvasArray
