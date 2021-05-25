<!-- To include with php code in administration.php -->
<p id="layers-error-message" class="info-error"></p>
<br>

<div id="layers-table-loader"><?php echo $loader; ?></div>
<div id="layers-table-container">
    <table id="layers-table" class="stripe"></table>
</div>

<!-- modal: data source config panel -->
<div id="edit-layer-modal" title="Configurer la couche" class="jqmodal">

    <div class="wrapper">

        <!-- Display the layer's name -->
        <div id="layer-name-label">Nom :</div>
        <div id="layer-name-field"></div>

        <!-- Display the layer's source name -->
        <div id="layer-source-label">Source : </div>
        <div id="layer-source-field"></div>

        <!-- Field for giving the layer a title -->
        <label for="layer-title-field">Titre :</label>
        <input type="text" name="layer-title-field" id="layer-title-field" value="" class="text ui-widget-content ui-corner-all">
        <br>

        <!-- Dropdown list to select the layer's theme -->
        <label for="layer-theme-field">Thème :</label>
        <select name="layer-theme-field" id="layer-theme-field">
            <option value="1">Aucun</option>
        </select>
        <br>

        <!-- Numbers to fix the layer's opacity -->
        <label for="layer-opacity-field">Opacité : </label>
        <div id="layer-opacity-container">
            <input type="number" id="layer-opacity-field" name="layer-opacity-field" size="6" min="0" max="1" step=".1" placeholder="Opacity">
            <svg id="layer-opacity-info" class="medium infoTooltip pointer"><use xlink:href="#iconeInfo" /></use></svg>   
        </div> 
        <br>

        <!-- Count to fix the layer's zIndex -->
        <label for="layer-zIndex-field">zIndex : </label>
        <div id="layer-zIndex-container">
            <input type="number" id="layer-zIndex-field" name="layer-zIndex-field" size="6" min="0" max="9000" step="10" placeholder="zIndex">
            <svg id="layer-zIndex-info" class="medium infoTooltip pointer"><use xlink:href="#iconeInfo" /></use></svg>
        </div>
        <br>    

    </div>
    <br>

    <!-- Display a loader -->
    <?php echo $loader; ?>
    
    <!-- Paragraph to display the error message -->
    <p class="info-error"></p>

</div>

<!-- modal: confirm layer deletion -->
<div id="data-layer-deletion-panel" title="Supprimer la couche" class="jqmodal">
    <p>
        Souhaitez-vous vraiment supprimer cette couche ? 
        Cette action est définitive.
        <br>
        <i>
            Vous pourrez toujours publier une nouvelle fois cette couche en sélectionnant sa source de données 
            dans l'onglet "Entrepôts".
        </i>
    </p>
    <?php echo $loader; ?>
</div>
