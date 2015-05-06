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

//var bgGeo;  //object for background tracker

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    console.log("Device Ready");
    
    document.addEventListener("pause", onPause, false);
    document.addEventListener("resume", onResume, false);
    document.addEventListener("offline", onOffline, false);
    //document.addEventListener("online", onOnline, false);
    
    checkConnection();
    loadFromInternalStorage();
}

function onPause() {
    console.log("app in background");   //android only, console.log does not work for iOS apps in background
    //bgGeo.start();
}

function onResume() {
    console.log("app in foreground");
    //bgGeo.stop();
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
        var start = document.getElementById("startTime");
        var stop = document.getElementById("stopTime");
        element.innerHTML = "Hello " + firstName + " " + lastName;
        start.innerHTML = startTime;
        stop.innerHTML = stopTime;
        
        sendLocation(); //send initial location onDeviceReady if during update time
        timeInterval = setInterval(function() {sendLocation()}, frequency); //initialize tracking intervals
        //initBGTracker();    //starts bgGeo
    }
}

/*
//initializes, configures, and starts background tracker
function initBGTracker() {
    bgGeo = window.plugins.backgroundGeoLocation;
    
    //must execute at least one getCurrentPosition call for background tracker to work
    navigator.geolocation.getCurrentPosition(function(location) {
        console.log('Location from Phonegap');
    });
    
    //configuring background location tracking
    bgGeo.configure(callbackFn, failureFn, {
        url: serverURL + "SaveBGLocation.php", //server URL to send location updates
        params: {
            deviceID: deviceID
        },
        headers: {
            //none
        },
        locationTimeout: frequency, //sets minimum amount of time between location updates
        desiredAccuracy: 10,
        stationaryRadius: 20,
        distanceFilter: 5,
        notificationTitle: 'Background tracking',   //android only, customize notification title
        notificationText: 'ENABLED',    //android only, customize notification text
        activityType: 'AutomotiveNavigation',   //for iOS, options = AutomotiveNavigation, OtherNavigation, Fitness, and Other
        debug: true,    //enable this to hear sounds for background-tracking life cycle
        stopOnTerminate: false  //enable this to clear background location settings when the app terminates
    });
    
    bgGeo.start();  //starts background tracker
    console.log("background location tracker initialized");
}
*/

/* TODO BACKGROUND LOCATION TRACKER */
//still track location when app is in the background
/*
//callback for Ajax-requests after POSTing background location to server
var yourAjaxCallback = function(response) {
    bgGeo.finish(); //must stop running in background after location update is completed
}

//callback to be executed every time a geolocation is recorded in the background
//not executed in Android, since background tracking is done by a service, not running app code
var callbackFn = function(location) {
    updateCount++;
    
    console.log('BackgroundGeoLocation callback: location update = ' + updateCount);
    
    //HTTP request to POST location to server (iOS only, android POST done automatically from configure vars)
    yourAjaxCallback.call(this);
}

var failureFn = function(error){
    console.log('BackgroundGeolocation error');
}
*/

/* FOREGROUND LOCATION TRACKER */

//sends location to server after specified interval (if app is visible)
function sendLocation() {
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
    
    //send location if during tracking time
    
    if (stopTime < startTime) { //location tracking stopTime is midnight or later
        if ((currentTime < stopTime && currentTime >= "0:00") || (currentTime >= startTime && currentTime <= "23:59")) {
            trackingOn();
            navigator.geolocation.getCurrentPosition(onSuccess, onError);   //get location
            console.log("sending location");
        }
        else {
            trackingOff();
            console.log("not tracking time");
        }
    }
    
    else {
        if (currentTime >= startTime && currentTime < stopTime) { //stopTime is before midnight
            trackingOn();
            window.navigator.geolocation.getCurrentPosition(onSuccess, onError);   //get location
            console.log("sending location");
        }
        
        else {  //disable location tracking - clear timeInterval, set timeOut until startTime
            trackingOff();
            console.log("not tracking time");
        }
    }
}

// onSuccess Geolocation
//
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
                //DEBUGGING PURPOSES
                /*
                var ul = document.getElementById("resultList");
                var li = document.createElement("li");
                li.appendChild(document.createTextNode(data));
                ul.appendChild(li);
                */
                
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
//  print error message, then just wait until next location update
function onError(error) {
    console.log('code: '    + error.code    + '\n' +
        'message: ' + error.message + '\n');    
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