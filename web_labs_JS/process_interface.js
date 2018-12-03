/*
  Design, text, images and code by Richard K. Herz, 2017-2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

let interface = {
  // OBJECT interface handles UI controls and input fields in HTML
  // unit objects may write directly to output fields or other elements

  runThisLab : function() {
    // CALLED BY UI RUN BUTTON DEFINED IN HTML
    // USES OBJECTS simParams, controller
    //
    // TOGGLE runningFlag FIRST before doing stuff below
    controller.toggleRunningFlag(); // toggle runningFlag true-false
    // TOGGLE runningFlag FIRST before doing stuff below
    let runningFlag = controller.runningFlag;
    if (runningFlag) {
      // start sim running again
      controller.ssFlag = false; // unit sets true when sim reaches steady state
      button_runButton.value = 'Pause'; // REQUIRES run button id="button_runButton"
      controller.runSimulation();
      simParams.updateRunCount();
    } else {
      // sim will stop after last updateProcess and its updateDisplay finishes
      // so change run button label from pause to run
      button_runButton.value = 'Run'; // REQUIRES run button id="button_runButton"
    }
  }, // END OF function runThisLab

  resetThisLab : function() {
    // CALLED BY UI RESET BUTTON DEFINED IN HTML
    // USES OBJECTS simParams, controller
    // REQUIRES BELOW that run button id="button_runButton"
    //
    controller.stopRunningFlag();
    controller.resetSimTime();
    // reset all units
    let numUnits = Object.keys(processUnits).length; // number of units
    for (n = 0; n < numUnits; n += 1) {
      processUnits[n].reset();
    }
    controller.updateDisplay();
    button_runButton.value = 'Run'; // REQUIRES run button id="button_runButton"
    // do NOT update process nor display again here (will take one step)
  }, // END OF function resetThisLab

  getInputValue : function(pUnitIndex,pVar) {
    // GET INPUT VALUES FROM INPUT FIELDS - CALLED IN UNITS updateUIparams()
    // USES OBJECT processUnits
    let varInputID = processUnits[pUnitIndex]['dataInputs'][pVar];
    let varInitial = processUnits[pUnitIndex]['dataInitial'][pVar];
    let varMin = processUnits[pUnitIndex]['dataMin'][pVar];
    let varMax = processUnits[pUnitIndex]['dataMax'][pVar];
    let varValue = 0; // set below
    // get the contents of the input and handle
    if (document.getElementById(varInputID)) {
      // the input exists so get the value and make sure it is within range
      varValue = document.getElementById(varInputID).value;
      varValue = Number(varValue); // force any number as string to numeric number
      if (isNaN(varValue)) {varValue = varInitial;} // handle e.g., 259x, xxx
      if (varValue < varMin) {varValue = varMin;}
      if (varValue > varMax) {varValue = varMax;}
      //
      if (Math.abs(varValue) < 1.0e-3) {
        varValue = varValue.toExponential(2);
      } else if (Math.abs(varValue) >= 9.999e+3) {
        varValue = varValue.toExponential(2);
      }
      //
      document.getElementById(varInputID).value = varValue;
    } else {
      // this 'else' is in case there is no input on the web page yet in order to
      // allow for independence and portability of this process unit
      varValue = varInitial;
    }
    return varValue
  }, // END of getInputValue()

  updateUIparams : function() {
    // User changed an input
    // Update user-entered inputs from UI to ALL units.
    // Could be called from onclick or onchange in HTML element, if desired.
    // Alternative: in HTML input tag onchange, send updateUIparams() to
    // specific unit involved in that input.

    let numUnits = Object.keys(processUnits).length; // number of units
    for (n = 0; n < numUnits; n += 1) {
      processUnits[n].updateUIparams();
    }

  },  // END OF function updateUIparams

  copyData : function(plotIndex) {
    // CALLED BY UI COPY DATA BUTTONS DEFINED IN HTML
    // copies data from plot to new browser tab or popup window - see below
    //
    // USES OBJECTS plotInfo, controller, interface, simParams
    // plotIndex is the index in object plotInfo of the desired plot to copy
    // USES internal function formatNum

    // if sim is running, pause the sim
    // copy grabs what is showing on plot when copy button clicked
    // so want user to be able to take screenshot to compare with data copied
    // this will let last updateDisplay of updateProcess finish before sim pauses
    let runningFlag = controller.runningFlag;
    if (runningFlag) {
      interface.runThisLab(); // toggles running state
    }

    let n; // index
    let v; // variable index
    let k; // points index
    let numUnits;
    let numVar;
    let varIndex; // index of selected variable in unit local data array
    let varUnitIndex; // index of unit from which variable is to be obtained
    let tText; // we will put the data into this variable
    let tItemDelimiter = ', &nbsp;'
    let tVarLabelLen = plotInfo[plotIndex]['varLabel'].length; // length for loops below

    tText = '<p>Web Labs at ReactorLab.net &nbsp; &gt; &nbsp;' + simParams.title + '</p>';

    // list current input values
    tText += '<p>Simulation time of data capture = ' + controller.simTime + ' s <br>';
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

    tText += '<p>' + plotInfo[plotIndex]['title'] + '</p>';

    // column headers
    tText += '<p>';
    // first, x-axis variable name for table
    tText += plotInfo[plotIndex]['xAxisTableLabel'] + tItemDelimiter;
    // then other column names for y-axis variables
    for (v = 0; v < tVarLabelLen; v += 1) {
      tText += plotInfo[plotIndex]['varLabel'][v];
      tText += ' (' + plotInfo[plotIndex]['varDataUnits'][v] + ')';
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

    let plotType = plotInfo[plotIndex]['type']; // profile or strip
    let dataName = plotType + 'Data'; // profileData or stripData
    if ((plotType == 'profile') || (plotType == 'strip')) {
      // repeat to make each line in table for each data point
      for (k = 0; k <= plotInfo[plotIndex]['numberPoints']; k += 1) {
        // first get x value in [k][0], get it from ['var'][0]
        // x values should be same for all units for this plot
        varIndex = plotInfo[plotIndex]['var'][0];
        varUnitIndex = plotInfo[plotIndex]['varUnitIndex'][0];
        tText += formatNum(processUnits[varUnitIndex][dataName][varIndex][k][0]) + tItemDelimiter;
          // get y value for each variable in [k][1]
          for (v = 0; v < tVarLabelLen; v += 1) {
            varIndex = plotInfo[plotIndex]['var'][v];
            varUnitIndex = plotInfo[plotIndex]['varUnitIndex'][v];
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

    //
    // for window.open, see http://www.w3schools.com/jsref/met_win_open.asp
    //
    // NOTE: window.open VERSION BELOW OPENS NEW POPUP WINDOW - MAY GET HIDDEN
    //       BEHIND FULL SCREEN BROWSER IF USER CLICKS ON PAGE BEFORE POPUP OPENS
    dataWindow = window.open('', 'Copy data',
          'height=600, left=20, resizable=1, scrollbars=1, top=40, width=600');
    //
    // NOTE: window.open VERSION BELOW OPENS NEW TAB IN SAME BROWSER WINDOW
    //       NEED TO ADD TOOLTIP TO BTN AND/OR TEXT OR LINK ON COPY DATA TAB...
    // dataWindow = window.open('',
    //       'height=600, left=20, resizable=1, scrollbars=1, top=40, width=600');
    //

    dataWindow.document.writeln('<html><head><title>Copy data</title></head>' +
           '<body>' +
           tText +
           '</body></html>');
    dataWindow.document.close();

    function formatNum(nn) {
      if (isNaN(nn)) {
        return nn;
      }
      // nn is a number so format with number methods
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
    } // END of function formatNum

  } // END of function copyData

} // END OF OBJECT interface
