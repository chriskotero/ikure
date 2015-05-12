$(document).ready(function() {
    checkID(); //checks if cookie is present & valid, if so login
    
    $("#signIn").on("click",function() {    //registers onClick event
        sendRequest();
    });
});

function checkID(){
    var adminID = window.localStorage.getItem("adminID");
    if (adminID != null){
        if (adminID > 0) {
            login();
        }
    }
}

//can submit username/password by pressing enter key
function enterPressed(){
    if (window.event.keyCode==13){
        sendRequest();
    }else {
        //do nothing
    }
}

//sends info to php server to verify username/password
function sendRequest()
{
    var scriptName = window.localStorage.getItem("verifyLoginScript");
    var serverURL = window.localStorage.getItem("serverURL");
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var response;
    
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
            response = xmlhttp.responseText;
            console.log(response);
            //parseResponse(xmlhttp.responseText);
        
            if (response == -1) {	//invalid username or password
                displayIncorrect();
            }
            else{
                //document.cookie = "adminID="+response;
                window.localStorage.setItem("adminID", response);
                login();
            }
        }
    }
    xmlhttp.open("POST",serverURL+scriptName,true);
    
    var data = new FormData();
    data.append('username', username);
    data.append('password', password);
    xmlhttp.send(data);
}

function login() {
    window.location = "welcome.html";
}