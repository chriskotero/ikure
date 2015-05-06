<?php header('Access-Control-Allow-Origin: *'); ?>
<?php

/*  Script takes POST request, grabs 'username' and 'password' from request */
/*  authenticates from database */
/*  return values:
 *      -1 - invalid username or password (don't log in)
 *      adminID - the adminID that corresponds to the username/password match
 */

    include 'DatabaseCredentials.php';
    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    // Check connection
    if ($conn->connect_error) {
         die("Connection failed: " . $conn->connect_error);
    }
    
    $username = $_REQUEST["username"];
    $password = $_REQUEST["password"];
    $userID = -1;
    
    //testing purposes
    //$username = "test";
    //$password = "test";
    
    $sql = "SELECT * FROM Accounts WHERE username = '$username' AND password = '$password'";
    $result = $conn->query($sql);
    
    if(!is_null($result) && !empty($result) && $result->num_rows > 0){
        while($row = $result->fetch_assoc()) {
            $userID = $row["adminID"];
        }
    }

    echo $userID;
    
    $conn->close();
?>