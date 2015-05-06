$(document).ready(checkCookie);	//checks if cookie is present & valid, if so login

function checkCookie(){
    var adminID = getCookie("adminID");
    if (adminID != ""){
        if (adminID > 0) {
            login();
        }
    }
}

function getCookie(key) {	//gets cookie key value if available
    var name = key + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}

//can submit username/password by pressing enter key
function enterPressed(){
    if (window.event.keyCode==13){
        //var textValue=document.forms[0].password.value;
        sendRequest();
    }else {
        //do nothing
    }
}

//sends info to php server to verify username/password
function sendRequest()
{
    var scriptName = "VerifyLogin.php";
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
                document.cookie = "adminID="+response;
                login();
            }
        }
    }
    xmlhttp.open("POST","http://students.engr.scu.edu/~mmaeshir/ikure/"+scriptName,true);
    
    var data = new FormData();
    data.append('username', username);
    data.append('password', password);
    xmlhttp.send(data);
}

$(function() {
    $("#signIn").on("click",function(e) {
        sendRequest();
    });
});

function login() {
    window.location = 'locate.html';
}