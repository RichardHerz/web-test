/*
  Design, text, images and code by Richard K. Herz, 2018
  Copyrights held by Richard K. Herz
  Licensed for use under the GNU General Public License v3.0
  https://www.gnu.org/licenses/gpl-3.0.en.html
*/

// This file defines an object that holds simulation parameter values and
// defines objects that represent process units

// ------------ PROCESS UNIT OBJECT DEFINITIONS ----------------------

// EACH PROCESS UNIT DEFINITION MUST CONTAIN AT LEAST THESE 6 FUNCTIONS:
//   initialize, reset, updateUIparams, updateInputs, updateState, display
// WARNING: THESE FUNCTION DEFINITIONS MAY BE EMPTY BUT MUST BE PRESENT

// -------------------------------------------------------------------

var processUnits = new Object();
  // contents must be only the process units as child objects
  // children optionally can be defined in separate script files, e.g., as puHeatExchanger,
  // then inserted into processUnits, e.g., processUnits[0] = puHeatExchanger,
  // then cleared for garbage collection, e.g., puHeatExchanger = null;
  // units defined in separate files makes them easier to edit

// load process unit objects into this object
processUnits[0] = puPlugFlowReactor;
processUnits[1] = puHeatExchanger;

// clear separate process units for garbage collection
puPlugFlowReactor = null;
puHeatExchanger = null;
