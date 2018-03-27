/*
  Design, text, images and code by Richard K. Herz, 2017-2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// WARNING: number plot points here should match number plot points in
//          unit that generates the plot data
// where number plot points + 1 for origin are plotted

// these vars used several places below in this file
var numProfileVars = 4;
var numProfilePts = puCatalystLayer.numNodes;

// these vars used several places below in this file
var numStripVars = 3;
var numStripPts = 80;

// DECLARE PARENT OBJECT TO HOLD PLOT INFO
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
  plotsObj[0]['name'] = 'surface profiles';
  plotsObj[0]['type'] = 'profile';
  plotsObj[0]['canvas'] = '#div_PLOTDIV_catalyst_surface';
  plotsObj[0]['numberPoints'] = puCatalystLayer.numNodes; // should match numNodes in process unit
  // plot has numberPoints + 1 pts!
  plotsObj[0]['xAxisLabel'] = 'surface in layer';
  // xAxisShow false does not show numbers, nor label, nor grid for x-axis
  // might be better to cover numbers if desire not to show numbers
  plotsObj[0]['xAxisShow'] = 1; // 0 false, 1 true
  plotsObj[0]['xAxisMin'] = 0;
  plotsObj[0]['xAxisMax'] = 1;
  plotsObj[0]['xAxisReversed'] = 1; // 0 false, 1 true, when true, xmax on left
  plotsObj[0]['yLeftAxisLabel'] = '';
  plotsObj[0]['yLeftAxisMin'] = 0;
  plotsObj[0]['yLeftAxisMax'] = 1;
  plotsObj[0]['yRightAxisLabel'] = 'yRight';
  plotsObj[0]['yRightAxisMin'] = 0;
  plotsObj[0]['yRightAxisMax'] = 1;
  plotsObj[0]['plotLegendPosition'] = "ne";
  plotsObj[0]['var'] = new Array();
    plotsObj[0]['var'][0] = 2; // values are curve data number to be put on plot
    plotsObj[0]['var'][1] = 3; // listed in order of varLabel order, etc.
  plotsObj[0]['varLabel'] = new Array();
    plotsObj[0]['varLabel'][0] = 'AS'; // 1st var
    plotsObj[0]['varLabel'][1] = 'rate';
  plotsObj[0]['varShow'] = new Array();
    // varShow = 'show' shows curve, 'hide' hides curve but shows name in legend
    // value can be changed by javascript if want to show/hide curve with checkbox
    plotsObj[0]['varShow'][0] = 'show'; // 1st var
    plotsObj[0]['varShow'][1] = 'show';
  plotsObj[0]['varYaxis'] = new Array();
    plotsObj[0]['varYaxis'][0] = 'left'; // 1st var
    plotsObj[0]['varYaxis'][1] = 'left';
  plotsObj[0]['varYscaleFactor'] = new Array();
    plotsObj[0]['varYscaleFactor'][0] = 1; // 1st var
    plotsObj[0]['varYscaleFactor'][1] = 1;
  // ALTERNATIVE to separate arrays for variable number, show, axis
  //    might be to have one array per variable equal to an array of info...?
  //
  // plot 1 info
  plotsObj[1] = new Object();
  plotsObj[1]['name'] = 'pellet gas';
  plotsObj[1]['type'] = 'profile';
  plotsObj[1]['canvas'] = '#div_PLOTDIV_catalyst_gas';
  plotsObj[1]['numberPoints'] = puCatalystLayer.numNodes;
  // plot has numberPoints + 1 pts!
  plotsObj[1]['xAxisLabel'] = 'gas in layer';
  // xAxisShow false does not show numbers, nor label, nor grid for x-axis
  // might be better to cover numbers if desire not to show numbers
  plotsObj[1]['xAxisShow'] = 1; // 0 false, 1 true
  plotsObj[1]['xAxisMin'] = 0;
  plotsObj[1]['xAxisMax'] = 1;
  plotsObj[1]['xAxisReversed'] = 1; // 0 false, 1 true, when true, xmax on left
  plotsObj[1]['yLeftAxisLabel'] = '';
  plotsObj[1]['yLeftAxisMin'] = 0;
  plotsObj[1]['yLeftAxisMax'] = 1;
  plotsObj[1]['yRightAxisLabel'] = 'yRight';
  plotsObj[1]['yRightAxisMin'] = 0;
  plotsObj[1]['yRightAxisMax'] = 1;
  plotsObj[1]['plotLegendPosition'] = "ne";
  plotsObj[1]['var'] = new Array();
    plotsObj[1]['var'][0] = 0; // 1st var in profile data array
    plotsObj[1]['var'][1] = 1;
  plotsObj[1]['varLabel'] = new Array();
    plotsObj[1]['varLabel'][0] = 'A';
    plotsObj[1]['varLabel'][1] = 'B';
  plotsObj[1]['varShow'] = new Array();
    // varShow = 'show' shows curve, 'hide' hides curve but shows name in legend
    // value can be changed by javascript if want to show/hide curve with checkbox
    plotsObj[1]['varShow'][0] = 'show'; // 1st var
    plotsObj[1]['varShow'][1] = 'show';
  plotsObj[1]['varYaxis'] = new Array();
    plotsObj[1]['varYaxis'][0] = 'left'; // 1st var
    plotsObj[1]['varYaxis'][1] = 'left';
  plotsObj[1]['varYscaleFactor'] = new Array();
    plotsObj[1]['varYscaleFactor'][0] = 1; // 1st var
    plotsObj[1]['varYscaleFactor'][1] = 1;
  // ALTERNATIVE to separate arrays for variable number, show, axis
  //    might be to have one array per variable equal to an array of info...?
  //
  // plot 2 info
  plotsObj[2] = new Object();
  plotsObj[2]['name'] = 'inlet gas';
  plotsObj[2]['type'] = 'strip';
  plotsObj[2]['canvas'] = '#div_PLOTDIV_inlet_gas';
  plotsObj[2]['numberPoints'] = numStripPts;
  // plot has numberPoints + 1 pts!
  plotsObj[2]['xAxisLabel'] = '< recent time | earlier time >'; // here, time is dimensionless
  // xAxisShow false does not show numbers, nor label, nor grid for x-axis
  // might be better to cover numbers if desire not to show numbers
  plotsObj[2]['xAxisShow'] = 1; // 0 false, 1 true
  plotsObj[2]['xAxisMin'] = 0;
  plotsObj[2]['xAxisMax'] = numStripPts * simParams.simTimeStep * simParams.simStepRepeats;
  plotsObj[2]['xAxisReversed'] = 1; // 0 false, 1 true, when true, xmax on left
  plotsObj[2]['yLeftAxisLabel'] = '';
  plotsObj[2]['yLeftAxisMin'] = 0;
  plotsObj[2]['yLeftAxisMax'] = 1;
  plotsObj[2]['yRightAxisLabel'] = 'yRight';
  plotsObj[2]['yRightAxisMin'] = 0;
  plotsObj[2]['yRightAxisMax'] = 1;
  plotsObj[2]['plotLegendPosition'] = "ne";
  plotsObj[2]['var'] = new Array();
    plotsObj[2]['var'][0] = 0; // 1st var in profile data array
    // plotsObj[2]['var'][1] = 1;
  plotsObj[2]['varLabel'] = new Array();
    plotsObj[2]['varLabel'][0] = 'A in';
    // plotsObj[2]['varLabel'][1] = 'B';
  plotsObj[2]['varShow'] = new Array();
    // varShow = 'show' shows curve, 'hide' hides curve but shows name in legend
    // value can be changed by javascript if want to show/hide curve with checkbox
    plotsObj[2]['varShow'][0] = 'show'; // 1st var
    // plotsObj[2]['varShow'][1] = 'show';
  plotsObj[2]['varYaxis'] = new Array();
    plotsObj[2]['varYaxis'][0] = 'left'; // 1st var
    // plotsObj[2]['varYaxis'][1] = 'left';
  plotsObj[2]['varYscaleFactor'] = new Array();
    plotsObj[2]['varYscaleFactor'][0] = 1; // 1st var
    plotsObj[2]['varYscaleFactor'][1] = 1;
  // ALTERNATIVE to separate arrays for variable number, show, axis
  //    might be to have one array per variable equal to an array of info...?
  //
  // plot 3 info
  plotsObj[3] = new Object();
  plotsObj[3]['name'] = 'outlet gas';
  plotsObj[3]['type'] = 'strip';
  plotsObj[3]['canvas'] = '#div_PLOTDIV_outlet_gas';
  plotsObj[3]['numberPoints'] = numStripPts;
  // plot has numberPoints + 1 pts!
  plotsObj[3]['xAxisLabel'] = '< recent time | earlier time >'; // here, time is dimensionless
  // xAxisShow false does not show numbers, nor label, nor grid for x-axis
  // might be better to cover numbers if desire not to show numbers
  plotsObj[3]['xAxisShow'] = 1; // 0 false, 1 true
  plotsObj[3]['xAxisMin'] = 0;
  plotsObj[3]['xAxisMax'] = numStripPts * simParams.simTimeStep * simParams.simStepRepeats;
  plotsObj[3]['xAxisReversed'] = 1; // 0 false, 1 true, when true, xmax on left
  plotsObj[3]['yLeftAxisLabel'] = '';
  plotsObj[3]['yLeftAxisMin'] = 0;
  plotsObj[3]['yLeftAxisMax'] = 1;
  plotsObj[3]['yRightAxisLabel'] = 'yRight';
  plotsObj[3]['yRightAxisMin'] = 0;
  plotsObj[3]['yRightAxisMax'] = 1;
  plotsObj[3]['plotLegendPosition'] = "ne";
  plotsObj[3]['var'] = new Array();
    plotsObj[3]['var'][0] = 1; // 1st var in profile data array
    plotsObj[3]['var'][1] = 2;
  plotsObj[3]['varLabel'] = new Array();
    plotsObj[3]['varLabel'][0] = 'A out';
    plotsObj[3]['varLabel'][1] = 'B out';
  plotsObj[3]['varShow'] = new Array();
    // varShow = 'show' shows curve, 'hide' hides curve but shows name in legend
    // value can be changed by javascript if want to show/hide curve with checkbox
    plotsObj[3]['varShow'][0] = 'show'; // 1st var
    plotsObj[3]['varShow'][1] = 'show';
  plotsObj[3]['varYaxis'] = new Array();
    plotsObj[3]['varYaxis'][0] = 'left'; // 1st var
    plotsObj[3]['varYaxis'][1] = 'left';
  plotsObj[3]['varYscaleFactor'] = new Array();
    plotsObj[3]['varYscaleFactor'][0] = 1; // 1st var
    plotsObj[3]['varYscaleFactor'][1] = 1;
  // ALTERNATIVE to separate arrays for variable number, show, axis
  //    might be to have one array per variable equal to an array of info...?
  //

  // DEFINE plotFlag ARRAY so don't have to generate
  // entire plot everytime want to just change data (and not axes, etc.)
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

  // initialize data arrays - must follow function initPlotData in this file
  var profileData = initPlotData(numProfileVars,numProfilePts); // holds data for static profile plots
  var stripData = initPlotData(numStripVars,numStripPts); // holds data for scrolling strip chart plots
