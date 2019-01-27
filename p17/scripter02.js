
// http://tutorials.jenkov.com/svg/scripting.html

let pAngle = -135;
let counter = 0;
let delx = 1000;

function rotor() {
  pAngle = pAngle + 45;
  console.log('pAngle = ' + pAngle);
  let svgElement = document.getElementById("svg_group");
  let el = document.getElementById("test_p");
  el.innerHTML = "angle = " + pAngle;
  svgElement.setAttribute("transform", "rotate(" + pAngle + " 300 300)");
}

function doit() {
  counter++;
  rotor();
  if (counter < 10) {
    setTimeout(function(){ doit(); }, delx);
  }
}
