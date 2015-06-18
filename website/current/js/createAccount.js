$(document).ready(function() {
    checkID(); //checks if valid adim, if so continue
    
    $("#createButton").on("click",function() {    //registers onClick event
        createNewAccount();
    });
    
    $("#logout").on("click",function() {
        window.localStorage.clear();
        window.location = "index.html";
    });
});

function checkID(){
    var adminID = window.localStorage.getItem("adminID");
    if (adminID == null){
        window.location = "index.html";
    }
}

function createNewAccount() {
    var firstName = document.getElementById("firstName").value;
    var lastName = document.getElementById("lastName").value;
    var phoneNumber = document.getElementById("phoneNumber").value;
    var username = document.getElementById("username").value;
    var password = document.getElementById("password");
    var passwordConf = document.getElementById("passwordConf");
    
    if (password.value != passwordConf.value) {
        alert("Re-entered Password does not match Password");
        password.value = "";
        passwordConf = "";
    }
    else {
        if (firstName == "" || lastName == "" || phoneNumber == "" || username == "" || password.value == "" || passwordConf == "") {
            alert("Please fill out all fields");
        }
        else {
            var serverURL = window.localStorage.getItem("serverURL");
            var scriptName = window.localStorage.getItem("createNewAccountScript");
            $.post(serverURL+scriptName,
                {
                    firstName: firstName,
                    lastName: lastName,
                    phoneNumber: phoneNumber,
                    username: username,
                    password: password.value
                },
                function(data){
                    //console.log(data);
                    if (data == -1) {   //admin account already exists for that user
                        displayStatus(-1);
                    }
                    else {
                        displayStatus(1);
                    }
                }
            );
        }
    }
}

function displayStatus(code) {
console.log("test");
    var status = document.getElementById("status");
    
    if (code == -1) {   //already exists
        status.innerHTML = "Admin account for that username already exists";
    }
    else if (code == 1) {   //successfully added
        status.innerHTML = "New admin account created";
    }
}