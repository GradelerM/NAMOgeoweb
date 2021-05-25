<?php
    session_start();
    include_once 'config.php';  // charge les différentes variables nécessaires pour les scripts php

    header('Location: map.php'); // TODO: Marie, je ne comprends pas pourquoi il y a cette ligne
    header("Content-Type: application/json ; charset=utf-8");
    // header("Content-Type: text/html ; charset=utf-8");
    header("Cache-Control: no-cache , private");//anti Cache pour HTTP/1.1
    header("Pragma: no-cache");//anti Cache pour HTTP/1.0

    $response=array();
    $response["success"] = false;	

    // cette page login.php renverra quelque chose si:
    //     a) l'utilisateur renseigne un username associé à un password (tous deux non vides) qui retournent un enregistrement de la table user (sur uniquement les utilisateurs actifs)
    //     b) s'il fait une requete en POST (préférable) ou GET (à éviter car en clair) avec cette URI: 
    //                     https://rivage-guadeloupe.teledetection.fr/login.php?username=son_username&password=son_password
    //        ce qui lui renverra un flux json formaté parfaitement dont un attribut est "success" à vrai si le login a réussi (il y a 
    //        alors en plus des détails de l'utilisateurs qui sont transmis au navigateur, pour dire par exemple "Bonjour Vincent") ou à false s'il n'a pas réussi l'autentification
    if (isset($_REQUEST["username"]) and ($_REQUEST["username"]!="") and ($_REQUEST["password"]) and ($_REQUEST["password"]!="")) {

        $conn_string = "host=".$_SESSION['db_host']." port=".$_SESSION['db_port']." dbname=".$_SESSION['db_name']." user=".$_SESSION['db_user']." password=".$_SESSION['db_password'];

        $dbconn = pg_connect($conn_string);
        if (!$dbconn) {
            $response["error"] = "Une erreur s'est produite lors du pg_connect";
            echo json_encode($response);
            exit;
        }
  
        // La fonction htmlspecialchars() permet de se protéger contre la faille XSS en échappant les caractères en entités HTML
        // Les caractères visés sont:
        //      &  devient &amp;
        //      "  devient &quot;
        //      '  devient &#039;
        //      <  devient &lt;
        //      >  devient &gt;
        $username=trim(htmlspecialchars($_REQUEST['username'])) ;	
        $password=trim(htmlspecialchars($_REQUEST['password'])) ;	        
        
        // structure de la table user (de préférence aller vers des attributs EN)
        //      id -> integer
        //      username -> string
        //      mail  -> string
        //      role -> string(20)
        //      user_enabled -> booleen

        // construction de la requête
        $sql ="SELECT * FROM userdata.users WHERE username = '".$username."' AND password = '".hash('sha256', $password)."' AND user_enabled=TRUE";  
        // TODO: à terme, il faut passerle password par un hashage avec password_hash(), donc c'est à travailler

        $result = pg_query ($dbconn,$sql);
        
        if (pg_num_rows($result)==1) {  // s'il y a un utilisateur qui correspond à ce username et ce password, c'est ok, on va fecher le retour de la bdd pour lire ces caractéristiques

            while($row = pg_fetch_array($result)){
                $response["id"]  = $row["id"];
                $response["username"] = htmlspecialchars_decode($row["username"]);   // on enregiste le username avece htmlspecialchars, il faut donc le renvoyer avec htmlspecialchars_decode
                $response["email"] = htmlspecialchars_decode($row["email"]); 
                $response['role']=$row["role"];
            }

            $response["success"] = true;

            // ici, on crée (on instancie) la variable de session php $_SESSION['user'] (qui reste au niveau du serveur) donc à partir de maintenant
            // l'utilisateur pourra passer les tests présents sur chaque page php commencant par if (!isset($_SESSION['user'])) { exit; }
            $_SESSION['user_id']=$response["id"];
            $_SESSION['user']=$response["username"];  // TODO: Marie, je pense qu'il faut plutôt passer $response["id"], ce sera plus utile plus tard (mais je ne sais pas si tu utilises ailleurs ce $response["username"] donc je n'y touche pas)
                                                      // Je l'utilise pour afficher l'identifiant de l'utilisateur sur la plateforme

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
