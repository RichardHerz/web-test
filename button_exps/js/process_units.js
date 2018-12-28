/*
  Design, text, images and code by Richard K. Herz, 2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// This file defines objects that represent process units

// ------------ PROCESS UNIT OBJECT DEFINITIONS ----------------------

// EACH PROCESS UNIT DEFINITION MUST CONTAIN AT LEAST THESE 7 FUNCTIONS:
//  initialize, reset, updateUIparams, updateInputs, updateState,
//  updateDisplay, checkForSteadyState
// THESE FUNCTION DEFINITIONS MAY BE EMPTY IN SOME CASES BUT MUST BE PRESENT
//
// EACH PROCESS UNIT DEFINITION MUST DEFINE the variable residenceTime

// -------------------------------------------------------------------

let processUnits = new Object();
// assign process unit objects to this object
// as indexed child objects in order to allow object controller
// to access them in a repeat with numeric index
// contents must be only the process units as child objects
// child objects optionally can be defined in separate script files, which
// makes them easier to edit,
// then inserted into processUnits, e.g.,
// USING CONSTRUCTOR FUNCTION...
//   processUnits[0] = new puHeatExchanger(0); // [] and () index # must match
// OR USING OBJECT
//   processUnits[0] = puHeatExchanger; // puHeatExchanger is an object
//   processUnits[0].unitIndex = 0; // assign unitIndex to match processUnits index
// then object cleared for garbage collection, e.g.,
//   puHeatExchanger = null; // puHeatExchanger is an object

processUnits[0] = new puWaterFeed(0);
processUnits[1] = new puWaterTank(1);
processUnits[2] = new puWaterController(2);
