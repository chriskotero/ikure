/*
 * device.js deals with assigning the device to a specific health worker
 * this information is stored both locally through internal storage and on the database
 * 
 */
//var serverURL = "http://students.engr.scu.edu/~mmaeshir/ikure/";
var serverURL = "";
var startTime;
var stopTime;
var updateFrequency = -1;

var deviceID = 0;
var latitude;
var longitude;
var firstName = "";
var lastName = "";


// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, false);

// Cordova is ready
//

$(document).ready( function() {
  $("#submit").on("click",function(e) {
    assignDevice();
  });
});

function onDeviceReady() {
    var first = window.localStorage.getItem("firstName");
    var last = window.localStorage.getItem("lastName");
    if (first != null && last != null) {  //if device is already assigned to person, redirect to homescreen
        console.log("redirect to homescreen");
        window.location = "homescreen.html";
    }
    
    serverURL = window.localStorage.getItem("serverURL");
    if (serverURL != null) {
      document.getElementById("serverURL").value == serverURL;
    }
    navigator.geolocation.getCurrentPosition(onSuccess, onError);   //initialize variables & tracking
}


// GeoLocation onSuccess, assign device uuid and lat/long
//
function onSuccess(position) {
    deviceID = device.uuid;    
    latitude = position.coords.latitude;    
    longitude = position.coords.longitude;
}

// onError Callback receives a PositionError object
//
function onError(error) {
    alert('code: '    + error.code    + '\n' +
        'message: ' + error.message + '\n');
}

function assignDevice(){
    console.log("Assign Device");
    
    //var serverURL = window.localStorage.getItem("serverURL");
    var scriptName = window.localStorage.getItem("assignDeviceScript");
    
    if (scriptName == null) {
        console.log("error loading assignDevice script name");
    }
    
    serverURL = document.getElementById('serverURL').value;
    firstName = document.getElementById('firstName').value;
    lastName = document.getElementById('lastName').value;
    startTime = document.getElementById('startTime').value;
    stopTime = document.getElementById('stopTime').value;
    updateFrequency = document.getElementById('frequency').value * 1000 * 60; //convert from minutes to milliseconds
    
    $.post(serverURL+scriptName,
        {
            deviceID: deviceID,
            firstName: firstName,
            lastName: lastName
        },
        function(data){
            if(data == 0){
              console.log("Device already assigned to this person");
              if (window.localStorage.getItem("firstName") != firstName || window.localStorage.getItem("lastName") != lastName) {
                //device is assigned, but not saved to local storage
                saveToLocalStorage();
              }
              
              window.location = "homescreen.html";
            }
            else if(data == 1){
              console.log("Device assigned to " + firstName + " " + lastName);
              saveToLocalStorage(); //saves device uuid, first name, and last name to local storage
              window.location = "homescreen.html"; //redirects to homescreen page
            }
            else{
              console.log("Invalid server response");
            }
        }
    );
}
    
function saveToLocalStorage(){
    if (deviceID != 0 && firstName != "" && lastName != "" && updateFrequency > 0) { //valid data to store
        window.localStorage.setItem("deviceID", deviceID);
        window.localStorage.setItem("firstName", firstName);
        window.localStorage.setItem("lastName", lastName);
        //window.localStorage.setItem("serverURL", serverURL);
        window.localStorage.setItem("startTime", startTime);
        window.localStorage.setItem("stopTime", stopTime);
        window.localStorage.setItem("updateFrequency", updateFrequency);
    }
    
    //for debugging
    console.log("deviceID: " + window.localStorage.getItem("deviceID"));
    console.log("firstName: " + window.localStorage.getItem("firstName"));
    console.log("lastName: " + window.localStorage.getItem("lastName"));
    //console.log("serverURL: " + window.localStorage.getItem("serverURL"));
    console.log("startTime: " + window.localStorage.getItem("startTime"));
    console.log("stopTime: " + window.localStorage.getItem("stopTime"));
    console.log("updateFrequency: " + window.localStorage.getItem("updateFrequency"));
}
