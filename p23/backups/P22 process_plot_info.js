/*
  Design, text, images and code by Richard K. Herz, 2017-2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// THIS FILE USED FOR DEFINITION OF PLOTS: PROFILE, STRIP CHART, & COLOR CANVAS

// WARNING: in units, local data array names for plotting must be
//          'profileData' for ['type'] = 'profile'
//          'stripData' for ['type'] = 'strip'
//          'colorCanvasData' for ['type'] = 'canvas'

// WE CURRENTLY USE FLOT.JS FOR PLOTTING PROFILE & STRIP PLOTS
// some options below such as plotDataSeriesColors are optional for flot.js
// and flot.js will use default values for those options

// ------- DECLARE PARENT OBJECT TO HOLD PLOT INFO --------

// the object properties are used by plotting functions
// in file process_plotter.js
// more than one plot can be put one one web page by
// defining multiple object children, where the first index
// plotsObj[0] is the plot number index (starting at 0)
//
// method initialize() below places the plot definitions into plotsObj
//
var plotsObj = {

  // after the openThisLab() function in _main.js calls method initialize()
  // here, this object will contain a child object for each plot
  //
  // method initialize() is run after each process units initialize() method
  // is run by openThisLab() so that it can use values from the units,
  // e.g., processUnits[unum]['dataMin'][1]; // [1] is TinCold
  //
  // in _main.js, the function updateDisplay() uses the length of plotsObj
  // after subtracting 1 for method initialize, in order to plot all the plots;
  // if you add another method, you need to update the length correction
  // in updateDisplay()

  initialize : function() {
    //
    // WARNING: some of these object properties may be changed during
    //          operation of the program, e.g., show, scale
    //
    let unum = 0; // useful when only one unit in lab, processUnits[unum]
    //
    // plot 0 info
    plotsObj[0] = new Object();
    plotsObj[0]['type'] = 'profile';
    plotsObj[0]['title'] = 'PFR Temperature Profiles';
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
    plotsObj[0]['yLeftAxisMin'] = processUnits[unum]['dataMin'][9]; // [9] is Trxr
    plotsObj[0]['yLeftAxisMax'] = processUnits[unum]['dataMax'][9];
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
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotsObj[0]['varDataUnits'] = new Array();
      // list ['dataUnits'][#] elements in order of corresonding 'var' VALUES above
      plotsObj[0]['varDataUnits'][0] = processUnits[unum]['dataUnits'][9]; // 1st var
      plotsObj[0]['varDataUnits'][1] = processUnits[unum]['dataUnits'][10];
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
    // for canvas type, all data comes from one process unit and one local array
    plotsObj[1]['varUnitIndex'] = unum; // index of unit in processUnits object
    plotsObj[1]['var'] = 0; // variable number in array spaceTimeData, 0, 1, etc.
    // varTimePts & varSpacePts must match values used in unit array colorCanvasData
    plotsObj[1]['varTimePts'] = processUnits[unum]['numNodes'];
    plotsObj[1]['varSpacePts'] = 1;
    plotsObj[1]['varValueMin'] = processUnits[unum]['dataMin'][9]; // [9] is Trxr
    plotsObj[1]['varValueMax'] = processUnits[unum]['dataMax'][9];
    plotsObj[1]['xAxisReversed'] = 0; // 0 false, 1 true, when true, xmax on left

    // plot 2 info
    plotsObj[2] = new Object();
    plotsObj[2]['type'] = 'canvas';
    plotsObj[2]['title'] = 'jacket color canvas';
    plotsObj[2]['canvas'] = 'canvas_CANVAS_jacket'; // without prefix #
    // for canvas type, all data comes from one process unit and one local array
    plotsObj[2]['varUnitIndex'] = unum; // index of unit in processUnits object
    plotsObj[2]['var'] = 1; // variable number in array spaceTimeData, 0, 1, etc.
    // varTimePts & varSpacePts must match values used in unit array colorCanvasData
    plotsObj[2]['varTimePts'] = processUnits[unum]['numNodes'];
    plotsObj[2]['varSpacePts'] = 1;
    plotsObj[2]['varValueMin'] = processUnits[unum]['dataMin'][9]; // [9] is Trxr
    plotsObj[1]['varValueMax'] = processUnits[unum]['dataMax'][9];
    plotsObj[2]['xAxisReversed'] = 0; // 0 false, 1 true, when true, xmax on left

  }, // end initialize method of plotsObj

} // end plotsObj
