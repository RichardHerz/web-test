/*
  Design, text, images and code by Richard K. Herz, 2017-2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// WARNING: in process units, local data array names for plotting must be
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

    let unum = 0; // useful when only one unit in plot, processUnits[unum]
    let pnum = 0; // redefined below
    let vnum = 0; // redefined below

    // plot 0 info
    pnum = 0;
    plotInfo[pnum] = new Object();
    plotInfo[pnum]['type'] = 'profile';
    plotInfo[pnum]['title'] = 'Surface Profiles';
    plotInfo[pnum]['canvas'] = '#div_PLOTDIV_catalyst_surface'; // flot.js wants ID with prefix #
    // set numberPoints < = than width of plot in HTML pixels for fast plotting
    plotInfo[pnum]['numberPoints'] = processUnits[unum]['numNodes']; // should match numNodes in process unit
    // plot has numberPoints + 1 pts!
    plotInfo[pnum]['xAxisLabel'] = 'surface in layer';
    plotInfo[pnum]['xAxisTableLabel'] = 'position in layer'; // label for copy data table
    // xAxisShow false does not show numbers, nor label, nor grid for x-axis
    // might be better to cover numbers if desire not to show numbers
    plotInfo[pnum]['xAxisShow'] = 1; // 0 false, 1 true
    plotInfo[pnum]['xAxisMin'] = 0;
    plotInfo[pnum]['xAxisMax'] = 1;
    plotInfo[pnum]['xAxisReversed'] = 1; // 0 false, 1 true, when true, xmax on left
    plotInfo[pnum]['yLeftAxisLabel'] = '';
    plotInfo[pnum]['yLeftAxisMin'] = 0;
    plotInfo[pnum]['yLeftAxisMax'] = 1;
    plotInfo[pnum]['yRightAxisLabel'] = '';
    plotInfo[pnum]['yRightAxisMin'] = 0;
    plotInfo[pnum]['yRightAxisMax'] = 1;
    plotInfo[pnum]['plotLegendShow'] = 1;  // Boolean, '' or 0 for no show, 1 or "show"
    plotInfo[pnum]['plotLegendPosition'] = 'ne';
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
    vnum = 0; // 1st variable
    plotInfo[pnum]['varUnitIndex'][0] = unum; // value is index of unit in processUnits object
    plotInfo[pnum]['var'][vnum] = 2; // value is variable index in plot data array
    plotInfo[pnum]['varLabel'][vnum] = 'AS';
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotInfo[pnum]['varDataUnits'][vnum] = ''; // 1st var
    // varShow values are 'show' to show on plot and legend,
    // 'tabled' to not show on plot nor legend but list in copy data table
    // and any other value, e.g., 'hide' to not show on plot but do show in legend
    // varShow value can be changed by javascript if want to show/hide curve with checkbox
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
    vnum = 1; // 2nd variable
    plotInfo[pnum]['varUnitIndex'][1] = unum;
    plotInfo[pnum]['var'][vnum] = 3;
    plotInfo[pnum]['varLabel'][vnum] = 'rate';
    plotInfo[pnum]['varDataUnits'][vnum] = '';
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;

    // plot 1 info
    pnum = 1;
    plotInfo[pnum] = new Object();
    plotInfo[pnum]['type'] = 'profile';
    plotInfo[pnum]['title'] = 'Gas Profiles';
    plotInfo[pnum]['canvas'] = '#div_PLOTDIV_catalyst_gas'; // flot.js wants ID with prefix #
    // set numberPoints < = than width of plot in HTML pixels for fast plotting
    plotInfo[pnum]['numberPoints'] = processUnits[unum]['numNodes']; // should match numNodes in process unit
    // plot has numberPoints + 1 pts!
    plotInfo[pnum]['xAxisLabel'] = 'gas in layer';
    plotInfo[pnum]['xAxisTableLabel'] = 'position in layer'; // label for copy data table
    // xAxisShow false does not show numbers, nor label, nor grid for x-axis
    // might be better to cover numbers if desire not to show numbers
    plotInfo[pnum]['xAxisShow'] = 1; // 0 false, 1 true
    plotInfo[pnum]['xAxisMin'] = 0;
    plotInfo[pnum]['xAxisMax'] = 1;
    plotInfo[pnum]['xAxisReversed'] = 1; // 0 false, 1 true, when true, xmax on left
    plotInfo[pnum]['yLeftAxisLabel'] = '';
    plotInfo[pnum]['yLeftAxisMin'] = 0;
    plotInfo[pnum]['yLeftAxisMax'] = 1;
    plotInfo[pnum]['yRightAxisLabel'] = '';
    plotInfo[pnum]['yRightAxisMin'] = 0;
    plotInfo[pnum]['yRightAxisMax'] = 1;
    plotInfo[pnum]['plotLegendShow'] = 1;  // Boolean, '' or 0 for no show, 1 or "show"
    plotInfo[pnum]['plotLegendPosition'] = 'ne';
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
    vnum = 0; // 1st variable
    plotInfo[pnum]['varUnitIndex'][0] = unum; // value is index of unit in processUnits object
    plotInfo[pnum]['var'][vnum] = 0; // value is variable index in plot data array
    plotInfo[pnum]['varLabel'][vnum] = 'A';
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotInfo[pnum]['varDataUnits'][vnum] = ''; // 1st var
    // varShow values are 'show' to show on plot and legend,
    // 'tabled' to not show on plot nor legend but list in copy data table
    // and any other value, e.g., 'hide' to not show on plot but do show in legend
    // varShow value can be changed by javascript if want to show/hide curve with checkbox
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
    vnum = 1; // 2nd variable
    plotInfo[pnum]['varUnitIndex'][1] = unum;
    plotInfo[pnum]['var'][vnum] = 1;
    plotInfo[pnum]['varLabel'][vnum] = 'B';
    plotInfo[pnum]['varDataUnits'][vnum] = '';
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;

    // plot 2 info
    pnum = 2;
    plotInfo[pnum] = new Object();
    plotInfo[pnum]['type'] = 'strip';
    plotInfo[pnum]['title'] = 'Inlet Gas';
    plotInfo[pnum]['canvas'] = '#div_PLOTDIV_inlet_gas'; // flot.js wants ID with prefix #
    // set numberPoints < = than width of plot in HTML pixels for fast plotting
    plotInfo[pnum]['numberPoints'] = 80; // WARNING: value used below in xAxisMax & plot 4
    // plot has numberPoints + 1 pts!
    plotInfo[pnum]['xAxisLabel'] = '< recent time | earlier time (s) >';
    plotInfo[pnum]['xAxisTableLabel'] = 'Time'; // label for copy data table
    // xAxisShow false does not show numbers, nor label, nor grid for x-axis
    // might be better to cover numbers if desire not to show numbers
    plotInfo[pnum]['xAxisShow'] = 1; // 0 false, 1 true
    plotInfo[pnum]['xAxisMin'] = 0;
    plotInfo[pnum]['xAxisMax'] = 80 * simParams.simTimeStep * simParams.simStepRepeats;
    plotInfo[pnum]['xAxisReversed'] = 1; // 0 false, 1 true, when true, xmax on left
    plotInfo[pnum]['yLeftAxisLabel'] = '';
    plotInfo[pnum]['yLeftAxisMin'] = 0;
    plotInfo[pnum]['yLeftAxisMax'] = 1;
    plotInfo[pnum]['yRightAxisLabel'] = '';
    plotInfo[pnum]['yRightAxisMin'] = 0;
    plotInfo[pnum]['yRightAxisMax'] = 1;
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
    vnum = 0; // 1st variable
    plotInfo[pnum]['varUnitIndex'][vnum] = unum; // value is index of unit in processUnits object
    plotInfo[pnum]['var'][vnum] = 0; // value is variable index in plot data array
    plotInfo[pnum]['varLabel'][vnum] = 'A in';
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotInfo[pnum]['varDataUnits'][vnum] = '';
    // varShow values are 'show' to show on plot and legend,
    // 'tabled' to not show on plot nor legend but list in copy data table
    // and any other value, e.g., 'hide' to not show on plot but do show in legend
    // varShow value can be changed by javascript if want to show/hide curve with checkbox
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;

    // plot 3 info
    pnum = 3;
    plotInfo[pnum] = new Object();
    plotInfo[pnum]['type'] = 'strip';
    plotInfo[pnum]['title'] = 'Outlet Gas';
    plotInfo[pnum]['canvas'] = '#div_PLOTDIV_outlet_gas'; // flot.js wants ID with prefix #
    // set numberPoints < = than width of plot in HTML pixels for fast plotting
    plotInfo[pnum]['numberPoints'] = 80; // WARNING: value used below in xAxisMax
    // plot has numberPoints + 1 pts!
    plotInfo[pnum]['xAxisLabel'] = '< recent time | earlier time (s) >';
    plotInfo[pnum]['xAxisTableLabel'] = 'Time'; // label for copy data table
    // xAxisShow false does not show numbers, nor label, nor grid for x-axis
    // might be better to cover numbers if desire not to show numbers
    plotInfo[pnum]['xAxisShow'] = 1; // 0 false, 1 true
    plotInfo[pnum]['xAxisMin'] = 0;
    plotInfo[pnum]['xAxisMax'] = 80 * simParams.simTimeStep * simParams.simStepRepeats;
    plotInfo[pnum]['xAxisReversed'] = 1; // 0 false, 1 true, when true, xmax on left
    plotInfo[pnum]['yLeftAxisLabel'] = '';
    plotInfo[pnum]['yLeftAxisMin'] = 0;
    plotInfo[pnum]['yLeftAxisMax'] = 1;
    plotInfo[pnum]['yRightAxisLabel'] = '';
    plotInfo[pnum]['yRightAxisMin'] = 0;
    plotInfo[pnum]['yRightAxisMax'] = 1;
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
    vnum = 0; // 1st variable
    plotInfo[pnum]['varUnitIndex'][vnum] = unum; // value is index of unit in processUnits object
    plotInfo[pnum]['var'][vnum] = 1; // value is variable index in plot data array
    plotInfo[pnum]['varLabel'][vnum] = 'A out';
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotInfo[pnum]['varDataUnits'][vnum] = '';
    // varShow values are 'show' to show on plot and legend,
    // 'tabled' to not show on plot nor legend but list in copy data table
    // and any other value, e.g., 'hide' to not show on plot but do show in legend
    // varShow value can be changed by javascript if want to show/hide curve with checkbox
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;
    //
    vnum = 1; // 2nd variable
    plotInfo[pnum]['varUnitIndex'][vnum] = unum; // value is index of unit in processUnits object
    plotInfo[pnum]['var'][vnum] = 2; // value is variable index in plot data array
    plotInfo[pnum]['varLabel'][vnum] = 'B out';
    // varDataUnits are dimensional units used in copy data table, along with varLabel
    plotInfo[pnum]['varDataUnits'][vnum] = '';
    // varShow values are 'show' to show on plot and legend,
    // 'tabled' to not show on plot nor legend but list in copy data table
    // and any other value, e.g., 'hide' to not show on plot but do show in legend
    // varShow value can be changed by javascript if want to show/hide curve with checkbox
    plotInfo[pnum]['varShow'][vnum] = 'show';
    plotInfo[pnum]['varYaxis'][vnum] = 'left';
    plotInfo[pnum]['varYscaleFactor'][vnum] = 1;

    // plot 4 info
    pnum = 4;
    plotInfo[pnum] = new Object();
    plotInfo[pnum]['type'] = 'canvas';
    plotInfo[pnum]['title'] = 'reaction rate color canvas';
    plotInfo[pnum]['canvas'] = 'canvas_CANVAS_rate'; // without prefix #
    // for canvas type, all data comes from one process unit and one local array
    plotInfo[pnum]['varUnitIndex'] = unum; // index of unit in processUnits object
    plotInfo[pnum]['var'] = 0; // variable number in array spaceTimeData, 0, 1, etc.
    // varTimePts & varSpacePts must match values used in unit array colorCanvasData
    plotInfo[pnum]['varTimePts'] = 80;
    plotInfo[pnum]['varSpacePts'] = processUnits[unum]['numNodes'];
    plotInfo[pnum]['varValueMin'] = 0;
    plotInfo[pnum]['varValueMax'] = 1/processUnits[unum].Model/processUnits[unum].Model; // 1/1/1 or 1/2/2
    plotInfo[pnum]['xAxisReversed'] = 1; // 0 false, 1 true, when true, xmax on left

  }, // end initialize method of plotInfo

} // end plotInfo
