<?php
session_start();

include_once 'config.php';

header("Content-Type: text/plain ; charset=utf-8");
header("Cache-Control: no-cache , private");//anti Cache pour HTTP/1.1
header("Pragma: no-cache");//anti Cache pour HTTP/1.0

// $response sera le tableau que l'ont transformera en json à la fin du traitement
$response = array();
$response["success"] = false;

// If the user isn't allowed to query this api, stop and return an error message
if (isset($_SESSION['user']) && $_SESSION['admin'] == true) {

    // Do nothing, the user can access the api as an admin

} elseif (isset($_SESSION['user']) && $_SESSION['editor'] == true) {
    
    // Do nothing, the user can access the api as a geoadmin

} else { // The user does not have the necessary rights to access the administration panel
    $response["error"] = "User not authenticated";
    pg_close($dbconn); 
    echo json_encode($response) ;
    exit; 
}

// Connect to database
$conn_string = "host=".$_SESSION['db_host']." port=".$_SESSION['db_port']." dbname=".$_SESSION['db_name']." user=".$_SESSION['db_user']." password=".$_SESSION['db_password'];
    $dbconn = pg_connect($conn_string);
if (!$dbconn) {
    $response["error"] = "Database connection failed";
    pg_close($dbconn); 
    echo json_encode($response) ;
    exit;
}

// Define a "noreply" adress to send the mails from
$email_noreply = $noreply_mail; // NOREPLY MAIL

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// If the user is an administrator, allow him to load a list of all users from the database
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
if (isset($_SESSION['admin']) and ($_SESSION['admin']== true) and 
    isset($_POST["mode"]) and ($_POST["mode"] == 'fetch_userdata')) {
    
    // The user is authenticated as an administrator, we can load the list of users from the database
    // We send the user's id as an answer as it is needed for further processing
    $response["admin_id"] = $_SESSION["user_id"];

    // We start with loading all the pending users
    $sql = "SELECT id, username, role, motivation FROM userdata.users WHERE user_enabled = false ORDER BY id";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result)<>-1) {

        // If the query worked, we store all the elements in an array
        if (isset($pending_users)) {
            unset($pending_users);
        }

        $response["success"] = true;
        $pending_users = array();

        while ($array = pg_fetch_array($result)) {

            $user = (object) array(
                'id' => $array["id"],
                'username' => htmlspecialchars_decode($array["username"]),
                'role' => $array["role"],
                'motivation' => htmlspecialchars_decode($array["motivation"])
            );

            array_push($pending_users, $user);
        }
        
        $response["pending_users"] = $pending_users;


    } else {
        // If the query didn't return anything, send an error message
        $response["success"] = false;
        $response["error"] = "There was an error while fetching pending users.";
    }

    // Then we load all the allowed users
    $sql = "SELECT id, username, role, motivation FROM userdata.users WHERE user_enabled = true ORDER BY id";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result)<>-1) {

        // If the query worked, we store all the elements in an array
        if (isset($allowed_users)) {
            unset($allowed_users);
        }

        $response["success"] = true;
        $allowed_users = array();

        while ($array = pg_fetch_array($result)) {

            $user = (object) array(
                'id' => $array["id"],
                'username' => htmlspecialchars_decode($array["username"]),
                'role' => $array["role"],
                'motivation' => htmlspecialchars_decode($array["motivation"])
            );

            array_push($allowed_users, $user);
        }
        
        $response["allowed_users"] = $allowed_users;

    } else {
        // If the query didn't return anything, send an error message
        $response["success"] = false;
        $response["error"] = "There was an error while fetching allow users.";
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Allow a new user to use the database
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

elseif (isset($_SESSION['admin']) and ($_SESSION['admin']== true) and isset($_POST["id"]) and
        isset($_POST["mode"]) and ($_POST["mode"] == 'allow_user')) {
   
    // Update the user's authorizations in the database
    $sql = "UPDATE userdata.users SET user_enabled=true WHERE id=".$_POST["id"]." RETURNING *";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // The field was updated with no error

        $response["success"] = true;

        // We send a mail to the user to notify him/her
        $row = pg_fetch_array($result);
        $email = $row["email"];

        $response["email"] = $email;

        $to      = $email;
        $subject = 'Autorisation NAMO Geoweb - '.$project_name; // PROJECT NAME
        $message = 'Un administrateur a activé votre compte. Vous pouvez désormais utiliser la plateforme NAMO Geoweb - '.$project_name.' accessible à cette adresse : '.$project_url;
        $headers = "From: ".$email_noreply."\r\n" .
        "Reply-To: ".$email_noreply."\r\n" .
        'X-Mailer: PHP/' . phpversion().
        'MIME-Version: 1.0' . "\r\n" .
        'Content-type: text/plain; charset=UTF-8' . "\r\n";

        if (!mail($to, $subject, $message, $headers)) {
            $response["success"] = false;
            $response["error_code"] = 2 ;
            $response["error"] = "There was a problem with sending the mail to the user. Please contact him directly at the following email address: "+$email;
        }

    } else {
        $response["error"] = "There was an error allowing the user to use the application";
        $response["error_code"] = 1;
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Reject an user and delete him from the database
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

elseif (isset($_SESSION['admin']) and ($_SESSION['admin']== true) and isset($_POST["id"]) and
        isset($_POST["mode"]) and ($_POST["mode"] == 'reject_user')) {
   
    // Delete the user from the database
    $sql = "DELETE FROM userdata.users WHERE id=".$_POST["id"]." RETURNING *";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // The field was updated with no error

        $response["success"] = true;

        // We send a mail to the user to notify him/her
        $row = pg_fetch_array($result);
        $email = $row["email"];

        $response["email"] = $email;

        $to      = $email;
        $subject = 'Autorisation NAMO Geoweb - '.$project_name; // PROJECT NAME
        $message = 'Votre demande de création d\'un compte pour accéder aux outils participatifs de la plateforme NAMO Geoweb - '.$project_name.' a été refusée par un administrateur de la plateforme.';
        $headers = "From: ".$email_noreply."\r\n" .
        "Reply-To: ".$email_noreply."\r\n" .
        'X-Mailer: PHP/' . phpversion().
        'MIME-Version: 1.0' . "\r\n" .
        'Content-type: text/plain; charset=UTF-8' . "\r\n";

        if (!mail($to, $subject, $message, $headers)) {
            $response["success"] = false;
            $response["error_code"] = 2 ;
            $response["error"] = "There was a problem with sending the mail to the user. Please contact him directly at the following email address: "+$email;
        }

    } else {
        $response["error"] = "There was an error allowing the user to use the application";
        $response["error_code"] = 1;
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Revoke the user's rights to access the application
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

elseif (isset($_SESSION['admin']) and ($_SESSION['admin']== true) and isset($_POST["id"]) and
        isset($_POST["mode"]) and ($_POST["mode"] == 'revoke_user')) {
   
    // Update the user's authorizations in the database
    $sql = "UPDATE userdata.users SET user_enabled = false WHERE id=".$_POST["id"]." RETURNING *";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // The field was updated with no error

        $response["success"] = true;

        // We send a mail to the user to notify him/her
        $row = pg_fetch_array($result);
        $email = $row["email"];

        $response["email"] = $email;

        $to      = $email;
        $subject = 'Autorisation NAMO Geoweb - '.$project_name; // PROJECT NAME
        $message = 'Votre compte sur la plateforme NAMO Geoweb - '.$project_name.' a été temporairement suspendu par un administrateur.';
        $headers = "From: ".$email_noreply."\r\n" .
        "Reply-To: ".$email_noreply."\r\n" .
        'X-Mailer: PHP/' . phpversion().
        'MIME-Version: 1.0' . "\r\n" .
        'Content-type: text/plain; charset=UTF-8' . "\r\n";

        if (!mail($to, $subject, $message, $headers)) {
            $response["success"] = false;
            $response["error_code"] = 2 ;
            $response["error"] = "There was a problem with sending the mail to the user. Please contact him directly at the following email address: "+$email;
        }

    } else {
        $response["error"] = "There was an error revoking the user's rights.";
        $response["error_code"] = 1;
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Edit an user's role
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

elseif (isset($_SESSION['admin']) and ($_SESSION['admin']== true) and isset($_POST["id"]) and
        isset($_POST["role"]) and isset($_POST["mode"]) and ($_POST["mode"] == 'edit_user_role')) {
   
    // Update the user's role in the database
    $sql = "UPDATE userdata.users SET role = '".$_POST["role"]."' WHERE id=".$_POST["id"]." RETURNING *";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // The field was updated with no error

        $response["success"] = true;

        // We send a mail to the user to notify him/her
        $row = pg_fetch_array($result);
        $email = $row["email"];

        $response["email"] = $email;

        $to      = $email;
        $subject = 'Rôle NAMO Geoweb - '.$project_name; // PROJECT NAME
        $message = 'Un administrateur a édité votre rôle sur la plateforme NAMO Geoweb - '.$project_name.'. Vous êtes désormais "' . $_POST["role"] . '".';
        $headers = "From: ".$email_noreply."\r\n" .
        "Reply-To: ".$email_noreply."\r\n" .
        'X-Mailer: PHP/' . phpversion().
        'MIME-Version: 1.0' . "\r\n" .
        'Content-type: text/plain; charset=UTF-8' . "\r\n";

        if (!mail($to, $subject, $message, $headers)) {
            $response["success"] = false;
            $response["error_code"] = 2 ;
            $response["error"] = "There was a problem with sending the mail to the user. Please contact him directly at the following email address: "+$email;
        }

    } else {
        $response["error"] = "There was an error updating the user's rights. Please reload the application and try again.";
        $response["error_code"] = 1;
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Add a new collection
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and $_POST["mode"] == 'add_collection') {

    // Send query to create the new collection
    $sql = "INSERT INTO userdata.collections(name) VALUES ('[new collection]') RETURNING id";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // The new collection was created with no error

        $row = pg_fetch_array($result);
        $response['id'] = $row["id"];
        $response['name'] = $row["name"];
        $response['success'] = true;        

    } else {
        $response["error"] = "There was an error creating the new collection";
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Edit a collection's name
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and $_POST["mode"] == 'edit_collection_name' and isset($_POST["name"]) and isset($_POST["id"])) {

    // Send query to rename the collection
    $sql = "UPDATE userdata.collections SET name='".$_POST["name"]."' WHERE id=".$_POST["id"]." RETURNING *";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // The collection was renamed with no error
        $response['success'] = true;
    } else {
        $response["error"] = "There was an error renaming the new collection";
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Edit the collection's order
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'update_collections_position') and isset($_POST["collections_array"])) {
    
    // Write a new sql query for each element in the array
    foreach ($_POST["collections_array"] as $collection) {
        $sql = "UPDATE userdata.collections SET position=".$collection["index"]." WHERE id=".$collection["id"]." RETURNING *";
        $result = pg_query($dbconn,$sql);

        // Check if it is working
        if (pg_num_rows($result) !== 1) { // It is unsafe, exit
            $response["error"] = "An error occured during the query.";
            pg_close($dbconn); 
            echo json_encode($response) ;
            exit;
        }

    }    
    unset($chapter); // Break the reference with the last element
    $response["success"] = true;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Delete a collection
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and $_POST["mode"] == 'delete_collection' and isset($_POST["id"])) {

    // Begin the transaction
    pg_query("BEGIN") or $response["error"] = "Could not start transaction";

    // Move all the books from this collection to the "Autres" collection (id = 1)
    $sql1 = "UPDATE userdata.books SET collection_id=1 WHERE collection_id=".$_POST["id"]." RETURNING *";
    $res1 = pg_query($dbconn,$sql1);

    // Delete the collection from the database
    $sql2 = "DELETE FROM userdata.collections WHERE id=".$_POST["id"]." RETURNING *";
    $res2 = pg_query($dbconn,$sql2);

    if ($res1 and $res2) {
        // Commiting the transaction
        $commit = pg_query("COMMIT");

        if ($commit) { // It worked
            $response["success"] = true;
        } else { // Commit failed
            $response["error"] = "Could not commit transaction, can't delete collection";
        }
        
    } else {
        // Rolling back the transaction
        pg_query("ROLLBACK") or $response["error"] = "An error occured while deleting the collection, rolling back the transaction";
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Load all the server sources from the database
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'fetch_sources')) {

    $sql = "SELECT * FROM geodata.servers ORDER BY id ASC";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result)>=0) {
        // If the query worked, we store all the servers in an array
        if (isset($server_list)) {
            unset($server_list);
        }

        $response["success"] = true;
        $server_list = array();

        while ($array = pg_fetch_array($result)) {

            $server = (object) array(
                'id' => htmlspecialchars_decode($array["id"]),
                'name' => htmlspecialchars_decode($array["name"]),
                'url' => htmlspecialchars_decode($array["url"]),
                'type' => $array["type"]
            );

            array_push($server_list, $server);
        }
        
        $response["sources"] = $server_list;

    } elseif (pg_num_rows($result)==0) { // No sources yet

        $response["success"] = true;
        $server_list = array();
        $response["sources"] = $server_list;

    } else {
        // If the query didn't return anything, send an error message
        $response["error"] = "No sources found";
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Load all the server types from the database
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'fetch_server_types')) {

    $sql = "SELECT * FROM geodata.\"serverType\" ORDER BY id ASC";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result)>=0) {
        // If the query worked, we store all the servers types in an array
        if (isset($types_list)) {
            unset($types_list);
        }

        $response["success"] = true;
        $types_list = array();

        while ($array = pg_fetch_array($result)) {

            $type = (object) array(
                'id' => $array["id"],
                'type' => $array["type"]
            );

            array_push($types_list, $type);
        }
        
        $response["serverTypes"] = $types_list;

    } elseif (pg_num_rows($result)==0) {

        $response["success"] = true;
        $types_list = array();
        $response["sources"] = $types_list;

    } else {
        // If the query didn't return anything, send an error message
        $response["error"] = "No sources found";
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch capabilities
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'fetch_capabilities') and isset($_POST["url"])) {

    // Store the url in a variable
    $url = $_POST["url"];

    // Loading xml file
    $xml = simplexml_load_file($url);

    // Send the xml document to the app if the query worked
    if ($xml) {
        
        $response["success"] = true;
        $response["xml"] = $xml;

    } else {
        $response["error"] = "Couldn't fetch Capabilities from server.";
    }
    

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Add the new server source in the database
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'add_new_server')
        and isset($_POST["url"]) and isset($_POST["type"]) and isset($_POST["name"])) {

    $name = pg_escape_string(htmlspecialchars($_POST["name"]));
    $url = pg_escape_string(htmlspecialchars($_POST["url"]));

    // Send query to create the new server source
    $sql = "INSERT INTO geodata.servers(name, url, type) VALUES ("
           ."'".$name."', "
           ."'".$url."', "
           .$_POST["type"]
           .") RETURNING *";

    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // The new collection was created with no error
        $response['success'] = true;        
    } else {
        $response["error"] = "There was an error adding the new server";
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Update a server source in the database
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'update_server') and isset($_POST["id"])
        and isset($_POST["url"]) and isset($_POST["type"]) and isset($_POST["name"])) {

    $name = pg_escape_string(htmlspecialchars($_POST["name"]));
    $url = pg_escape_string(htmlspecialchars($_POST["url"]));

    // Send query to create the new server source
    $sql = "UPDATE geodata.servers SET "
           ."name = '".$name."', "
           ."url = '".$url."', "
           ."type = ".$_POST["type"]
           ." WHERE id = ".$_POST["id"]." RETURNING *";

    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // The new collection was created with no error
        $response['success'] = true;        
    } else {
        $response["error"] = "There was an error updating the server";
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Delete a server source
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and $_POST["mode"] == 'delete_server' and isset($_POST["id"])) {

    // Delete the server
    $sql = "DELETE FROM geodata.servers WHERE id=".$_POST["id"]." RETURNING *";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // The server was deleted

        $response["success"] = true;
        
    } else { // There was an error deleting the server
        $response["error"] = "There was an error deleting the server source";
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch all published layers per server
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'list_published_layers_by_server')
        and isset($_POST["id"])) {

    // Send query to fetch all the published layers in the application by server id
    $sql = "SELECT * FROM geodata.layers WHERE server =".$_POST["id"];

    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 0) { // The query worked but no layers are published

        $response['success'] = true;
        $response['arrayOfLayers'] = array();

    } elseif (pg_num_rows($result) >= 1){ // The query worked and found some layers

        if (isset($layers_list)) {
            unset($layers_list);
        }

        $response["success"] = true;
        $layers_list = array();

        while ($array = pg_fetch_array($result)) {

            $layer = (object) array(
                'id' => $array["id"],
                'name' => htmlspecialchars_decode($array["name"]),
                'title' => htmlspecialchars_decode($array["title"])
            );

            array_push($layers_list, $layer);
        }
        
        $response["arrayOfLayers"] = $layers_list;

    } else {
        $response["error"] = "There was an error fetching the published layers.";
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Add a new layer to the database
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'save_new_layer')
        and isset($_POST["source_id"]) and isset($_POST["name"]) and isset($_POST["title"]) 
        and isset($_POST["theme"]) and isset($_POST["opacity"]) and isset($_POST["zIndex"])) {

    $name = pg_escape_string(htmlspecialchars($_POST["name"]));
    $title = pg_escape_string(htmlspecialchars($_POST["title"]));

    // Send query to create the new layer
    $sql = "INSERT INTO geodata.layers(server, name, title, theme, opacity, \"zIndex\") VALUES ("
           .$_POST["source_id"].", "
           ."'".$name."', "
           ."'".$title."', "
           .$_POST["theme"].", "
           .$_POST["opacity"].", "
           .$_POST["zIndex"]
           .") RETURNING *";

    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // The layer was added with no error
        $response['success'] = true;        
    } else {
        $response["error"] = "There was an error adding the new layer";
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch ALL the published layers (not by server)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'list_published_layers')) {

    // Send query to fetch all the published layers in the application by server id
    $sql = "SELECT geodata.layers.id, server, geodata.layers.name, title, geodata.layers.theme, geodata.themes.theme as theme_name, opacity, \"zIndex\", geodata.servers.name as server_name"
          ." FROM geodata.layers"
          ." INNER JOIN geodata.servers"
          ." ON geodata.layers.server = geodata.servers.id"
          ." INNER JOIN geodata.themes"
          ." ON geodata.layers.theme = geodata.themes.id";

    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 0) { // The query worked but no layers are published

        $response['success'] = true;
        $response['layers'] = array();

    } elseif (pg_num_rows($result) >= 1){ // The query worked and found some layers

        if (isset($layers_list)) {
            unset($layers_list);
        }

        $response["success"] = true;
        $layers_list = array();

        while ($array = pg_fetch_array($result)) {

            $layer = (object) array(
                'id' => $array["id"],
                'server' => $array["server"],
                'server_name' => htmlspecialchars_decode($array["server_name"]),
                'name' => htmlspecialchars_decode($array["name"]),
                'title' => htmlspecialchars_decode($array["title"]),
                'theme' => $array["theme"],
                'theme_name' => htmlspecialchars_decode($array["theme_name"]),
                'opacity' => $array["opacity"],
                'zIndex' => $array["zIndex"]
            );

            array_push($layers_list, $layer);
        }
        
        $response["layers"] = $layers_list;

    } else {
        $response["error"] = "There was an error fetching the published layers.";
    }


}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch ONLY ONE published layer in the database
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'fetch_unique_layer') and isset($_POST["id"])) {

    // Send query to fetch all the published layers in the application by server id
    $sql = "SELECT geodata.layers.id, server, geodata.layers.name, title, geodata.layers.theme, geodata.themes.theme as theme_name, opacity, \"zIndex\", geodata.servers.name as server_name, geodata.servers.url as server_url"
          ." FROM geodata.layers"
          ." INNER JOIN geodata.servers"
          ." ON geodata.layers.server = geodata.servers.id"
          ." INNER JOIN geodata.themes"
          ." ON geodata.layers.theme = geodata.themes.id"
          ." WHERE geodata.layers.id = ".$_POST["id"];

    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // The layer was found

        // It's a success
        $response['success'] = true;

        // Add these informations in an object
        $row = pg_fetch_array($result);

        $layer = (object) array(
            'id' => $row["id"],
            'server' => $row["server"],
            'server_name' => htmlspecialchars_decode($row["server_name"]),
            'server_url' => htmlspecialchars_decode($row["server_url"]),
            'name' => htmlspecialchars_decode($row["name"]),
            'title' => htmlspecialchars_decode($row["title"]),
            'theme' => $row["theme"],
            'theme_name' => htmlspecialchars_decode($row["theme_name"]),
            'opacity' => $row["opacity"],
            'zIndex' => $row["zIndex"]
        );

        $response["layer"] = $layer;
        
    } else {
        $response["error"] = "Layer not found, please try again later.";
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Update a layer data in the database
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'update_layer_infos')
        and isset($_POST["layer_id"]) and isset($_POST["title"]) 
        and isset($_POST["theme"]) and isset($_POST["opacity"]) and isset($_POST["zIndex"])) {

    $title = pg_escape_string(htmlspecialchars($_POST["title"]));

    // Send query to create the new server source
    $sql = "UPDATE geodata.layers SET "
           ."title = '".$title."', "
           ."theme = ".$_POST["theme"].", "
           ."opacity = ".$_POST["opacity"].", "
           ."\"zIndex\" = ".$_POST["zIndex"]
           ." WHERE id = ".$_POST["layer_id"]." RETURNING *";

    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // The layer was updated with no error
        $response['success'] = true;        
    } else {
        $response["error"] = "There was an error updating the layer";
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Delete a layer
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and $_POST["mode"] == 'delete_layer' and isset($_POST["id"])) {

    // Delete the server
    $sql = "DELETE FROM geodata.layers WHERE id=".$_POST["id"]." RETURNING *";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // The layer was deleted

        $response["success"] = true;
        
    } else { // There was an error deleting the layer
        $response["error"] = "There was an error deleting the layer";
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetching all the themes
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
if (isset($_POST["mode"]) and ($_POST["mode"]=='fetch_themes')) {

    $sql = "SELECT * FROM geodata.themes ORDER BY position";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result)<>0) {
        // If the query worked, we store all the collections in an array
        if (isset($themes_list)) {
            unset($themes_list);
        }

        $response["success"] = true;
        $themes_list = array();

        while ($array = pg_fetch_array($result)) {

            $theme = (object) array(
                'id' => $array["id"],
                'name' => $array["theme"]
            );

            array_push($themes_list, $theme);
        }
        
        $response["themes"] = $themes_list;

    } else {
        // If the query didn't return anything, send an error message
        $response["error"] = "No themes found";
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Add a new theme
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and $_POST["mode"] == 'add_theme') {

    // Send query to create the new collection
    $sql = "INSERT INTO geodata.themes(theme) VALUES ('[new theme]') RETURNING id";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // The new theme was created with no error

        $row = pg_fetch_array($result);
        $response['id'] = $row["id"];
        $response['name'] = $row["theme"];
        $response['success'] = true;        

    } else {
        $response["error"] = "There was an error creating the new theme";
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Edit a theme's name
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and $_POST["mode"] == 'edit_theme_name' and isset($_POST["name"]) and isset($_POST["id"])) {

    // Send query to rename the collection
    $sql = "UPDATE geodata.themes SET theme='".$_POST["name"]."' WHERE id=".$_POST["id"]." RETURNING *";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // The collection was renamed with no error
        $response['success'] = true;
    } else {
        $response["error"] = "There was an error renaming the theme";
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Update the theme's position
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'update_themes_position') and isset($_POST["themes_array"])) {
    
    // Write a new sql query for each element in the array
    foreach ($_POST["themes_array"] as $theme) {
        $sql = "UPDATE geodata.themes SET position=".$theme["index"]." WHERE id=".$theme["id"]." RETURNING *";
        $result = pg_query($dbconn,$sql);

        // Check if it is working
        if (pg_num_rows($result) !== 1) { // It is unsafe, exit
            $response["error"] = "An error occured during the query.";
            pg_close($dbconn); 
            echo json_encode($response) ;
            exit;
        }

    }    
    unset($chapter); // Break the reference with the last element
    $response["success"] = true;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Delete a theme
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and $_POST["mode"] == 'delete_theme' and isset($_POST["id"])) {

    // Begin the transaction
    pg_query("BEGIN") or $response["error"] = "Could not start transaction";

    // Move all the books from this collection to the "Autres" collection (id = 1)
    $sql1 = "UPDATE geodata.layers SET theme=1 WHERE theme=".$_POST["id"]." RETURNING *";
    $res1 = pg_query($dbconn,$sql1);

    // Delete the collection from the database
    $sql2 = "DELETE FROM geodata.themes WHERE id=".$_POST["id"]." RETURNING *";
    $res2 = pg_query($dbconn,$sql2);

    if ($res1 and $res2) {
        // Commiting the transaction
        $commit = pg_query("COMMIT");

        if ($commit) { // It worked
            $response["success"] = true;
        } else { // Commit failed
            $response["error"] = "Could not commit transaction, can't delete collection";
        }
        
    } else {
        // Rolling back the transaction
        pg_query("ROLLBACK") or $response["error"] = "An error occured while deleting the theme, rolling back the transaction";
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Api called with no or unknown mode
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
else {
    $response["error"] = "No mode defined or mode unknown"; 
    $response["sentMode"] = $_POST["mode"];
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Script end : close database connexion and encode json response
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// fermeture de la liaison avec la base de données
pg_close($dbconn); 

// quel que soit le traitement réalisé (ou non), on retourne $response que l'on encode en json auparavant
echo json_encode($response) ;

?>
