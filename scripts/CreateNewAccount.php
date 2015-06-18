<?php header('Access-Control-Allow-Origin: *'); ?>
<?php
/* Phonegap UUID info: http://docs.phonegap.com/en/edge/cordova_device_device.md.html#device.uuid */
/*  Handles POST request, takes device UUID (as string) and first/last name of worker, saves in database
*/
    include 'DatabaseCredentials.php';
    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    // Check connection
    if ($conn->connect_error) {
         die("Connection failed: " . $conn->connect_error);
    }
    
    $firstName = $_REQUEST["firstName"];
    $lastName = $_REQUEST["lastName"];
    $phoneNumber = $_REQUEST["phoneNumber"];

    $username = $_REQUEST["username"];
    $password = $_REQUEST["password"];
    
    $sql = "SELECT adminID FROM Accounts WHERE username='$username'";
    $result = $conn->query($sql);
    
    if($result->num_rows > 0){  //admin account for that person already exists
        echo -1;
    }
    
    else {
        $sql = "INSERT INTO Accounts (adminID, username, password, firstName, lastName, phoneNumber) VALUES (NULL,'$username', '$password', '$firstName', '$lastName', '$phoneNumber');";
        $conn->query($sql);
        echo 1;
    }

    $conn->close();
?>