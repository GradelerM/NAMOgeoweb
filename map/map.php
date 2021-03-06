<?php
session_start() ;

include_once 'config.php';  // charge les différentes variables nécessaires pour les scripts php
include_once './components/loaders.php'; // Including some loaders and other elements to display

header("Content-Type: text/html ; charset=utf-8");
header("Cache-Control: no-cache , private");//anti Cache pour HTTP/1.1
header("Pragma: no-cache");//anti Cache pour HTTP/1.0

// Displaying username
$username = "";

// Hiding information when the user is not authenticated
$show_when_logged = "";

if (isset($_SESSION['user'])) {
  $show_when_logged = "";
} else {
  $show_when_logged = "style='display:none;'";
}

// Showing or hiding informations when the user is an administrator
$show_when_admin_logged = "";

if (isset($_SESSION['user']) && $_SESSION['admin'] == true) {
  $show_when_admin_logged = "";
} else {
  $show_when_admin_logged = "style='display:none;'";
}

// Hiding connexion buttons if session is active
$login_buttons = "";

if (isset($_SESSION['user'])) {
    $login_buttons = "style='display:none;'";
    $username = $_SESSION['user'];
 }

if (!isset($_SESSION['user'])) {
    $login_info = "display:none;";
 }

// Display error when signup problem
$signup_error="";

// Defining a loader to use in the page during Ajax calls
$loader = '<div class="loader-container"><div class="loader"></div></div>';


?>

<!doctype html>
<html lang="fr">

<head>
  <!-- Meta tags -->
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  <meta="description" content="NAMO GeoWeb – <?php echo $project_name; ?>"> <!-- PROJECT NAME -->
  <meta="author" content="GradelerM – NAMO GeoWeb">
  <title><?php echo $project_name; ?></title><!-- PROJECT NAME -->

  <!-- Leaflet (scripts) -->
  <script src="scripts/lib/leaflet/leaflet.js"></script>
  <!-- OpenLayers (scripts) -->
  <script src="scripts/lib/openlayers/ol.js"></script>

  <!-- Leaflet (styles) -->
  <link rel="stylesheet" href="scripts/lib/leaflet/leaflet.css" />
  <!-- OpenLayers (styles) -->
  <link rel="stylesheet" href="scripts/lib/openlayers/ol.css" />
  <!-- OpenLayers extensions (styles) -->
  <link rel="stylesheet" href="scripts/lib/openlayers-ext/ol-ext.min.css" />
  <!-- JQuery-UI (styles) -->
  <link rel="stylesheet" href="scripts/lib/jquery-ui-1.12.1/jquery-ui.min.css" />
  <!-- Project stylesheet -->
  <link rel="stylesheet" href="styles/styles.css?v=1.1">
  <link rel="stylesheet" href="styles/override.css?v=1.1">
  <link rel="stylesheet" href="styles/temp.css?v=1.1"> <!-- Temporary styles for hiding unready elements -->

</head>

<body>
    <!-- Main icons -->
  <svg style="display: none;">
    <symbol id="iconeMenu" viewBox="0 0 24 24">
      <path d="M0 2H24V6H0V2Z" />
      <path d="M0 10H24V14H0V10Z" />
      <path d="M24 18H0V22H24V18Z" />
    </symbol>

    <symbol id="iconeArrow" viewBox="0 0 24 24">
      <path d="M18 12L9 22.3923L9 1.6077L18 12Z" />
    </symbol>

    <symbol id="iconeInfo" viewBox="0 0 24 24">
      <path d="M12 9C13.1046 9 14 8.10457 14 7C14 5.89543 13.1046 5 12 5C10.8954 5 10 5.89543 10 7C10 8.10457 10.8954 9 12 9Z"/>
      <path d="M10 12L9 10H14V19H10V12Z"/>
      <path fill-rule="evenodd" clip-rule="evenodd" d="M24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12ZM21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>
    </symbol>

    <!-- Tabs menu icons -->
    <symbol id="iconeCouches" viewBox="0 0 24 24">
      <path d="M12 3L0 7.73684L12 12L24 7.73684L12 3Z" />
      <path d="M12 21L0 16.5L3.36 15.0789L12 18.1579L20.16 15.0789L23.76 16.5L12 21Z" />
      <path d="M12 16.5L0 12L3.36 10.5789L12 13.6579L20.16 10.5789L23.76 12L12 16.5Z" />
    </symbol>

    <symbol id="iconeFondsCarte" viewBox="0 0 24 24">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M0 2V20.846L8.24398 21.9059L15.756 20.9401L24 22V3.15405L15.756 2.09411L8.24398 3.05994L0 2ZM7.71108 20.3765L8.24398 20.445L8.48795 20.4136V4.4895L8.24398 4.52087L7.71108 4.45235V20.3765ZM15.2231 3.62355V19.5477L15.756 19.4791L16 19.5105V3.5864L15.756 3.55503L15.2231 3.62355Z" />
    </symbol>

    <symbol id="iconeGraphiques" viewBox="0 0 24 24">
      <path d="M0.0878906 9.24185L11.3153 2L21.4799 3.99977L21.6592 3.36855L23.3167 5.22694L20.8368 6.26357L21.0639 5.46426L11.6414 3.61051L0.955727 10.503L0.0878906 9.24185Z" />
      <path d="M15.6522 8.47643H8.34783V22H15.6522V8.47643Z" />
      <path d="M16.6957 11.5301H24V22H16.6957V11.5301Z" />
      <path d="M0 16.3288H7.30435V22H0V16.3288Z" />
    </symbol>

    <symbol id="iconeModeles" viewBox="0 0 24 24">
      <path d="M0 3H10.08V7.77551H5.76V9.61225H10.08V14.3878L5.76 14.3878V16.2245H10.08V17.2315L15.5107 14.3878H13.92V9.61225H24V14.3878H18.4984L10.08 18.7959V21H0V16.2245H4.32V14.3878L0 14.3878V9.61225H4.32V7.77551H0V3Z" />
    </symbol>

    <symbol id="iconeStorytelling" viewBox="0 0 24 24">
      <path d="M18.9767 6.83895L14.5116 7.34471L14.407 5.9111L18.8721 5.40535L18.9767 6.83895Z" />
      <path d="M18.9767 12.908L14.5116 13.4137L14.407 11.9801L18.8721 11.4744L18.9767 12.908Z" />
      <path d="M18.9767 9.87346L14.5116 10.3792L14.407 8.94561L18.8721 8.43986L18.9767 9.87346Z" />
      <path fill-rule="evenodd" clip-rule="evenodd" d="M2.0707 2V4.46177L0 4.31019V20.1216L12 21L24 20.1216V4.31019L21.9293 4.46177V2L12 2.97579L2.0707 2ZM3.5107 18.432V3.58586L11.1628 4.33786V19.184L3.5107 18.432ZM12.6028 19.2071V4.3609L20.4893 3.58586V18.432L12.6028 19.2071Z" />
    </symbol>

    <symbol id="iconeZoneEtude" viewBox="0 0 24 24">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M24 3V21H0V3H24ZM1.44 4.42105H12V11.6589H1.44V4.42105Z" />
    </symbol>

    <symbol id="iconeMarker" viewBox="0 0 24 24">
      <path fill-rule="evenodd" clip-rule="evenodd" d="M18 8.08696C18 9.4429 17.563 10.6953 16.824 11.7071L12 22L7.17599 11.7071C6.43703 10.6953 6 9.4429 6 8.08696C6 4.72522 8.68629 2 12 2C15.3137 2 18 4.72522 18 8.08696ZM12 10.6957C13.4202 10.6957 14.5714 9.5277 14.5714 8.08696C14.5714 6.64621 13.4202 5.47826 12 5.47826C10.5798 5.47826 9.42857 6.64621 9.42857 8.08696C9.42857 9.5277 10.5798 10.6957 12 10.6957Z" />
    </symbol>

    <symbol id="iconeMarkerAdd" viewBox="0 0 24 24">
      <path d="M13.9412 10.6957H10.4118V10.0314C9.87022 9.55373 9.52941 8.85957 9.52941 8.08696C9.52941 7.31435 9.87022 6.62019 10.4118 6.14252V5.47826H13.9412V2.25207C13.382 2.08807 12.7897 2 12.1765 2C8.7653 2 6 4.72522 6 8.08696C6 9.4429 6.44988 10.6953 7.21057 11.7071L12.1765 22L15.9522 14.1739H13.9412L13.9412 10.6957Z" />
      <path d="M21 7.22559H17.4105V3.73913H15.766V7.22559H12.1765V8.6612H15.766V12.4348H17.4105V8.6612H21V7.22559Z" />
    </symbol>

    <symbol id="iconeMarkerEdit" viewBox="0 0 24 24">
      <path d="M12.3649 2C14.5349 2 16.4513 3.0385 17.6002 4.62416L14.8058 9.25287C14.9894 8.902 15.0927 8.50602 15.0927 8.08696C15.0927 6.64621 13.8714 5.47826 12.3649 5.47826C10.8584 5.47826 9.63709 6.64621 9.63709 8.08696C9.63709 9.5277 10.8584 10.6957 12.3649 10.6957C13.3173 10.6957 14.1557 10.2289 14.6436 9.52145L12.6462 12.83L13.6962 18.0474L14.455 17.796L12.3649 22L7.24751 11.7071C6.46361 10.6953 6 9.4429 6 8.08696C6 4.72522 8.84966 2 12.3649 2Z" />
      <path d="M23 6.11483L19.8502 4.3757L18.9409 5.88183L22.0907 7.62096L23 6.11483Z" />
      <path d="M18.4863 6.6349L21.6361 8.37403L17.999 14.3986L14.8492 12.6594L18.4863 6.6349Z" />
      <path d="M17.3334 15.0351L14.6056 13.529V16.5412L17.3334 15.0351Z" />
    </symbol>

    <symbol id="iconeMarkerRemove" viewBox="0 0 24 24">
      <path d="M11.9218 22L16.4901 12.1241L16.0666 11.6888L13.6739 14.1483L10.0847 10.4591L10.378 10.1576C9.77355 9.68077 9.38391 8.93063 9.38391 8.08696C9.38391 7.19839 9.81612 6.41358 10.4762 5.94253L10.0847 5.54006L13.3543 2.17928C12.8956 2.06216 12.4158 2 11.9218 2C8.6513 2 6 4.72522 6 8.08696C6 9.4429 6.43134 10.6953 7.16067 11.7071L11.9218 22Z" />
      <path d="M16.0666 4.31031L14.3285 2.52366C15.0992 2.87643 15.783 3.39345 16.3379 4.03144L16.0666 4.31031Z" />
      <path d="M20 10.4557L17.2269 7.80677L19.7668 4.99745L18.4963 3.7839L15.9564 6.59322L13.1833 3.94429L12.1374 5.10107L14.9106 7.75L12.1615 10.7907L13.432 12.0042L16.181 8.96355L18.9542 11.6125L20 10.4557Z" />
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

    <!-- Insert your SVG symbol above this comment -->

  </svg>

  <div class="wrapper">

    <!-- Hide the screen while the app is loading -->
    <div id="loadingscreen" class="loading-screen"> <!-- HORIZONTAL LOGO -->
      <?php echo '<img src="images/assets/logos/'.$horizontal_logo.'" width="200" title="logo" alt="logo" />'; ?>
      <div class="loader"></div>
    </div>

    <!-- Tools navigation bar (left) -->
    <div class="navbar notOnMobile"> <!-- VERTICAL LOGO -->
      <?php echo '<a href="#" id="logo" class="notOnMobile accueil-link"><img src="images/assets/logos/'.$vertical_logo.'" width="56" title="logo" alt="logo" /></a>'; ?>
      <ul class="hide-scrollbar notOnMobile">

        <!-- ROI -->
        <li class="navlink-tooltip-anchor">
          <a href="#" id="navlink-ZoneEtude" class="navlink">
            <svg class="nav-tab-icon"><use xlink:href="#iconeZoneEtude" /></svg>
            <p>Zones d'étude</p>
          </a>
        </li>
        <!-- Information tooltip -->
        <span class="navlink-tooltip">
          Naviguez d'une zone d'étude du projet à l'autre
        </span>

        <!-- Basemap -->
        <li class="navlink-tooltip-anchor">
          <a href="#" id="navlink-FondsCarte" class="navlink">
            <svg class="nav-tab-icon"><use xlink:href="#iconeFondsCarte" /></svg>
            <p>Fonds de carte</p>
          </a>
        </li>
        <!-- Information tooltip -->
        <span class="navlink-tooltip">
          Choisissez un fond de carte
        </span>

        <!-- Layers -->
        <li class="navlink-tooltip-anchor">
          <a href="#" id="navlink-Couches" class="navlink">
            <svg class="nav-tab-icon"><use xlink:href="#iconeCouches" /></svg>
            <p>Couches</p>
          </a>
        </li>
        <!-- Information tooltip -->
        <span class="navlink-tooltip">
          Sélectionnez les couches à afficher sur la carte
        </span>

        <!-- Graphs -->
        <li class="navlink-tooltip-anchor" style="display: none;">
          <a href="#" id="navlink-Graphiques" class="navlink">
            <svg class="nav-tab-icon"><use xlink:href="#iconeGraphiques" /></svg>
            <p>Graphiques</p>
          </a>
        </li>
        <!-- Information tooltip -->
        <span class="navlink-tooltip">
          Visualisez des graphiques associés à la carte
        </span>

        <!-- Storymaps -->
        <li class="navlink-tooltip-anchor">
          <a href="#" id="navlink-Storytelling" class="navlink active">
            <svg class="nav-tab-icon"><use xlink:href="#iconeStorytelling" /></svg>
            <p>Cartes narratives</p>
          </a>
        </li>
        <!-- Information tooltip -->
        <span class="navlink-tooltip">
          Découvrez plusieurs histoires sous forme de carte narrative.
        </span>

        <!-- Models -->
        <li class="navlink-tooltip-anchor" style="display: none;">
          <a href="#" id="navlink-Modeles" class="navlink">
            <svg class="nav-tab-icon"><use xlink:href="#iconeModeles" /></svg>
            <p>Modèles</p>
          </a>
        </li>
        <!-- Information tooltip -->
        <span class="navlink-tooltip">
          Modélisez le socio-écosystème lagunaire
        </span>

      </ul>
    </div>


    <!-- Navigation through website -->
    <div class="headerNav">

      <!-- Navigation links -->
      <div id="navList">
        <ul>
          <li><a href="#" class="accueil-link">Accueil</a></li>
          <li><a href="#" id="apropos-link">A propos</a></li>
          <li><a href="#" id="aide-link" class="">Aide</a></li>
          <li><a href="storytool.php" target="_blank" id="contribuer-link" class="" <?php echo $show_when_logged;?>>Contribuer</a></li>
          <li><a href="administration.php" target="_blank" id="administration-link" class="" <?php echo $show_when_admin_logged;?>>Administration</a></li>
        </ul>
      </div>

      <!-- "Accueil" modal -->
      <div id="accueil-modal" class="modal notOnMobile">
        <!-- Content -->
        <div class="modal-content">
          <span class="close-modal">&times;</span>
          <p><b>Vous vous apprêtez à quitter la carte</b></p>
          <p>
            Retournez sur la page d'accueil vous fera quitter la carte. Pour ne pas perdre l'état de 
            votre session de consultation, vous pouvez ouvrir la page d'accueil dans un nouvel onglet.
          </p>
          <button class="mainButton negativebtn" onclick="window.location.href='/';">Je veux quitter</button>
          <button class="mainButton positivebtn" onclick="window.open('/', '_blank');">Nouvel onglet</button>
          <button class="mainButton classic stop-modal">Annuler</button>
        </div>
      </div>

      <!-- Info modals for header links -->
      <!-- "A propos" modal -->
      <div id="apropos-modal" class="apropos-modal modal notOnMobile">
        <!-- Content -->
        <div class="modal-content">
          <span class="close-modal">&times;</span>
          <h4>Bienvenue dans l'atlas interactif NAMO GeoWeb du projet <?php echo $project_name;?></h4>
          <div class="scrollable">

            <!-- Append modal content -->
            <?php include("./components/about.html") ?>

          </div>
        </div>
      </div>

      <!-- "Aide" modal -->
      <div id="aide-modal-0" class="modal notOnMobile">
        <!-- Content -->
        <div class="modal-content">
          <span class="close-modal">&times;</span>
          <p><b>Bienvenue dans le tutoriel de l'application NAMO GeoWeb – <?php echo $project_name; ?></b></p>
          <p> <!-- PROJECT NAME -->
            Découvrez pas-à-pas le fonctionnement de la carte interactive du
            projet Rivage Guadeloupe. Pour de plus amples informations sur les fonctionnalités,
            référez-vous à la <a href="<?php echo $repo_link; ?>" target="_blank">documentation</a>.
          </p> <!-- REPO LINK -->
          <div class="modal-nav"><a class="modal-next">Suivant ></a></div>
        </div>
      </div>

      <!-- "Aide" modal -->
      <div id="aide-modal-1" class="modal notOnMobile">
        <!-- Content -->
        <div class="modal-content tooltip-modal">
          <span class="close-modal">&times;</span>
          <p>
            Commencez par choisir une zone d'étude du projet que vous voulez explorer.
          </p>
          <div class="modal-nav"><a class="modal-next">Suivant ></a></div>
        </div>
      </div>

      <!-- "Aide" modal -->
      <div id="aide-modal-2" class="modal notOnMobile">
        <!-- Content -->
        <div class="modal-content tooltip-modal">
          <span class="close-modal">&times;</span>
          <p>
            Choisissez ensuite le fond de carte qui vous convient pour visualiser
            les données.
          </p>
          <div class="modal-nav"><a class="modal-next">Suivant ></a></div>
        </div>
      </div>

      <!-- "Aide" modal -->
      <div id="aide-modal-3" class="modal notOnMobile">
        <!-- Content -->
        <div class="modal-content tooltip-modal">
          <span class="close-modal">&times;</span>
          <p>
            Parcourez les couches de données par catégorie. Cochez ou non celles-ci
            pour les afficher sur la carte, consultez leur légende et faites varier
            leur opacité pour ajuster votre carte.
          </p>
          <div class="modal-nav"><a class="modal-next">Suivant ></a></div>
        </div>
      </div>

      <!-- "Aide" modal -->
      <div id="aide-modal-4" class="modal notOnMobile">
        <!-- Content -->
        <div class="modal-content tooltip-modal">
          <span class="close-modal">&times;</span>
          <p>
            Si vous ne savez pas par où commencer, le mieux est de découvrir le projet
            à travers les histoires qui vous sont proposées. Laissez-vous guider !
          </p>
          <div class="modal-nav"><a class="modal-next">Suivant ></a></div>
        </div>
      </div>

      <!-- "Aide" modal -->
      <div id="aide-modal-5" class="modal notOnMobile">
        <!-- Content -->
        <div class="modal-content">
          <span class="close-modal">&times;</span>
          <p><b>Vous pouvez maintenant explorer la carte et ses fonctionnalités !</b></p>
          <p> <!-- REPO LINK -->
            Pour ceux qui souhaitent en savoir plus, rendez-vous sur le
            <a href="<?php echo $repo_link; ?>" target="_blank">GitLab du projet</a>.
          </p>
          <div class="modal-nav"><a class="fin">J'ai compris !</a></div>
        </div>
      </div>

      <!-- Authentication modal -->
      <div id="authentication-modal" class="modal notOnMobile">
        <!-- Content -->
        <div class="modal-content">
          <span class="close-modal">&times;</span>
          <p><b>Authentification</b></p>
          <p>
            Connectez-vous si vous disposez déjà d'un accès authentifié à l'application.
            <form action="/map/login.php" method="post">
              <label for="username">Nom d'utilisateur:</label>
              <input type="text" id="username" name="username" class="noSpace"><br>
              <label for="password">Mot de passe:</label>
              <input type="password" id="password" name="password" class="noSpace"><br>
              <input type="submit" value="Envoyer">
            </form> 
          </p>
        </div>
      </div>

      <!-- Sign up modal -->
      <div id="signup-modal" class="modal notOnMobile">
        <!-- Content -->
        <div class="modal-content">
          <span class="close-modal">&times;</span>
          <p><b>Inscription</b></p>
          <p>
            Inscrivez-vous pour utiliser les fonctionnalités de contribution de l'application.
            <form id="signup-form" action="" method="post" onsubmit="return false;">
              <label for="signup_username">Nom d'utilisateur:</label>
              <input type="text" id="signup_username" name="username" class="noSpace"><br>
              <label for="signup_password">Mot de passe:</label>
              <input type="password" id="signup_password" name="password" class="noSpace"><br>
              <label for="signup_mail">Adresse mail:</label>
              <input type="mail" id="signup_mail" name="email" class="noSpace"><br>
              <label for="signup_motivations">Expliquez en quelques lignes pourquoi vous souhaitez créer un compte:</label>
              <textarea id="signup_motivations" name="motivations" class="" form="signup-form" maxlength="1000"></textarea><br>
              <input type="submit" value="Envoyer">
            </form> 
            <div id="signup-success-message"></div>
            <div id="signup-error-message"></div>
          </p>
        </div>
      </div>

      <!-- Layer metadata modal -->
      <div id="layer-metadata-modal" class="modal notOnMobile">
        <!-- Content -->
        <div class="modal-content">
          <span class="close-modal">&times;</span>
          <p style="text-align: left;"><b>Nom de la couche : </b><span class="layer-metadata-name"></span></p>
          <p style="text-align: left;"><b>Lien vers la source : </b><br><span class="layer-metadata-url"></span></p>
        </div>
      </div>

      <!-- Button to toggle menu on medium screen -->
      <div class="navButton notOnLarge notOnMobile">
        <button id="medium-nav-button"><svg class="menu-burger-icon"><use xlink:href="#iconeMenu" /></svg></button>
      </div>

    </div>

    <!-- Research and connexion navbar : dropdown on medium screen -->
    <div id="medium-nav" class="headerTools notOnMobile">

      <!-- Research div -->
      <div id="recherche" style="display: none;">
        <button class="mainButton disabled">Rechercher</button>
        <input type="search" id="recherche" name="recherche" disabled="disabled">
      </div>

      <!-- Connexion div -->
      <div id="connexion">
        <button id="login-button" class="mainButton classic" <?php echo $login_buttons;?>>Se connecter</button>
        <button id="signup-button" class="mainButton positivebtn" <?php echo $login_buttons;?>>S'inscrire</button>
        <span style="font-size: 0.8em; margin-right: 12px; <?php echo $login_info?>">Utilisateur : <?php echo $username;?></span>
        <button id="logout-button" class="mainButton cta" style="<?php echo $login_info?>">Se déconnecter</button>
      </div>

    </div>

    <!-- Button to toggle menu on small screen (and small logo) -->
    <div class="navButton headerXS"> <!-- HORIZONTAL LOGO -->
      <?php echo '<a href="#" id="logoXS"><img src="images/assets/logos/'.$horizontal_logo.'" height="28px"/></a>'; ?>
      <!-- Burger menu dropdown in case it's needed for a mobile version -->
      <!-- <button id="small-nav-button"><svg class="menu-burger-icon"><use xlink:href="#iconeMenu" /></svg></button> -->
      <div id="mobile-back-to-menu"><a href="#" class="accueil-link">Accueil</a></div>
    </div>

    <!-- Mobile and small screen content -->
    <div class="mobileContent">
      <p style="margin-top: 80px;">
        La taille de votre écran n'est pas suffisante pour utiliser confortablement l'application 
        et la version mobile n'est pas encore disponible.</br>
        </br>
        Merci d'utiliser un autre appareil pour naviguer dans la carte.
      </p>
    </div>
    <!-- End of mobile content div -->

    <!-- Div containing the map and map tools -->

    <!-- Map area -->
    <div class="mappingArea notOnMobile">
      <div id="map" class="map"></div>
    </div>

    <!-- popup div -->
    <div id="popup" class="ol-popup notOnMobile">
      <a href="#" id="popup-closer" class="ol-popup-closer"></a>
      <div id="popup-content" class="ol-popup-content"></div>
    </div>

    <!-- popup div for deleting marker -->
    <div id="delete-marker-pop" class="delete-marker-popup notOnMobile">
      <div id="delete-marker-pop-content" class="delete-marker-popup-content">
        <p>Supprimer ce marqueur ?</p>
        <p class="note">Cette action est définitive !</p>
        <div>
          <button id="delete-marker-confirm" class="confirm">Oui</button>
          <button id="delete-marker-abort" class="abort">Non</button>
        </div>
      </div>
    </div>

    <!-- End of mapping div -->

    <!-- Custom controls div -->
    <div id="customcontrols" class="customcontrols notOnMobile">
      <div class="custom-control-box notOnMobile">
        <div>
          <button id="marker-control" class="custom-control">
            <svg class="control-icon"><use xlink:href="#iconeMarker" /></svg>
          </button>
          <div class="control-dropdown collapsed">
            <button id="add-marker" class="custom-control green">
              <svg class="control-icon"><use xlink:href="#iconeMarkerAdd" /></svg>
            </button>
            <button id="edit-marker" class="custom-control purple">
              <svg class="control-icon"><use xlink:href="#iconeMarkerEdit" /></svg>
            </button>
            <button id="remove-marker" class="custom-control red">
              <svg class="control-icon"><use xlink:href="#iconeMarkerRemove" /></svg>
            </button>
          </div>
        </div>
      </div>
      <!--
      <div class="custom-control-box notOnMobile">
        <div>
          <button id="measure-control" class="custom-control">
            <svg class="control-icon"><use xlink:href="#iconeArrow" /></svg>
          </button>
        </div>
      </div>
      -->
      <div>
        <!-- Space for adding buttons, don't forget to give the div a class="custom-control-box notOnMobile" -->
        <!-- See examples above -->
      </div>
      <div id="map-message" class="map-message-displayed">
        <button id="back-to-library-control" class="mainButton positivebtn library">Fermer la carte narrative</button>
      </div>
    </div>
    <!-- End of custom controls div -->

    <!-- Floating legend div -->
    <div class="floatLegend notOnMobile">
      <div class="floatLegend-flex-container">
        <div class="legend-tabs-grid">
          <div><button id="thematic-legend" class="floatLegend-button legend-active">Légende</button></div>
          <!-- <div><button id="model-legend" class="floatLegend-button">Modèle</button></div> -->
        </div>
        <div id="thematic-float" class="float-legend-content">
          <p id="float-empty-message"><i>Aucune couche affichée</i></p>
          <!-- Filled with loadLayers.js -->
        </div>

        <!-- Second floating legend tab -->
        <div id="model-float" class="float-legend-content">
          <div class="legend-float"><p><i>En construction</i></p></div>
        </div>

      </div>

    </div>
    <!-- End of floating legend div -->

    <!-- Divs containing the different tool tabs (collapsible) -->

    <div id="tab-ZoneEtude" class="tab tab-small notOnMobile hide shrink">
      <div class="tab-puller">
        <svg class="tab-rectangle" width="20" height="28"><rect width="24" height="32"/></svg>
        <svg id="arrow-ZoneEtude" class="tab-arrow"><use xlink:href="#iconeArrow" /></svg>
      </div>
      <div class="tab-content">
       
        <!-- Insert your "tab-box" div here -->
        <?php include("./regions_of_interest.html"); ?>

      </div>
    </div>

    <div id="tab-FondsCarte" class="tab tab-small notOnMobile hide shrink">
      <div class="tab-puller">
        <svg class="tab-rectangle" width="20" height="28"><rect width="24" height="32"/></svg>
        <svg id="arrow-FondsCarte" class="tab-arrow"><use xlink:href="#iconeArrow" /></svg>
      </div>
      <div class="tab-content">
        <!-- planOSM thumbnail -->
        <div class="tab-box">
          <div class="box-title">
            <p>Open Street Map</p>
            <a href="#"><svg class="info-link"><use xlink:href="#iconeInfo" /></use></svg></a>
          </div>
          <a id="planOSM-toggle" class="plan plan-active" href="#">
            <div class="map-thumbnail">
              <img src="images/assets/thumbnails/planOSM_thumbnail.png" />
            </div>
            <div class="map-thumbnail-banner">
              <p>Cliquez pour afficher</p>
            </div>
          </a>
        </div>
        <!-- planESRI thumbnail -->
        <div class="tab-box">
          <div class="box-title">
            <p>ESRI - World Imagery</p>
            <a href="#"><svg class="info-link"><use xlink:href="#iconeInfo" /></use></svg></a>
          </div>
          <a id="planESRI-toggle" class="plan" href="#">
            <div class="map-thumbnail">
              <img src="images/assets/thumbnails/planESRI_thumbnail.png" />
            </div>
            <div class="map-thumbnail-banner">
              <p>Cliquez pour afficher</p>
            </div>
          </a>
        </div>
        <!-- planESRI_WTM thumbnail -->
        <div class="tab-box">
          <div class="box-title">
            <p>ESRI - World Topographic Map</p>
            <a href="#"><svg class="info-link"><use xlink:href="#iconeInfo" /></use></svg></a>
          </div>
          <a id="planESRI_WTM-toggle" class="plan" href="#">
            <div class="map-thumbnail">
              <img src="images/assets/thumbnails/planESRI_WTM_thumbnail.png" />
            </div>
            <div class="map-thumbnail-banner">
              <p>Cliquez pour afficher</p>
            </div>
          </a>
        </div>

        <!-- Insert your "tab-box" div here -->
      </div>
    </div>

    <div id="tab-Couches" class="tab tab-medium notOnMobile hide shrink">
      <div class="tab-puller">
        <svg class="tab-rectangle" width="20" height="28"><rect width="24" height="32"/></svg>
        <svg id="arrow-Couches" class="tab-arrow"><use xlink:href="#iconeArrow" /></svg>
      </div>
      <div id="tab-Couches-content" class="tab-content">
      <?php echo $loader;?>
      <p class="info-error"></p>
        <!-- Filled with loadLayers.js -->
      </div>
    </div>

    <!-- Note : as the graphs aren't ready, they aren't displayed in the app for now -->
    <div id="tab-Graphiques" class="tab tab-medium block-min-width notOnMobile hide shrink" style="display: none;">
      <div class="tab-puller">
        <svg class="tab-rectangle" width="20" height="28"><rect width="24" height="32"/></svg>
        <svg id="arrow-Graphiques" class="tab-arrow"><use xlink:href="#iconeArrow" /></svg>
      </div>
      <div class="tab-content">
        <!-- Help section at top -->
        <div id="graphiques-help" class="help-title">
          <a href="#" class="help-toggle">
            <svg class="theme-arrow deployedArrow"><use xlink:href="#iconeArrow" /></use></svg>
            <p class="help title">Aide</p>
          </a>
        </div>
        <div id="graphiques-help-text" class="help-text">
          <p style="color: #8C8C8E;">
            <span style="color: #FF3333;"> <b>Cette fonctionnalité n'est pas encore disponible.</b></span>
            <br />Afficher une couche sur la carte fait apparaître le(s) graphique(s) associé(s).<br />
            Sélectionnez une commune pour filtrer les données des graphiques :
            cliquez sur le bouton <b>"Sélectionner"</b> puis sur une commune sur la carte.
            Si vous voulez sélectionner une autre commune, recommencez. Enfin, si vous
            souhaitez ne sélectionner aucune commune sur la carte, cliquer sur
            <b>"Supprimer"</b>.
          </p>
        </div>
        <!-- End of help section -->
        <!-- Selection buttons on top -->
        <div id="selection-buttons" class="div-selection-buttons">
          <button id="select-commune" class="mainButton positivebtn disabled">Sélectionner une commune</button>
          <button id="select-reset" class="mainButton negativebtn disabled">Supprimer ma sélection</button>
        </div>
        <hr />
        <!-- Population graph div -->
        <div id="graph-population" class="graph-box">
          <div id="selected-commune-name"><span>Mauguio</span></div>
          <div class="graph-info">
            <p>Evolution de la population au cours du temps</p>
            <a href="#"><svg class="info-link"><use xlink:href="#iconeInfo" /></use></svg></a>
          </div>
          <!-- Insérer la div pour sélectionner l'étendue temporelle ici -->
          <div id="graph-population-dataviz"></div>
          <hr />
        </div>

        <!-- Insert your graph div here -->
      </div>
    </div>

    <div id="tab-Storytelling" class="tab tab-medium notOnMobile">
      <!-- Commenting tab-puller since it is very buggy with the size-adaptation thing
      <div class="tab-puller">
        <svg class="tab-rectangle" width="20" height="28"><rect width="24" height="32"/></svg>
        <svg id="arrow-Storytelling" class="tab-arrow"><use xlink:href="#iconeArrow" /></svg>
      </div>
      -->
      <div class="tab-content no-margin no-padding">
        <!-- Stories library -->
        <div id="bibliotheque-narration" class="storymap-library">
          <p class="story-collection-header">Collection des cartes narratives</p>
          <hr/>
          <?php echo $loader;?>
          <div id="story-collection-themes"></div>
          <p class="error">
            Une erreur est survenue. Essayez de recharger l'application. Si le problème persiste,
            merci de contacter un administrateur.
          </p>
        </div>
        <!-- Actual story container -->
        <div id="story-and-buttons" class="story-and-buttons">
          <div id="story-header" class="story-header">
            <div id="back-to-library-arrow"> < </div>
            <div id="font-size-controls" class="font-size-controls">
              <a href="#" id="font-scale-up"><svg><use xlink:href="#fontScaleUp" /></use></svg></a>
              <a href="#" id="font-scale-down"><svg><use xlink:href="#fontScaleDown" /></use></svg></a>
            </div>
            <div id="story-map-ratio-control" class="story-map-ratio-control">
              <svg><use xlink:href="#smallTab" /></use></svg>
              <div id="story-map-ratio-slider"></div>
              <svg><use xlink:href="#bigTab" /></use></svg>
            </div>
          </div>
          <div id="story" class="story-container"></div>
          <div id="story-footer" class="story-footer">
            <button id="back-to-library" class="mainButton positivebtn library">Retourner à la bibliothèque des cartes narratives</button>
          </div>
        </div>
      </div>
    </div>

    <div id="tab-Modeles" class="tab tab-large block-min-width notOnMobile hide shrink" style="display: none;">
      <div class="tab-puller">
        <svg class="tab-rectangle" width="20" height="28"><rect width="24" height="32"/></svg>
        <svg id="arrow-Modeles" class="tab-arrow"><use xlink:href="#iconeArrow" /></svg>
      </div>
      <div class="tab-content">

        <!-- Disabled message -->
        <div id="disabled-model-message">
          <p>
            Veuillez quitter le mode narration pour accéder à l'outil de modélisation
            (bouton "Quitter la narration" de l'onglet "Carte Narratives" ou dans la barre 
            d'outils en haut à droite de la carte).
          </p>
        </div>

        <div id="modele-tools">
          <!-- Ask for the study area -->
          <div id = modele-area>
            <label for="area-choice">Sélectionnez une zone d'étude :</label>
            <select name="area-choice" id="area-choice">
              <option value="empriseMediterrannee">Méditerrannée</option>
              <option value="empriseLaguneBiguglia">Lagune de Biguglia</option>
              <option value="empriseOccitanieEst">Est de l'Occitanie</option>
              <option value="empriseEtangOr">Etang de l'Or</option>
              <option value="empriseEtangsPalavasiens">Etangs palavasiens</option>
            </select>
            <button id="fly-to-area" class="mainButton positivebtn">S'y rendre</button>
          </div>

          <!-- Displaying selected layers and select DPSIR attribute -->
          <div id="select-DPSIR">
            <p>
            Composez votre modèle DPSIR à partir des couches affichées sur la carte.
            Choisissez un état à référencer et au moins une pression et un impact associés
            pour un modèle valide.
            </p>
            <div id="dpsir-message" class="invalid">
              <p id="dpsir-message-title">Modèle invalide</p>
              <ul id="dpsir-error-list">
                <li id="missing-state" class="dpsir-error">Etat manquant (ajoutez une couche "état" unique)</li>
                <li id="too-many-states" class="dpsir-error">Il y a plus d'un état (retirez une couche "état")</li>
                <li id="missing-pressure" class="dpsir-error">Pression manquante (ajoutez au moins une couche "pression")</li>
                <li id="missing-impact" class="dpsir-error">Impact manquant (ajoutez au moins une couche "impact")</li>
              </ul>
            </div>
            <!-- The displayed layers are listed here via the "loadLayers" script -->
          </div>

          <!-- Start of the diagram section -->
          <div id="diagram-section">
            <div id="diagram-driver" class="DPSIR-box">
              <p>Forces Motrices</p>
            </div>
            <div id="diagram-pressure" class="DPSIR-box">
              <p>Pressions</p>
            </div>
            <div id="diagram-state" class="DPSIR-box">
              <p>Etat</p>
            </div>
            <div id="diagram-impact" class="DPSIR-box">
              <p>Impacts</p>
            </div>
            <div id="diagram-response" class="DPSIR-box">
              <p>Réponses</p>
            </div>

            <!-- Diagram arrows -->
            <!-- Driver-Pressure arrow -->
            <div id="diagram-arrow-driver-pressure">
              <svg width="100%" height="100%">
                <defs>
                  <marker id="marker-driver-pressure" viewBox="0 0 10 10"
                  refX="5" refY="5" markerWidth="5" markerHeight="5"
                  orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" />
                  </marker>
                </defs>
                <polyline id="driverpressure" class="diagram-link" stroke-width="2px"
                points="75,0 75,16"
                marker-end="url(#marker-driver-pressure)" />
              </svg>
            </div>
            <!-- Pressure-State arrow -->
            <div id="diagram-arrow-pressure-state">
              <svg width="100%" height="100%">
                <defs>
                  <marker id="marker-pressure-state" viewBox="0 0 10 10"
                  refX="5" refY="5" markerWidth="5" markerHeight="5"
                  orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" />
                  </marker>
                </defs>
                <polyline id="pressurestate" class="diagram-link" stroke-width="2px"
                points="75,0 75,16"
                marker-end="url(#marker-pressure-state)" />
              </svg>
            </div>
            <!-- State-Impact arrow -->
            <div id="diagram-arrow-state-impact">
              <svg width="100%" height="100%">
                <defs>
                  <marker id="marker-state-impact" viewBox="0 0 10 10"
                  refX="5" refY="5" markerWidth="5" markerHeight="5"
                  orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" />
                  </marker>
                </defs>
                <polyline id="stateimpact" class="diagram-link" stroke-width="2px"
                points="75,0 75,16"
                marker-end="url(#marker-state-impact)" />
              </svg>
            </div>
            <!-- Impact-Response arrow -->
            <div id="diagram-arrow-impact-response">
              <svg width="100%" height="100%">
                <defs>
                  <marker id="marker-impact-response" viewBox="0 0 10 10"
                  refX="5" refY="5" markerWidth="5" markerHeight="5"
                  orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" />
                  </marker>
                </defs>
                <polyline id="impactresponse" class="diagram-link" stroke-width="2px"
                points="150,178 190,108"
                marker-end="url(#marker-impact-response)" />
              </svg>
            </div>
            <!-- Response arrows -->
            <div id="diagram-arrow-response">
              <svg width="100%" height="100%">
                <defs>
                  <marker id="marker-response" viewBox="0 0 10 10"
                  refX="5" refY="5" markerWidth="5" markerHeight="5"
                  orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" />
                  </marker>
                </defs>
                <polyline id="responseimpact" class="diagram-link" stroke-width="2px"
                points="190,98 150,168"
                marker-end="url(#marker-response)" />
                <polyline id="responsestate" class="diagram-link" stroke-width="2px"
                points="190,94 154,118"
                marker-end="url(#marker-response)" />
                <polyline id="responsepressure" class="diagram-link" stroke-width="2px"
                points="190,88 154,68"
                marker-end="url(#marker-response)" />
              </svg>
            </div>

          </div>
          <!-- End of diagram section -->

        </div>

      </div>
    </div>

    <!-- End of tool tabs div -->

  </div>

  <!-- JQuery -->
  <script src="scripts/lib/jquery/jquery-3.5.1.min.js"></script>

  <!-- JQuery-UI-->
  <script src="scripts/lib/jquery-ui-1.12.1/jquery-ui.min.js"></script>

  <!-- OpenLayers extensions -->
  <script src="scripts/lib/openlayers-ext/ol-ext.js"></script>

  <!-- D3.js -->
  <script src="scripts/lib/d3js-5.16.0/d3.min.js"></script>

  <!-- jquery-csv for parsing CSVs server side (storytelling)-->
  <script src="scripts/lib/jquery-csv/jquery.csv.min.js"></script>

  <!-- PapaParse for parsing CSVs client side (DPSIR model)-->
  <script src="scripts/lib/papaparse-5.0/papaparse.min.js"></script>

  <!-- Remarkable (Markdown support) -->
  <script src="scripts/lib/remarkable-2.0.1/remarkable-2.0.1.js"></script>


  <!-- Mapping scripts -->
  <script src="scripts/loadingscreen.js"></script>
  <script src="scripts/map.js"></script>
  <script src="scripts/mapInteractions.js"></script>
  <script src="scripts/load_layers.js"></script> <!-- Loading layers in "Couches" -->
  <script src="scripts/storymaps_templates.js"></script> <!-- Nedded to display the storymaps -->
  <script src="scripts/load_stories.js"></script> <!-- Loading stories in "Carte narrative" (storytool version) -->
  <script src="scripts/legendLevel.js"></script>

  <!-- Menu and forms interactivity -->
  <script src="scripts/dropdownsMenus.js"></script>
  <script src="scripts/login.js"></script>
  <script src="scripts/drawonmap.js"></script>

  <!-- UI Tooltips (outisde the map) -->
  <script src="scripts/tooltips.js"></script>

</body>
