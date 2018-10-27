/*
  Design, text, images and code by Richard K. Herz, 2017-2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// WARNING: in process units, local data array names for plotting must
//          'profileData' for ['type'] = 'profile'
//          'stripData' for ['type'] = 'strip'
//          'colorCanvasData' for ['type'] = 'canvas'

// ---------- DECLARE PARENT OBJECT TO HOLD PLOT INFO --------
// --- DEFINITION OF PLOTS: PROFILE, STRIP CHART, & COLOR CANVAS ---

// plotting is called by the controller object and not individual process
// units in order that a plot may contain data from more than one process unit

// some options may be optional for some plotting packages, such as
// plotDataSeriesColors for flot.js package, in which case default values will
// be used by the plotting package

// more than one plot can be put one one web page by
// defining multiple object children, where the first index
// plotInfo[0] is the plot number index (starting at 0)

let plotInfo = {

  // after the openThisLab() function in _main.js calls method initialize()
  // here, this object will contain a child object for each plot
  //
  // in _main.js, the function updateDisplay() uses the length of plotInfo
  // after subtracting 1 for method initialize, in order to plot all the plots;
  // if you add another method, you need to update the length correction
  // in updateDisplay()
  //
  // method initialize() is run after each process unit's initialize() method
  // is run by openThisLab() so that it can use values from the units,
  // e.g., processUnits[unum]['dataMin'][1];

  initialize : function() {
    //
    // WARNING: some of these object properties may be changed during
    //          operation of the program, e.g., show, scale
    //
    // --------- below are plots for the reactor ----------------

    // let unum = 0; // useful when only one unit in plot, processUnits[unum]

    // plot 0 info
    let pnum = 0;
    plotInfo[pnum] = new Object();
    plotInfo[pnum]['type'] = 'strip';
    plotInfo[pnum]['title'] = 'Reactor Conditions';
    plotInfo[pnum]['canvas'] = '#div_PLOTDIV_plotData'; // flot.js wants ID with prefix #
    // set numberPoints < = than width of plot in HTML pixels for fast plotting
    plotInfo[pnum]['numberPoints'] = 100;
    // plot has numberPoints + 1 pts!
    plotInfo[pnum]['xAxisLabel'] = '< recent time | earlier time (s) >';
    plotInfo[pnum]['xAxisTableLabel'] = 'Time (s)'; // label for copy data table
    // xAxisShow false does not show numbers, nor label, nor grid for x-axis
    // might be better to cover numbers if desire not to show numbers
    plotInfo[pnum]['xAxisShow'] = 1; // 0 false, 1 true
    plotInfo[pnum]['xAxisMin'] = 0;
    // multiplier in line below is numberPoints for this plot
    plotInfo[pnum]['xAxisMax'] = 100 * simParams.simTimeStep * simParams.simStepRepeats; // numberPoints * ...
    plotInfo[pnum]['xAxisReversed'] = 1; // 0 false, 1 true, when true, xmax on left
    plotInfo[pnum]['yLeftAxisLabel'] = 'Reactant Concentration';
    plotInfo[pnum]['yLeftAxisMin'] = 0;
    plotInfo[pnum]['yLeftAxisMax'] = 2;
    plotInfo[pnum]['yRightAxisLabel'] = '';
    plotInfo[pnum]['yRightAxisMin'] = 0;
    plotInfo[pnum]['yRightAxisMax'] = 2;
    plotInfo[pnum]['plotLegendPosition'] = "ne";
    plotInfo[pnum]['plotLegendShow'] = 1;  // Boolean, '' or 0 for no show, 1 or "show"
    plotInfo[pnum]['plotGridBgColor'] = 'white';
    // colors can be specified rgb, rgba, hex, and color names
    // for flot.js colors, only basic color names appear to work, e.g., white, blue, red
    // for all html color names to hex see http://www.color-hex.com
    // for all color names to hex see https://www.w3schools.com/colors/colors_picker.asp
    plotInfo[pnum]['plotDataSeriesColors'] = ['blue','red','#919191']; // optional, in variable order 0, 1, etc.
    // ['#1e90ff','#ff6347','#919191'] is DodgerBlue, Tomato, Tin (metal Tin)
    //
    // SET UP ARRAYS TO HOLD INFO FOR EACH VARIABLE on plot and/or copy data table
    // WARNING: all below with prefix 'var' must have same number of child objects,
    // one for each variable placed on plot
    plotInfo[pnum]['varUnitIndex'] = new Array();
    plotInfo[pnum]['var'] = new Array();
    plotInfo[pnum]['varLabel'] = new Array();
    plotInfo[pnum]['varDataUnits'] = new Array();
    plotInfo[pnum]['varShow'] = new Array();
    plotInfo[pnum]['varYaxis'] = new Array();
    plotInfo[pnum]['varYscaleFactor'] = new Array();
    //
    // ADD SETTINGS FOR EACH VARIABLE
    //
    let vnum = 0; // 1st variable
    plotInfo[pnum]['varUnitIndex'][vnum] = 0; // value is index of unit in processUnits object
    plotInfo[pnum]['var'][vnum] = 0; // value is variable index in plot data array
    plotInfo[pnum]['varLabel'][vnum] = 'Feed';
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotInfo[pnum]['varDataUnits'][vnum] = ''; // processUnits[1]['dataUnits'][4]; // 1st var
    // varShow values are 'show' to show on plot and legend,
    // 'tabled' to not show on plot nor legend but list in copy data table
    // and any other value, e.g., 'hide' to not show on plot but do show in legend
    // varShow value can be changed by javascript if want to show/hide curve with checkbox
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
    vnum = 1; // 2nd variable
    plotInfo[pnum]['varUnitIndex'][vnum] = 1; // value is index of unit in processUnits object
    plotInfo[pnum]['var'][vnum] = 0; // value is variable index in plot data array
    plotInfo[pnum]['varLabel'][vnum] = 'Rxr 1';
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotInfo[pnum]['varDataUnits'][vnum] = ''; // processUnits[1]['dataUnits'][4]; // 1st var
    // varShow values are 'show' to show on plot and legend,
    // 'tabled' to not show on plot nor legend but list in copy data table
    // and any other value, e.g., 'hide' to not show on plot but do show in legend
    // varShow value can be changed by javascript if want to show/hide curve with checkbox
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
    vnum = 2; // 3rd variable
    plotInfo[pnum]['varUnitIndex'][vnum] = 2;
    plotInfo[pnum]['var'][vnum] = 0;
    plotInfo[pnum]['varLabel'][vnum] = 'Rxr 2';
    plotInfo[pnum]['varDataUnits'][vnum] = ''; // processUnits[1]['dataUnits'][3];
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
    vnum = 3; // 4th variable
    plotInfo[pnum]['varUnitIndex'][vnum] = 3;
    plotInfo[pnum]['var'][vnum] = 0;
    plotInfo[pnum]['varLabel'][vnum] = 'Rxr 3';
    plotInfo[pnum]['varDataUnits'][vnum] = ''; // processUnits[1]['dataUnits'][3];
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
    vnum = 4; // 5th variable
    plotInfo[pnum]['varUnitIndex'][vnum] = 4;
    plotInfo[pnum]['var'][vnum] = 0;
    plotInfo[pnum]['varLabel'][vnum] = 'Rxr 4';
    plotInfo[pnum]['varDataUnits'][vnum] = ''; // processUnits[1]['dataUnits'][3];
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
  }, // end initialize method of plotInfo

} // end plotInfo
