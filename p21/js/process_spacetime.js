/*
  Design, text, images and code by Richard K. Herz, 2017-2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// SEE PLOT DEFINITIONS IN FILE process_plot_info.js
// SEE DATA ARRAY INITIALIZATION IN FILE process_plot_info.js

function jetColorMap(n) {
  // input n should be value between 0 and 1
  // rgb output array values will be 0-255 to match MATLAB's jet colormap
  //
  // ANOTHER WAY would be a look up table - would that be faster?
  //
  var r;
  var g;
  var b;
  if (n<0) {n = 0;}
  if (n>1) {n = 1;}
  // would not need to round input to integers with IF statements
  // EXCEPT if don't round then can get rgb values > 1.0 at end of IF
  // so would then need to add more IF statements to check - SO ROUND NOW
  var n64 = Math.round(1 + 63*n); // n64 = 1 when n = 0; n64 = 64 when n = 1
  if (n64 >= 1 && n64 < 9) {
    r = 0;
    g = 0;
    b = (n64-1)/7*0.4375 + 0.5625;
  } else if (n64 >= 9 && n64 < 25) {
    r = 0;
    g = (n64-9)/15*0.9375 + 0.0625;
    b = 1;
  } else if (n64 >= 25 && n64 < 41) {
    r = (n64-25)/15*0.9375 + 0.0625;
    g = 1;
    b = -(n64-25)/15*0.9375 + 0.9375;
  } else if (n64 >= 41 && n64 < 57) {
    r = 1;
    g = -(n64-41)/15*0.9375 + 0.9375;
    b = 0;
  } else if (n64 >= 57 && n64 <= 64) {
    r = -(n64-57)/7*0.4375 + 0.9375;
    g = 0;
    b = 0;
  } else {
    // out of bounds - give output for zero input
    r = 0;
    g = 0;
    b = 0.5625;
  } // end of IF structure
  // but we must round output to integers after converting to 0-255
  r = Math.round(r*255);
  g = Math.round(g*255);
  b = Math.round(b*255);
  return [r,g,b];
} // end of function jetColorMap

function plotColorCanvasPlot(pNumber) {
  //
  // input argument pNumber refers to plot info in child pNumber
  // of object plotsObj which is defined in file process_plot_info.js
  // use this to plot space-time plots as well as other color canvas plots
  // see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial

  var canvasID = plotsObj[pNumber]['canvas'];
  var canvas = document.getElementById(canvasID);
  var context = canvas.getContext('2d');

  // copy data from unit local array colorCanvasData to local array colorCanvasData
  var varUnitIndex = plotsObj[pNumber]['varUnitIndex'];
  // v is the index number of the one variable to plot on the canvas
  // where 0 is first, 1 is second, etc.
  var v = plotsObj[pNumber]['var'];

  // next line REQUIRES unit object array to be named colorCanvasData
  var colorCanvasData = processUnits[varUnitIndex]['colorCanvasData'][v];

  var t;
  var s;
  var r;
  var g;
  var b;
  var jet;
  var x;
  var y;
  // below we have to convert computed color values
  // to text string for fillStyle below, so get pieces ready
  var tColor1 = 'rgb(';
  var tColor2;
  var tColor3;
  var tColor4;
  var tColor5 = ')';
  var tPixels = canvas.width; // canvas width, height set in HTML canvas element
  var sPixels = canvas.height;
  var numTimePts = plotsObj[pNumber]['varTimePts'];
  var numSpacePts = plotsObj[pNumber]['varSpacePts'];
  var tPixelsPerPoint = tPixels/(numTimePts+1); // pixels per point, note +1
  var sPixelsPerPoint = sPixels/numSpacePts; // pixels per point
  var minVarVal = plotsObj[pNumber]['varValueMin'];
  var maxVarVal = plotsObj[pNumber]['varValueMax'];
  var scaledVarVal; // holds variable value scaled 0-1 by minVarVal & maxVarVal

  for (t = 0; t <= numTimePts; t += 1) { // NOTE = at t <=
    for (s = 0; s < numSpacePts; s += 1) {
      scaledVarVal = (colorCanvasData[t][s] - minVarVal) / (maxVarVal - minVarVal);
      jet = jetColorMap(scaledVarVal); // scaledVarVal should be scaled 0 to 1
      r = jet[0];
      g = jet[1];
      b = jet[2];
      // we have to convert computed color values to string for fillStyle
      tColor2 = r.toString();
      tColor3 = g.toString();
      tColor4 = b.toString();
      tColor = tColor1.concat(tColor2,',',tColor3,',',tColor4,tColor5);
      context.fillStyle = tColor;
      if (plotsObj[pNumber]['xAxisReversed']) {
        // swap directions in plot from that in colorCanvasData array
        x = tPixelsPerPoint * (numTimePts - t);
      } else {
        x = tPixelsPerPoint * t;
      }
      y = sPixelsPerPoint * s;
      // draw colored rectangle on canvas to represent this data point
      context.fillRect(x,y,tPixelsPerPoint,sPixelsPerPoint);
    } // end of inner FOR repeat
  } // end of outer FOR repeat

} // end of function plotColorCanvasPlot
