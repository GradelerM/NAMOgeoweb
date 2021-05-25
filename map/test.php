<?php
session_start() ;

include_once 'config.php';  // charge les différentes variables nécessaires pour les scripts php

header("Content-Type: text/html ; charset=utf-8");
header("Cache-Control: no-cache , private");//anti Cache pour HTTP/1.1
header("Pragma: no-cache");//anti Cache pour HTTP/1.0

// Displaying username
$username = "";

// Hiding connexion buttons if session is active
$login_buttons = "";

if (isset($_SESSION['user'])) {
    $username = $_SESSION['user'];
    echo "Session is active";
 }

if (!isset($_SESSION['user'])) {
    $login_info = "display:none;";
    echo "Session is NOT active, please connect";
 }

?>

<br>
<br>
<button id="test">Use script</button>
<br>
<br>

<!-- Loading JQuery -->
<script src="scripts/lib/jquery/jquery-3.5.1.min.js"></script>

<script>

    // Read JSON file stored in local 'JSON/storyTemplateDefault.json'
    /*
    var stories;
    $.ajax({
        url: 'JSON/storyTemplateDefault.json',
        dataType: 'json',
        async: false, // WIP : remove async false once the data is on the server
        success: function(data) {
          stories = data;
        },
        error: function() {
            console.error("Couldn't fetch data from " + source);
        }
      });
      console.log(stories);
      */
    
    // Send AJAX request to get the book
    var stories;
    $.ajax({
        url: './api.php',
        method: 'POST',
        data: {mode:'books_test'},
        dataType: 'json',
        success: function(response) {
            console.log('Success');
            console.log(response);
        },
        error: function(response) {
            console.log('Error');
            console.log(response);
        }
    });

    // Send AJAX request
    $('#test').on('click', function() {
        console.log('Clicked');
        // Send AJAX request to api.php : POST
            $.ajax({
                url: './api.php',
                method: 'POST',
                data: {books:JSON.stringify(stories), mode:'update_books'},
                dataType: 'json',
                success: function(response) {
                    console.log('Success');
                    console.log(response);
                },
                error: function(response) {
                    console.log('Error');
                    console.log(response);
                }
            });
    });   

</script>