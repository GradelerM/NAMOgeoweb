<?php
session_start() ;

include_once 'config.php';  // charge les différentes variables nécessaires pour les scripts php
include_once './components/loaders.php'; // Including some loaders and other elements to display

header("Content-Type: text/html ; charset=utf-8");
header("Cache-Control: no-cache , private");//anti Cache pour HTTP/1.1
header("Pragma: no-cache");//anti Cache pour HTTP/1.0

// echo "Hello world : ";

// Hiding content if the user isn't logged in
$logged_in = "";
$not_logged_in = "";

if (isset($_SESSION['user'])) {
    $not_logged_in = "style='display:none;'";
 }

if (!isset($_SESSION['user'])) {
    $logged_in = "style='display:none;'";
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
        <title>NAMO GeoWeb - storytool</title><!-- PROJECT NAME -->

        <!-- Importing fonts -->
        <link href="https://fonts.googleapis.com/css2?family=Roboto:500,700" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet"> 

        <!-- Styles -->
        <link rel="stylesheet" href="scripts/lib/openlayers/ol.css" />
        <link rel="stylesheet" href="scripts/lib/openlayers-ext/ol-ext.min.css" />
        <link rel="stylesheet" href="scripts/lib/jquery-ui-1.12.1/jquery-ui.min.css" />
        <link rel="stylesheet" href="styles/backoffice.css?v=1.1" />
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

        <!-- Pop-ups, modals, etc. -->
        <!-- Create / load a new book -->
        <div id="create-load-book" class="modal hidden" <?php echo $logged_in;?>>
            <div class="modal-content">
                <!-- Create a new storymap -->
                <p>
                    Souhaitez-vous créer une nouvelle carte narrative ou en modifier une ?
                </p>
                <button id="new-book" class="positive" style="width: 100%; margin:0; margin-bottom: 8px; font-size: 1em;">Ajouter une nouvelle carte narrative</button>

                <!-- List the user's books -->
                <p style="margin-bottom: 12px; text-align: left;">
                    Liste de mes cartes narratives :
                </p>
                <div id="user-books-list-container">
                    <!-- Display a loader during the query  -->
                    <?php echo $loader;?>
                    <table id="user-books-list">
                        <!-- Content generated with PHP fetch query -->
                    </table>
                </div>

                <!-- Display this part if the user is an admin or an editor -->
                <?php
                    if ($_SESSION['admin'] == true || $_SESSION['editor'] == true) {
                        include("./components/storytool_pending_published_list.php");
                    }
                ?>

                </br>

            </div>
        </div>

        <!-- Confirm book deletion -->
        <div id="confirm-book-deletion" class="modal hidden" <?php echo $logged_in;?>>
            <div class="modal-content">
                <p id="confirm-choice-content-delete">
                    La suppression d'une carte narrative est une action irréversible et entraînera sa disparition de l'éditeur mais aussi de 
                    l'application si elle a déjà été publiée.</br>
                    Êtes-vous sûr(e) de vouloir supprimer cette carte narrative ?
                </p>
                <button id="book-deletion-no" class="positive">Annuler</button>
                <button id="book-deletion-yes" class="cta">Supprimer</button>
            </div>
        </div>

        <div id="edit-book-modal" title="Editer un livre ?"></div>
        <div id="edit-book-status-modal" title="Modifier le statut du livre ?"></div>

        <!-- Confirm chapter choice -->
        <div id="confirm-chapter-deletion" class="modal hidden">
            <div class="modal-content">
                <p id="confirm-choice-content">
                    Etes-vous sûr(e) de vouloir supprimer ce chapitre ?<br/>
                    Cette action est irréversible.
                </p>
                <button id="chapter-deletion-no" class="cta">Non</button>
                <button id="chapter-deletion-yes" class="positive">Oui</button>
            </div>
        </div>

        <!-- Confirm paragraph deletion -->
        <div id="confirm-paragraph-deletion" class="modal hidden">
            <div class="modal-content">
                <p id="confirm-choice-content">
                    Etes-vous sûr(e) de vouloir supprimer cet élément ?<br/>
                    Cette action est irréversible.
                </p>
                <button id="paragraph-deletion-no" class="cta">Non</button>
                <button id="paragraph-deletion-yes" class="positive">Oui</button>
            </div>
        </div>

        <!-- Markdown helper -->
        <div id="markdown-helper" class="helper-window hidden">
            <div class="helper-topbar"><p class="close-helper">x</p></div>
            <div class="helper-content">
                <h3 style="text-align: center;">Markdown - Aide à la syntaxe </h3>
                <hr>
                <!-- Writing a title -->
                <p><strong>Écrire un titre</strong></p>
                <div class="codeblock">
                    <code>
                        # Titre niveau 1</br>
                        ## Titre niveau 2</br>
                        ### Titre niveau 3</br>
                    </code>
                </div>
                <div class="result">
                    <h1>Titre niveau 1</h1>
                    <h2>Titre niveau 2</h2>
                    <h3>Titre niveau 3</h3>
                </div>
                <hr>
                <!-- Ecrire en gras -->
                <p><strong>Écrire en gras</strong></p>
                <div class="codeblock">
                    <code>
                        Mettre le texte **en gras**.
                    </code>
                </div>
                <p class="result">Mettre le texte <strong>en gras</strong></p>
                <hr>
                <!-- Ecrire en italique -->
                <p><strong>Écrire en italique</strong></p>
                <div class="codeblock">
                    <code>
                        Mettre le texte *en italique*.
                    </code>
                </div>
                <p class="result">Mettre le texte <i>en italique</i></p>
                <hr>
                <!-- Ecrire une liste -->
                <p><strong>Écrire une liste</strong></p>
                <p>Une liste doit être séparée du paragraphe précédent par un saut de ligne.</p>
                <div class="codeblock">
                    <code>
                        Liste non ordonnée :</br>
                        </br>
                        - élement</br>
                        - autre élement</br>
                        - dernier élement</br>
                    </code>
                </div>
                <div class="result">
                    <p>Liste non ordonnée :</p>
                    <ul>
                        <li>élément</li>
                        <li>autre élément</li>
                        <li>dernier élément</li>
                    </ul>
                </div>
                </br>
                <div class="codeblock">
                    <code>
                        Liste non ordonnée (autre syntaxe) :</br>
                        </br>
                        * élement</br>
                        * autre élement</br>
                        * dernier élement</br>
                    </code>
                </div>
                <div class="result">
                    <p>Liste non ordonnée (autre syntaxe) :</p>
                    <ul>
                        <li>élément</li>
                        <li>autre élément</li>
                        <li>dernier élément</li>
                    </ul>
                </div>
                </br>
                <div class="codeblock">
                    <code>
                        Liste ordonnée :</br>
                        </br>
                        1. premier élément</br>
                        2. deuxième élement</br>
                        3. troisième élement</br>
                    </code>
                </div>
                <div class="result">
                    <p>Liste non ordonnée :</p>
                    <ol>
                        <li>premier élément</li>
                        <li>deuxième élément</li>
                        <li>troisième élément</li>
                    </ol>
                </div>
                <hr>
                <!-- Insérer un lien -->
                <p><strong>Insérer un lien</strong></p>
                <p>
                    Les liens insérés dans le texte s'ouvriront toujours dans un nouvel onglet.</br>
                    Survoler un lien fera apparaître l'adresse à laquelle l'utilisateur va être redirigé.
                </p>
                <div class="codeblock">
                    <code>
                        [GitLab](https://gitlab.com)
                    </code>
                </div>
                <p class="result"><a href="https://gitlab.com" target="_blank">Voici un lien vers GitLab</a></p>
                <hr>
                <!-- Séparer des paragraphes -->
                <p><strong>Séparer des paragraphes</strong></p>
                <p>Deux paragraphes doivent être séparés par un saut de ligne.</p>
                <div class="codeblock">
                    <code>
                        Lorem ipsum dolor sit amet consectetur adipiscing elit ante 
                        mattis.</br> 
                        Nec imperdiet turpis fusce lectus porta congue faucibus torquent orci.</br>
                        </br>
                        Scelerisque natoque donec posuere netus tortor duis quam blandit 
                        class mollis quisque potenti.
                    </code>
                </div>
                <p class="result">
                        Lorem ipsum dolor sit amet consectetur adipiscing elit ante 
                        mattis tortor inceptos consequat.
                        Nec imperdiet turpis fusce lectus porta congue faucibus torquent orci.</br>
                        </br>
                        Scelerisque natoque donec posuere netus tortor duis quam blandit 
                        class mollis quisque potenti.
                </p>
           
            <!-- End of content div -->
            </div>
        </div>

        <!-- Main modal -->
        <div id="main-modal" class="modal hidden">
            <div class="modal-content">
                <p id="main-modal-content">
                    Etes-vous sûr(e) de vouloir supprimer cet élément ?<br/>
                    Cette action est irréversible.
                </p>
                <button id="main-modal-ok" class="positive">J'ai compris</button>
            </div>
        </div>

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

        <!-- Chapter contextual menus -->
        <div class="contextual-menu chapter-parameters-menu">
            <ul>
                <a href="#" class="disabled"><li>Dupliquer</li></a>
                <a href="#" class="menu-supprimer-chapter"><li>Supprimer</li></a>
            </ul>
        </div>

        <!-- paragraph contextual menus -->
        <div class="contextual-menu paragraph-parameters-menu">
            <ul>
                <a href="#" class="menu-editer-paragraph"><li>Editer</li></a>
                <a href="#" class="disabled"><li>Dupliquer</li></a>
                <a href="#" class="menu-supprimer-paragraph"><li>Supprimer</li></a>
            </ul>
        </div>

        <!-- paragraph contextual menus -->
        <div class="contextual-menu layer-parameters-menu">
            <ul>
                <a href="#" class="menu-remove-layer"><li>Retirer</li></a>
            </ul>
        </div>

        <!-- Tooltips -->
        <div id="paragraph-editor-save-tooltip" class="tooltip hidden">Enregistrer les modifications</div>
        <div id="paragraph-editor-cancel-tooltip" class="tooltip hidden">Annuler les modifications</div>
        <div id="internal-image-info-tooltip" class="tooltip hidden">Sélectionnez une image dans votre ordinateur</div>
        <div id="image-legend-info-tooltip" class="tooltip hidden">N'oubliez pas de citer vos sources dans la légende</div>
        <div id="layer-selection-info-tooltip" class="tooltip hidden">L'ordre des couches dans la liste ne change pas leur ordre d'affichage sur la carte</div>
        <div id="href-preview-tooltip" class="tooltip hidden"></div>


        <!-- Grid container -->
        <div class="container-storytool">
            <!-- Header -->
            <div class="header">
                <!-- HORIZONTAL LOGO -->
                <?php echo '<a href="#" id="back-to-map"><img src="images/assets/logos/'.$horizontal_logo.'"/></a>'; ?>
                <div id="header-navlinks">
                    <ul>
                        <!-- WIKI LINK -->
                        <li><a href="https://gitlab.com/GradelerM/rivage-guadeloupe/-/wikis/home" target="_blank">Documentation</a></li>
                        <li><a href="#" target="_blank">Aide</a></li>
                    </ul>
                </div>
            </div>

            <!-- Login -->
            <div id="login" class="login" <?php echo $not_logged_in;?>>
                Connectez-vous pour créer ou éditer des cartes narratives.<br><br>
                <form action="/map/login.php" method="post">
                <label for="username">Nom d'utilisateur:</label>
                <input type="text" id="username" name="username"><br>
                <label for="password" style="margin-left: 27px;">Mot de passe:</label>
                <input type="password" id="password" name="password"><br><br>
                <input type="submit" style="margin-left: 130px;" value="Envoyer">
                </form> 
            </div>

            <!-- Tabs -->
            <div class="tabs" <?php echo $logged_in;?>>
                <div id="tab-informations" class="tab">
                    <a href="#">Informations</a>
                </div>
                <div id="tab-editeur" class="tab disabled">
                    <a href="#">Editeur</a>
                </div>
                <div id="tab-overview" class="tab disabled">
                    <a href="#">Aperçu</a>
                </div>
                <div id="tab-publish" class="tab disabled">
                    <a href="#">Publier</a>
                </div>
            </div>

            <!-- Content -->
            <div class="content" <?php echo $logged_in;?>>

                <!-- Informations -->
                <div id="content-informations" class="content-informations content-window">
                    <div class="groupe">
                        <label for="field-book-title">Titre de ma carte narrative : </label>
                        <input type="text" id="field-book-title" name="field-book-title" size="80" minlength="1" maxlength="200" placeholder="Titre de ma carte">
                    </div>
                    <div class="groupe">
                        <form>
                            <label for="book-collection">Collection dans laquelle classer la carte narrative :</label>
                            <select id="book-collection" name="book-collection">
                                <!-- Get here and add the other options after reading them from the database -->
                            </select>
                        </form>
                    </div>
                    <div class="groupe">
                        <label for="field-book-abstract">Résumé de ma carte narrative : </label><br />
                        <textarea id="field-book-abstract" name="field-book-abstract" rows="16" cols="105" maxlength="1000" placeholder="Résumé de la carte narrative"></textarea>
                    </div>
                    <div class="groupe">
                        <label for="field-book-legal-notice">Mentions légales : </label>
                        <input type="text" id="field-book-legal-notice" name="field-book-legal-notice" size="78" minlength="0" maxlength="200" placeholder="Auteurs ou organisme à l'origine de l'histoire, autres mentions nécessaires">
                    </div>
                </div>

                <!-- Editeur -->
                <div id="content-editeur" class="content-editeur content-window hidden">

                    <!-- TOC -->
                    <div id="table-of-contents">
                        <p>Déroulé de ma carte narrative : </p>
                        <div id="table-of-contents-box">
                            <!-- Box content -->
                            <ul id="table-of-contents-list" class="table-of-contents-list">
                                <li id="story-intro" class="selectable ui-state-default ui-state-disabled">
                                    <p>Avant-propos</p>
                                </li>
                                <!-- Other chapters added here via JavaScript -->
                                <li id="add-chapter" class="ui-state-default ui-state-disabled">+</li>
                            </ul>
                        </div>
                    </div>

                    <!-- Separator -->
                    <div class="separator">
                        <div class="vl"></div>
                    </div>

                    <!-- Main loader -->
                    <div id="main-loader-paragraph"><?php echo $loader;?></div>
                    <div id="main-loader-map"><?php echo $loader;?></div>

                    <!-- Chapter edition -->
                    <div id="chapter-edition" class="hidden">
                        <div id="chapter-title-group" class="groupe">
                            <span id="chapter-title-info">
                                <svg class="small"><use xlink:href="#iconeInfo" /></use></svg>
                                <span id="chapter-title-info-tooltip">
                                    Indiquez un titre à votre chapitre qui apparaîtra dans la carte narrative finale.
                                </span>
                            </span>
                            <label for="chapter-title">Mon chapitre : </label>
                            <input type="text" id="chapter-title" name="chapter-title" size="40" minlength="0" maxlength="80" placeholder="Titre du chapitre">
                            <?php echo $small_loader;?>
                        </div>

                        <div id="chapter-box">
                            <ul id="paragraph-list" class="paragraph-list">
                                <!-- Paragraphs are inserted here via JavaScript -->
                                <li id="add-paragraph" class="ui-state-default ui-state-disabled">
                                    <label for="new-paragraph-type">Nouveau :</label>
                                    <select id="new-paragraph-type" name="new-paragraph-type"></select>
                                    <button id="new-paragraph-add">Ajouter</button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <!-- Map section -->
                    <div id="map-edition" class="hidden">
                        <div class="groupe">
                            <p>Emprise de la vue :</p>
                            <div id="map-caption"></div>
                            <div id="map-overlay-loader"><div><?php echo $loader; ?></div></div>
                        </div>
                        <div class="groupe map-control">
                            <label for="input-x">Centre : </label>
                            <input type="text" id="input-x" name="input-x" size="6" minlength="1" maxlength="10" placeholder="X">    
                            <laber for="input-y"> ; </laber>
                            <input type="text" id="input-y" name="input-y" size="6" minlength="1" maxlength="10" placeholder="Y">    
                        </div>
                        <div class="groupe map-control">
                            <label for="input-zoom">Zoom : </label>
                            <input type="number" id="input-zoom" name="input-zoom" size="6" min="1" max="40" step=".1" placeholder="Zoom">    
                        </div>
                        <div class="groupe">
                            <form>
                                <label for="select-basemap">Fond :</label>
                                <select id="select-basemap" name="select-basemap">
                                </select>
                            </form>
                        </div>
                        <div class="groupe">
                            <p class="align-items-center" style="margin-bottom: 4px;">
                            Couches : 
                            <svg class="medium infoTooltip layer-selection-info"><use xlink:href="#iconeInfo" /></use></svg>
                            </p>
                            <div id="couches-list">
                                <!-- Select layers dropdowns are inserted here -->
                                <!-- Button to add layers -->
                                <div id="add-layer">+</div>
                            </div>
                        </div>

                    </div>

                </div>

                <!-- Overview -->
                <div id="content-overview" class="content-overview content-window hidden">
                    <div id="overview-map" class="overview-map">
                        <div id="mymap" class="mymap"></div>
                    </div>
                    <div id="story-tab" class="story-tab">
                        <div id="story-toolbar" class="story-toolbar">
                            <div id="font-size-controls">
                                <a href="#" id="font-scale-up"><svg class=""><use xlink:href="#fontScaleUp" /></use></svg></a>
                                <a href="#" id="font-scale-down"><svg class=""><use xlink:href="#fontScaleDown" /></use></svg></a>
                            </div>
                            <div id="story-map-ratio-control" class="story-map-ratio-control">
                                <svg><use xlink:href="#smallTab" /></use></svg>
                                <div id="story-map-ratio-slider"></div>
                                <svg><use xlink:href="#bigTab" /></use></svg>
                            </div>
                        </div>
                        <div id="story" class="story-container">Story container</div>
                    </div>
                    <div id="floating-legend">
                        <div id="floating-legend-container" class="container-flex"></div>
                    </div>
                    <div id="overview-controles">
                        <button id="shrink-tab" style="display: none;">Afficher / Masquer</button>
                    </div>
                </div>

                <!-- Publish -->
                <div id="content-publish" class="content-publish content-window hidden">

                    <div class="publish-box">
                        <label for="storymap-status">Statut de la carte narrative : </label>
                        <select name="storymap-status" id="storymap-status">

                            <option value="draft">Brouillon</option>
                            <option value="pending">En attente de publication</option>

                            <!-- Only allow to publish  -->
                            <?php
                                if ($_SESSION["admin"] == true || $_SESSION["editor"] == true) {
                                    echo '<option value="published">Publiée</option>';
                                }
                            ?>

                        </select>
                    </div>

                    <div class="publish-info">
                        <p>
                            Votre carte narrative peut avoir trois statuts :
                            <ul>
                                <li>
                                    <b>Brouillon : </b>
                                    Vous seul pouvez accéder à votre carte narrative et l'éditer. 
                                    Une fois que votre carte narrative est prête, vous pouvez la définir comme "en attente de publication". 
                                </li>
                                <li>
                                    <b>En attente de publication : </b>
                                    Vous pouvez encore accéder à votre carte narrative et l'éditer, mais elle est prête à être soumise à une évaluation 
                                    par les administrateurs et les éditeurs de la plateforme qui reçoivent une alerte par mail. 
                                    Ils peuvent accéder à votre carte narrative et l'éditer avant de valider sa publication sur l'application.
                                </li>
                                <li>
                                    <b>Publiée : </b>
                                    Votre carte narrative est publiée et visible par n'importe quel visiteur de l'application dans la section "carte narrative". 
                                    Si vous souhaitez y apporter des modifications, elle sera automatiquement dépubliée et devra à nouveau être validée par un 
                                    administrateur ou un éditeur de la plateforme.
                                </li>
                            </ul>
                        </p>
                        <p>
                            <i>
                                Information : le rôle des adminstrateurs et des éditeurs de la plateforme est de vérifier qu'aucun contenu 
                                dangereux ou inapproprié ne soit publié sur le site.
                            </i>
                        </p>

                    </div>

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

        <!-- Layers -->
        <script src="scripts/load_layers.js"></script>
        <script src="scripts/map.js"></script>

        <!-- Interactions -->
        <script src="scripts/storytool_interactions.js"></script>
        <script src="scripts/storymaps_templates.js"></script> <!-- Nedded to display the storymaps -->
        <script src="scripts/load_stories.js"></script>

    </body>

</html>