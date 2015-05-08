$(document).ready(function() {
    checkID()
    
    $("#listWorkers").addClass("listChoiceSelected");
    $("#locateWorkers").addClass("listChoiceNotSelected");
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
    sendRequest();	//pull health worker locations
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
    
    google.maps.event.addListener(marker, 'mouseover', function() {
        infowindow.open(map,this);
    });
    google.maps.event.addListener(marker, 'mouseout', function() {
        infowindow.close(map,this);
    });
}

google.maps.event.addDomListener(window, 'load', initialize);	//initialize map on window load

//draws marker on map
function drawMarker(worker){
    //var workerLatLng = new google.maps.LatLng(worker.getLatitude(),worker.getLongitude());
    addMarker(new google.maps.LatLng(worker.getLatitude(), worker.getLongitude()),
        worker.getID(),
        worker.getFirstName(),
        worker.getLastName());
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
        
        //for debugging
        /*
        console.log(responseTokens[i]);
        console.log(responseTokens[i+1]);
        console.log(responseTokens[i+2]);
        console.log(responseTokens[i+3]);
        console.log(responseTokens[i+4]);
        */
    }
    
    // CREATE MARKERS FOR WORKERS //		    
    for(var i=0; i<workerArray.length; i++){
        drawMarker(workerArray[i]);
    }
}

function sendRequest()
{
    var scriptName = window.localStorage.getItem("getAllLocationsScript");
    var serverURL = window.localStorage.getItem("serverURL");
    
    var xmlhttp;
    if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            //document.getElementById("myDiv").innerHTML=xmlhttp.responseText;
            parseResponse(xmlhttp.responseText);
        }
    }
    xmlhttp.open("POST",serverURL+scriptName,true);
    
    var data = new FormData();
    xmlhttp.send(data);
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
            
            //list workers
        });
        
        $("#locateWorkers").on("click", function() {
            $("#locateWorkers").removeClass("listChoiceNotSelected");
            $("#listWorkers").removeClass("listChoiceSelected");
            $("#locateWorkers").addClass("listChoiceSelected");
            $("#listWorkers").addClass("listChoiceNotSelected");
            
            //locate workers
        });
});