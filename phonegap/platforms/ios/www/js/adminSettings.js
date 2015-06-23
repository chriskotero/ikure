
var startTime;
var stopTime;
var frequency;

document.addEventListener("deviceready", onDeviceReady, false);

$(document).ready( function() {
    $("#reassign").on("click",function() {
        toggleConfirmation();
    });
    $("#yes").on("click",function() {
        reassignDevice();
    });
    $("#no").on("click",function() {
        toggleConfirmation();
    });
    $("#saveAndExit").on("click",function() {
        saveAndExit();
    });
    console.log("done loading onclick listeners");
});

function onDeviceReady(){
    loadFromInternalStorage();
    setSettings();
    
}

function loadFromInternalStorage(){
    startTime = window.localStorage.getItem("startTime");
    stopTime = window.localStorage.getItem("stopTime");
    frequency = window.localStorage.getItem("updateFrequency");
    
    if (startTime == null) {
        window.location = "index.html";
    }
    readableFreq = frequency / (1000*60);
    
    console.log("startTime = " + startTime);
    console.log("stopTime = " + stopTime);
    console.log("updateFrequency = " + readableFreq + " minutes");
}

function setSettings() {
    var startVal = document.getElementById("startTime");
    var stopVal = document.getElementById("stopTime");
    var freqVal = document.getElementById("frequency");
        
    startVal.value = startTime;
    stopVal.value = stopTime;
    
    freqVal.value = frequency / (1000*60);
}

function toggleConfirmation() {
    var options = document.getElementById("reassignConfirmation");
    
    if (options.style.display == "none") {
        options.style.display = "block";
    }
    else if (options.style.display == "block") {
        options.style.display = "none";
    }
}
function reassignDevice(){
    window.localStorage.clear();    //clear all local storage
    window.location = "index.html"; //redirects to index.html
}

function saveAndExit(){
    var startTime = document.getElementById('startTime').value;
    var stopTime = document.getElementById('stopTime').value;
    var updateFrequency = document.getElementById('frequency').value * 1000 * 60;
    
    window.localStorage.setItem("startTime", startTime);
    window.localStorage.setItem("stopTime", stopTime);
    window.localStorage.setItem("updateFrequency", updateFrequency);
    
    window.location = "homescreen.html";    //redirect to homescreen.html
}