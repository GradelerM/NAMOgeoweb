<!-- To include with php code in administration.php -->
<button id="add-data-source" class="positive" style="margin-left: 0; display: none;">Ajouter une nouvelle source</button>

<br>

<p id="sources-error-message" class="info-error"></p>

<br>

<?php echo $loader; ?>
<div id="sources-table-container">
    <table id="sources-table" class="stripe"></table>
</div>

<br>

<!-- modal: data source config panel -->
<div id="data-source-config-panel" title="Configurer la source de données" class="jqmodal">

    <!-- Informations -->
    <p>
        Collez-ici l'url getCapabilities du serveur cible. <a href="https://docs.geoserver.geo-solutions.it/edu/en/multidim/accessing_multidim/basic_requests.html" target="_blank">Exemple pour GeoServer ici.</a><br>
        <i>Ne fonctionne pour l'instant que pour la version 1.3.0 de getCapabilities.</i>
    </p>

    <!-- Field for pasting the getCapabilities url -->
    <label for="data-source-capabilities">Capabilities :</label>
    <input type="text" name="data-source-capabilities" id="data-source-capabilities" value="" class="text ui-widget-content ui-corner-all" style="width: 460px">
    <br>

    <!-- Field for giving the server a name -->
    <label for="data-source-name">Nom de la source de données :</label>
    <input type="text" name="data-source-name" id="data-source-name" value="" class="text ui-widget-content ui-corner-all">
    <br>

    <!-- Dropdown list to select the server type -->
    <label for="data-source-type">Type de serveur :</label>
    <select name="data-source-type" id="data-source-type" style="margin-bottom: 12px;"></select>
    <br>

    <!-- Display a loader -->
    <?php echo $loader; ?>

    <!-- Room for displaying a table preview -->
    <div id="data-source-preview-container">
        <table id="data-source-preview" class="stripe"></table>
    </div>
    
    <!-- Paragraph to display the error message -->
    <p class="info-error"></p>

</div>

<!-- modal: confirm source deletion -->
<div id="data-source-deletion-panel" title="Supprimer la collection" class="jqmodal">
    <p>
        Souhaitez-vous vraiment supprimer cette source de données ? 
        Toutes les couches associées seront aussi retirées de l'application. 
        Cette action est définitive.
    </p>
    <?php echo $loader; ?>
</div>

<!-- modal: add new layer from source -->
<div id="list-layers-from-source" title="Ajouter une nouvelle couche" class="jqmodal">

    <!-- Informations -->
    <p>
        Sélectionnez une couche à publier parmis celles disponibles sur le serveur. <i>(Astuce: vous pouvez agrandir cette fenêtre).</i>
    </p>

    <!-- Display a loader -->
    <?php echo $loader; ?>

    <!-- Room for displaying a table preview -->
    <div id="list-layers-from-source-container">
        <table id="list-layers-from-source-table" class="stripe"></table>
    </div>
    
    <!-- Paragraph to display the error message -->
    <p class="info-error"></p>

</div>
