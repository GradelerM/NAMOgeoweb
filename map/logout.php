<?php	
    session_start();

    header("Location: map.php");
    header("Content-Type: application/json ; charset=utf-8");
    header("Cache-Control: no-cache , private");//anti Cache for HTTP/1.1
    header("Pragma: no-cache");//anti Cache for HTTP/1.0

    if (!isset($_SESSION['user'])) { exit; }

    $response=array();
    $response["success"] = false;	

    if (isset($_SESSION['user_id'])) {
        unset($_SESSION['user_id']);
        if (isset($_SESSION['user'])) {
            unset($_SESSION['user']);
        }
        if (isset($_SESSION['book_id'])) {
            unset($_SESSION['book_id']);
        }
        $response["success"] = true;	
    }

    echo json_encode($response); 
?>
