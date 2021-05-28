<?php
session_start();

include_once 'config.php';

header("Content-Type: text/plain ; charset=utf-8");
header("Cache-Control: no-cache , private");//anti cache for HTTP/1.1
header("Pragma: no-cache");//anti cache for HTTP/1.0

// $response = array turned into json at the end
$response = array();
$response["success"] = false;

// Connecting to the database
$attempts = 5;
echo 'api.php attempt '.$attempts;
$conn_string = "host=".$_SESSION['db_host']." port=".$_SESSION['db_port']." dbname=".$_SESSION['db_name']." user=".$_SESSION['db_user']." password=".$_SESSION['db_password'];
while ($attempts) {
    $dbconn = pg_connect($conn_string);
}
if (!$dbconn) {
    $response["error"] = "Database connection failed";
    pg_close($dbconn); 
    echo json_encode($response) ;
    exit;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Read the published books
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
if (isset($_POST["mode"]) and $_POST["mode"] == 'write_storymap' and isset($_POST["book_id"])) {
    
    // Define a function to abort the queries since this will be used many times here
    function abort() {
        $response["error"] = "An error occured while fetching the storymap";
        pg_close($dbconn); 
        echo json_encode($response);
        exit;
    }

    // Set variables 
    $allowed = false;

    // Unset variables
    if (isset($book_id)) {
        unset($book_id);
    }
    if (isset($status)) {
        unset($status);
    }
    if (isset($storymap)) {
        unset($storymap);
    }

    // Make sure the book's status is "published"
    $sql =  "SELECT status FROM userdata.books WHERE id = ".$_POST["book_id"];
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // It worked

        $row = pg_fetch_array($result);       
        $status = $row["status"];

        if ($status == "published") {
            
            // Ok, we can display this book in map.php
            $allowed = true;
            $book_id = $_POST["book_id"];

        } else { // The book isn't published, we can't display it

            $response["error"] = "This book is not published";
            pg_close($dbconn); 
            echo json_encode($response);
            exit;

        }

    } else { // The book wasn't found in the database
        $response["error"] = "Book not found in the database";
    }

    // If we reach this point, we have the needed authorizations to fetch the book's informations
    // Check once more if we're allowed to send the query to the database
    if ($allowed === true) {

        $response['origin'] = 'public';

        //=======================================================================================
        // Start with fetching the book's informations
        $sql =  "SELECT userdata.books.id, title, publication_date, legal_notice, username"
                ." FROM userdata.books"
                ." INNER JOIN userdata.users"
                ." ON userdata.users.id = userdata.books.author_id"
                ." WHERE userdata.books.id = "
                .$book_id;
        $result = pg_query($dbconn,$sql);

        if (pg_num_rows($result) == 1) { // It worked, we can keep working

            // Add the fetched values to $storymap
            $row = pg_fetch_array($result);       

            $storymap["title"]              = htmlspecialchars_decode($row["title"]);
            $storymap["author"]             = $row["username"];
            $storymap["publication_date"]   = $row["publication_date"];
            $storymap["legal_notice"]       = htmlspecialchars_decode($row["legal_notice"]);

        } else { // Couldn't fetch the book's informations, abort
            abort();
        }

        //=======================================================================================
        // Fetch the introduction's informations
        $sql = "SELECT * FROM userdata.chapters WHERE introduction = true AND book_id = ".$book_id;
        $result = pg_query($dbconn,$sql);

        if (pg_num_rows($result) == 1) { // It worked, we can keep working

            // Fetch the map view
            $row = pg_fetch_array($result);

            $map["latitude"]    = $row["latitude"];
            $map["longitude"]   = $row["longitude"];
            $map["zoom"]        = $row["zoom"];
            $map["basemap"]     = $row["basemap"];
            $map["layers"]      = $row["layers"];

            // Push it in the introduction
            $introduction["map"] = $map;

        } else { // Couldn't fetch the introduction's informations, abort
            abort();
        }

        //=======================================================================================
        // Fetch the introduction's paragraphs // FUNCTION
    
        // Write the sql query to read the chapter's title
        $sql =  "WITH introduction as ("
                ."SELECT userdata.paragraphs.id, chapter_id, book_id, type, content, url, userdata.paragraphs.position " 
                ."FROM userdata.paragraphs "
                ."INNER JOIN userdata.chapters "
                ."ON userdata.paragraphs.chapter_id = userdata.chapters.id "
                ."WHERE introduction = true"
                .") "
                ."SELECT * "
                ."FROM introduction "
                ."WHERE book_id=".$book_id
                ."ORDER BY position";
    
        $result = pg_query($dbconn,$sql);
    
        if (pg_num_rows($result) >= 0) { // It worked, we can keep working
    
            if (isset($paragraph)) {
                unset($paragraph);
            }

            // Store the paragraphs in an array in $introduction
            $introduction["paragraphs"] = array();
            
            while ($row = pg_fetch_array($result)) {
                
                $paragraph["type"]      = $row["type"];
                $paragraph["content"]   = htmlspecialchars_decode($row["content"]);
                $paragraph["url"]       = $row["url"];
    
                // Push the paragraphs in the array in $introduction
                array_push($introduction["paragraphs"], $paragraph);      
    
            }
        
        } elseif (pg_num_rows($result) == 0) { // It work but the chapter doesn't contain any paragraphs
            
            // Note that the introduction doesn't contain any paragraph
            $introduction["paragraphs"] = "empty";
    
        } else { // Couldn't fetch the introduction's informations, abort
            abort();
        }
        
        //=======================================================================================
        // Add the introduction to $storymap
        $storymap["introduction"] = $introduction;

        //=======================================================================================
        // Fetch the book's chapters // FUNCTION

        // Define $storymap["chapters"] as an array
        $storymap["chapters"] = array();

        // Load the book's chapters and store it
        $sql = "SELECT * FROM userdata.chapters WHERE book_id =".$book_id." AND introduction = false ORDER BY position";
        $result = pg_query($dbconn,$sql);

        if (pg_num_rows($result) >= 0) { // It worked, we can keep working

            // Store the map informations and the chapter's title
            while ($row = pg_fetch_array($result)) {

                // Store the chapter's title
                $chapter["title"]   = htmlspecialchars_decode($row["title"]);
               
                // Store the main chapter informations in $chapter
                $map["latitude"]    = $row["latitude"];
                $map["longitude"]   = $row["longitude"];
                $map["zoom"]        = $row["zoom"];
                $map["basemap"]     = $row["basemap"];
                $map["layers"]      = $row["layers"];

                $chapter["map"]     = $map;

                // Fetch $chapter["paragraphs"]
                // Write the sql query to read the chapter's title // FUNCTION
                $sql_paragraphs =   "WITH chapter as ("
                                    ."SELECT userdata.paragraphs.id, chapter_id, book_id, type, content, url, userdata.paragraphs.position " 
                                    ."FROM userdata.paragraphs "
                                    ."INNER JOIN userdata.chapters "
                                    ."ON userdata.paragraphs.chapter_id = userdata.chapters.id "
                                    ."WHERE chapter_id=".$row["id"] // $row["id"] = the current chapter's id (because $row = pg_fetch_array)
                                    ."AND introduction = false"
                                    .") "
                                    ."SELECT * "
                                    ."FROM chapter "
                                    ."WHERE book_id=".$book_id
                                    ."ORDER BY position" ;
                $result_paragraphs = pg_query($dbconn,$sql_paragraphs);

                if (pg_num_rows($result_paragraphs) >= 0) { // It worked, we can keep working

                    // Make sure $paragraph is unset
                    if (isset($paragraph)) {
                        unset($paragraph);
                    }

                    // Store the paragraphs in an array in $chapter
                    $chapter["paragraphs"] = array();
                    
                    while ($row = pg_fetch_array($result_paragraphs)) {
                        
                        $paragraph["type"]      = $row["type"];
                        $paragraph["content"]   = htmlspecialchars_decode($row["content"]);
                        $paragraph["url"]       = $row["url"];

                        // Push the paragraphs in the array in $chapter
                        array_push($chapter["paragraphs"], $paragraph);      

                    }

                } elseif (pg_num_rows($result) == 0) { // It work but the chapter doesn't contain any paragraphs
                    
                    // Note that the introduction doesn't contain any paragraph
                    $storymap["chapters"] = "empty";

                } else { // Couldn't fetch the introduction's informations, abort
                    abort();
                }
    
                // Push the paragraphs in the array in $chapter["paragraphs"]
                array_push($storymap["chapters"], $chapter);      
    
            }
            
        } elseif (condition) { // It work but the book doesn't contain any chapters
            
            // Note that the book doesn't contain any chapter
            $storymap["chapters"] = "empty";

        } else { // Couldn't fetch the introduction's informations, abort
            abort();
        }

        //=======================================================================================
        // Return a success message and the response
        $response["success"] = true;
        $response["storymap"] = $storymap;
        
    
    } else { // $allowed=false, an error occured somewhere
        abort();
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Getting all the "Collections"
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This query is sent as soon as the app is ready (jQuery(document).ready()) in both front-office and back-office
elseif (isset($_POST["mode"]) and ($_POST["mode"]=='collections')) {

    $sql = "SELECT * FROM userdata.collections";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result)<>0) {
        // If the query worked, we store all the collections in an array
        if (isset($collections_list)) {
            unset($collections_list);
        }

        $response["success"] = true;
        $collections_list = array();

        while ($array = pg_fetch_array($result)) {

            $collection = (object) array(
                'id' => $array["id"],
                'name' => $array["name"]
            );

            array_push($collections_list, $collection);
        }
        
        $response["collections"] = $collections_list;

    } else {
        // If the query didn't return anything, send an error message
        $response["error"] = "No collections found";
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch all the published book's informations
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and $_POST["mode"] == 'published_stories') {

    // Send query to fetch all of the published books in the database
    $sql = "SELECT id, title, abstract, collection_id FROM userdata.books WHERE status = 'published' ORDER BY title";
    $result = pg_query($dbconn,$sql);
    
    if (pg_num_rows($result)<>0) { // Some books are published

        if (isset($books_list)) {
            unset($books_list);
        }
        $books_list = array();

        // Fetch id, title, collection_id of all these books
        while ($row = pg_fetch_array($result)) {
            $book = (object) array(
                'id' => $row["id"],
                'title' => htmlspecialchars_decode($row["title"]),
                'abstract' => htmlspecialchars_decode($row["abstract"]),
                'collection_id' => $row["collection_id"]
            );

            array_push($books_list, $book);
        }
        
        $response["success"] = true;
        $response["books_list"] = $books_list;

    } elseif (pg_num_rows($result) == 0) { // No books are published
        
        $response["books_list"] = 'empty';
        $response["success"] = true;
    
    } else {
        $response["error"] = 'There was en error fetching the storymaps.';
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch all the themes
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
if (isset($_POST["mode"]) and ($_POST["mode"]=='fetch_all_themes')) {

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
                'name' => $array["theme"],
            );

            array_push($themes_list, $theme);
        }
        
        $response["themes"] = $themes_list;

    } else {
        // If the query didn't return anything, send an error message
        $response["error"] = "Can't load the layers, please try again later. If the problem persists, please contact an administrator.";
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch the published layers from the database
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'fetch_published_layers_from_db')) {

    // Send query to fetch all the published layers in the application by server id
    $sql = "SELECT geodata.layers.id, server, geodata.layers.name, title, geodata.layers.theme, geodata.themes.theme as theme_name, opacity, \"zIndex\", geodata.servers.name as server_name, geodata.\"serverType\".type as server_type, geodata.\"serverType\".id as server_type_id, url"
          ." FROM geodata.layers"
          ." INNER JOIN geodata.servers"
          ." ON geodata.layers.server = geodata.servers.id"
          ." INNER JOIN geodata.themes"
          ." ON geodata.layers.theme = geodata.themes.id"
          ." INNER JOIN geodata.\"serverType\""
          ." ON geodata.servers.type = geodata.\"serverType\".id";

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
                'server_type' => htmlspecialchars_decode($array["server_type"]),
                'server_type_id' => $array["server_type_id"],
                'url' => htmlspecialchars_decode($array["url"]),
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
        $response["error"] = "Can't load the layers, please try again later. If the problem persists, please contact an administrator.";
    }

}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// The api has been call with undefined or unknown mode
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
else {
    $response["error"] = "no mode defined or mode unknown"; 
    $response["sentMode"] = $_POST["mode"];
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Closing db connexion and encoding response as json
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// closing db
pg_close($dbconn); 

// encoding the response
echo json_encode($response) ;

?>