// Functions to load the layers from the database when the map loads:

// Function to add the layers to the map
function addingLayers(e) {

    for (var i = 0; i < e.length; i++) {
        var layer = window["theme_" + e[i].id];
        map.addLayer(layer);
    }

};

// Function to load the layers from the database when the application starts
function fetchPublishedLayersFromDB() {

    // Send the query to the database
    $.ajax({
        url: './public_api.php',
        method: 'POST',
        async: true,
        data: {
            mode: 'fetch_published_layers_from_db'
        },
        dataType: 'json',
        beforeSend: function () {

            // Show the loader
            $('#tab-Couches-content .loader-container').show();

            // Empty error message
            $('#tab-Couches-content .info-error').empty().hide();

        },
        success: function (response) {

            // Make sure the query returned no errors
            if (response.success == true) {

                // Create some layer groups variables
                tmp_arrays = [];
                for (let j = 0; j < layerGroups.length; j++) {
                    var elmt = {
                        id: layerGroups[j].id,
                        layers: []
                    };
                    tmp_arrays.push(elmt);                 
                }

                // Write all the needed objects: one source and one layer for each layer
                for (let i = 0; i < response.layers.length; i++) {

                    // Store all the needed informations in the "layer" object
                    var layer = response.layers[i];

                    // Define a serverType only if server id is different than 1 (aka "other", so the field should be empty to not cause errors)
                    // Create the source object
                    if (layer.server_type_id == 1) {

                        source_var = "layer_" + layer.id + "_WMS";
                        window[source_var] = new ol.source.ImageWMS({
                            url: layer.url,
                            params: {'LAYERS': layer.name, 'TILED':true},
                            serverName: layer.server_name                       
                          });
                        
                    } else {

                        source_var = "layer_" + layer.id + "_WMS";
                        window[source_var] = new ol.source.ImageWMS({
                            url: layer.url,
                            params: {'LAYERS': layer.name, 'TILED':true},
                            serverType: layer.server_type, // We define the server type here
                            serverName: layer.server_name                       
                          });

                    }

                    // Create the layer object
                    layer_var = "layer_" + layer.id;
                    window[layer_var] = new ol.layer.Image({
                        id: layer_var,
                        name: layer.name,
                        title: layer.title,
                        source: window[source_var],     // Indicate that the source is the variable created above
                        theme: layer.theme,
                        themeName: layer.theme_name,
                        visible: false,
                        opacity: Number(layer.opacity), // Make sure the opacity is a number
                        zIndex: Number(layer.zIndex),   // Make sure the zIndex is a number
                        widgets: 'opacity legend'       // For now, only keep these two widgets by default (default values for WMS)
                    });

                    // Add the layer to the correct layer group
                    for (let ii = 0; ii < tmp_arrays.length; ii++) {
                        if (tmp_arrays[ii].id == layer.theme) {
                            tmp_arrays[ii].layers.push(window[layer_var]);
                        }                        
                    }

                } // End of loop through all the layers

                // Then, create the layer groups from the tmp_arrays
                for (let jj = 0; jj < layerGroups.length; jj++) {

                    // Write the layer group name: theme_1, theme_2, etc.
                    layer_group = "theme_" + layerGroups[jj].id;
                    
                    // Loop through tmp_arrays to search for a match between layerGroups id and tmp_arrays id
                    for (let kk = 0; kk < tmp_arrays.length; kk++) {
                        
                        // Check if ids are equal
                        // If yes, create a new OpenLayers objects and add the array to it
                        if (layerGroups[jj].id == tmp_arrays[kk].id) {

                            window[layer_group] = new ol.layer.Group({
                                name: layerGroups[jj].theme,
                                layers: tmp_arrays[kk].layers
                            });

                        } // Enf of "if" statement
                        
                    } // End of tmp_arrays "for" loop
                    
                } // End of layerGroups "for" loop

                // When everything else is ready, add the layers to the map
                addingLayers(layerGroups);

                // Load everything else in the user interface so the "Couches" tab is functionnal
                loadLayers(layerGroups);

            } else { // There was an error

                // Display error message
                console.error(response.error);
                $('#tab-Couches-content .info-error').append(response.error).show();

            }

        },
        complete: function () {

            // Hide the loader
            $('#tab-Couches-content .loader-container').hide();

        },
        error: function (response) {

            // Display error message
            console.error(response.error);
            $('#tab-Couches-content .info-error').append(response.error).show();

        }
    });

}

// Create the layerGroups variable for global scope
var layerGroups = [];

// Function to fetch the layer groups (themes) from the database
function fetchThemesWriteLayerGroups() {
    
    // Send the query to the database
    $.ajax({
        url: './public_api.php',
        method: 'POST',
        async: true,
        data: {
            mode: 'fetch_all_themes'
        },
        dataType: 'json',
        beforeSend: function () {

            // Show the loader
            $('#tab-Couches-content .loader-container').show();

            // Empty error message
            $('#tab-Couches-content .info-error').empty().hide();


        },
        success: function (response) {

            // Make sure the query returned no errors
            if (response.success == true) {

                // Empty the layerGroups variable with all the available layers
                layerGroups = [];

                for (let i = 0; i < response.themes.length; i++) {

                    // Create an object that contains the theme and its id
                    var theme = {
                        id: response.themes[i].id,
                        theme: response.themes[i].name
                    };

                    // Add the group to the layerGroups array
                    layerGroups.push(theme);   

                }
                
                // Then, fetch the published layers
                fetchPublishedLayersFromDB();

            } else { // There was an error

                // Display error message
                console.error(response.error);
                $('#tab-Couches-content .info-error').append(response.error).show();

            }

        },
        complete: function () {
            // Don't do anything else
        },
        error: function (response) {

            // Display error message
            console.error(response.error);
            $('#tab-Couches-content .info-error').append(response.error).show();

        }
    });

}

// Fetch the layers and layer groups as soon as the application loads
fetchThemesWriteLayerGroups();

// Define with a global scope
var loadLayers;

jQuery(document).ready(function () {

    // Function to load the layers and display it in the "Couches" tab
    loadLayers = function(layerGroups) {

        // Writing html for layer categories (main panel and floating legend)
        // Looping through every called layer groups in map.js
        for (var index = 0; index < layerGroups.length; index++) {

            var groupId = layerGroups[index].id;

            var groupContainerId = "theme" + layerGroups[index].id;

            var groupName = layerGroups[index].theme;

            // Writing HTML code for tab-Couches section
            var tabGroupsHTML =
                '<!-- Thématique : ' + groupName + ' -->' +
                '<div id="' + groupContainerId + '" class="tab-box">' +
                '<div class="box-title">' +
                '<!-- Thematic category title -->' +
                '<div class="thematique-title">' +
                '<a href="#" class="thematique-toggle">' +
                '<svg class="theme-arrow deployedArrow"><use xlink:href="#iconeArrow" /></use></svg>' +
                '<p>' + groupName + '</p>' +
                '</a>' +
                '</div>' +
                '</div>' +
                '<!-- Layers contained in this category (filled with load_layers.js) -->' +
                '<div id="' + groupContainerId + '-layers" class="thematique-layers"></div>' +
                '</div>';

            // Writing HTML code for floating legend
            var floatGroupsHTML =
                '<div id="' + groupContainerId + '-float">' +
                '</div>';

            // Appending content to main HTML
            $('#tab-Couches-content').append(tabGroupsHTML);
            $('#thematic-float').append(floatGroupsHTML);

            // End of loop for creating themes /layer groups
        }

        // Check all layer groups
        for (var i = 0; i < layerGroups.length; i++) {
            // Get the collection array containing the group layers
        var layers = window["theme_" + layerGroups[i].id].getLayers().getArray();
            for (var j = 0; j < layers.length; j++) {
                // Repeat the following actions for every layer in the layerGroups[i]
                // Creating/resetting the layerInfo and layerWidgets objects
                var layerInfo = {};
                var layerWidgets = [];

                // Getting the layer's theme (= layerGroups id)
                layerInfo.theme = layerGroups[i].id;

                // Getting the layer's id
                layerInfo.id = layers[j].get('id');
                // Getting the layer's title
                layerInfo.title = layers[j].get('title');
                // Getting the metadata link (NOT WORKING YET) (UNCOMMENT WHEN OK)
                // layerInfo.meta = layers[i].get('meta');

                // Getting the layer's widgets
                var layerWidgets = ((layers[j].get('widgets')).split(" "));

                // Getting the dates we can choose in the choixAnnee widget
                var choixAnnee = [];
                if ((layers[j].values_.hasOwnProperty('choixAnnee')) == true) {
                    choixAnnee = ((layers[j].get('choixAnnee')).split(" "));
                };

                // Generating variables
                var containerId = "theme" + (Object.values(layerInfo)[0]).concat("-layers");
                var floatingLegendId = "theme" + (Object.values(layerInfo)[0]).concat("-float");
                var name = Object.values(layerInfo)[1];
                var title = Object.values(layerInfo)[2];
                // var meta = Object.values(layerInfo)[3];
                // console.log(meta);

                // Default : empty HTML for widgets
                var opacityHTML = '';
                var dateHTML = '';
                var legendHTML = '';
                var legendHTMLFloat = '';
                var customlegendHTML = '';
                var customlegendHTMLFloat = '';
                var choixAnneeHTML = '';
                var legendLevelHTML = '';

                // Default : empty HTML for DPSIR lines
                var dpsirHTML = '';

                // Checking if opacity widget is needed
                for (var ii = 0; ii < layerWidgets.length; ii++) {
                    if (layerWidgets[ii] == 'opacity') {
                        // Writing opacity widget HTML code :
                        var opacityHTML =
                            '<div id="' + name + '-opacity" class="widget-opacity">' +
                            '<label for="">Opacité : <span></span></label>' +
                            '<input type="text" class="range min-0 max-100" value="100"/>' +
                            '</div>';
                    }
                }

                // Checking if legend widget is needed
                for (var jj = 0; jj < layerWidgets.length; jj++) {
                    if (layerWidgets[jj] == 'legend') {
                        // Writing legend widget HTML code :
                        var legendHTML =
                            '<div id="' + name + '-legend" class="widget-legend">' +
                            '<p>Légende :</p>' +
                            '<div class="legend"><img id="' + name + '-img" /></div>' +
                            '</div>';
                        // Writing the floating legend part
                        var legendHTMLFloat =
                            '<img id="' + name + '-float" />';
                    }
                }

                // Adding population date widgets
                // For pop_ancienne_occitanie
                if (name == 'pop_ancienne_occitanie') {
                    // Writing population date widget HTML code :
                    var dateHTML =
                        '<div id="' + name + '-select-date" class="widget-select-date">' +
                        '<label for="' + name + '-select-date-choice">Date :</label>' +
                        '<select id="' + name + '-select-date-choice" name="' + name + '-select-date-choice">' +
                        '<option value="1793" selected >1793</option>' +
                        '<option value="1800">1800</option>' +
                        '<option value="1800">1851</option>' +
                        '<option value="1800">1901</option>' +
                        '<option value="1800">1954</option>' +
                        '<option value="1800">1999</option>' +
                        '<option value="1800">2016</option>' +
                        '</select>' +
                        '</div>';
                }

                // Checking if customlegend widget is needed
                for (var kk = 0; kk < layerWidgets.length; kk++) {
                    if (layerWidgets[kk] == 'customlegend') {
                        // Getting the 'customlegendTitle' value
                        var customlegendTitle = layers[j].get('customlegendTitle');
                        // Writing legend widget HTML code :
                        var customlegendHTML =
                            '<div id="' + name + '-customlegend" class="widget-customlegend">' +
                            '<p>Légende :</p>' +
                            '<div id="' + name + '-customlegendbox" class="customlegend">' +
                            '<p>' + customlegendTitle + '<span></span></p>' +
                            '<img id="' + name + '-customimg" src="images/assets/legends/' + name + '_customlegend.png"/>' +
                            '</div>' +
                            '</div>';
                        // Writing the floating legend part
                        var customlegendHTMLFloat =
                            '<div id="' + name + '-customlegendfloat" class="customlegend-float">' +
                            '<p>' + customlegendTitle + '<span></span></p>' +
                            '<img id="' + name + '-customimgfloat"/>' +
                            '</div>';
                    }
                }

                // Checking if choixAnnee widget is needed
                for (var ll = 0; ll < layerWidgets.length; ll++) {
                    if (layerWidgets[ll] == 'choixAnnee') {
                        // Checking if the date is in the layer source
                        var testDate = (window[layerInfo.id].values_.source.params_.LAYERS).indexOf("date:");
                        if (testDate === -1) {
                            console.error("The 'date:' parameter must be declared in the source " +
                                "(layer name in GeoServer, or params: {'LAYERS'} in map.js). " +
                                "Please refer to the documentation for more informations about choixAnnee widget.");
                        } else {
                            // Writing the main part of the HTML code
                            var choixAnneeHTML =
                                '<div id="' + name + '-choixAnnee" class="widget-choixAnnee">' +
                                '<label for="' + name + '-choixAnnee-choix">Date :</label>' +
                                '<select id="' + name + '-choixAnnee-choix" name="' + name + '-choixAnnee-choix" class="widget-choixAnnee-choix">';
                            for (var lll = 0; lll < choixAnnee.length; lll++) {
                                choixAnneeHTML = choixAnneeHTML +
                                    '<option value="' + choixAnnee[lll] + '">' + choixAnnee[lll] + '</option>';
                            }
                            var choixAnneeHTML = choixAnneeHTML +
                                '</select>' +
                                '</div>';
                        }
                    }
                }

                // Checking if legendLevel widget is needed
                for (var mm = 0; mm < layerWidgets.length; mm++) {
                    if (layerWidgets[mm] == 'legendLevel') {
                        // Checking if the legend level "niv:" is in the layer source
                        var testNiv = (window[layerInfo.id].values_.source.params_.LAYERS).indexOf("niv:");
                        if (testNiv === -1) {
                            console.error("The 'niv:' parameter must be declared in the source " +
                                "(layer name in GeoServer, or params: {'LAYERS'} in map.js). " +
                                "Please refer to the documentation for more informations about legendLevel widget.");
                        } else {
                            // Writing the main part of the HTML code
                            var legendLevelHTML =
                                '<div id="' + name + '-legendLevel" class="widget-legendLevel">' +
                                '<input type="radio" id="' + name + '-1" class="legendLevel-radiobtn" name="' + name + '-legendLevel-radiobtn" value="1" checked>' +
                                '<label for="' + name + '-legendLevel-radiobtn">Niveau 1</label><br>' +
                                '<input type="radio" id="' + name + '-2" class="legendLevel-radiobtn" name="' + name + '-legendLevel-radiobtn" value="2">' +
                                '<label for="' + name + '-legendLevel-radiobtn">Niveau 2</label><br>' +
                                '</div>';
                        }
                    }
                }

                // Writing full HTML code :
                var layerMainHTML =
                    '<div id=' + name + '>' +
                    '<div class="layer-name">' +
                    '<a href="#" class="layer-toggle">' +
                    '<svg class="layer-arrow deployedArrow"><use xlink:href="#iconeArrow" /></use></svg>' +
                    '<input type="checkbox" id="' + name + '-checkbox" name="' + name + '-checkbox" value="display" />' +
                    '<label for="' + name + '-checkbox">' + title + '</label>' +
                    '</a>' +
                    '<a id="' + name + '-info" href="#"><svg class="info-link"><use xlink:href="#iconeInfo" /></use></svg></a>' +
                    '</div>' +
                    '<div class="layer-widgets">' +
                    opacityHTML +
                    dateHTML +
                    choixAnneeHTML +
                    legendLevelHTML +
                    legendHTML +
                    customlegendHTML +
                    '</div>' +
                    '</div>';

                // Writing floating legend HTML code:
                var floatingLegendHTML =
                    '<div id="' + name + '-floatbox" class="legend-float">' +
                    '<p>' + title + '</p>' +
                    legendHTMLFloat +
                    customlegendHTMLFloat +
                    '</div>';

                // Writing DPSIR select line HTML code:
                var dpsirHTML =
                    '<div id="' + name + '-dpsir" class="dpsir-line">' +
                    '<select name="' + name + '-dpsir" id="' + name + '-dpsir" class="dpsir-line-select">' +
                    '<option selected="selected" value="none">Aucun</option>' +
                    '<option value="driver">Force motrice</option>' +
                    '<option value="pressure">Pression</option>' +
                    '<option value="state">Etat</option>' +
                    '<option value="impact">Impact</option>' +
                    '<option value="response">Reponse</option>' +
                    '<select>' +
                    '<span class="dpsir-label">' + title + '</span>' +
                    '<div>';

                // Appending HTML code
                $('#' + containerId).append(layerMainHTML);
                $('#' + floatingLegendId).append(floatingLegendHTML);
                $('#select-DPSIR').append(dpsirHTML);

            }

        }

        // Once everything is done, call the functions to exec from mapInteractions or storytool_interactions only when the app is ready
        execOnLoad();

    };

});
