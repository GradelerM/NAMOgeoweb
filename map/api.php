<?php
session_start();

include_once 'config.php';

header("Content-Type: text/plain ; charset=utf-8");
header("Cache-Control: no-cache , private");//anti Cache for HTTP/1.1
header("Pragma: no-cache");//anti Cache for HTTP/1.0

// $response is the array we turn to json at the end
$response = array();
$response["success"] = false;

// If the user is not authenticated, kill
if (!isset($_SESSION['user'])) {
    $response["error"] = "User not authenticated";
    pg_close($dbconn); 
    echo json_encode($response) ;
    exit; 
}

// Connecting to database
$conn_string = "host=".$_SESSION['db_host']." port=".$_SESSION['db_port']." dbname=".$_SESSION['db_name']." user=".$_SESSION['db_user']." password=".$_SESSION['db_password'];
    $dbconn = pg_connect($conn_string);
if (!$dbconn) {
    $response["error"] = "Database connection failed";
    pg_close($dbconn); 
    echo json_encode($response) ;
    exit;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Getting all the "Collections"
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// This query is sent as soon as the app is ready (jQuery(document).ready()) in both front-office and back-office
if (isset($_POST["mode"]) and ($_POST["mode"]=='collections')) {

    $sql = "SELECT * FROM userdata.collections ORDER BY position";
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
// Fetch all the books from authenticated user
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'fetch_users_books')) {
    
    // Fetch all the books the user owns
    $sql = "SELECT * FROM userdata.books WHERE author_id=".$_SESSION["user_id"]." ORDER BY id";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) >= 0) { // The query worked

        if (isset($books_list)) {
            unset($books_list);
        }
        $books_list = array();

        // Fetch id, title, status of all these books
        while ($row = pg_fetch_array($result)) {
            $book = (object) array(
                'id' => $row["id"],
                'title' => htmlspecialchars_decode($row["title"]),
                'status' => $row["status"]
            );

            array_push($books_list, $book);
        }
        
        $response["success"] = true;
        $response["books_list"] = $books_list;

        // Return an additional answer to tell the application if it has to load the pending and published books too
        // --> works if the user is admin or editor
        if ($_SESSION["admin"] == true || $_SESSION["editor"] == true) {
            $response["load_extra_books"] = true;
        } else {
            $response["load_extra_books"] = false;
        }

    } else {
        $response["error"] = 'There was en error fetching the users\'s books.';
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch all the pending books except the user's
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'fetch_pending_books')) {

    // Make sure the user is admin or editor to be able to load and edit these books
    if ($_SESSION["admin"] == true || $_SESSION["editor"] == true) {

        // Fetch all the pending books the user can load (except his)
        $sql =   "SELECT userdata.books.id, author_id, username, title, status"
                ." FROM userdata.books"
                ." INNER JOIN userdata.users"
                ." ON userdata.users.id = userdata.books.author_id"
                ." WHERE author_id != ".$_SESSION["user_id"]
                ." AND status = 'pending'"
                ." ORDER BY userdata.users.id";
        $result = pg_query($dbconn,$sql);

        if (pg_num_rows($result) > 0) { // There are some pending books to load

            if (isset($books_list)) {
                unset($books_list);
            }
            $books_list = array();

            // Fetch id, title, author of all these books
            while ($row = pg_fetch_array($result)) {
                $book = (object) array(
                    'id' => $row["id"],
                    'title' => htmlspecialchars_decode($row["title"]),
                    'author' => $row["username"]
                );

                array_push($books_list, $book);
            }
            
            $response["success"] = true;
            $response["books_list"] = $books_list;

        } elseif (pg_num_rows($result) == 0) { // No pending books to load

            $response["success"] = true;
            $response["books_list"] = false; // Returning false so we know the query worked but the list is empty

        } else {
            $response["error"] = 'There was en error fetching the books.';
        }

    } else { // The authenticated user cannot load these books

        $response["error"] = "You don't have the right to edit other user's storymaps";
        pg_close($dbconn); 
        echo json_encode($response) ;
        exit; 

    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch all the published books except the user's
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'fetch_published_books')) {

    // Make sure the user is admin or editor to be able to load and edit these books
    if ($_SESSION["admin"] == true || $_SESSION["editor"] == true) {

        // Fetch all the pending books the user can load (except his)
        $sql =   "SELECT userdata.books.id, author_id, username, title, status"
                ." FROM userdata.books"
                ." INNER JOIN userdata.users"
                ." ON userdata.users.id = userdata.books.author_id"
                ." WHERE author_id != ".$_SESSION["user_id"]
                ." AND status = 'published'"
                ." ORDER BY userdata.users.id";
        $result = pg_query($dbconn,$sql);

        if (pg_num_rows($result) > 0) { // There are some published books to load

            if (isset($books_list)) {
                unset($books_list);
            }
            $books_list = array();

            // Fetch id, title, author of all these books
            while ($row = pg_fetch_array($result)) {
                $book = (object) array(
                    'id' => $row["id"],
                    'title' => htmlspecialchars_decode($row["title"]),
                    'author' => $row["username"]
                );

                array_push($books_list, $book);
            }
            
            $response["success"] = true;
            $response["books_list"] = $books_list;

        } elseif (pg_num_rows($result) == 0) { // No published books to load

            $response["success"] = true;
            $response["books_list"] = false; // Returning false so we know the query worked but the list is empty

        } else {
            $response["error"] = 'There was en error fetching the books.';
        }

    } else { // The authenticated user cannot load these books

        $response["error"] = "You don't have the right to edit other user's storymaps";
        pg_close($dbconn); 
        echo json_encode($response) ;
        exit; 

    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Loading an existing book
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'load_book') and isset($_POST["book_id"])) {

    // If it exists, unset the "book_id" session variable
    if (isset($_SESSION["book_id"])) {
        unset($_SESSION["book_id"]);
    }

    // If it exists, unset the "book_id" session variable
    if (isset($_SESSION["owner"])) {
        unset($_SESSION["owner"]);
    }

    // Always make sure the user can edit the book (repeat "fetch_user_books" step for additional security)

    // Check if the book belongs to the user
    if ($_SESSION["admin"] == false && $_SESSION["editor"] == false) {

        $sql = "SELECT * FROM userdata.books WHERE author_id=".$_SESSION["user_id"];
        $result = pg_query($dbconn,$sql);
        $response["current_user"] = 'owner';

    }
    // Check if the user is an admin or an editor, allowed to edit the book
    else {

        $sql = "SELECT * FROM userdata.books WHERE id=".$_POST["book_id"];
        $result = pg_query($dbconn,$sql);
        $response["current_user"] = 'admin or editor';

    }

    if (pg_num_rows($result)<>0) { // The user owns some books

        while ($row = pg_fetch_array($result)) {
            
            if ($row["id"] == $_POST["book_id"]) { // The user owns this specific book / we make sure we fetched the right book
                $_SESSION["book_id"] = $_POST["book_id"]; // Store the book_id in a session variable so we can use it later

                // If the user's id and the book's author match, set $_SESSION["owner"] to true
                if ($row["author_id"] == $_SESSION["user_id"]) {
                    $_SESSION["owner"] = true;
                    $response["owner"] = true;
                } else {
                    $_SESSION["owner"] = false;
                    $response["owner"] = false;
                }

                // Store in the response the book's title, collection, abstract, legal_notice and status
                $response["book_title"] = htmlspecialchars_decode($row["title"]);
                $response["book_collection"] = $row["collection_id"];
                $response["book_abstract"] = htmlspecialchars_decode($row["abstract"]);
                $response["book_legal_notice"] = htmlspecialchars_decode($row["legal_notice"]);
                $response["status"] = $row["status"];

                // Edit this book's status so if is set to "published", set it back to "pending"
                $sql_status = "SELECT status FROM userdata.books WHERE id=".$_POST["book_id"];
                $result_status = pg_query($dbconn,$sql_status);

                if (pg_num_rows($result_status) == 1) { // The book was found in the database

                    // Check what's the book's current status
                    $row_status = pg_fetch_array($result_status);
                    $status = $row_status["status"];

                    // If the book was published, set it back to "pending"
                    if ($status == "published") {
                        $sql = "UPDATE userdata.books SET status='pending' WHERE id=".$_POST["book_id"];
                        $result = pg_query($dbconn,$sql);
                        $response["status"] = 'pending';
                    }
                }

                // Load the book's chapters and store them in the answer
                $sql = "SELECT id, title, position FROM userdata.chapters WHERE book_id =".$_SESSION["book_id"]." AND introduction = false ORDER BY position";
                $result = pg_query($dbconn,$sql);

                if (isset($chapters)) {
                    unset($chapters);
                }
                $chapters = array();

                while ($array = pg_fetch_array($result)) {

                    $chapter = (object) array(
                        'id' => $array["id"],
                        'title' => htmlspecialchars_decode($array["title"]),
                        'position' => $array["position"]
                    );
        
                    array_push($chapters, $chapter);
                }

                $response["success"] = true; // It's a success
                $response["chapters"] = $chapters; // Send the chapter list to the application
                break;
            }
        }

    } else {
        $response["error"] = "The authenticated user doesn't own this book.";
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Creating a new book
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and $_POST["mode"] == 'create_book') {

    // If it exists, unset the "book_id" session variable
    if (isset($_SESSION["book_id"])) {
        unset($_SESSION["book_id"]);
    }

    // Send query to create the new book
    $sql = "INSERT INTO userdata.books(author_id) VALUES (".$_SESSION["user_id"].") RETURNING id";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // The new book was created with no error
        $row = pg_fetch_array($result);
        $response["book_id"] = $row["id"];
        $_SESSION["book_id"] = $row["id"]; // Storing this new book id as a session variable so we can use it later
        $response["success"] = true;

        // And now add the book's introduction
        $sql = "INSERT INTO userdata.chapters(book_id, position, introduction) VALUES (".$_SESSION["book_id"].", 0, true) RETURNING *";
        $result = pg_query($dbconn,$sql);
    
        if (pg_num_rows($result) == 1) { // The introduction was created with no error
            $row = pg_fetch_array($result);
            $response["success"] = true;
            
        } else { // Something went wrong
            $response["error"] = "There was a problem adding the introduction";
        }


    } else {
        $response["error"] = "There was an error creating the new book";
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Delete a book
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
if (isset($_POST["mode"]) and isset($_POST["book_id"]) and $_POST["mode"] == 'delete_book') {

   
    // Make sure once again the user is the book's owner (better safe than sorry)
    $sql = "SELECT * FROM userdata.books WHERE id=".$_POST["book_id"]." AND author_id=".$_SESSION["user_id"];
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // The book exists in the database and belongs to the current logged user
        
        // Then, delete the book's table
        $sql = "DELETE FROM userdata.books WHERE id=".$_POST["book_id"]." RETURNING *";
        $result = pg_query($dbconn,$sql);
        if (pg_num_rows($result) == 1) { // The book was deleted

            // Consider it is a success even if the folder's deletion can fail after this
            $response["success"] = true;
            
        } else { // There was an error deleting the book
            $response["error"] = "There was an error deleting the book";
        }

        // Then, delete the book's uploads
        $folder = "uploads/storymap_".$_POST["book_id"];
        $files = glob($folder.'/*');

        // Delete all the files
        foreach($files as $file) {
            if(is_file($file))
                unlink($file);
        }

        // Delete the folder
        rmdir($folder);

    } else {
        $response["error"] = "There was an error deleting the book";
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Save the book's title
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'save_title') and isset($_POST["content"])) {

    // Encode the book's title
    $title = pg_escape_string(htmlspecialchars($_POST["content"]));
    
    // Update the book's title in the database
    $sql = "UPDATE userdata.books SET title='".$title."' WHERE id=".$_SESSION["book_id"]." RETURNING *";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // The field was updated with no error
        $response["success"] = true;
    } else {
        $response["error"] = "There was an error saving the title";
    }
    
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Save the book's abstract
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'save_abstract') and isset($_POST["content"])) {
    
    $response["content"] = $_POST["content"];

    // Encode the book's abstract
    $abstract = pg_escape_string(htmlspecialchars($_POST["content"]));

    // Update the book's title in the database
    $sql = "UPDATE userdata.books SET abstract='".$abstract."' WHERE id=".$_SESSION["book_id"]." RETURNING *";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // The field was updated with no error
        $response["success"] = true;
    } else {
        $response["error"] = "There was an error saving the abstract";
    }
    
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Save the book's legal notice
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'save_legal_notice') and isset($_POST["content"])) {

    // Encoding the book's legal notice
    $legal_notice = pg_escape_string(htmlspecialchars($_POST["content"]));
    
    // Update the book's title in the database
    $sql = "UPDATE userdata.books SET legal_notice='".$legal_notice."' WHERE id=".$_SESSION["book_id"]." RETURNING *";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // The field was updated with no error
        $response["success"] = true;
    } else {
        $response["error"] = "There was an error saving the legal notice";
    }
    
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Save the book's collection
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'save_collection')) {
    
    // Update the book's title in the database
    $sql = "UPDATE userdata.books SET collection_id='".$_POST["collection_id"]."' WHERE id=".$_SESSION["book_id"]." RETURNING *";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // The field was updated with no error
        $response["success"] = true;
    } else {
        $response["error"] = "There was an error saving the collection";
    }
    
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Add a new chapter to the book
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'add_chapter')) {
    
    if (isset($position)) {
        unset($position);
    }

    // Send query to deduce the new chapter's position
    $sql = "SELECT book_id, position FROM userdata.chapters WHERE book_id=".$_SESSION["book_id"]." ORDER BY position DESC LIMIT 1";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // The book already contains chapters

        $row = pg_fetch_array($result);
        $position = $row["position"] + 1;

    } else if (pg_num_rows($result) == 0) { // The book is empty, we have to create the first chapter

        $position = 1; // And not position = 0 because it is already taken by the introduction

    } else { // It did not work
        $response["error"] = "There was a problem adding the new chapter";
        pg_close($dbconn); 
        echo json_encode($response) ;
        exit;
    }

    // Send query to insert a new chapter at this position in the book
    $sql = "INSERT INTO userdata.chapters(book_id, position) VALUES (".$_SESSION["book_id"].",".$position.") RETURNING *";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // The new chapter was created with no error
        $row = pg_fetch_array($result);
        $response["chapter_id"] = $row["id"];
        $response["chapter_position"] = $row["position"];
        $response["success"] = true;

        if (isset($chapter)) {
            unset($chapter);
        }

        $chapter = (object) array(
            'id' => $row["id"],
            'title' => $row["title"],
            'position' => $row["position"]
        );

        $response["chapter"] = $chapter;
        
    } else { // Something went wrong
        $response["error"] = "There was a problem adding the new chapter";
    }
    
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Update the chapters' positions when the user performs a drag'n'drop
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'update_chapter_position') and isset($_POST["array"])) {
    
    // Write a new sql query for each element in the array
    foreach ($_POST["array"] as $chapter) {
        $sql = "UPDATE userdata.chapters SET position=".$chapter["index"]." WHERE book_id=".$_SESSION["book_id"]." AND id=".$chapter["id"]." RETURNING *";
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
// Delete a chapter
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'delete_chapter') and isset($_POST["chapter_id"])) {
      
    // Check if any local pictures were linked to this chapter
    $sql =  "SELECT book_id, chapter_id, userdata.paragraphs.id, type, content, url"
            ." FROM userdata.paragraphs"
            ." INNER JOIN userdata.chapters"
            ." ON userdata.paragraphs.chapter_id = userdata.chapters.id"
            ." WHERE book_id = ".$_SESSION["book_id"]
            ." AND chapter_id = ".$_POST["chapter_id"]
            ." AND type = 'localPicture'";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 0) { // The chapter does not contain any local picture
        // Skip it
    } elseif (pg_num_rows($result) > 0) { // The chapter contains local pictures
        
        // Store all of the urls in an array for deleting these pictures later
        if (isset($urls)) {
            unset($urls);
        }
        $urls = array();
        
        while ($row = pg_fetch_array($result)) {
            
            $url = $row["url"];
            array_push($urls, $url);    

        }

    } else {
        $response["error"] = "There was an error deleting the chapter";
        echo json_encode($response) ;
        pg_close($dbconn); 
        exit;
    }

    // Write the sql query to delete the chapter
    $sql = "DELETE FROM userdata.chapters WHERE book_id=" .$_SESSION["book_id"]. " AND id=" .$_POST["chapter_id"]. " RETURNING *";
    $result = pg_query($dbconn,$sql);  

    if(pg_num_rows($result) == 1) { // It worked

        // Now we have to delete the local pictures
        foreach ($urls as $url) {

            // Check if an url actually exists or if it was empty
            if ($url == NULL) {
                // The url was empty, no image to remove from the server
            } else {
                
                // Check if the file really exists
                if (file_exists($url)) {
                    
                    // Delete it
                    unlink($url);

                } else {
                    // The file wasn't found, the url link was already broken
                }
            }

        }        

        $response["success"] = true;

    } else {
        $response["error"] = "There was an error deleting the chapter";
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Get a chapter's title
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'get_chapter_title') and isset($_POST["chapter_id"])) {
    
    // Wrtie the sql query to read the chapter's title
    $sql = "SELECT id, title FROM userdata.chapters WHERE book_id=" .$_SESSION["book_id"]. " AND id=" .$_POST["chapter_id"];
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // It worked
        $row = pg_fetch_array($result);
        $response["title"] = htmlspecialchars_decode($row["title"]);
        $response["success"] = true;
    } else {
        $response["error"] = "There was an error reading the chapter's title";
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Loading the introduction's paragraphs
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'read_introduction_paragraphs')) {
    
    // Wrtie the sql query to read the chapter's title
    $sql =  "WITH introduction as ("
            ."SELECT userdata.paragraphs.id, chapter_id, book_id, type, content, url, userdata.paragraphs.position " 
            ."FROM userdata.paragraphs "
            ."INNER JOIN userdata.chapters "
            ."ON userdata.paragraphs.chapter_id = userdata.chapters.id "
            ."WHERE introduction = true"
            .") "
            ."SELECT * "
            ."FROM introduction "
            ."WHERE book_id=".$_SESSION["book_id"]
            ."ORDER BY position" ;

    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) >= 0) { // The query worked

        if (isset($paragraphs)) {
            unset($paragraphs);
        }
        $paragraphs = array();
        
        while ($row = pg_fetch_array($result)) {
            
            $paragraph = (object) array(
                'id' => $row["id"],
                'type' => $row["type"],
                'content' => $row["content"],
                'url' => $row["url"],
                'position' => $row["position"]
            );

            array_push($paragraphs, $paragraph);      

        }

        $response["success"] = true; // It's a success
        $response["paragraphs"] = $paragraphs; // Send the chapter list to the application

    } elseif (pg_num_rows($result) == 0) { // It work but the chapter doesn't contain any paragraphs
        
        $response["success"] = true;
        $response["paragraphs"] = 'empty'; // The introduction is empty

    } else { // There was an error
        $response["error"] = "There was an error loading the paragraphs";
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Loading a chapter => read paragraphs
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'read_chapter_paragraphs') and isset($_POST["chapter_id"])) {

    // Fetch the paragraphs in the chapter "chapter_id" in the book "book_id"
    $sql = "WITH chapter as ("
            ."SELECT userdata.paragraphs.id, chapter_id, book_id, type, content, url, userdata.paragraphs.position " 
            ."FROM userdata.paragraphs "
            ."INNER JOIN userdata.chapters "
            ."ON userdata.paragraphs.chapter_id = userdata.chapters.id "
            ."WHERE chapter_id=".$_POST["chapter_id"]
            ."AND introduction = false"
            .") "
            ."SELECT * "
            ."FROM chapter "
            ."WHERE book_id=".$_SESSION["book_id"]
            ."ORDER BY position" ;
    
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) >= 1) { // The query worked

        if (isset($paragraphs)) {
            unset($paragraphs);
        }
        $paragraphs = array();
        
        while ($row = pg_fetch_array($result)) {
            
            $paragraph = (object) array(
                'id' => $row["id"],
                'type' => $row["type"],
                'content' => htmlspecialchars_decode($row["content"]),
                'url' => htmlspecialchars_decode($row["url"]),
                'position' => $row["position"]
            );

            array_push($paragraphs, $paragraph);      

        }

        $response["success"] = true; // It's a success
        $response["paragraphs"] = $paragraphs; // Send the chapter list to the application

    } elseif (pg_num_rows($result) == 0) { // It work but the chapter doesn't contain any paragraphs
        
        $response["success"] = true;
        $response["paragraphs"] = 'empty'; // The chapter is empty

    } else { // There was an error
        $response["error"] = "There was an error loading the paragraphs";
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Save the chapter's title
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'save_chapter_title') and isset($_POST["chapter_id"]) and isset($_POST["content"])) {
    
    $response["chapter_id"] = $_POST["chapter_id"];
    $response["content"] = $_POST["content"];

    $title = pg_escape_string(htmlspecialchars($_POST["content"]));

    // Update the chapter's title in the database
    $sql = "UPDATE userdata.chapters SET title='".$title."' WHERE book_id=".$_SESSION["book_id"]."AND id=".$_POST["chapter_id"]." RETURNING *";
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // The field was updated with no error
        $response["success"] = true;
    } else {
        $response["error"] = "There was an error saving the title";
    }    
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Save the paragraphs's content
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'save_paragraph_content') 
        and isset($_POST["chapter_id"]) and isset($_POST["paragraph_id"]) 
        and isset($_POST["destination"]) and isset($_POST["content"])) {

    // Escape the html characters
    $content = pg_escape_string(htmlspecialchars($_POST["content"]));

    // Check if it's part of the introduction or not
    if ($_POST["chapter_id"] == 'story-intro') {
        $sql_chapter = "AND introduction = true";
    } else {
        $sql_chapter = " AND chapter_id = ".$_POST["chapter_id"];
    }

    // Check if destination is "content" or "url
    if ($_POST["destination"] == 'content' || $_POST["destination"] == 'url') {

        $sql =  "UPDATE userdata.paragraphs"
                ." SET ".$_POST["destination"]." = '".$_POST["content"]."'"
                ." FROM userdata.chapters"
                ." WHERE userdata.paragraphs.chapter_id = userdata.chapters.id"
                ." AND userdata.paragraphs.id = ".$_POST["paragraph_id"]
                .$sql_chapter
                ." AND book_id = ".$_SESSION["book_id"]
                ."RETURNING *";
        $result = pg_query($dbconn,$sql);

        if (pg_num_rows($result) == 1) { // The field was updated with no error
            $row = pg_fetch_array($result);

            $response["success"] = true;
            $response["type"] = $row["type"];
            $response["content"] = htmlspecialchars_decode($row["content"]);
            $response["url"] = htmlspecialchars_decode($row["url"]);            
        } else {
            $response["error"] = 'An error occured while saving content';
        }

    } else {
        $response["error"] = 'Saving destination unknown';
    }
    
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Create a new paragraph
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'add_new_paragraph') and isset($_POST["chapter_id"]) and isset($_POST["type"])) {
   
    if (isset($position)) {
        unset($position);
    }

    if (isset($chapter_id)) {
        unset($chapter_id);
    }

    
    // Make sure the requested type exists
    if ($_POST["type"] == 'textHtml' || $_POST["type"] == 'textMarkdown' || $_POST["type"] == 'localPicture' || $_POST["type"] == 'remotePicture') {

        
        // Check if the new paragraph must be added to the introduction
        if ($_POST["chapter_id"] == 'story-intro') {

            // Fetch the chapter id linked to the introduction of this book

            $sql = "SELECT book_id, id, introduction FROM userdata.chapters WHERE introduction = true AND book_id = ".$_SESSION["book_id"];
            $result = pg_query($dbconn,$sql);

            if (pg_num_rows($result) == 1) { // The introduction has been found
                
                $row = pg_fetch_array($result);
                $chapter_id = $row["id"];

            } else {

                $response["error"] = "Introduction is missing";
                echo json_encode($response);
                pg_close($dbconn); 
                exit;
            }

        } else {

            $chapter_id = $_POST["chapter_id"];

        }

        // Send query to deduce the new paragraph's position
        $sql =  "SELECT book_id, chapter_id, userdata.paragraphs.id, userdata.paragraphs.position"
                ." FROM userdata.paragraphs"
                ." INNER JOIN userdata.chapters"
                ." ON userdata.paragraphs.chapter_id = userdata.chapters.id"
                ." WHERE chapter_id = ".$chapter_id
                ." AND book_id = ".$_SESSION["book_id"]
                ." ORDER BY userdata.paragraphs.position DESC LIMIT 1";
        $result = pg_query($dbconn,$sql);

        if (pg_num_rows($result) == 1) { // The chapter already contains paragraphs

            $row = pg_fetch_array($result);
            $position = $row["position"] + 1;

        } else if (pg_num_rows($result) == 0) { // The chapter is empty, we have to create the first paragraph

            $position = 0;

        } else { // It did not work
            $response["error"] = "There was a problem adding the new paragraph";
            echo json_encode($response);
            pg_close($dbconn); 
            exit;
        }

        // Write the query for a chapter
        $sql =  "INSERT INTO userdata.paragraphs(chapter_id, type, position)"
                ." VALUES ("
                .$chapter_id
                .",'"
                .$_POST["type"]
                ."',"
                .$position
                .") RETURNING *";

        // Send query to insert a new paragraph at this position in the book
        $result = pg_query($dbconn,$sql);

        if (pg_num_rows($result) == 1) { // The new paragraph was created with no error
            $row = pg_fetch_array($result);
            $response["success"] = true;

            if (isset($paragraph)) {
            unset($paragraph);
            }

            $paragraph = (object) array(
            'id' => $row["id"],
            'type' => $row["type"],
            'position' => $row["position"]
            );

            $response["paragraph"] = $paragraph;

        } else { // Something went wrong
            $response["error"] = "There was a problem adding the new chapter";
            pg_close($dbconn); 
            echo json_encode($response);
            exit;
        }

    } else {
        $response["error"] = 'Paragraph type is unsafe';
    }

        
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Delete a paragraph
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'delete_paragraph') and isset($_POST["chapter_id"]) and isset($_POST["paragraph_id"])) {

    // TODOS
    // Check if it's part of the introduction or not
    if ($_POST["chapter_id"] == 'story-intro') {
        $sql_chapter = "AND introduction = true";
    } else {
        $sql_chapter = " AND chapter_id = ".$_POST["chapter_id"];
    }

    // Write the sql query to delete the paragraph
    $sql =  "DELETE FROM userdata.paragraphs"
            ." USING userdata.chapters WHERE userdata.paragraphs.chapter_id = userdata.chapters.id"
            ." AND book_id = ".$_SESSION["book_id"]
            ." ".$sql_chapter
            ." AND userdata.paragraphs.id = ".$_POST["paragraph_id"]
            ." RETURNING *";

    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) <> 0) { // It worked

        // Check is the paragraph's type was a localPicture
        $row = pg_fetch_array($result);
        $type = $row["type"];

        $repsonse["type"] = $type;

        if ($type === 'localPicture') { // It is linked to a picture stored in the server, we have to delete it too
            
            $url = $row["url"];

            if ($url == NULL) {
                // No image is linked, don't do anything else
                $response["success"] = true;
            } else {
                $unlink = unlink($url);

                // Check if it worked
                if ($unlink) {
                    $response["success"] = true;
                } else { // Couldn't delete the image
                    $response["error"] = "Couldn't delete the linked image";
                }
            }

        } else { // The paragraph didn't contain any local image
            $response["success"] = true;
        }

    } else {
        $response["error"] = "There was an error deleting the paragraph";
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Update the paragraphs' positions when the user performs a drag'n'drop
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'update_paragraph_position') and isset($_POST["chapter_id"]) and isset($_POST["array"])) {
    
    // Write the $sql_chapter part of the query
    if ($_POST["chapter_id"] == 'story-intro') {
        $sql_chapter = " AND introduction = true";
    } else {
        $sql_chapter = " AND chapter_id = ".$_POST["chapter_id"];
    }

    // Write a new sql query for each element in the array
    foreach ($_POST["array"] as $paragraph) {
        $sql =  "UPDATE userdata.paragraphs"
                ." SET position = '".$paragraph["index"]."'"
                ." FROM userdata.chapters"
                ." WHERE userdata.paragraphs.chapter_id = userdata.chapters.id"
                ." AND userdata.paragraphs.id = ".$paragraph["id"]
                .$sql_chapter
                ." AND book_id = ".$_SESSION["book_id"]
                ." RETURNING *";
        $result = pg_query($dbconn,$sql);

        // Check if it is working
        if (pg_num_rows($result) !== 1) { // It is unsafe, exit
            $response["error"] = "An error occured during the query";
            pg_close($dbconn); 
            echo json_encode($response);
            exit;
        }
    }
    unset($paragraph); // Break the reference with the last element
    $response["success"] = true; 
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Get the chapter's map
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'get_chapter_map') and isset($_POST["chapter_id"])) {

    // Write the $sql_chapter part of the query
    if ($_POST["chapter_id"] == 'story-intro') {
        $sql_chapter = " AND introduction = true";
    } else {
        $sql_chapter = " AND id = ".$_POST["chapter_id"];
    }
    
    // Wrtie the sql query to read the chapter's title
    $sql =  "SELECT id, latitude, longitude, zoom, basemap, layers"
            ." FROM userdata.chapters WHERE book_id=" .$_SESSION["book_id"].$sql_chapter;
    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // It worked
        $row = pg_fetch_array($result);
        $response["success"] = true;

        $response["latitude"] = $row["latitude"];
        $response["longitude"] = $row["longitude"];
        $response["zoom"] = $row["zoom"];
        $response["basemap"] = htmlspecialchars_decode($row["basemap"]);
        $response["layers"] = htmlspecialchars_decode($row["layers"]);

    } else {
        $response["error"] = "There was an error reading the chapter's map informations";
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Save the chapter's map
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'save_chapter_map') and isset($_POST["chapter_id"])
        and isset($_POST["latitude"]) and isset($_POST["longitude"]) and isset($_POST["zoom"]) 
        and isset($_POST["basemap"]) and isset($_POST["layers"])) {
    
    // Write the $sql_chapter part of the query
    if ($_POST["chapter_id"] == 'story-intro') {
        $sql_chapter = " AND introduction = true";
    } else {
        $sql_chapter = " AND id = ".$_POST["chapter_id"];
    }

    // Escape the strings
    $basemap = pg_escape_string(htmlspecialchars($_POST["basemap"]));
    $layers = pg_escape_string(htmlspecialchars($_POST["layers"]));

    // Update the chapter's title in the database
    $sql =  "UPDATE userdata.chapters"
            ." SET latitude = ".$_POST["latitude"]
            .", longitude = ".$_POST["longitude"]
            .", zoom = ".$_POST["zoom"]
            .", basemap = '".$_POST["basemap"]
            ."', layers = '".$_POST["layers"]
            ."' WHERE book_id=".$_SESSION["book_id"]
            ." ".$sql_chapter
            ." RETURNING *";

    $response["sql"] = $sql;

    $result = pg_query($dbconn,$sql);

    if (pg_num_rows($result) == 1) { // The field was updated with no error
        $response["success"] = true;
    } else {
        $response["error"] = "There was an error saving the map";
    }    
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// The user uploads a picture
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_FILES["file"]) and isset($_POST["mode"]) and ($_POST["mode"] == 'upload_image')
        and isset($_POST["chapter_id"]) and isset($_POST["paragraph_id"])) {

    // Setting default error to display
    $response["error_upload"] = "Une erreur est survenue ";
    
    $response["file"] = $_FILES["file"];

    if (isset($row)) {
        unset($row);
    }

    // Fetch informations about the uploaded file
    $fileName = $_FILES["file"]["name"];
    $fileTmpName = $_FILES["file"]["tmp_name"];
    $fileSize = $_FILES["file"]["size"];
    $fileError = $_FILES["file"]["error"];
    $fileType = $_FILES["file"]["type"];

    // Get the file extension
    $fileExt = explode(".", $fileName);
    $fileActualExt = strtolower(end($fileExt)); // Make sure it's in lowercase. Example : JPG -> jpg

    // List the allowed files (already in the <input> but it's for additional security)
    $allowed = array('jpg', 'jpeg', 'png', 'gif');

    // Check if the file is allowed
    if (in_array($fileActualExt, $allowed)) {
        
        // Check if there is was an error uploading the file
        if ($fileError === 0) {
           
            // Check is the file is light enough
            if ($fileSize < 2000000) {
                
                // The file passed the test, we can save it inside the server
                // Create a file name based on the milisecond timestamp for unique id and add the file extension at the end
                $fileNameNew = uniqid('', true).".".$fileActualExt;

                // Define where to store the image
                $folder = "uploads/storymap_".$_SESSION["book_id"];
                $fileDestination = $folder."/".$fileNameNew;
                $response["folder"]= $folder;
                $reponse["fileDestination"] = $fileDestination;

                // Check if the path already exists on the server
                if (!file_exists($folder)) {
                    $mkdir = mkdir($folder, 0770);

                    if ($mkdir == true) { // The new folder was created
                        $response["mkdir"] = "New folder created";

                    } else { // Couldn't create the new folder
                        $response["error_upload"] = "Can't create directory";
                        pg_close($dbconn); 
                        echo json_encode($response);
                        exit;
                    }

                } else { // The folder already exists, no need to create it
                    $response["mkdir"] = "Folder already exists";
                }

                // And move the file from the temporary location to the destination in the server
                $moved = move_uploaded_file($fileTmpName, $fileDestination);

                if ($moved) {

                    // Write the $sql_chapter part of the query
                    if ($_POST["chapter_id"] == 'story-intro') {
                        $sql_chapter = " AND introduction = true";
                    } else {
                        $sql_chapter = " AND chapter_id = ".$_POST["chapter_id"];
                    }
                    
                    // Check if a file is already linked to this paragraph
                    $sql =  "SELECT book_id, chapter_id, userdata.paragraphs.id, type, content, url"
                            ." FROM userdata.paragraphs"
                            ." INNER JOIN userdata.chapters"
                            ." ON userdata.paragraphs.chapter_id = userdata.chapters.id"
                            ." WHERE book_id = ".$_SESSION["book_id"]
                            .$sql_chapter
                            ." AND userdata.paragraphs.id = ".$_POST["paragraph_id"];
                    $result = pg_query($dbconn,$sql);
                    
                    // Check if the query found the paragraph we're looking for
                    if (pg_num_rows($result) == 1) {

                        // Fetch the url
                        $row = pg_fetch_array($result);
                        $url = $row["url"];

                        // Check if an url already exists
                        if ($url == NULL) {
                            // The url was empty, no image to remove from the server
                        } else {
                            
                            // Check if the file really exists
                            if (file_exists($url)) {
                               
                                // If the previous file was still in the database, delete it
                                unlink($url);

                            } else {
                                // The file wasn't found, the url link was already broken
                            }
                        }

                        // Now we are sure the previous file doesn't exist anymore, we can replace the url in the database
                        $sql =  "UPDATE userdata.paragraphs"
                                ." SET url = '".$fileDestination."'"
                                ." FROM userdata.chapters"
                                ." WHERE userdata.paragraphs.chapter_id = userdata.chapters.id"
                                ." AND userdata.paragraphs.id = ".$_POST["paragraph_id"]
                                .$sql_chapter
                                ." AND book_id = ".$_SESSION["book_id"]
                                ."RETURNING *";
                        $result = pg_query($dbconn,$sql);

                        if (pg_num_rows($result) == 1) { // The field was updated with no error

                            // Send a success message
                            $response["success"] = true;
                            $response["src"] = $fileDestination;

                        } else { // Couldn't update the field
                            $response["error_upload"] = 'An error occured while saving content';
                            $reponse["unlink"] = "Unlinking the image";
                            $response["image_url"] = $fileDestination;
                            unlink($fileDestination);
                        }

                    } else {
                        $response["error_upload"] = "An error occured while fetching the paragraph";
                        $reponse["unlink"] = "Unlinking the image";
                        $response["image_url"] = $fileDestination;
                        unlink($fileDestination);
                    }  
                    
                } else {
                    $response["error_upload"] = "Failed to move the file";
                    $reponse["unlink"] = "Unlinking the image";
                    $response["image_url"] = $fileDestination;
                    unlink($fileDestination);
                }

            } else { // Too big file blocked by api.php
                $response["error_upload"] = "Le fichier est trop volumineux (2MB maximum)";
                // $response["error"] = "The file is too big";
            }

        } elseif ($fileError === 1) { // Too big file blocked by php.ini
            $response["error_upload"] = "Le fichier est trop volumineux (2MB maximum)";
            // $response["error"] = "The file is too big";

        } else {
            $response["error_upload"] = "Une erreur est survenue ";
            // $response["error"] = "There was an error uploading the file";
        }
    } else {
        $response["error_upload"] = "Vous ne pouvez ajouter que des images au format JPEG, JPG, PNG ou GIF";
        // $response["error"] = "File extension unsafe";
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Read and write a full book to display it in the app
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and ($_POST["mode"] == 'write_storymap')) {

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

    // Define if the POST resquest was send by map.php or storytool.php
    $referer = $_SERVER["HTTP_REFERER"];
    $exploded = explode("/", $referer);
    $origin = end($exploded);

    // Making sure we can access the book we want to display

    // If the query is sent by map.php, the book's id is sent in $_POST["book_id"] and we have to make sure
    // the book's status is "published"
    if ($origin == 'map.php') {
        // Indicate that the origin is public
        $response["origin"] = "public";

        // Check if the needed values are set

        if (isset($_POST["book_id"])) {
            
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
            
        } else { // The requested book id isn't set, abort

            $response["error"] = "Book id undefined";
            pg_close($dbconn); 
            echo json_encode($response);
            exit;

        }

    // If the query is sent by storytool.php, the book's id is already stored in the session variables
    // and we don't need to check if the book's status is "published" or not
    } elseif ($origin == 'storytool.php') {
        // Indicate that the origin is private
        $response["origin"] = "private";

        // Give the variables the needed values
        $allowed = true;
        $book_id = $_SESSION["book_id"];

    } else {

        // The origin is unknown, abort
        $response["error"] = "Request origin unsafe";
        pg_close($dbconn); 
        echo json_encode($response);
        exit;
        
    }

    // If we reach this point, we have the needed authorizations to fetch the book's informations
    // Check once more if we're allowed to send the query to the database
    if ($allowed === true) {

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
// Change a book's status 
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and $_POST["mode"] == 'edit_book_status' and isset($_POST["status"])) {

    // Send query to edit the book's status
    $sql = "UPDATE userdata.books SET status = '".$_POST["status"]."' WHERE id = ".$_SESSION["book_id"]." RETURNING *";
    
    $response["query"] = $sql;
    $result = pg_query($dbconn,$sql);
    
    $response["rows"] = pg_num_rows($result);

    if (pg_num_rows($result) == 1) { // The status was updated with no error
        $response["success"] = true;
    } else {
        $response["error"] = "There was an error editing the book's status";
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Fetch all the published book's informations
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
elseif (isset($_POST["mode"]) and $_POST["mode"] == 'published_stories') {

    // Send query to fetch all of the published books in the database
    $sql = "SELECT id, title, abstract, collection_id FROM userdata.books WHERE status = 'published'";
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
// Api called with no mode or mode unknown
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
else {
    $response["error"] = "no mode defined or mode unknown"; 
    $response["sentMode"] = $_POST["mode"];
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SCRIPT END: close database and encore $response to json
////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// closing the database
pg_close($dbconn); 

// encode as json and return $response
echo json_encode($response) ;
?>
