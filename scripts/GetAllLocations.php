<?php header('Access-Control-Allow-Origin: *'); ?>
<?php
/*  Handles POST request, takes deviceID, longitude, and latitude
 *      pulls ID for corresponding deviceID
 *      updates location for corresponding ID
*/
    include 'DatabaseCredentials.php';
    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    // Check connection
    if ($conn->connect_error) {
         die("Connection failed: " . $conn->connect_error);
    }
    
    $ID = array();
    $deviceID = array();
    $firstName = array();
    $lastName = array();
    $userLong = array();
    $userLat = array();
    
    $sql = "SELECT ID, X(userLocation), Y(userLocation), timestamp FROM WorkerLocations WHERE 1";
    $result = $conn->query($sql);
    
    if($result->num_rows > 0){
        while($row = $result->fetch_assoc()) {
            array_push($ID, $row["ID"]);
            //array_push($firstName, $row["firstName"]);
            //array_push($lastName, $row["lastName"]);
            array_push($userLong, $row["X(userLocation)"]);
            array_push($userLat, $row["Y(userLocation)"]);
            
            //echo $row["ID"] . " - (" . $row["X(userLocation)"] . " , " . $row["Y(userLocation)"] . ")" . PHP_EOL;
        }
        
        foreach ($ID as $id){
            $sql = "SELECT firstName, lastName FROM DeviceWorkerList WHERE ID='$id'";
            $result = $conn->query($sql);
            if($result->num_rows < 1) echo "device not assigned!";
            
            while($row = $result->fetch_assoc()){
                //echo $row["deviceID"] . " - (" . $row["firstName"] . " , " . $row["lastName"] . ")";
                //array_push($deviceID, $row["deviceID"]);
                array_push($firstName, $row["firstName"]);
                array_push($lastName, $row["lastName"]);
            }
        }
        
        //echo "<p>";
        for ($i = 0; $i < count($ID); $i++){
            //echo $ID[$i] . " assigned to " . $firstName[$i] . " " . $lastName[$i] . " located at (" . $userLong[$i] . ", " . $userLat[$i] . ")<br />";
            echo $ID[$i] . ",";
            echo $firstName[$i] . ",";
            echo $lastName[$i] . ",";
            echo $userLat[$i] . ",";
            echo $userLong[$i];
            if($i<count($ID)-1) echo ","; //doesn't append comma after last element
        }
        //echo "</p>";
    }
    else echo "-1";
    
    $conn->close();
?>