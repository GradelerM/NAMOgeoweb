jQuery(document).ready(function () {

  function loadLayers (layerGroups) {

    // Writing html for layer categories (main panel and floating legend)
    // Looping through every called layer groups in map.js
    for (var index = 0; index < layerGroups.length; index++) {

      // Checking if the layers group name starts with "theme"
      // If not, sending warning and correcting automatically
      var groupId   = layerGroups[index];
    
      if (groupId.startsWith('theme') === false) {
        console.warn('The layers group ' + groupId + ' should be called "theme' + groupId + '" in the app. ' +
        'It is advised you correct this error before further use of the application. ' +
        'Please check the documentation for further information.');
        groupId = 'theme' + groupId;
      }
      
      var groupContainerId = groupId.replace("theme", "");

      var groupName = window[layerGroups[index]].get('name');
      if (groupName === undefined) {
        console.warn('The layers group ' + layerGroups[index] + ' has no defined name. A default name has been defined. ' +
        'You might want to change this name for better user experience. ' +
        'Please check the documentation for further information.');
        groupName = groupId;
      }

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
      '<!-- Layers contained in this category (filled with loadLayers.js) -->' +
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
    for ( var i = 0; i < layerGroups.length; i++ ) {
      // Get the collection array containing the group layers
      var layers = window[layerGroups[i]].getLayers().getArray();
      for ( var j = 0; j < layers.length; j++ ) {
        // Repeat the following actions for every layer in the layerGroups[i]
//        console.log(layers[j]);
        // Creating/resetting the layerInfo and layerWidgets objects
        var layerInfo     = {};
        var layerWidgets  = [];

        // Getting the layer's theme (= layerGroups name)
        // If the user forgot to add "theme", adding it manually
        layerInfo.theme = layerGroups[i];
        
        if (layerInfo.theme.startsWith('theme') === false) {
          layerInfo.theme = 'theme' + layerInfo.theme;
        }
        
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
        if ( (layers[j].values_.hasOwnProperty('choixAnnee')) == true ) {
          choixAnnee   = ((layers[j].get('choixAnnee')).split(" "));
        };

        // Generating variables
        var containerId = (Object.values(layerInfo)[0]).replace("theme","").concat("-layers");
        var floatingLegendId = (Object.values(layerInfo)[0]).replace("theme","").concat("-float");
        var name = Object.values(layerInfo)[1];
        var title = Object.values(layerInfo)[2];
        // var meta = Object.values(layerInfo)[3];
        // console.log(meta);

        // Default : empty HTML for widgets
        var opacityHTML           = '';
        var dateHTML              = '';
        var legendHTML            = '';
        var legendHTMLFloat       = '';
        var customlegendHTML      = '';
        var customlegendHTMLFloat = '';
        var choixAnneeHTML        = '';
        var legendLevelHTML       = '';

        // Default : empty HTML for DPSIR lines
        var dpsirHTML             = '';

        // Checking if opacity widget is needed
        for ( var ii = 0; ii < layerWidgets.length; ii++ ) {
          if ( layerWidgets[ii] == 'opacity' ) {
            // Writing opacity widget HTML code :
            var opacityHTML =
            '<div id="'+name+'-opacity" class="widget-opacity">' +
            '<label for="">Opacité : <span></span></label>' +
            '<input type="text" class="range min-0 max-100" value="100"/>' +
            '</div>';
          }
        }

        // Checking if legend widget is needed
        for ( var jj = 0; jj < layerWidgets.length; jj++ ) {
          if ( layerWidgets[jj] == 'legend' ) {
            // Writing legend widget HTML code :
            var legendHTML =
            '<div id="'+name+'-legend" class="widget-legend">' +
            '<p>Légende :</p>' +
            '<div class="legend"><img id="'+name+'-img" /></div>' +
            '</div>';
            // Writing the floating legend part
            var legendHTMLFloat =
            '<img id="'+name+'-float" />';
          }
        }

        // Adding population date widgets
        // For pop_ancienne_occitanie
        if ( name == 'pop_ancienne_occitanie' ) {
          // Writing population date widget HTML code :
          var dateHTML =
            '<div id="'+name+'-select-date" class="widget-select-date">' +
              '<label for="'+name+'-select-date-choice">Date :</label>' +
              '<select id="'+name+'-select-date-choice" name="'+name+'-select-date-choice">' +
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
        for ( var kk = 0; kk < layerWidgets.length; kk++ ) {
          if ( layerWidgets[kk] == 'customlegend' ) {
            // Getting the 'customlegendTitle' value
            var customlegendTitle = layers[j].get('customlegendTitle');
            // Writing legend widget HTML code :
            var customlegendHTML =
            '<div id="'+name+'-customlegend" class="widget-customlegend">' +
              '<p>Légende :</p>' +
              '<div id="'+name+'-customlegendbox" class="customlegend">' +
                '<p>'+customlegendTitle+'<span></span></p>' +
                '<img id="'+name+'-customimg" src="images/assets/legends/'+name+'_customlegend.png"/>' +
              '</div>' +
            '</div>';
            // Writing the floating legend part
            var customlegendHTMLFloat =
            '<div id="'+name+'-customlegendfloat" class="customlegend-float">' +
              '<p>'+customlegendTitle+'<span></span></p>' +
              '<img id="'+name+'-customimgfloat"/>' +
            '</div>';
          }
        }

        // Checking if choixAnnee widget is needed
        for (var ll = 0; ll < layerWidgets.length; ll++) {
          if ( layerWidgets[ll] == 'choixAnnee') {
            // Checking if the date is in the layer source
            var testDate = (window[layerInfo.id].values_.source.params_.LAYERS).indexOf("date:");
            if ( testDate === -1 ) {
              console.error("The 'date:' parameter must be declared in the source " +
              "(layer name in GeoServer, or params: {'LAYERS'} in map.js). " +
              "Please refer to the documentation for more informations about choixAnnee widget.");
            } else {
              // Writing the main part of the HTML code
              var choixAnneeHTML =
                '<div id="'+name+'-choixAnnee" class="widget-choixAnnee">' +
                  '<label for="'+name+'-choixAnnee-choix">Date :</label>' +
                  '<select id="'+name+'-choixAnnee-choix" name="'+name+'-choixAnnee-choix" class="widget-choixAnnee-choix">' ;
              for (var lll = 0; lll < choixAnnee.length; lll++) {
                choixAnneeHTML = choixAnneeHTML +
                  '<option value="' +choixAnnee[lll]+ '">' +choixAnnee[lll]+ '</option>';
              }
              var choixAnneeHTML = choixAnneeHTML +
                  '</select>' +
                '</div>';
            }
          }
        }

        // Checking if legendLevel widget is needed
        for (var mm = 0; mm < layerWidgets.length; mm++) {
          if ( layerWidgets[mm] == 'legendLevel' ) {
            // Checking if the legend level "niv:" is in the layer source
            var testNiv = (window[layerInfo.id].values_.source.params_.LAYERS).indexOf("niv:");
            if ( testNiv === -1 ) {
              console.error("The 'niv:' parameter must be declared in the source " +
              "(layer name in GeoServer, or params: {'LAYERS'} in map.js). " +
              "Please refer to the documentation for more informations about legendLevel widget.");
            } else {
              // Writing the main part of the HTML code
              var legendLevelHTML =
              '<div id="'+name+'-legendLevel" class="widget-legendLevel">' +
              '<input type="radio" id="'+name+'-1" class="legendLevel-radiobtn" name="'+name+'-legendLevel-radiobtn" value="1" checked>' +
              '<label for="'+name+'-legendLevel-radiobtn">Niveau 1</label><br>' +
              '<input type="radio" id="'+name+'-2" class="legendLevel-radiobtn" name="'+name+'-legendLevel-radiobtn" value="2">' +
              '<label for="'+name+'-legendLevel-radiobtn">Niveau 2</label><br>' +
              '</div>';
            }
          }
        }

        // Writing full HTML code :
        var layerMainHTML =
        '<div id='+name+'>' +
        '<div class="layer-name">'+
        '<a href="#" class="layer-toggle">' +
        '<svg class="layer-arrow deployedArrow"><use xlink:href="#iconeArrow" /></use></svg>' +
        '<input type="checkbox" id="'+name+'-checkbox" name="'+name+'-checkbox" value="display" />' +
        '<label for="'+name+'-checkbox">'+title+'</label>' +
        '</a>' +
        '<a id="'+name+'-info" href="#"><svg class="info-link"><use xlink:href="#iconeInfo" /></use></svg></a>' +
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

        // Writing floating legend HTML code :
        var floatingLegendHTML =
        '<div id="'+name+'-floatbox" class="legend-float">' +
        '<p>'+title+'</p>' +
        legendHTMLFloat +
        customlegendHTMLFloat +
        '</div>';

        // Writing DPSIR select line HTML code :
        var dpsirHTML =
        '<div id="'+name+'-dpsir" class="dpsir-line">' +
        '<select name="'+name+'-dpsir" id="'+name+'-dpsir" class="dpsir-line-select">' +
        '<option selected="selected" value="none">Aucun</option>' +
        '<option value="driver">Force motrice</option>' +
        '<option value="pressure">Pression</option>' +
        '<option value="state">Etat</option>' +
        '<option value="impact">Impact</option>' +
        '<option value="response">Reponse</option>' +
        '<select>' +
        '<span class="dpsir-label">'+title+'</span>' +
        '<div>';

        // Appending HTML code
        $('#'+containerId).append(layerMainHTML);
        $('#'+floatingLegendId).append(floatingLegendHTML);
        $('#select-DPSIR').append(dpsirHTML);

      }

    }

  };
  loadLayers(layerGroups);

});
