
// http://tutorials.jenkov.com/svg/scripting.html

var pAngle = -135;

function rotor() {
  pAngle = pAngle + 45;
  console.log('pAngle = ' + pAngle);
  let svgElement = document.getElementById("svg_group");
  let el = document.getElementById("test_p");
  el.innerHTML = "angle = " + pAngle;
  svgElement.setAttribute("transform", "rotate(" + pAngle + " 300 300)");
}

function doit() {

  // // see https://stackoverflow.com/a/37505354
  // // need function(){rotor()} - rotor() by itself doesn't work
  // // rotor() by itself gets called but no delay

  // *** can use delx as a variable
  // *** but argument myVar in rotor(myVar) gets value myVar is at time of last call
  // *** to setTimeout is executed, which is almost instantaneously here
  // *** so maybe increment angle in rotor() with no arguments...which works
  // *** but may be able to use an input argument if only issue the rotor
  // *** calls as part of some other function which is called by setTimeout...

  let delx = 1000;
  setTimeout(function(){ rotor(); }, delx);
  delx = delx + 500;
  setTimeout(function(){ rotor(); }, delx);
  delx = delx + 500;
  setTimeout(function(){ rotor(); }, delx);
  delx = delx + 500;
  setTimeout(function(){ rotor(); }, delx);
  delx = delx + 500;
  setTimeout(function(){ rotor(); }, delx);

}
