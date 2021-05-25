<div id="collections-content">

    <div>
        <p>Liste des collections :</p>
        <div id="collections-box" class="collections-box">
            <!-- Display a loader -->
            <?php echo $loader; ?>
            <ul id="collections-list" class="collections-list">
                <li id="collection-1" class="selectable ui-state-default ui-state-disabled">
                    <p>Aucune</p>
                </li>
                <!-- Other chapters added here via JavaScript -->
                <li id="add-collection" class="ui-state-default ui-state-disabled">+</li>
            </ul>
        </div>
    </div>

    <div id="collections-info">
        <p id="collections-error-message" class="info-error"></p>
        <p>
            Cette section vous permet de gérer les collections dans lesquelles ranger les cartes narratives.
            <ul>
                <li>la collection "Aucune" ne peut pas être éditée</li>
                <li>vous pouvez créer de nouvelles collections</li>
                <li>lorsqu'une collection est supprimée, tous les livres qu'elle contient sont ajoutés à la collection "Aucune"</li>
                <li>vous pouvez réordonner les collections avec un glisser-déposer</li>
            </ul>
        </p>
    </div>

</div>


<!-- collections contextual menus -->
<div class="contextual-menu collection-parameters-menu">
    <ul>
        <a href="#" class="menu-rename-collection"><li>Renommer la collection</li></a>
        <a href="#" class="menu-delete-collection"><li>Supprimer la collection</li></a>
    </ul>
</div>

<!-- modals -->
<div id="edit-collection-name-modal" title="Editer le nom de la collection" class="jqmodal">
    <p class="info-error"></p>
    <label for="edit-collection-name">Choisissez un nom pour la collection :</label>
    <input type="text" name="edit-collection-name" id="edit-collection-name" value="" class="text ui-widget-content ui-corner-all">
</div>

<div id="delete-collection-modal" title="Supprimer la collection" class="jqmodal">
    <p>Souhaitez-vous vraiment supprimer cette collection ? Cette action est irréversible.</p>
    <p>
        Toutes les cartes narratives de cette collection vont être classées dans la collection "Autres". 
        Vous devrez leur attribuer une nouvelle collection depuis l'éditeur de cartes narratives (outil de contribution).
    </p>
</div>