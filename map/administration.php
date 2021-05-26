<?php
session_start() ;

include_once 'config.php';  // charge les différentes variables nécessaires pour les scripts php
include_once './components/loaders.php'; // Including some loaders and other elements to display

// Defining the header
header("Content-Type: text/html ; charset=utf-8");
header("Cache-Control: no-cache , private");//anti Cache pour HTTP/1.1
header("Pragma: no-cache");//anti Cache pour HTTP/1.0

// Redirect user to the map if he is not a logged in administrator / geoadministrator
if (isset($_SESSION['user']) && $_SESSION['admin'] == true) {

    // Do nothing, the user can access the interface as an admin

} elseif (isset($_SESSION['user']) && $_SESSION['editor'] == true) {
    
    // Do nothing, the user can access the interface as a geoadmin

} else { // The user does not have the necessary rights to access the administration panel
    header("Location: map.php");
    die();
}

?>

<!DOCTYPE html>
<html lang="fr">

    <head>
        <!-- Meta tags -->
        <meta charset="utf-8"/>
        <meta http-equiv="X-UA-Compatible" content="IE=edge"/>

        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit-no"/>
        <meta="description" content="Page d'accueil du projet de carte narrative Rivage"/>
        <meta="author" content="Marie Gradeler (2020)"/>
        <title>NAMO GeoWeb - administration</title><!-- PROJECT NAME -->

        <!-- Importing fonts -->
        <link href="https://fonts.googleapis.com/css2?family=Roboto:500,700" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet"> 

        <!-- Styles -->
        <link rel="stylesheet" href="styles/backoffice.css?v=1.1" />
        <link rel="stylesheet" href="scripts/lib/jquery-ui-1.12.1/jquery-ui.css?v=1.1" />
        <link rel="stylesheet" href="scripts/lib/datatables/datatables.min.css" />
        <link rel="stylesheet" href="styles/override.css?v=1.1">

    </head>

    <body>
        <!-- Main icons -->
        <svg style="display: none;">
            <symbol id="iconeInfo" viewBox="0 0 24 24">
                <path d="M12 9C13.1046 9 14 8.10457 14 7C14 5.89543 13.1046 5 12 5C10.8954 5 10 5.89543 10 7C10 8.10457 10.8954 9 12 9Z"/>
                <path d="M10 12L9 10H14V19H10V12Z"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12ZM21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>
              </symbol>

            <symbol id="iconeParameters" viewBox="0 0 24 24">
                <path d="M12 16C14.2092 16 16 14.2091 16 12C16 9.79086 14.2092 8 12 8C9.79083 8 8 9.79086 8 12C8 14.2091 9.79083 16 12 16Z"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M9 0H15V2.45779C15.5821 2.64062 16.1413 2.87527 16.6721 3.15628L18.8284 1L23.071 5.24265L20.8925 7.42117C21.1519 7.9241 21.37 8.45187 21.5422 9H24V15H21.5422C21.3647 15.5652 21.1384 16.1087 20.8682 16.6256L23.071 18.8285L18.8284 23.0711L16.6255 20.8682C16.1086 21.1384 15.5651 21.3647 15 21.5422V24H9V21.5422C8.45184 21.3701 7.92407 21.1519 7.42114 20.8925L5.24255 23.0711L0.999939 18.8284L3.15625 16.6721C2.87524 16.1413 2.64056 15.5821 2.45776 15H0V9H2.45782C2.63531 8.43488 2.86157 7.89139 3.13177 7.37445L1 5.24268L5.24261 1.00003L7.37439 3.13181C7.89136 2.8616 8.43488 2.63528 9 2.45779V0ZM18 12C18 15.3137 15.3137 18 12 18C8.68628 18 6 15.3137 6 12C6 8.68628 8.68628 6 12 6C15.3137 6 18 8.68628 18 12Z"/>
            </symbol>
            
            <symbol id="iconeEdit" viewBox="0 0 24 24">
                <path d="M18 0L24 6L21 9L15 3L18 0Z"/>
                <path d="M14.25 3.75L20.25 9.75L8.25 21.75L2.25 15.75L14.25 3.75Z"/>
                <path d="M1.90192 16.9019L0 24L7.09808 22.0981L1.90192 16.9019Z"/>
            </symbol>

            <symbol id="iconeConfirm" viewBox="0 0 24 24">
                <path d="M24 3.36536L21.3688 0L7.81373 17.3373L2.63119 10.7087L0 14.0741L7.76053 24L8.15968 23.4895L8.21288 23.5575L24 3.36536Z"/>
            </symbol>
            
            <symbol id="iconeCancel" viewBox="0 0 24 24">
                <path d="M0 3.2L3.2 0L12 8.80003L20.8 0L24 3.2L15.2 12L23.9999 20.8L20.7999 24L12 15.2L3.20006 24L6.90532e-05 20.8L8.8 12L0 3.2Z"/>
            </symbol>

            <symbol id="iconeArrow" viewBox="0 0 24 24">
                <path d="M18 12L9 22.3923L9 1.6077L18 12Z" />
            </symbol>

            <symbol id="fontScaleUp" viewBox="0 0 27 24">
                <path d="M13.5203 19.1106H5.45105L3.7628 24H0L7.86898 3H11.1167L19 24H15.2229L13.5203 19.1106ZM6.46687 16.1683H12.5045L9.48569 7.45673L6.46687 16.1683Z"/>
                <path d="M23.1924 4.20283H27V6.5066H23.1924V11H20.8277V6.5066H17V4.20283H20.8277V0H23.1924V4.20283Z"/>
            </symbol>

            <symbol id="fontScaleDown" viewBox="0 0 27 24">
                <path d="M13.5203 19.1106H5.45105L3.7628 24H0L7.86898 3H11.1167L19 24H15.2229L13.5203 19.1106ZM6.46687 16.1683H12.5045L9.48569 7.45673L6.46687 16.1683Z"/>
                <rect x="18" y="4" width="9" height="2"/>
            </symbol>

            <symbol id="smallTab" viewBox="0 0 28 21">
                <path d="M10 0H28V21H10V0Z"/>
                <path d="M0 0H8V21H0V0Z"/>
            </symbol>

            <symbol id="bigTab" viewBox="0 0 28 21">
                <path d="M14 0H28V21H14V0Z"/>
                <path d="M0 0H13V21H0V0Z"/>
            </symbol>
        </svg>
        <!-- End of SVG declaration -->

        <!-- Back to map modal -->
        <div id="back-to-map-modal" class="modal hidden">
            <div class="modal-content">
                <p id="main-modal-content">
                    Voulez-vous retourner à la carte ?
                </p>
                <button id="back-to-map-modal-ok" class="positive" onclick="document.location.href='map.php';">Oui</button>
                <button id="back-to-map-modal-no" class="negative">Non</button>
            </div>
        </div>

        <!-- Grid container -->
        <div class="container-storytool">
            <!-- Header -->
            <div class="header">
                <a href="#" id="back-to-map"><img src="images/assets/logos/logoHorizontal.png"/></a> <!-- HORIZONTAL LOGO -->
                <div id="header-navlinks">
                    <ul>
                        <!-- WIKI LINK -->
                        <li><a href="https://gitlab.com/GradelerM/rivage-guadeloupe/-/wikis/home" target="_blank">Documentation</a></li>
                    </ul>
                </div>
            </div>

            <!-- Tabs -->
            <div class="tabs">

                <!-- Can the user access the "users" tab? Only allowed for admins -->
                <?php
                    if ($_SESSION['admin'] == true) {
                        echo '<div id="tab-users" class="tab">';
                        echo '<a href="#">Utilisateurs</a>';
                        echo '</div>';
                    }
                ?>

                <div id="tab-collections" class="tab disabled">
                    <a href="#">Collections</a>
                </div>

                <div id="tab-data-sources" class="tab disabled">
                    <a href="#">Entrepôts</a>
                </div>

                <div id="tab-data-layers" class="tab disabled">
                    <a href="#">Couches</a>
                </div>

                <div id="tab-data-themes" class="tab disabled">
                    <a href="#">Thèmes</a>
                </div>

                <!-- Add your other tabs here -->
            </div>

            <!-- Content -->
            <div class="content">

                <!-- JQueryUi Modals -->
                <div id="modal-admin-interface" title="Information"></div>
                <div id="modal-admin-interface-error" title="Erreur"></div>
                <div id="edit-user-role-modal" title="Editer le rôle"></div>

                <!-- Users -->
                <!-- To display only if the user has admin role (called from html/administration_users.html) -->
                <?php
                    if ($_SESSION['admin'] == true) {
                        echo '<div id="content-users" class="content-informations content-window">';
                        include("./components/administration_users.php");
                        echo '</div>';
                    }
                ?>

                <!-- Collections -->
                <!-- For now, it's displayed for every user allowed to access this interface, no need for an "if" statement -->
                <div id="content-collections" class="content-collections content-window hidden">
                <?php include("./components/administration_collections.php") ?>
                </div>

                <!-- Data sources -->
                <!-- For now, it's displayed for every user allowed to access this interface, no need for an "if" statement -->
                <div id="content-data-sources" class="content-data-sources content-window hidden">
                    <?php include("./components/administration_data_sources.php") ?>
                </div>

                <!-- Data layers -->
                <!-- For now, it's displayed for every user allowed to access this interface, no need for an "if" statement -->
                <div id="content-data-layers" class="content-data-layers content-window hidden">
                    <?php include("./components/administration_data_layers.php") ?>
                </div>

                <!-- Data themes -->
                <!-- For now, it's displayed for every user allowed to access this interface, no need for an "if" statement -->
                <div id="content-data-themes" class="content-data-themes content-window hidden">
                    <?php include("./components/administration_data_themes.php") ?>
                </div>

            <!-- Insert new tab here -->
            </div>

        </div>

        <!-- JQuery -->
        <script src="scripts/lib/jquery/jquery-3.5.1.min.js"></script>
        
        <!-- JQuery-UI-->
        <script src="scripts/lib/jquery-ui-1.12.1/jquery-ui.min.js"></script>

        <!-- OpenLayers -->
        <script src="scripts/lib/openlayers/ol.js"></script>

        <!-- OpenLayers extensions -->
        <script src="scripts/lib/openlayers-ext/ol-ext.js"></script>

        <!-- Remarkable (Markdown support) -->
        <script src="scripts/lib/remarkable-2.0.1/remarkable-2.0.1.js"></script>

        <!-- DataTables (easier tables) -->
        <script src="scripts/lib/datatables/datatables.min.js"></script>

        <!-- Interactions -->
        <script src="scripts/administration_interactions.js"></script>

        <!-- Layers -->
        <script src="scripts/map.js"></script>

    </body>

</html>