var serverURL = "http://students.engr.scu.edu/~mmaeshir/ikure/";
var verifyLoginScript = "VerifyLogin.php";
var getAllLocationsScript = "GetAllLocations.php";

$(document).ready(function() {
    if (window.localStorage.getItem("serverURL") != serverURL) {
        storeVars();
    }
});

function storeVars() {
    window.localStorage.setItem("serverURL", serverURL);
    window.localStorage.setItem("verifyLoginScript", verifyLoginScript);
    window.localStorage.setItem("getAllLocationsScript", getAllLocationsScript);
}