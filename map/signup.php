<?php
    session_start();
    include_once 'config.php';  // charge les différentes variables nécessaires pour les scripts php

    // header('Location: map.php');
    header("Content-Type: application/json ; charset=utf-8");
    header("Cache-Control: no-cache , private"); //anti Cache pour HTTP/1.1
    header("Pragma: no-cache"); //anti Cache pour HTTP/1.0

    $response=array();
    $response["success"] = false;

    // cette page signup.php a comme fonction de créer un nouvel utilisateur dans la base de données. Par défaut, l'utilisateur n'est pas activé (requiert une action de l'administrateur).
    //      - l'endpoint est ./map/signup.php?username=son_username&password=son_password&email=son_email
    //      - si l'utilisateur existe déjà dans la base de données, la réponse sera success = false , error_code = 1 + la descripton textuelle de l'erreur dans error
    //      - s'il y a un problème avec l'envoi de mail, la réponse sera success = false , error_code = 2 + la descripton textuelle de l'erreur dans error
    //      - si l'enregistrement s'effectue correctement:
    //          a) la réponse sera success = true. Le front office doit informer l'utilisateur mais lui expliquer que son compte requiert une validation
    //          b) l'utilisateur sera créé dans la base de données mais "user_enabled" sera false l'admin devra changer la valeur manuellement dans la bdd et son rôle sera "contributor"
    //
    //      TODO: process de validation de l'email de l'utilsateur
    //      TODO: Créer une table des rôles (actuellement codé en dur dans la table login)
    //      TODO: crypter le mot de passe avec password_hash() et non md5() -> requiert dans la bdd un attribut password de type string de 255 caractère au minimum
    //                     cf.  https://www.php.net/manual/fr/function.password-hash.php

    if (isset($_REQUEST["username"]) and ($_REQUEST["username"]!="") and ($_REQUEST["password"]) and ($_REQUEST["password"]!="") and ($_REQUEST["email"]) and ($_REQUEST["email"]!="") and ($_REQUEST["motivations"]!="")) {

        $conn_string = "host=".$_SESSION['db_host']." port=".$_SESSION['db_port']." dbname=".$_SESSION['db_name']." user=".$_SESSION['db_user']." password=".$_SESSION['db_password'];

        $dbconn = pg_connect($conn_string);
        if (!$dbconn) {
            $response["error_code"] = 99 ;
            $response["error"] = "Une erreur s'est produite lors du pg_connect";
            echo json_encode($response);
            exit;
        }
        
        
        $insert_array['username']=htmlspecialchars(trim($_REQUEST['username'])) ;	
        $insert_array['password']=htmlspecialchars(trim($_REQUEST['password'])) ;	  
        $insert_array['email']=htmlspecialchars(trim($_REQUEST['email'])) ;
        $insert_array['motivations']=htmlspecialchars(trim($_REQUEST['motivations'])) ;        
        	  
        $insert_array['role']="contributor" ;   
        $insert_array['user_enabled']=FALSE ;
        
        
        // vérification de la présence dans la bdd d'un utilisteur avec le même username    
        // $sql ="SELECT * FROM user WHERE username = ".$insert_array['username']." AND password = ".md5($insert_array['password']);
        
        $sql ="SELECT * FROM userdata.users WHERE username = '".$insert_array['username']."'";
        $result = pg_query ($dbconn,$sql);

        if (pg_num_rows($result)==0) {

            // Then check if the email is already used in the database
            $sql ="SELECT * FROM userdata.users WHERE email = '".$insert_array['email']."'";
            $result = pg_query ($dbconn,$sql);

            if (pg_num_rows($result)==0) {
                
                $sql = "INSERT INTO userdata.users (username, password, email, motivation, role, user_enabled) "
                ."VALUES ('"
                .$insert_array['username']
                ."', '"
                .hash('sha256', $insert_array['password'])
                ."', '"
                .$insert_array['email']
                ."', '"
                .$insert_array['motivations']
                ."', '"
                .$insert_array['role']
                ."', "
                ."FALSE"
                .")";
        
                $result = pg_query($dbconn, $sql);

                if ($result) {
                    // nb: on ne redirige pas automatiquement vers le login car l'enregistrement nécessite la validation d'un admin
                    $response["success"] = true;

                    // Define a "noreply" adress to send the mails from
                    $email_noreply = "noreply@teledetection.fr";

                    // Send an email to the administrators
                    // Fetch the administrator's mail adresses from the database
                    $sql = "SELECT id, username, email FROM userdata.users WHERE role = 'admin' AND user_enabled = true ORDER BY id";
                    $result = pg_query($dbconn,$sql);
                    $email_admin = ""; // Define the list in which to store the mails

                    if (pg_num_rows($result)<>-1 && pg_num_rows($result) !== null) { // The query worked and returned something
    
                        // Loop through the result's rows and add the mail adresses to $list
                        while ($array = pg_fetch_array($result)) {
                            $email_admin .= $array["email"] . ",";
                        }                
                        $email_admin = substr($email_admin, 0, -1); // Remove the last colon
            
                        // Write and send the mail
                        $to      = $email_admin;
                        $subject = 'New user on NAMO Geoweb - Projet RIVAGE';
                        $message = 'Please activate the new user ('.$insert_array['username'].') on NAMO GeoWeb - Projet RIVAGE: https://rivage-guadeloupe.teledetection.fr/map/administration.php';
                        $headers = "From: ".$email_noreply."\r\n" .
                        "Reply-To: ".$email_noreply."\r\n" .
                        'X-Mailer: PHP/' . phpversion();
            
                        if (!mail($to, $subject, $message, $headers)) {
                            $response["success"] = false;
                            $response["error_code"] = 2 ;
                            $response["error"] = "There was a problem with sending the mail to the administrators.";
                        }
                
                    } else { // The query didn't work / no admins were found
                
                        $response["success"] = false;
                        $response["error"] = "Coudln't find any admin. Please try again.";
                
                    }

                    // And send an email to the user
                    $to      = $insert_array['email'];
                    $subject = 'Inscription sur NAMO Geoweb - Projet RIVAGE';
                    $message = 'Votre inscription sur NAMO Geoweb - Projet RIVAGE a bien été prise en compte. Vous recevrez un mail à cette adresse dès que votre compte aura été activé par un administrateur de la plateforme.';
                    $headers = "From: ".$email_noreply."\r\n" .
                    "Reply-To: ".$email_noreply."\r\n" .
                    'X-Mailer: PHP/' . phpversion();

                    if (!mail($to, $subject, $message, $headers)) {
                        $response["success"] = false;
                        $response["error_code"] = 3 ;
                        $response["error"] = "There was a problem with sending the mail to the user. Please contact the administrators at one of the following: ". $email_admin;
                    }

            
                } else {
                    $response["error_code"] = 0 ;
                    // $response["error"] = "An error occurred while registering the user in the database";
                    $response["error"] = "Une erreur s'est produite. Réessayez plus tard.";
                }

            } else {
                $response["error_code"] = 1 ;
                // $response["error"] = "The email ".$insert_array['email']." already exists in the database";
                $response["error"] = "L'adresse mail ".$insert_array['email']." est déjà utilisée.";
            }

        } 
        else {
            $response["error_code"] = 1 ;
            // $response["error"] = "The user ".$insert_array['username']." already exists in the database";
            $response["error"] = "L'utilisateur ".$insert_array['username']." existe déjà.";
        }

        pg_close($dbconn);        
    }

echo json_encode($response); 

?>
