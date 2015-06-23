$(document).ready( function() {
    $("#admin").on("click",function() {
        showAdminOption();
    });
    $("#verifyAdmin").on("click",function() {
        verifyAdmin();
    });
    console.log("done loading onclick listeners");
});

//unhides option to input admin credentials to unassign device
function showAdminOption(){
    console.log("showAdminOptions");
    var adminOptions = document.getElementById("adminOptions");
    
    if (adminOptions.style.display == "none") {
        console.log("hidden");
        adminOptions.style.display = "block";
    }
    else {
        console.log("not hidden");
        adminOptions.style.display = "none";
    }
}

function verifyAdmin() {
    console.log("verifyAdmin");
    
    var serverURL = window.localStorage.getItem("serverURL");
    var scriptName = window.localStorage.getItem("verifyLoginScript");
        
    if (scriptName == null) {
        console.log("error loading verifyAdmin script name");
        window.localStorage.clear();
        window.location = "index.html";
    }
    
    var user = document.getElementById("username").value;
    var pass = document.getElementById("password").value;
    
    $.post(serverURL+scriptName, {username: user, password: pass},
    function(data){
        console.log(data);
        if (data != -1) {   //valid admin credentials
            console.log("admin verified");
            window.location = "adminSettings.html";
        }
        else{
            console.log("invalid admin credentials");
        }
    });
}