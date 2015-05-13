var map;	//google map variable
var mapDisplay; //true if map is being displayed, false otherwise
var drawingManager;	//draw on map overlay
var workerArray = [];   //initialize array
var searchArray = [];   //initialize array to search
var markerArray = [];   //initialize array to store googleMaps markers
var infowindowArray = [];   //initialize array to store info windows for each marker
var currentInfoWindowIndex = -1;  //used when locating workers, keeps track of current opened info window to close when another is opened


//google.maps.event.addDomListener(window, 'load', initialize);	//initialize map on window load

$(document).ready(function() {
    checkID()
    
    $("#listWorkers").addClass("listChoiceSelected");
    $("#locateWorkers").addClass("listChoiceNotSelected");
    
    visitInit();
    sendLocationRequest("list");
});

function checkID(){
    var adminID = window.localStorage.getItem("adminID");
    if (adminID != null){	//cookie exists
        if (adminID < 1) {	//invalid adminID
            window.localStorage.clear();
        }
    }
    else window.location="index.html";	//cookie doesn't exist, redirect to login page
}

//creates a worker object that stores the deviceID, first name, last name, and current location for a worker
function Worker(id, first, last, lat, long){
    this.ID = id;
    this.firstName = first;
    this.lastName = last;
    this.latitude = lat;
    this.longitude = long;

    this.getID = function(){
        return this.ID;
    };
    this.getFirstName = function(){
        return this.firstName;
    };
    this.getLastName = function(){
        return this.lastName;
    };
    this.getLatitude = function(){
        return this.latitude;
    };
    this.getLongitude = function(){
        return this.longitude;
    };		    
}

// Standard google maps function
function initialize() {
    var mapOptions = {
        center: { lat: 22.501446, lng: 88.361675},    //iKure headquarters location
        zoom: 6
    };
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
}

// Custom centered location
function customInitialize(latitude, longitude){
    var mapOptions = {
        center: { lat: latitude, lng: longitude},    //iKure headquarters location
        zoom: 15
    };
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
}

// Function for adding a marker to the page.
function addMarker(location, id, first, last) {
    var contentString =
        '<div id="content">'+
            '<div id="siteNotice">'+'</div>'+
            //'<h1 id="firstHeading" class="firstHeading">'+</h1>'+
            '<div id="bodyContent">'+
                '<p><b>'+id+':  </b>' + first + ' ' + last + '</p>'+
            '</div>'+
        '</div>';

    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });
    
    marker = new google.maps.Marker({
        position: location,
        map: map
    });
    
    marker.setValues({type: "point", id: id});

    markerArray.push(marker);
    infowindowArray.push(infowindow);
    
    //can hover over marker to get info
    google.maps.event.addListener(marker, 'mouseover', function() {
        infowindow.open(map,this);
    });

    google.maps.event.addListener(marker, 'mouseout', function() {
        infowindow.close(map,this);
    });
    
    google.maps.event.addListener(marker, 'click', function() {
        //console.log(infowindow.getMap());
        if (infowindow.getMap() != null) {
            infowindow.close(map,this);
        }
        else {
            infowindow.open(map,this);
        }
    });
}

//draws marker on map
function drawMarker(worker){
    //var workerLatLng = new google.maps.LatLng(worker.getLatitude(),worker.getLongitude());
    addMarker(new google.maps.LatLng(worker.latitude, worker.longitude),
        worker.ID,
        worker.firstName,
        worker.lastName);
}

//only for plotting visit markers
function addVisitMarker(location, time){
    var contentString =
        '<div id="content">'+
            '<div id="siteNotice">'+'</div>'+
            '<div id="bodyContent">'+
                '<p>Location Sent At ' + time + '</p>'+
            '</div>'+
        '</div>';

    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });
    
    marker = new google.maps.Marker({
        position: location,
        icon: "img/visitMarkerIcon.png",
        map: map
    });
        
    //can hover over marker to get info
    google.maps.event.addListener(marker, 'mouseover', function() {
        infowindow.open(map,this);
    });

    google.maps.event.addListener(marker, 'mouseout', function() {
        infowindow.close(map,this);
    });
}

//plotting visit
function plotVisit(locations){
    var flightPlanCoordinates = [];
    for(var i=0; i<locations.length; i++){
        addVisitMarker(new google.maps.LatLng(Number(locations[i]["latitude"]), Number(locations[i]["longitude"])), locations[i]["time"]);
        flightPlanCoordinates.push(new google.maps.LatLng(Number(locations[i]["latitude"]), Number(locations[i]["longitude"])));
    }
    
    var flightPath = new google.maps.Polyline({
        path: flightPlanCoordinates,
        geodesic: true,
        strokeColor: '#259325',
        strokeOpacity: 1.0,
        strokeWeight: 4
    });

    flightPath.setMap(map);
}
//breaks down script response string
function parseLocationResponse(responseString){
    var responseTokens = responseString.split(",");
    
    workerArray = [];
    
    for(var i=0; i<responseTokens.length; i=i+5){
        var tempWorker = new Worker(
            responseTokens[i],      //worker id
            responseTokens[i+1],    //worker first name 
            responseTokens[i+2],    //worker last name
            responseTokens[i+3],    //worker latitude
            responseTokens[i+4]	//worker longitude
        );
        workerArray.push(tempWorker);	//save worker to workerArray
    }
    
    searchArray = JSON.parse(JSON.stringify(workerArray));  //initialize searchArray
    
    saveWorkers();
}

function sendLocationRequest(option) {
    var scriptName = window.localStorage.getItem("getAllLocationsScript");
    var serverURL = window.localStorage.getItem("serverURL");
    if (workerArray.length == 0) {  //only pull request from db on first load (or refresh)
        $.post(serverURL+scriptName, {},
            function(data){
                //console.log(data);
                if (data != -1) {   //locations aquired
                    parseLocationResponse(data);
                    if(option == "list") {
                        listWorkers();
                    }
                    else if(option == "locate") {
                        locateWorkers();
                    }
                }
        });
    }
    else {
        if (option == "list") {
            listWorkers();
        }
        else if (option == "locate") {
            locateWorkers();
        }
    }
}

function sendVisitsRequest(id, first, last) {
    var scriptName = window.localStorage.getItem("getWorkerVisitsScript");
    var serverURL = window.localStorage.getItem("serverURL");
    
    var worker = JSON.parse(window.localStorage.getItem("worker"+id));
    
    if (worker == null || (worker != null && (worker["firstName"] != first || worker["formattedLocations"] == null))) {   //only pull worker visit info if not already stored
        $.post(serverURL+scriptName,
            {
                workerID: id,
                firstName: first,
                lastName: last
            },
            function(data){
                if (data != -1) {   //locations aquired
                    parseWorkerVisitResponse(id, first, last, data);
                    displayWorkerVisit(id, true);
                }
                else {
                    worker = {firstName: first, lastName: last, date: null};
                    window.localStorage.setItem("worker"+id, JSON.stringify(worker));
                    displayWorkerVisit(id, false);
                }
        });
    }
    else {
        console.log("already stored");
        displayWorkerVisit(id, true);
    }
}

function parseWorkerVisitResponse(id, first, last, data){
    var workerVisits = JSON.parse(data);
    //console.log(workerVisits);
    
    var worker = {
        firstName: first,
        lastName: last,
        formattedLocations: []
    };
    
    var locations = []; //will hold all visit data
    
    for (var i=0; i<workerVisits.length; i++) {
        //console.log(i);
        var location = {};
        location["date"] = workerVisits[i]["date"];
        location["latitude"] = workerVisits[i]["latitude"];
        location["longitude"] = workerVisits[i]["longitude"];
        location["time"] = workerVisits[i]["time"];

        locations.push(location);
    }
        
    /* now sort location data by day */
    
    var date = "";
    var allLocations = [];
    
    var i = 0;
    var count = 0;
    
    while(i < locations.length){
        if (date == locations[i]["date"]) {
            allLocations[count-1]["locations"].push({
                time: locations[i]["time"],
                longitude: locations[i]["longitude"],
                latitude: locations[i]["latitude"]
            });
        }
        else {
            date = locations[i]["date"];
            allLocations.push({
                date: date,
                locations: [
                    {
                        time: locations[i]["time"],
                        longitude: locations[i]["longitude"],
                        latitude: locations[i]["latitude"]
                    }
                ]
            });
            count++;
        }
        
        i++;
    }
    
    worker["formattedLocations"] = allLocations;
    
    window.localStorage.setItem("worker"+id, JSON.stringify(worker));   //save worker visit info
}

function displayWorkerVisit(id, notEmpty){    
    var worker = JSON.parse(window.localStorage.getItem("worker"+id));
    
    var workerDiv = document.getElementById("worker");
    workerDiv.innerHTML = "";
        
    var title = document.createElement("h1");
    title.innerHTML = "Worker: " + worker["firstName"] + " " + worker["lastName"];
    
    var content = document.createElement("div");
    content.id = "visitContent";
    
    if (notEmpty == true) {
        var selectTitle = document.createElement("h2");
        selectTitle.innerHTML = "Select one of the available dates to view that day's location data:";
        content.appendChild(selectTitle);
        
        for(var i=0; i<worker["formattedLocations"].length; i++){
            var dateButton = document.createElement("div");
            dateButton.className = "dateSelect";
            dateButton.innerHTML = worker["formattedLocations"][i]["date"];
            dateButton.onclick = toggleVisit(worker["formattedLocations"][i]);
            content.appendChild(dateButton);
        }
    }
    else {
        content.innerHTML = "<p>No location data stored in the past week</p>";
    }
    
    workerDiv.appendChild(title);
    workerDiv.appendChild(content);
    
    if (mapDisplay == true) {
        $("#map").hide();
        $("#worker").show();
        mapDisplay = false;
    }
}

function toggleVisit(visit){
    return function() {
        console.log(mapDisplay);
        if (mapDisplay == false) {
            $("#worker").hide();
            $("#map").show();
            mapDisplay = true;
            showVisit(visit);
        }
        else {
            $("#map").hide();
            $("#worker").show();
            mapDisplay = false;
        }
    }
}

function showVisit(visit){
    console.log(visit);
    
    customInitialize(Number(visit["locations"][0]["latitude"]), Number(visit["locations"][0]["longitude"]));
    plotVisit(visit["locations"]);
}

$(function() {	//handles menu selections
        $("#logout").on("click",function() {
            window.localStorage.clear();
            window.location = "index.html";
        });
        
        $("create").on("click", function() {
            window.location = "createAccount.html";
        });
        
        $("#listWorkers").on("click", function() {
            visitInit();
            
            $("#listWorkers").removeClass("listChoiceNotSelected");
            $("#locateWorkers").removeClass("listChoiceSelected");
            $("#listWorkers").addClass("listChoiceSelected");
            $("#locateWorkers").addClass("listChoiceNotSelected");
            
            sendLocationRequest("list");
        });
        
        $("#locateWorkers").on("click", function() {
            locateInit();
            
            $("#locateWorkers").removeClass("listChoiceNotSelected");
            $("#listWorkers").removeClass("listChoiceSelected");
            $("#locateWorkers").addClass("listChoiceSelected");
            $("#listWorkers").addClass("listChoiceNotSelected");
            
            sendLocationRequest("locate");
        });
});

function saveWorkers() {
    window.localStorage.setItem("workerArray", JSON.stringify(workerArray));
}

//search bar algorithm
function searchAndDisplay(displayOption){
    return function() {
        var searchOption = $('input[name=searchChoice]:checked').val();
        var query = document.getElementById("search").value;
        var queryLength = query.length;
        
        var searchArray = JSON.parse(window.localStorage.getItem("workerArray"));

        if (query != "") {
            for(var i=searchArray.length-1; i>=0; i--){
                var term = searchArray[i][searchOption];

                if (term.length < queryLength || query.toUpperCase() != term.substr(0, queryLength).toUpperCase()) {
                    searchArray.splice(i, 1);
                }
            }
        }
        
        if (displayOption == "locate") {
            locateWorkerHelper(searchArray);
        }
        else if (displayOption == "list") {
            listVisitHelper(searchArray);
        }
    }
}

/** LIST HEALTH WORKERS OPTION **/

function visitInit() {
    $("#loading").show();
      
    var workerDiv = document.getElementById("worker");
    workerDiv.id = "worker";
    workerDiv.innerHTML = "<h1>Select a worker from the list to view his/her visits from the past week</h1>";
    
    if (mapDisplay == true) {
        $("#map").hide();
        $("#worker").show();
    }
    
    mapDisplay = false;
}

function listWorkers() {
    $("#loading").hide();
    
    var searchBar = document.getElementById("search");
    var firstNameSearch = document.getElementById("firstNameSearch");
    var lastNameSearch = document.getElementById("lastNameSearch");
    searchBar.addEventListener("input", searchAndDisplay("list"));
    firstNameSearch.addEventListener("click", searchAndDisplay("list"));
    lastNameSearch.addEventListener("click", searchAndDisplay("list"));
    
    var workerArray = JSON.parse(window.localStorage.getItem("workerArray"));
    listVisitHelper(workerArray);
}

function listVisitHelper(workerArray2){
    var content = document.getElementById("content");
    
    content.innerHTML = "";
    
    for(var i=0; i<workerArray2.length; i++){
        var tempWorker = workerArray2[i];
        
        var div = document.createElement("div");
        div.className = "listList";
        
        var infoDiv = document.createElement("div");
        infoDiv.className = "listInfo";
        infoDiv.innerHTML = tempWorker.ID + ": " + tempWorker.firstName + " " + tempWorker.lastName;
        var listDiv = document.createElement("div");
        listDiv.className = "listSubmit";
        listDiv.id = "list"+tempWorker.ID;
        listDiv.innerHTML = "View Visits";
        listDiv.onclick = listVisits(tempWorker.ID, tempWorker.firstName, tempWorker.lastName);
        
        div.appendChild(infoDiv);
        div.appendChild(listDiv);
        
        content.appendChild(div);
    }
}

function listVisits(id, first, last) {
    return function() {
        console.log(id);        
        getVisits(id, first, last);
    }
}

function getVisits(id, first, last) {
    sendVisitsRequest(id, first, last);
}

/** LOCATE HEALTH WORKERS OPTION **/

function locateInit() {
    $("#loading").show();
    if (mapDisplay == false) {
        $("#map").show();
        $("#worker").hide();
        mapDisplay = true;
    }
    initialize();   //initialize google map
}

function locateWorkers() {    
    $("#loading").hide();
        
    var searchBar = document.getElementById("search");
    var firstNameSearch = document.getElementById("firstNameSearch");
    var lastNameSearch = document.getElementById("lastNameSearch");
    
    searchBar.addEventListener("input", searchAndDisplay("locate"));
    firstNameSearch.addEventListener("click", searchAndDisplay("locate"));
    lastNameSearch.addEventListener("click", searchAndDisplay("locate"));
    
    var workerArray = JSON.parse(window.localStorage.getItem("workerArray"));
    locateWorkerHelper(workerArray);
}

function locateWorkerHelper(workerArray2) {
    var listContent = document.getElementById("content");
    
    content.innerHTML = "";
    
    for(var i=0; i<workerArray2.length; i++){
        var tempWorker = workerArray2[i];
        
        drawMarker(tempWorker);

        var div = document.createElement("div");
        div.className = "locateList";
        
        var infoDiv = document.createElement("div");
        infoDiv.className = "locateInfo";
        infoDiv.innerHTML = tempWorker.ID + ": " + tempWorker.firstName + " " + tempWorker.lastName;
        var locateDiv = document.createElement("div");
        locateDiv.className = "locateSubmit";
        locateDiv.id = "locate"+tempWorker.ID;
        locateDiv.innerHTML = "Locate";
        locateDiv.onclick = locateWorker(tempWorker.ID);
        
        div.appendChild(infoDiv);
        div.appendChild(locateDiv);
        
        content.appendChild(div);
    }
}

function locateWorker(index) {
    //console.log(index);
    return function() {
        //console.log(index + " clicked");
        for(var i = 0; i<markerArray.length; i++){
            //console.log(markerArray[i].get("id"));
            if (markerArray[i].get("id") == index) {
                console.log("currentInfoWindowIndex = " + currentInfoWindowIndex);
                if (currentInfoWindowIndex == i) {
                    google.maps.event.trigger(markerArray[i], "click");
                    currentInfoWindowIndex = -1;
                }
                else if(currentInfoWindowIndex < 0) {
                    google.maps.event.trigger(markerArray[i], "click");
                    currentInfoWindowIndex = i;
                }
                else if (currentInfoWindowIndex >= 0) {
                    google.maps.event.trigger(markerArray[currentInfoWindowIndex], "click");
                    google.maps.event.trigger(markerArray[i], "click");
                    currentInfoWindowIndex = i;
                }
                break;
            }
        }
    }
}
