$(document).ready(function() {
    checkID()
    
    $("#listWorkers").addClass("listChoiceSelected");
    $("#locateWorkers").addClass("listChoiceNotSelected");
    
    listWorkers();
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

var map;	//google map variable
var drawingManager;	//draw on map overlay
var workerArray = [];   //initialize array
var markerArray = [];   //initialize array to store googleMaps markers
var infowindowArray = [];   //initialize array to store info windows for each marker
var currentInfoWindowIndex = -1;  //used when locating workers, keeps track of current opened info window to close when another is opened

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
    //var myLatlng = new google.maps.LatLng(40.779502, -73.967857);
    var mapOptions = {
        center: { lat: 22.501446, lng: 88.361675},    //iKure headquarters location
        zoom: 6
    };
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    //sendRequest();	//pull health worker locations
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

google.maps.event.addDomListener(window, 'load', initialize);	//initialize map on window load

//draws marker on map
function drawMarker(worker){
    //var workerLatLng = new google.maps.LatLng(worker.getLatitude(),worker.getLongitude());
    addMarker(new google.maps.LatLng(worker.latitude, worker.longitude),
        worker.ID,
        worker.firstName,
        worker.lastName);
}
  
//breaks down script response string
function parseResponse(responseString){
    var responseTokens = responseString.split(",");
    
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
    
    saveWorkers();
}

function sendLocationRequest()
{
    var scriptName = window.localStorage.getItem("getAllLocationsScript");
    var serverURL = window.localStorage.getItem("serverURL");
    
    $.post(serverURL+scriptName, {},
        function(data){
            //console.log(data);
            if (data != -1) {   //locations aquired
                parseResponse(data);
                locateWorkers();
            }
    });
}

$(function() {	//handles logout
        $("#logout").on("click",function() {
            window.localStorage.clear();
            window.location = "index.html";
        });
        
        $("#listWorkers").on("click", function() {
            $("#listWorkers").removeClass("listChoiceNotSelected");
            $("#locateWorkers").removeClass("listChoiceSelected");
            $("#listWorkers").addClass("listChoiceSelected");
            $("#locateWorkers").addClass("listChoiceNotSelected");
            
            listWorkers(); //list workers
        });
        
        $("#locateWorkers").on("click", function() {
            //$("#listContent").html("");
            $("#loading").show();
            
            $("#locateWorkers").removeClass("listChoiceNotSelected");
            $("#listWorkers").removeClass("listChoiceSelected");
            $("#locateWorkers").addClass("listChoiceSelected");
            $("#listWorkers").addClass("listChoiceNotSelected");
            
            //locate workers
            sendLocationRequest().done($("loading").hide());
            //locateWorkers();
        });
});

function saveWorkers() {
    window.localStorage.setItem("workerArray", JSON.stringify(workerArray));
}

function listWorkers() {
    
}

function locateWorkers() {
    //sendRequest();

    var workerArray2 = JSON.parse(window.localStorage.getItem("workerArray"));
    var listContent = document.getElementById("listContent");
    
    listContent.innerHTML = "";
    
    for(var i=0; i<workerArray2.length; i++){
        var tempWorker = workerArray2[i];
        
        drawMarker(tempWorker);

        var div = document.createElement("div");
        div.className = "locateList";
        
        var infoDiv = document.createElement("div");
        infoDiv.className = "locateInfo";
        infoDiv.innerHTML = tempWorker.ID + ": " + tempWorker.lastName + ", " + tempWorker.firstName;
        var locateDiv = document.createElement("div");
        locateDiv.className = "locateSubmit";
        locateDiv.id = "locate"+tempWorker.ID;
        locateDiv.innerHTML = "Locate";
        locateDiv.onclick = locateWorker(tempWorker.ID);
        
        div.appendChild(infoDiv);
        div.appendChild(locateDiv);
        
        listContent.appendChild(div);
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
