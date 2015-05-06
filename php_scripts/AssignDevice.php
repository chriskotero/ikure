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

    $deviceID = $_REQUEST["deviceID"];  //device's UUID
    $firstName = $_REQUEST["firstName"];
    $lastName = $_REQUEST["lastName"];
    
    $prevFirst = "";
    $prevLast = "";
    
    $sql = "SELECT firstName,lastName FROM DeviceWorkerList WHERE deviceID = '$deviceID'";
    $result = $conn->query($sql);
    
    if($result->num_rows > 0){  //device previously assigned (UPDATE)
        while($row = $result->fetch_assoc()) {
            $prevFirst = $row['firstName'];
            $prevLast = $row['lastName'];
        }
        
        if($prevFirst == $firstName && $prevLast == $lastName){ //already assigned to same person
            echo 0;   //return 0 if already assigned
        }
        else{   //assigning to different person (UPDATE)
            $sql = "UPDATE DeviceWorkerList SET firstName='$firstName', lastName='$lastName', timeAssigned=CURRENT_TIMESTAMP WHERE deviceID='$deviceID'";
            $conn->query($sql);
            echo 1;
        }
    }
    else{   //device not already in database (INSERT)
        $sql = "INSERT INTO DeviceWorkerList (ID, deviceID, firstName, lastName, timeAssigned) VALUES (NULL,'$deviceID', '$firstName', '$lastName', CURRENT_TIMESTAMP);";
        $conn->query($sql);
        echo 1;
    }
    
    $conn->close();
?>