$(function() {	//handles logout
        $("#logout").on("click",function() {
            window.localStorage.clear();
            window.location = "index.html";
        });
});

$(document).ready(function() {
    checkID()
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