<?php header('Access-Control-Allow-Origin: *'); ?>
<?php
/*  Handles POST request, takes deviceID, longitude, and latitude
 *      pulls ID, first and last name for corresponding deviceID from DeviceWorkerList
 *      pull current location from WorkerLocations
 *      saves old current location to WorkerRoutes
 *      updates current location for corresponding ID in WorkerLocations
*/
    include 'DatabaseCredentials.php';
    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    // Check connection
    if ($conn->connect_error) {
         die("Connection failed: " . $conn->connect_error);
    }
    
    $deviceID = $_REQUEST["deviceID"];
    $userLong = $_REQUEST["longitude"];
    $userLat = $_REQUEST["latitude"];
    
    $ID = -1;
    $firstName = "";
    $lastName = "";
    
    $sql = "SELECT ID, firstName, lastName FROM DeviceWorkerList WHERE deviceID='$deviceID'";
    $result = $conn->query($sql);
    
    if($result->num_rows < 1){  //device not assigned yet
        //echo "device is not in the assigned devices list";
        echo -1;
    }
    else{   //assigned device exists
        while($row = $result->fetch_assoc()) {    //save id, first/last name
          $ID = $row["ID"];
          $firstName = $row["firstName"];
          $lastName = $row["lastName"];
        }
        
        if($ID == -1 || $firstName == "" || $lastName == ""){    //invalid results
          //echo "error fetching worker info";
          echo -1;  //error fetching info
        }
        else{  //fetch success
          $userLocation = NULL;
          
          $sql = "SELECT userLocation FROM WorkerLocations WHERE ID='$ID'";
          $result = $conn->query($sql);
                    
          if($result->num_rows < 1){    //device not stored in table yet (INSERT)
               //update new current location
               $sql = "INSERT INTO WorkerLocations (ID, userLocation, timestamp) VALUES ('$ID', POINT('$userLong','$userLat'), CURRENT_TIMESTAMP);";
               $conn->query($sql);
               //echo "location successfully added";
               echo 0;   //success
          }
          else {    //previous location stored (UPDATE)
               while($row = $result->fetch_assoc()){
                    $userLocation = $row["userLocation"];
               }
               if($userLocation != NULL){    //valid old location
                    //add old location to route table
                    $sql = "INSERT INTO WorkerRoutes (ID, firstName, lastName, userLocation, timestamp) VALUES ('$ID', '$firstName', '$lastName', '$userLocation', CURRENT_TIMESTAMP);";
                    $conn->query($sql);
                    
                    //update current location in location table
                    $sql = "UPDATE WorkerLocations SET userLocation=POINT('$userLong','$userLat'), timeStamp=CURRENT_TIMESTAMP WHERE ID='$ID'";
                    $conn->query($sql);
                    //echo "location successfully updated";
                    
                    echo 0;   //success
               }
               else{
                    //echo "error updating location";
                    echo -1;  //failure
               }
          }
        }
    }
    
    //automatically delete all route data older than 2 weeks
    $sql = "DELETE FROM WorkerRoutes WHERE timestamp < DATE_SUB(NOW(), INTERVAL 14 DAYS)";
    $conn->query($sql);

    
    $conn->close();  
?>