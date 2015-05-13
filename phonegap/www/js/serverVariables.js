var serverURL = "http://students.engr.scu.edu/~mmaeshir/ikure/";
var assignDeviceScript = "AssignDevice.php";
var saveLocationScript = "SaveLocation.php";
var verifyLoginScript = "VerifyLogin.php";

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    storeVariables();
}

function storeVariables() {
    if (window.localStorage.getItem("serverURL") != serverURL
        || window.localStorage.getItem("assignDeviceScript") != assignDeviceScript
        || window.localStorage.getItem("saveLocationScript") != saveLocationScript
        || window.localStorage.getItem("verifyLoginScript") != verifyLoginScript) {
        window.localStorage.setItem("serverURL", serverURL);
        window.localStorage.setItem("assignDeviceScript", assignDeviceScript);
        window.localStorage.setItem("saveLocationScript", saveLocationScript);
        window.localStorage.setItem("verifyLoginScript", verifyLoginScript);
    }
}