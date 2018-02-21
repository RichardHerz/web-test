var el = document.querySelector("#radio_controllerMANUAL");
el.checked = false; // below works with either = true or = false
if (el.checked){
  alert("controller in MANUAL mode");
} else {
  alert("controller in AUTO mode");
}
