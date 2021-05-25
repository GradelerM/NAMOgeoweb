<!-- To include with php code in administration.php -->

<div id="themes-content">

    <div>
        <p>Liste des thèmes :</p>
        <div id="themes-box" class="themes-box">
            <!-- Display a loader -->
            <?php echo $loader; ?>
            <ul id="themes-list" class="themes-list">
                <li id="theme-1" class="selectable ui-state-default ui-state-disabled">
                    <p>Autres</p>
                </li>
                <!-- Other chapters added here via JavaScript -->
                <li id="add-theme" class="ui-state-default ui-state-disabled">+</li>
            </ul>
        </div>
    </div>

    <div id="themes-info">
        <p id="themes-error-message" class="info-error"></p>
        <p>
            Cette section vous permet de gérer les thèmes dans lesquels ranger les couches.
            <ul>
                <li>le thème "Autres" ne peut pas être édité</li>
                <li>vous pouvez créer de nouveaux thèmes</li>
                <li>lorsqu'un thème est supprimé, toutes les couches qu'il contient sont ajoutées au thème "Autres"</li>
                <li>vous pouvez réordonner les thèmes avec un glisser-déposer</li>
            </ul>
        </p>
    </div>

</div>


<!-- collections contextual menus -->
<div class="contextual-menu theme-parameters-menu">
    <ul>
        <a href="#" class="menu-rename-theme"><li>Renommer le thème</li></a>
        <a href="#" class="menu-delete-theme"><li>Supprimer le thème</li></a>
    </ul>
</div>

<!-- modals -->
<div id="edit-theme-name-modal" title="Editer le nom du thème" class="jqmodal">
    <p class="info-error"></p>
    <label for="edit-theme-name">Choisissez un nom pour le thème :</label>
    <input type="text" name="edit-theme-name" id="edit-theme-name" value="" class="text ui-widget-content ui-corner-all">
</div>

<div id="delete-theme-modal" title="Supprimer le thème" class="jqmodal">
    <p>Souhaitez-vous vraiment supprimer ce thème ? Cette action est irréversible.</p>
    <p>
        Toutes les couches de ce thème vont être classées dans le thème "Autres". 
        Vous devrez leur attribuer un nouveau thème depuis l'éditeur de couches (onglet "Couches").
    </p>
</div>