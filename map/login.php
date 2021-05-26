<?php
    session_start();
    include_once 'config.php';

    header('Location: map.php'); // Go back to map.php
    header("Content-Type: application/json ; charset=utf-8");
    header("Cache-Control: no-cache , private");//anti Cache for HTTP/1.1
    header("Pragma: no-cache");//anti Cache for HTTP/1.0

    $response=array();
    $response["success"] = false;	

    if (isset($_REQUEST["username"]) and ($_REQUEST["username"]!="") and ($_REQUEST["password"]) and ($_REQUEST["password"]!="")) {

        $conn_string = "host=".$_SESSION['db_host']." port=".$_SESSION['db_port']." dbname=".$_SESSION['db_name']." user=".$_SESSION['db_user']." password=".$_SESSION['db_password'];

        $dbconn = pg_connect($conn_string);
        if (!$dbconn) {
            $response["error"] = "Une erreur s'est produite lors du pg_connect";
            echo json_encode($response);
            exit;
        }
  
        $username=pg_escape_string(trim(htmlspecialchars($_REQUEST['username']))) ;	
        $password=pg_escape_string(trim(htmlspecialchars($_REQUEST['password']))) ;	        

        $sql ="SELECT * FROM userdata.users WHERE username = '".$username."' AND password = '".hash('sha256', $password)."' AND user_enabled=TRUE";  

        $result = pg_query ($dbconn,$sql);
        
        if (pg_num_rows($result)==1) {  // Found a matching user, reading its informations

            while($row = pg_fetch_array($result)){
                $response["id"]  = $row["id"];
                $response["username"] = htmlspecialchars_decode($row["username"]);   // on enregiste le username avece htmlspecialchars, il faut donc le renvoyer avec htmlspecialchars_decode
                $response["email"] = htmlspecialchars_decode($row["email"]); 
                $response['role']=$row["role"];
            }

            $response["success"] = true;

            // Creating the session variable php $_SESSION['user']
            // From now on, the user can pass the tests on each php page checking for a logged in user
            $_SESSION['user_id']=$response["id"];
            $_SESSION['user']=$response["username"];

            // Check if the user is an administrator or not
            if ($response['role'] == 'admin') {
                $_SESSION['admin'] = true;
            } else {
                $_SESSION['admin'] = false;
            }

            // Check if the user is an editor or not
            if ($response['role'] == 'editor') {
                $_SESSION['editor'] = true;
            } else {
                $_SESSION['editor'] = false;
            }

        }
        else {
            $response["error"] = "username or password error";            
        }

        pg_close($dbconn);        
    }

echo json_encode($response); 

?>
