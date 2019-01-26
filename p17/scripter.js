
// http://tutorials.jenkov.com/svg/scripting.html

let rotor = function(pAngle) {

  alert('pAngle = ' + pAngle);
  let svgElement = document.getElementById("svg_group");
  let el = document.getElementById("test_p");
  el.value = "hello " + pAngle;
  svgElement.setAttribute("transform", "rotate(" + pAngle + " 300 300)");

}

let doit = function(){

  let angle = 0;

  rotor(10);
  rotor(20);
  rotor(30);

    // setTimeout(rotor(0), 500);
    // setTimeout(rotor(45), 500);
    // setTimeout(rotor(90), 500);


    // for (let i=0; i<90; i++) {
    //   angle = angle - i;
    //   setTimeout(rotor(angle), 500);
    // }

}
