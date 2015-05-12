<?php header('Access-Control-Allow-Origin: *'); ?>
<?php
/*  Handles POST request, takes workerID, firstName, and lastName
 *      pulls past locations for corresponding worker/device
*/
     include 'DatabaseCredentials.php';
     // Create connection
     $conn = new mysqli($servername, $username, $password, $dbname);
     // Check connection
     if ($conn->connect_error) {
          die("Connection failed: " . $conn->connect_error);
     }
     
     $ID = $_REQUEST["workerID"];
     $firstName = $_REQUEST["firstName"];
     $lastName = $_REQUEST["lastName"];
     
     $pastVisits = array();
     $locationLat = "";
     $locationLong = "";
     $date = "";
     $time = "";
     
     $sql = "SELECT X(userLocation),
          Y(userLocation),
          DATE(timestamp),
          TIME(timestamp)
          FROM WorkerRoutes WHERE ID = '$ID' AND firstName = '$firstName' AND lastName = '$lastName' AND timestamp >= (CURDATE() - INTERVAL 7 DAY)
          ORDER BY timestamp DESC";

     $result = $conn->query($sql);
     
     if($result->num_rows < 1){  //no previous visits from worker with current device
          echo -1;
     }
     else {
          while($row = $result->fetch_assoc()) {    //save id, first/last name
               $locationLong = $row["X(userLocation)"];     //longitude coordinate
               $locationLat = $row["Y(userLocation)"];      //latitude coordinate
               $date = $row["DATE(timestamp)"];             //date format of timestamp
               $time = $row["TIME(timestamp)"];             //time location of timestamp
               
               array_push($pastVisits, array("date" => $date, "time" => $time, "longitude" => $locationLong, "latitude" => $locationLat));
          }
          
          echo json_encode($pastVisits);
     }
     $conn->close();
?>