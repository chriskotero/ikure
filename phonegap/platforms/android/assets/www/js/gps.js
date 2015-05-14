/*
 *gps.js handles the location tracking algorithm
 *  1 - event listeners are initiated
 *  2 - internal data (stored from index.html is loaded
 *  3 - timeInterval is set (every X milliseconds, sendLocation() is called)
 *  4 - device location is acquired
 *  5 - network status is evaluated
 *  6 - if the device is connected to the internet, current location is sent
 */

var startTime;
var stopTime;
var frequency;
var timeInterval;    //sets interval to update location

var updateCount = 0;    //for testing only

var deviceID;
var firstName;
var lastName;
var serverURL;

var latitude;
var longitude;

var connected = false;

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    console.log("Device Ready");
    
    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);
    document.addEventListener("offline", onOffline, false);
    
    checkConnection();
    loadFromInternalStorage();
}

function onPause() {
    console.log("app in background");   //android only, console.log does not work for iOS apps in background
}

function onResume() {
    console.log("app in foreground");
    refreshScreen();
}

function onOffline(){
    console.log("no internet connection");
    document.addEventListener("online", onOnline, false);
}

function onOnline(){
    console.log("internet connection established");
    document.removeEventListener("online", onOnline, false);
    sendLocation();
}

//checks the status of the device's internet connection
function checkConnection(){
    var networkState = navigator.connection.type;
    
    if (networkState == Connection.NONE) {
        connected = false;
        console.log("no internet connection");
    }
    else {
        connected = true;
        console.log("internet connection exists")
    }
}

//loads user information stored from index.html, if it exists
function loadFromInternalStorage(){
    console.log("loadFromInternalStorage");
    
    deviceID = window.localStorage.getItem("deviceID");
    firstName = window.localStorage.getItem("firstName");
    lastName = window.localStorage.getItem("lastName");
    serverURL = window.localStorage.getItem("serverURL");
    startTime = window.localStorage.getItem("startTime");
    stopTime = window.localStorage.getItem("stopTime");
    frequency = window.localStorage.getItem("updateFrequency");
        
    if (deviceID == null || firstName == null || lastName == null) {
        //error loading variables from local storage
        console.log("error homescreen.html loadFromInternalStorage()");
        window.localStorage.clear();    //clear all local storage
        window.clearInterval(timeInterval); //clears location update interval
        window.location = "index.html"; //redirect to index.html to reinput variables
    }
    else{
        var element = document.getElementById("title");
        var start = document.getElementById("startTimeDiv");
        var stop = document.getElementById("stopTimeDiv");
        element.innerHTML = "Hello " + firstName + " " + lastName;
        start.innerHTML = startTime;
        stop.innerHTML = stopTime;
        
        sendLocation(true); //send initial location onDeviceReady if during update time
        timeInterval = setInterval(function() {sendLocation(true)}, frequency); //initialize tracking intervals
    }
}

function trackingOn() {
    var freqMinutes = frequency / (1000*60);
    var trackingStatus = document.getElementById("trackingStatus");
    trackingStatus.innerHTML = "Currently tracking location every " + freqMinutes + " minutes";
}

function trackingOff() {
    var trackingStatus = document.getElementById("trackingStatus");
    trackingStatus.innerHTML = "Not currently tracking location";
}

function refreshScreen() {
    sendLocation(false);
}

/* LOCATION TRACKER */

//sends location to server after specified interval (if app is visible)
    //if sendLoc == true, location is sent to database
    //if sendLoc == false, location is not sent, but tracking status is updated
function sendLocation(sendLoc) {
    var d = new Date();
    var h = d.getHours();
    if (h < 10) {
        h = "0"+h;
    }
    var m = d.getMinutes();
    if (m < 10) {
        m = "0"+m;
    }
    currentTime = h + ':' + m;
    
    console.log("currentTime = " + currentTime);
    console.log("startTime = " + startTime);
    console.log("stopTime = " + stopTime);
    
    //send location if during tracking time
    if (stopTime < startTime) { //location tracking stopTime is midnight or later
        if ((currentTime < stopTime && currentTime >= "0:00") || (currentTime >= startTime && currentTime <= "23:59")) {
            trackingOn();
            if(sendLoc){
                console.log("1: sending location");
                navigator.geolocation.getCurrentPosition(onSuccess, onError);   //get location
            }
        }
        else {
            trackingOff();
            console.log("2: not tracking time");
        }
    }
    else {
        if (currentTime >= startTime && currentTime < stopTime) { //stopTime is before midnight
            trackingOn();
            if(sendLoc){
                console.log("3: sending location");
                navigator.geolocation.getCurrentPosition(onSuccess, onError);   //get location
            }
        }
        
        else {  //disable location tracking - clear timeInterval, set timeOut until startTime
            trackingOff();
            console.log("4: not tracking time");
        }
    }
}

// onSuccess Geolocation
    //called after location is acquired
function onSuccess(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    updateCount++;
    
    console.log("update " + updateCount);
    console.log("latitude = " + latitude);
    console.log("longitude = " + longitude);
    
    var scriptName = window.localStorage.getItem("saveLocationScript");
    
    if (scriptName == null) {
        console.log("error loading saveLocation script name");
        window.localStorage.clear();
        window.location = "index.html";
    }
    
    checkConnection();
    
    if (connected == true) {
        $.post(serverURL+scriptName,
            {
                deviceID: deviceID,
                latitude: latitude,
                longitude: longitude
            },
            function(data){
                if (data == 0) {   //success sending location
                    console.log("location successfully sent");
                }
                else{
                    console.log("error sending location");
                }
            }
        );
    }
    
    else{
        //Device is not connected to internet
        //current error handling is to just wait until next function call
        console.log("location not sent - not connected to the internet");
    }
}

// onError Callback receives a PositionError object
    // print error message, then just wait until next location update
function onError(error) {
    console.log('code: '    + error.code    + '\n' +
        'message: ' + error.message + '\n');    
}