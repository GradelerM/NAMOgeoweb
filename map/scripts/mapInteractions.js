var execOnLoad;

jQuery(document).ready(function () {

  /*
  ===============================================================================
  List of all the functions to execute once the layers are loaded (called in load_layers.js)
  ===============================================================================
  */
  execOnLoad = function(){

    readyCheckCheckboxes();       // Check if the layers are visible or not and check the checkboxes depending on the result
    readyDisplayFromCheckBoxes(); // If a checkbox is already checked (can happen with browser cache) then display the layer too
    readyDefineSliders();         // Define opacity sliders
    readyAutoLegend();            // Display the layer's legends on application load

  };

  /*
  ===============================================================================
  Zones d'etude
  ===============================================================================
  */
  // Function to get emprise name from the clicked thumbnail
  function getEmprise (e) {
    var result = e.replace("-zoom", "");
    return result;
  };

  // Function to fly to bounds on emprise thumbnail click
  $('.emprise').click(function () {
    var elmId = $(this).attr('id');
    var boundsName = getEmprise(elmId);
    mainView.animate({
      center: window[boundsName][0],
      zoom: window[boundsName][1]
    });
  });

  /*
  ===============================================================================
  Fonds de carte
  ===============================================================================
  */
  // Function to get layer name from the clicked thumbnail
  function getPlan (e) {
    var result = e.replace("-toggle", "");
    return result;
  };

  // Calling function getPlan to toogle plans (Fonds de Carte) on click
  $('.plan').click(function () {
    // Get the element's id to find the layer's name
    var elmId = $(this).attr('id');
    if ($(this).hasClass('plan-active')) {
      // Do nothing if the selected plan is already displayed
    } else {
      // Make all plans inactive (grey with "Cliquez pour afficher" indication)
      $('.plan').removeClass('plan-active');
      // Remove all plans from map area
      $('.plan').each(function () {
        var removeId = $(this).attr('id');
        map.removeLayer(window[getPlan(removeId)]);
      });
      // Make this plan active (display thumbnail with colors)
      $(this).addClass('plan-active');
      // Display this plan in the map area
      map.addLayer(window[getPlan(elmId)]);
    }
  });

  /*
  ===============================================================================
  Couches
  ===============================================================================
  */
  // Check layers checkboxes or not depending on if they are visible when the map loads
  function readyCheckCheckboxes() {
       $('.layer-toggle > input[type=checkbox]').each(function () {
      var layer = window[$(this).attr('id').replace("-checkbox", "")];
      var visible = layer.get('visible');
      var getLegendId = $(this).attr('id').replace("-checkbox", "-floatbox");
      var floatingLegend = $('#'+getLegendId);
      if ( visible == true ) {
        $(this).prop('checked', true);
        floatingLegend.show();
      } else {
        $(this).prop('checked', false);
        floatingLegend.hide();
      }
      emptyLegendMessage();
    });
  }

  // Display or not layers using checkboxes
  function readyDisplayFromCheckBoxes() {
    $('.layer-toggle > input[type=checkbox]').click(function() {
      var layer = window[$(this).attr('id').replace("-checkbox", "")];
      var getLegendId = $(this).attr('id').replace("-checkbox", "-floatbox");
      var floatingLegend = $('#'+getLegendId);
      if ( $(this).is(':checked') ) {
        layer.setVisible(true);
        floatingLegend.show();
      } else {
        layer.setVisible(false);
        floatingLegend.hide();
      }
      emptyLegendMessage(); // TODO
    });
  }

  // Display layer informations when (i) clicked
  $(document).on('click', '.layer-name .info-link', function() {

    // Empty the modal
    $('#layer-metadata-modal .layer-metadata-name').empty();
    $('#layer-metadata-modal .layer-metadata-url').empty();

    var layer_id   = $(this).parent().attr('id').replace("-info", "");
    var layer      = window[layer_id];
    var source     = layer.get('source');

    var name       = layer.get('name');
    var url        = source.url_;
    var link       = '<a href="' + url + '" target="_blank">' + url + '</a>'

    // Add the metadata in the modal
    $('#layer-metadata-modal .layer-metadata-name').append(name);
    $('#layer-metadata-modal .layer-metadata-url').append(link);

    // Display the modal
    $('#layer-metadata-modal').css('display', 'block');

  });

  /*
  ===============================================================================
  pop_ancienne_occitanie population layer dynamic styling
  ===============================================================================
  */
  // Population centroïds : proportional circles
  var myStyle = function(feature, viewResolution){
    // Getting the date out of the select widget
    var date = $('#pop_ancienne_occitanie-select-date-choice option:selected').text();
    // Getting the population value
    var pop = feature.get('pop' + date);
    // Setting the features zIndex so the smaller circles are displayed above the larger
    var index = 5000 - pop;
    // Defining the circle radius (the circle surface and the pop must be proportional)
    var coef = 4; // Proportionality coefficient
    var r = Math.cbrt(coef * (pop / Math.PI)); // Circle radius
    // Defining the style for each circle
    var style = new ol.style.Style({
      image: new ol.style.Circle({
        radius: r,
        fill: new ol.style.Fill({color: '#29959B'}),
        stroke: new ol.style.Stroke({
        color: '#ffffff',
        width: 2,
        }),
      }),
      zIndex: index,
    });
    // Returning the style at the end of the function
    return style;
  };

  /*
  // Setting the layer style when the map loads
  pop_ancienne_occitanie.setStyle(myStyle);

  // Setting the new style on date change
  $('#pop_ancienne_occitanie-select-date > select').on('change', function () {
    pop_ancienne_occitanie.setStyle(myStyle);
  });
  /*

  /*
  ===============================================================================
  Couches : widgets
  ===============================================================================
  */
  // Defining sliders for each div with class "range"
  function readyDefineSliders() {
    $('.range').each(function() {
      var cls       = $(this).attr('class');
      var matches   = cls.split(/([a-zA-Z]+)\-([0-9]+)/g);
      var elem      = $(this).parent();
      var options   = {};
      var input     = elem.find('input');
      elem.append('<div class="uirange"></div>');

      // Getting min and max values from <div class="">
      for(i in matches) {
        i = i * 1; // So the script understands i is an interger and not a string
        if(matches[i] == 'min') {
          options.min = matches[i+1]*1; // *1 for the same reason
        }
        if(matches[i] == 'max') {
          options.max = matches[i+1]*1; // *1 for the same reason
        }
      };

      // Display value in <label><span>[my value]</span></label> div
      options.slide = function (event, ui) {
        elem.find('label span').empty().append(ui.value);
        input.val(ui.value);
        (window[$(elem).attr('id').replace("-opacity", "")]).setOpacity(ui.value / 100);
      };

      options.value = input.val();
      options.range = 'min';
      elem.find('.uirange').slider(options);

      // Set layer opacity depending on the slider's value
      // It replaces the default opacity in the settings so it works when refreshed
      (window[$(elem).attr('id').replace("-opacity", "")]).setOpacity(options.value / 100);

      elem.find('label span').empty().append(input.val());
      input.hide();
    });
  }

  // Function to read widgets from a layer name
  function getWidgets (layerName) {
    var result = window[layerName].get('widgets');
    if (result == undefined) {
    } else {
      return result;
    }
  };

  // Function to test if a widget is called
  function checkWidget (widget, layer) {
    var widgets = getWidgets(layer);
    if (widgets == undefined) {

    } else {
      var array = widgets.split(" ");
      for ( var i = 0 ; i < array.length ; i++ ) {
        if ( array[i] == widget ) {
          var result = true;
          return result;
        }
      }
    }
  };

  // updateLegend function (to update legend with resolution changes)
  var updateLegend = function (layer, resolution) {
    // Getting legend png from GeoServer
    var source  = window[layer].get('source').getLegendUrl(resolution)+
                  ('&SLD_VERSION=1.1.0') +
                  ('&LEGEND_OPTIONS=fontName:Roboto;fontColor:262236;') +
                  ('fontSize:12;fontAntiAliasing:true;forceLabels:on;');
    // Targetting the "legend" widget div
    var target  = layer + "-img";
    // Getting the <img> DOM element out of the JQuery variable
    var img     = $('#'+target)[0];
    // Putting the legend's link in the img src
    img.src = source;
    // Targetting the "legend-float" on the floating legend
    var target_float = layer + "-float";
    var img_float = $('#'+target_float)[0];
    img_float.src = source;
  };

  // Auto legend Function
  function readyAutoLegend() {
    $('.widget-legend').each(function () {
      var layer   = $(this).attr('id').replace("-legend", "");
      var display = checkWidget('legend', layer);

      if (display == true) {

        // Set legend when document loads
        var resolution = map.getView().getResolution();
        updateLegend(layer, resolution);

        // Updates legends when resolution changes
        map.getView().on('change:resolution', function(event) {
          var resolution = event.target.getResolution();
          updateLegend(layer, resolution);
        });
      }
    });
  }

  /*
  // Custom legend to floating legend for pop_ancienne_occitanie
  $('.widget-customlegend').each(function () {
    // Get the layer name
    var layer = $(this).attr('id').replace("-customlegend","");
    // Get the chosen population year
    var year = $('#' + layer +'-select-date-choice option:selected').text();
    // Append the year to the legend title
    $('#' + layer + '-customlegendbox > p span').text(year);

    // Now display the floating legend
    var floatingbox = $('#' + layer + '-customlegendfloat').attr('id');
    // Append the date here too
    $('#' + floatingbox + ' > p span').text(year);
    // Get the png
    var source = $('#' + layer + '-customimg')[0].src;
    // And display the png
    var target = $('#' + layer + '-customimgfloat')[0];
    target.src = source;
  });

  // Update custom legend date on date change
  $('#pop_ancienne_occitanie-select-date > select').on('change', function () {
    var year = $('#pop_ancienne_occitanie-select-date-choice option:selected').text();
    var legendbox = $('#pop_ancienne_occitanie-customlegendbox > p span').text(year);
    var customlegendbox = $('#pop_ancienne_occitanie-customlegendfloat > p span').text(year);
  });

  // For choixAnnee and legendLevel widgets please refer to the following scripts
  // choixAnnee.js
  // legendLevel.js
  */

  /*
  ===============================================================================
  Request layers
  ===============================================================================
  */

  // Creating pop-up elements
  var popContainer = document.getElementById('popup');
  var popContent   = document.getElementById('popup-content');
  var popCloser    = document.getElementById('popup-closer');

  // Creating an overlay to anchor the popup to the map
  var popOverlay = new ol.Overlay({
    element: popContainer,
    autoPan: true,
    autoPanAnimation: {
      duration: 250,
    },
  });
  map.addOverlay(popOverlay);

  // Popup click handler: hiding
  $('#popup-closer').click(function () {
    popOverlay.setPosition(undefined);
    popCloser.blur();
    return false;
  });

  /*
  // Popup click handler: fetch and show if not empty
  // Request: commune name from WFS
  map.on('singleclick', function (evt) {
    if (bd_topo_communes.get('visible') == true) {
            var coordinate = evt.coordinate;
      console.log(coordinate);
      var popContent = document.getElementById('popup-content');
      popContent.innerHTML = "";
      console.log(popContent)
      var result = map.forEachFeatureAtPixel(
        evt.pixel,
        function (feature) {
          return feature;
        },
        {
          layerFilter: function (layer) {
            return layer === communes;
          },
        }
      );
      if (result == undefined) {
        console.log('NUUUUL');
        popContent.innerHTML = "";
        popOverlay.setPosition(undefined);
        popCloser.blur();
      } else {
        var name = result.get('nom');
        console.log(name);
        popContent.innerHTML = name;
        console.log(popContent);
        popOverlay.setPosition(coordinate);
      }
    }
  });
  */

  /*
  // Fetching WMS communes name on pop-up
  map.on('singleclick', function (evt) {
    // Check if bd_topo_communes is visible to prevent popup from appearing when it's not visible
    if (bd_topo_communes.get('visible') == true) {
      //document.getElementById('info').innerHTML = "";
      var popContent = document.getElementById('popup-content');
      popContent.innerHTML = "";
      var coordinate = evt.coordinate;
      var viewResolution = mainView.getResolution();
      var url = bd_topo_communesWMS.getFeatureInfoUrl(
        evt.coordinate,
        viewResolution,
        'EPSG:3857',
        {'INFO_FORMAT':'application/json'}
      );
      if (url) {
        fetch(url)
          .then(function (response) {
            return response.json();
            })
          .then(function (data) {
            if (data.features.length == 0) {
              popContent.innerHTML = "";
              popOverlay.setPosition(undefined);
              popCloser.blur();
            } else {
              //document.getElementById('info').innerHTML = data.features[0].properties.nom;
              popContent.innerHTML = data.features[0].properties.nom;
              popOverlay.setPosition(coordinate);
            }
          });
      }
    } else {
      popOverlay.setPosition(undefined);
      popCloser.blur();
    }

  });
  */

  /* Tooltip for pop_ancienne_occitanie */
  /*
  // Creating tooltip elements
  var poptooltipContainer = document.getElementById('pop-tooltip');
  var poptooltipContent   = document.getElementById('pop-tooltip-content');

  // Creating an overlay to anchor the popup to the map
  var poptooltipOverlay = new ol.Overlay({
    element: poptooltipContainer,
    autoPan: true,
    autoPanAnimation: {
      duration: 250,
    },
  });
  map.addOverlay(poptooltipOverlay);
  */

  /*
  // Binding a tooltip to pop_ancienne_occitanie
  map.on('pointermove', function (e) {
    // Checking if layer pop_ancienne_occitanie is visible
    if (pop_ancienne_occitanie.get('visible') == true) {
      var coordinate = e.coordinate;
      // Function to filter layers and get the clicked feature, stored in 'result'
      var result = map.forEachFeatureAtPixel(
        e.pixel,
        function (feature) {return feature;},
        {layerFilter: function (layer) {return layer === pop_ancienne_occitanie;}}
      );
      // Test if result is undefined (didn't click on a feature) or not
      if (result == undefined) {
        poptooltipContent.innerHTML = "";
        poptooltipOverlay.setPosition(undefined);
      } else {
        var name = result.get('nom');
        var date = $('#pop_ancienne_occitanie-select-date-choice option:selected').text();
        var dateName = "pop" + date;
        var pop = result.get(dateName);

        poptooltipContent.innerHTML =
          'Date : ' + date + '<br>\n' +
          name + '<br>\n' +
          'Population : ' + pop + '<br>\n';

        poptooltipOverlay.setPosition(coordinate);
      }
    }
  });
  */

  /*
  ===============================================================================
  Selecting WFS layers
  ===============================================================================
  */

  /*
  // bd_topo_communes layers : selection
  // Initializing the communeSelected variable (to stock the selected commune's name)
  var communeSelected = undefined;

  // Writing the request
  var communeSelectRequest = new ol.format.WFS().writeGetFeature({
    srsName: 'EPSG:3857',
    featureNS: 'http://resteaur-lag.teledetection.fr/geoserver/wfs?service=WFS&',
    featurePrefix: 'tetis',
    featureTypes: ['bd_topo_communes'],
    outputFormat: 'application/json',
    filter: ol.format.filter.equalTo('nom', 'Mauguio'),
  });
  console.log(communeSelectRequest);

  // Posting the request
  fetch('https://resteaur-lag.com/geoserver/wfs', {
    method: 'POST',
    body: new XMLSerializer().serializeToString(communeSelectRequest),
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      var commune = new ol.format.GeoJSON().readFeatures(json);
      communeSelectedSource.addFeatures(commune);
      map.getView().fit(communeSelectedSource.getExtent());
    });

  // Function to resquest and display the selected commune as a polygon
  $('#select-commune').click(function() {
    console.log('clicked');
  });
  */

  /*
  ===============================================================================
  Graphiques
  ===============================================================================
  */

  // Empty for now since we don't want to display any in Rivage Guadeloupe yet


  /*
  ===============================================================================
  Carte narrative
  ===============================================================================
  */
  /*================================================================*/
  // Tool for scaling font
  $('#font-scale-up').click(function() {
    var size = parseInt($('#story').css('font-size').replace('px',''));
    // Check if it already is max size
    if (size < 20) {
      // Remove "disabled" class for #font-scale-down
      $('#font-scale-down').removeClass('disabled-btn');

      // Calculate the new size
      size = size + 1;

        // Check if new size reached the limit
        if (size == 20) {
          // Add "disabled" class to #font-scale-up 
          $('#font-scale-up').addClass('disabled-btn');
        }

      // Update CSS content
      size = size + 'px';
      $('#story').css('font-size', size);

    }

  });

  $('#font-scale-down').click(function() {
    var size = parseInt($('#story').css('font-size').replace('px',''));
    // Check if it already is min size
    if (size > 10) {
        // Remove "disabled" class for #font-scale-up
        $('#font-scale-up').removeClass('disabled-btn');

        // Calculate the new size
        size = size - 1;

        // Check if new size reached the limit
        if (size == 10) {
            // Add "disabled" class to #font-scale-down 
            $('#font-scale-down').addClass('disabled-btn');
        }

        // Update CSS content
        size = size + 'px';
        $('#story').css('font-size', size);

    }

  });

  // This part needs loadStories.js to work, make sure it's called at the end
  // of the HTML code

  /*================================================================*/
  // Make sure the story links open in a new tab
  $(document).on('click', '.ol-storymap a', function() {
    window.open($(this).attr('href'));
    return false;
  });

  // Hiding story container panel
  $('#story-and-buttons').hide();
  $('#back-to-library-control').hide();



  /*================================================================*/
  /* Old content to delete later
  /*================================================================*/
  // Declaring global story variables
  /*
  var storyContent;
  var storyError = false;
  var storyParameters = {};

  // Get story source folder using story id
  function storySource(id) {
    var story_source = undefined;
    for (var i = 0; i < liste_histoires.length; i++) {
      if (liste_histoires[i].id === id) {
        story_source = liste_histoires[i].Source;
      }
    }
    return story_source;
  };

  // Function for fetching story content
  function getStory(source) {
    var url = "narration/" + source + "/" + source + ".csv";
    console.log(url);
    $.ajax({
      type: "GET",
      url: url,
      async: false,
      dataType: "text",
      success: function(data) {
        storyError = false;
        storyContent = $.csv.toObjects(data, {"separator" : "\t"});
      },
      error: function() {
        storyError = true;
        console.error("Couldn't fetch data source. " +
        "Please refer to 'notice.txt' for more informations.");
      }
    });
  };
  */
  /*================================================================*/

  /*================================================================*/
  // Grid width controls

  // Defining the default storytab and map grid area when the application loads
  var tab_default_position = 5; // Default tab grid column end
  var map_default_position = 2; // Defaut map grid column start
  var tab_map_limit = parseFloat($('#tab-Storytelling').css('grid-column-end')) + 1; // Default story tab column end position

  // Variable storing if the story is active or not
  var is_story_active = false;

  // Function to make sure the map takes the full screen width
  function gridRatioMapDefault() {
    $('.mappingArea').css('grid-column-start', map_default_position)
                     .css('grid-column-end', 15);
    map.updateSize();
  };

  // Function to edit the map's position when the story is active
  function gridRatioMap() {
    $('.mappingArea').css('grid-column-start', tab_map_limit)
                     .css('grid-column-end', 15);
    map.updateSize();
  };

  // Function to make sure the story tab takes its default size
  function gridRatioStoryDefault() {
    $('#tab-Storytelling').css('grid-column-end', tab_default_position)
                          .css('width', 'auto');
  };

  // Function to edit the story tab width
  function gridRatioStory() {
    $('#tab-Storytelling').css('grid-column-end', tab_map_limit)
                          .css('width', '100%');
  };

  // Function to swap between library ("bibliotheque narration") and the
  // actual story container
  function showStory() {
    // Tell that the story is active
    is_story_active = true;
    // Show and hide tabs
    $('#bibliotheque-narration').hide();
    $('#tab-Storytelling').css("overflow", "hidden");
    $('#story-and-buttons').show();
    $('#back-to-library-control').show();
    // Move the tab's grid area
    gridRatioStory();
    // Move the map's grid area
    gridRatioMap();
  };

  // Function to close the story and go back to the library
  function hideStory() {
    // Tell that story is inactive
    is_story_active = false;
    // Show and hide tabs
    $('#story-and-buttons').hide();
    $('#tab-Storytelling').css({'overflow-y': 'auto', 'overflow-x': 'hidden'});
    $('#bibliotheque-narration').show();
    $('#back-to-library-control').hide();
    // Move the tab's grid area
    gridRatioStoryDefault();
    // Move the map's grid 
    gridRatioMapDefault();
  };

  // Function to make sure the map regains its normal position when another tab is clicked
  $('.navlink').click(function() {
    // Define navlink id
    var navlink = $(this).attr('id');
    // Check if the tab was shrinked or not
    var is_shrinked = false;
    if ($('#tab-Storytelling').hasClass('shrink') == true) {
      var is_shrinked = true;
    }

    // If navlink-Storytelling is clicked and is_shrinked is true AND the story is active, make sure to display the map properly
    if (navlink == 'navlink-Storytelling' && is_shrinked == true && is_story_active == true) {
      gridRatioMap();
    } else { // The map goes back to its default position
      gridRatioMapDefault();
    }
  });

  // Tool for changing the tab and map ratio
  // Drawing the slider
  $('#story-map-ratio-slider').slider({
    value: tab_map_limit,
    min: tab_default_position,
    max: tab_default_position + 3,
    step: 1,
    change: function(event, ui) {
      // Update tab_map_limit
      tab_map_limit = parseFloat($('#story-map-ratio-slider').slider('value'));
      // Refresh the story and map ratio :
      // Move the tab's grid area
      gridRatioStory();
      // Move the map's grid area
      gridRatioMap();
      }
  });


  /*================================================================*/
  // Saving the user's map state before we display a story

  // Function to save the map's state before the user enters a story
  // Initializing global variables
  var saveLayersState = [];
  var saveFondCarte   = "";
  var dpsirBackup     = dpsirModel;

  function saveMapState() {
    // Rememeber current "fond de carte"
    saveFondCarte = $('.plan.plan-active').attr('id').replace("-toggle", "");

    // Resetting layers save state
    saveLayersState = [];
    // Check which layer is currently displayed and store in saveLayersState
    $('.layer-toggle > input[type=checkbox]').each(function() {
      var layerName = $(this).attr('id').replace("-checkbox", "");
      var layer = window[layerName];
      var visible = layer.get('visible');
      if (visible === true) {
        saveLayersState.push(layerName);
      }
    });

    // Saving the current DPSIR model state
    dpsirBackup = dpsirModel;
  };


  /*================================================================*/
  // Restaure the user's map's state as it was before the storymap was displayed

  // Function to restore the map's state before entering "story mode"
  function restoreMapState() {
    // Uncheck and hide all Layers
    hideAllLayers();

    // Force "click" events to display backup Layers
    for (var i = 0; i < saveLayersState.length; i++) {
      displayLayer(saveLayersState[i]);
    }

    // Displaying saved Fond de Carte
    changeFondDeCarte(saveFondCarte);

    // Update the legend
    emptyLegendMessage();

    // Restoring dpsirModel
    dpsirModel = dpsirBackup;
  };

  
  /*================================================================*/
  // Enable-disable DPSIR tool 

  // Function to disable model tool while in "story mode"
  function disableModelTool() {
    $('#modele-tools').hide();
    $('#disabled-model-message').show();
  };

  // Function to enable model tool when leaving "story mode"
  function enableModelTool() {
    $('#disabled-model-message').hide();
    $('#modele-tools').show();
  };
  enableModelTool();


  /*================================================================*/
  // Actually load and display the storymap // TODOS

  // Callback function to execute when the server sends the list of collections
  function libraryAddCollections(collections) {

    // Loop through collections to append them to the html content
    for (let i = 0; i < collections.length; i++) {
      var id = collections[i].id;
      var name = collections[i].name;

      // Write the HTML code to display the collections
      var html  =
      '<div id="collection-'+id+'" class="story-collection">' +
        '<div class="story-collection-title">' +
          '<a href="#" class="story-collection-toggle">' +
            '<svg class="theme-arrow deployedArrow"><use xlink:href="#iconeArrow" /></use></svg>' +
            '<p>'+name+'</p>' +
          '</a>' +
        '</div>' +
        '<div class="loader-container"><div class="loader"></div></div>' +
        '<div id="collection-'+id+'-content" class="story-collection-content"></div>' +
      '</div>';

      // Append the content to the interface
      $('#story-collection-themes').append(html);

    }
 
    // Now fetch all the published stories
    $.ajax({
      url: './public_api.php',
      method: 'POST',
      async: true,
      data: {mode:'published_stories'},
      dataType: 'json',
      // Show a loader while app is fetching the published stories
      beforeSend: function() {
        $('#story-collection-themes .loader-container').each(function () {
          $(this).show();
        });
      },
      success: function(response) {
          // Check if success = true or false
          if (response.success === true) {

            // What to do if no books are published
            if (response.books_list === 'empty') {

              // Add a message in each collection content 
              $('.story-collection').each(function () {
                var id = $(this).attr('id').replace('collection-', '');
                infoEmptyCollection(id);
              });

            } else { // If some books are published

              // Add these stories to the library
              libraryAddStorymaps(response.books_list);

            }

          } else {
              console.error(response.error);
              $('#bibliotheque-narration .error').show();
          }
      },
      // Remove the loader once the query is completed
      complete: function() {
        $('#story-collection-themes .loader-container').each(function () {
          $(this).hide();
        });
      },
      // Display an error message is the query failed
      error: function(response) {
          console.error(response.error);
          $('#bibliotheque-narration .error').show();
      }
    });

  }

  // Callback function to execute when the server sends the list of published stories
  function libraryAddStorymaps(books_list) {
    
    for (let i = 0; i < books_list.length; i++) {

      // Extract the values we need
      var id = books_list[i].id;
      var title = escapeHtmlRevert(books_list[i].title);
      var abstract = escapeHtmlRevert(books_list[i].abstract);
      var collection_id = books_list[i].collection_id;

      // Write the html content for each story to add to the interface
      var html =
      '<div class="story-button-div">' +
        '<a href="#"  id="story-button-' + id + '" class="story-button">' +
          '<p>' + title + '</p>' +
          '<p>' + abstract + '</p>' +
        '</a>' +
      '</div>';

      // And append this content to the right collection
      $('#collection-' + collection_id + '-content').append(html);
      
    }

    // Once this is done, display the infoEmptyCollection message if a collection is left empty
    $('.story-collection-content').each(function () {

      // Fetch the variables we need
      var id = $(this).attr('id').replace('collection-', '').replace('-content', '');
      var content = $(this).find('.story-button-div');

      // If the collection does not contain any story, display the message
      if (content.length == 0) {
        infoEmptyCollection(id);
      }

    });

  }

  // Function to display a message if a story collection is empty
  function infoEmptyCollection(collection_id) {
    var message = '<p><i>Cette collection ne contient encore aucune carte narrative.</i></p>';
    $('#collection-' + collection_id + '-content').append(message);
    $('#collection-' + collection_id).find('.story-collection-toggle').trigger('click');
  }

  // Request the database to load the collections and the published stories
  function loadStoryLibrary() {

    // Start by emptying the published-storymaps div just in case
    $('#published-storymaps').empty();

    // Hide the error message
    $('#bibliotheque-narration .error').hide();

    // Now query the database to fetch all the collections and published stories
    $.ajax({
      url: './public_api.php',
      method: 'POST',
      async: true,
      data: {mode:'collections'},
      dataType: 'json',
      // Show a loader while app is fetching the published stories
      beforeSend: function() {
        $('#bibliotheque-narration .loader-container').show();
      },
      success: function(response) {
          // Check if success = true or false
          if (response.success === true) {

            // Add the books and collections to the library
            libraryAddCollections(response.collections);

          } else {
              console.error(response.error);
              $('#bibliotheque-narration .error').show();
          }
      },
      // Remove the loader once the query is completed
      complete: function() {
          $('#bibliotheque-narration .loader-container').hide();
      },
      // Display an error message is the query failed
      error: function(response) {
          console.error(response.error);
          $('#bibliotheque-narration .error').show();
      }
    });

  }

  loadStoryLibrary(); // Load the storymaps library as soon as the application is ready

  // Load a storymap content when a story button is clicked
  // The main variables and functions used here are located in storymaps_templates.js and load_stories.js
  // If you encounter any "function() is not defined" issue, make sure these two .js scripts are called at the bottom of map.php
  $(document).on('click', '.story-button-div', function () {

    // Fetch the book's id
    var id = $(this).find('.story-button').attr('id').replace('story-button-', '');
    
    // Call the function for writing the story
    writeStoryMap(map,'map.php',id);

    // Display the story and hide the library
    saveMapState();
    disableModelTool();
    showStory();

    // Refresh the map
    map.updateSize();

  });

  // Function to go back to the library
  function backToLibrary() {
    is_story_active = false;
    $('.mappingArea').css('grid-column-start', map_default_position);
    map.updateSize();
    hideStory();
    restoreMapState();
    enableModelTool();
  }

  // Close story when the "back-to-library" button is clicked // TODO
  $('#back-to-library').on('click', function() {
    backToLibrary();
  });

  // Close story when the "back-to-library-control" button is clicked
  $('#back-to-library-control').on('click', function() {
    backToLibrary();
  });

  // Close story when the "back-to-library-arrow" button is clicked
  $('#back-to-library-arrow').on('click', function() {
    backToLibrary();
  });

  /*================================================================*/
  /* Old content to delete later
  /*================================================================*/
  /*
  // Function to write and display the story
  function createStory(source, storyContent) {
    // Getting the bounds we want to fly to
    storyParameters = {};
    for (var i = 0; i < storyContent.length; i++) {
      var chap    = storyContent[i].Chapitres;
      var lon     = Number(storyContent[i].Longitude);
      var lat     = Number(storyContent[i].Latitude);
      var zoom    = Number(storyContent[i].Zoom);
      var fond    = storyContent[i].FondDeCarte;
      var couche1 = storyContent[i].Couche1;
      var couche2 = storyContent[i].Couche2;
      var couche3 = storyContent[i].Couche3;
      var couche4 = storyContent[i].Couche4;
      var couche5 = storyContent[i].Couche5;
      storyParameters[chap] = {xy: ol.proj.fromLonLat([lon, lat]),
                                z: zoom,
                                fond: fond,
                                couche1 : couche1,
                                couche2 : couche2,
                                couche3 : couche3,
                                couche4 : couche4,
                                couche5 : couche5
                              };
    };

    // Write the story content
    var storyHTML   = "";
    var startHTML   = "";
    var chapterHTML = "";

    // Empty the story div
    $('#story').empty();

    for (var i = 0; i < storyContent.length; i++) {
      if (storyContent[i].Chapitres === "Introduction") {
        startHTML =
        '<div class="chapter" name="Introduction">' +
        '<h2>' + storyContent[i].Titre + '</h2>' +
        '<p>' + storyContent[i].Texte + '</p>' +
        '<div class="ol-scroll-next"><span>Début</span></div>' +
        '</div>';
      } else {
        chapterHTML =
        '<div class="chapter" name="' + storyContent[i].Chapitres + '">' +
        '<h2>' + storyContent[i].Titre + '</h2>' +
        '<img class="story-media" data-title="' + storyContent[i].Legende +
        '" src="narration/' + source + '/' + storyContent[i].Image + '" />' +
        '<p>' + storyContent[i].Texte + '</p>' +
        '<p class="source">' + storyContent[i].Source + '</p>';
        if (i === (storyContent.length - 1)) {
          chapterHTML = chapterHTML +
          '<div class="ol-scroll-top"><span>Retourner au début</span></div>';
        }
        chapterHTML = chapterHTML + '</div>';
        storyHTML = storyHTML + chapterHTML;
      }
    };

    // Append the whole content
    storyHTML = startHTML + storyHTML;
    $('#story').append(storyHTML);

    // Target the $('#story') element
    var storyContainer = new ol.control.Storymap({
      target: document.getElementById('story')
    });

    // Show image fullscreen on click
    var fullscreen = new ol.control.Overlay ({ hideOnClick: true, target: document.body });
    map.addControl(fullscreen);
    storyContainer.on('clickimage', function(e){
     fullscreen.showImage(e.img.src, { title: e.title });
     $('.ol-fullscreen-image').parent().css('z-index', 999999999).css('background-color', 'rgba(0,0,0,.9)');
    });

    // Map interactions
    //Fly to the center of the map
    storyContainer.on('scrollto', function(e) {

      /*
      // Display IGN map when story is opened
      var active = $('#navlink-Storytelling').hasClass('active');
      if (active == true) {
        // Add IGN map
          $('.plan').removeClass('plan-active');
          $('.plan').each(function () {
          var removeId = $(this).attr('id');
          map.removeLayer(window[getPlan(removeId)]);
        });
        $('#planIGN-toggle').addClass('plan-active');
        map.addLayer(planIGN);
      }
      */

      // Storymap code
      /*
      $('#story-test .chapter').removeClass('select');
      $(e.element).addClass('select');
      map.getView().cancelAnimations();
      if (e.name === 'Introduction') {
        // Fetch Fond de Carte
        if (storyParameters[e.name].fond.length > 0) {
          changeFondDeCarte(storyParameters[e.name].fond);
        }

        // Hide all displayed layers
        hideAllLayers();

        // Fetch layers to display
        var neededLayers = [];
        neededLayers.push(storyParameters[e.name].couche1);
        neededLayers.push(storyParameters[e.name].couche2);
        neededLayers.push(storyParameters[e.name].couche3);
        neededLayers.push(storyParameters[e.name].couche4);
        neededLayers.push(storyParameters[e.name].couche5);
        for (var i = 0; i < neededLayers.length; i++) {
          if (neededLayers[i].length != 0) {
            displayLayer(neededLayers[i]);
          }
        };

        // Move view
        map.getView().animate({
          center: storyParameters[e.name].xy,
          zoom: storyParameters[e.name].z
        });
      } else {
        // Fetch Fond de Carte
        if (storyParameters[e.name].fond.length > 0) {
          changeFondDeCarte(storyParameters[e.name].fond);
        }

        // Hide all displayed layers
        hideAllLayers();

        // Fetch layers to display
        var neededLayers = [];
        neededLayers.push(storyParameters[e.name].couche1);
        neededLayers.push(storyParameters[e.name].couche2);
        neededLayers.push(storyParameters[e.name].couche3);
        neededLayers.push(storyParameters[e.name].couche4);
        neededLayers.push(storyParameters[e.name].couche5);
        console.log("neededLayers");
        console.log(neededLayers);
        for (var i = 0; i < neededLayers.length; i++) {
          if (neededLayers[i].length != 0) {
            displayLayer(neededLayers[i]);
          }
        };

        // Move view
        var duration = 2000;
        map.getView().animate({
          center: storyParameters[e.name].xy,
          duration: duration
        });
        map.getView().animate({
          zoom: storyParameters[e.name].z,
          duration: duration
        }, {
          zoom: storyParameters[e.name].z,
          duration: duration/2
        });
      }
    });

    // Add the story control to the map
    map.addControl(storyContainer);
    console.log("Story control added");

  };
  */

  /*
  // Get story id on click on story-button and display the content
  $('.story-button').on('click', function() {
    storyId = $(this).attr('id').replace("story-button-","");
    storyId = Number(storyId);
    source  = storySource(storyId);
    // Fetch the right data
    getStory(source);
    // Display the story if there is no loading error
    if (storyError === false) {
      console.log(storyContent);
      createStory(source, storyContent);
      saveMapState();
      disableModelTool();
      showStory();
    }
  });

  // Close story when the "back-to-library" button is clicked
  $('#back-to-library').on('click', function() {
    is_story_active = false;
    $('.mappingArea').css('grid-column-start', map_default_position);
    map.updateSize();
    hideStory();
    restoreMapState();
    enableModelTool();
  });

  // Close story when the "back-to-library-control" button is clicked
  $('#back-to-library-control').on('click', function() {
    is_story_active = false;
    $('.mappingArea').css('grid-column-start', map_default_position);
    map.updateSize();
    hideStory();
    restoreMapState();
    enableModelTool();
  });
  */

  /*
  ===============================================================================
  Modèles
  ===============================================================================
  */

  // fly-to-area button
  $('#fly-to-area').on('click', function() {
    var area = $('#area-choice').val();
    mainView.animate({
      center: window[area][0],
      zoom: window[area][1]
    });
  });

  // Init empty DPSIR table when the app loads
  var dpsirModel = [
    {layer: 'null', attribute: 'null'},
  ];
  dpsirModel.splice(0, 1);

  // check which layers are displayed when the app loads and add to model
  // And hide unnecessary error messages
  // Called when the map loads
  $('.dpsir-line').each(function () {
    $('#too-many-states').hide();
    var layer = $(this).attr('id').replace("-dpsir", "");
    var visible = window[layer].get('visible');
    if ( visible == false ) {
      $(this).hide();
    }
  });

  // Function to add element to diagram
  function addToDiagram(attr, layer)  {
    var title = window[layer].get('title');
    var html = '<div id="'+ layer +'-DPSIR-content" class="DPSIR-content">' +
    title +
    '</div>';
    $('#diagram-' + attr).append(html);
  };

  // Function to remove element from diagram
  function removeFromDiagram(layer) {
    var id = layer + '-DPSIR-content';
    $('#'+id).remove();
  };

  // Add or remove layer when displayed on the map
  $('.layer-toggle > input[type=checkbox]').click(function() {
    var layer = $(this).attr('id').replace("-checkbox", "")
    var dpsirLine = $(this).attr('id').replace("-checkbox", "-dpsir");
    if ( $(this).is(':checked') ) {
      $('#' + dpsirLine).show();
    } else {
      $('#' + dpsirLine).hide();
      removeFromDiagram(layer);
      for (var i = 0; i < dpsirModel.length; i++) {
        if ( layer == dpsirModel[i].layer ) {
          dpsirModel.splice(i, 1);
        }
      }
    }
  });

  // /!\ Function to update error messages /!\
  function errorsDPSIR() {
    var errors = 0;
    var errorDate = [];
    var stateCount = 0;
    var pressure = false;
    var impact = false;
    var attrD = []; // Store Drivers (Forces Motrices)
    var attrP = []; // Store Pressures (Pressions)
    var attrS = []; // Store State (Etat)
    var attrI = []; // Store Impacts (Impacts)
    var attrR = []; // Store Responses (Réponses)
    var dbtA = "";
    var finA = "";
    var dbtB = "";
    var finB = "";

    // Check if the model doesn't contain chronological errors :
    // Storing all attributes in the right array
    for (var i = 0; i < dpsirModel.length; i++) {
      if (dpsirModel[i].attribute == 'driver') {
        attrD.push(dpsirModel[i].layer);
      }
      if (dpsirModel[i].attribute == 'pressure') {
        attrP.push(dpsirModel[i].layer);
      }
      if (dpsirModel[i].attribute == 'state') {
        attrS.push(dpsirModel[i].layer);
      }
      if (dpsirModel[i].attribute == 'impact') {
        attrI.push(dpsirModel[i].layer);
      }
      if (dpsirModel[i].attribute == 'response') {
        attrR.push(dpsirModel[i].layer);
      }
    }

    // Checking if there is a chronological error in the model
    // Checking for drivers
    for (var i = 0; i < attrD.length; i++) {
      dbtA = window[attrD[i]].get('debutTemp');
      finA = window[attrD[i]].get('finTemp');
      for (var j = 0; j < dpsirModel.length; j++) {
        if (dpsirModel[j].attribute != 'driver') {
          dbtB = window[dpsirModel[j].layer].get('debutTemp');
          finB = window[dpsirModel[j].layer].get('finTemp');
          if ( (dbtA <= dbtB && finA <= finB) == false) {
            errors = errors + 1;
            errorDate.push({ant: attrD[i], post: dpsirModel[j].layer});
          }
        }
      }
    }
    // Checking for pressures
    for (var i = 0; i < attrP.length; i++) {
      dbtA = window[attrP[i]].get('debutTemp');
      finA = window[attrP[i]].get('finTemp');
      for (var j = 0; j < dpsirModel.length; j++) {
        if ((dpsirModel[j].attribute != 'driver' &&
             dpsirModel[j].attribute != 'pressure') == true) {
          dbtB = window[dpsirModel[j].layer].get('debutTemp');
          finB = window[dpsirModel[j].layer].get('finTemp');
          if ( (dbtA <= dbtB && finA <= finB) == false) {
            errors = errors + 1;
            errorDate.push({ant: attrP[i], post: dpsirModel[j].layer});
          }
        }
      }
    }
    // Checking for state
    for (var i = 0; i < attrS.length; i++) {
      dbtA = window[attrS[i]].get('debutTemp');
      finA = window[attrS[i]].get('finTemp');
      for (var j = 0; j < dpsirModel.length; j++) {
        if ((dpsirModel[j].attribute != 'driver' &&
             dpsirModel[j].attribute != 'pressure' &&
             dpsirModel[j].attribute != 'state') == true) {
          dbtB = window[dpsirModel[j].layer].get('debutTemp');
          finB = window[dpsirModel[j].layer].get('finTemp');
          if ( (dbtA <= dbtB && finA <= finB) == false) {
            errors = errors + 1;
            errorDate.push({ant: attrS[i], post: dpsirModel[j].layer});
          }
        }
      }
    }
    // Checking for impacts
    for (var i = 0; i < attrS.length; i++) {
      dbtA = window[attrS[i]].get('debutTemp');
      finA = window[attrS[i]].get('finTemp');
      for (var j = 0; j < dpsirModel.length; j++) {
        if ((dpsirModel[j].attribute != 'driver' &&
             dpsirModel[j].attribute != 'pressure' &&
             dpsirModel[j].attribute != 'state' &&
             dpsirModel[j].attribute != 'impact') == true) {
          dbtB = window[dpsirModel[j].layer].get('debutTemp');
          finB = window[dpsirModel[j].layer].get('finTemp');
          if ( (dbtA <= dbtB && finA <= finB) == false) {
            errors = errors + 1;
            errorDate.push({ant: attrS[i], post: dpsirModel[j].layer});
          }
        }
      }
    }

    // Display the corresponding error messages
    // Removing all the errorDate messages before adding new ones
    $('.error-date').remove();
    for (var i = 0; i < errorDate.length; i++) {
      var html = '<li class="dpsir-error error-date">' +
      'La couche ' +
      errorDate[i].ant +
      ' est trop ancienne pour être postérieure à la couche ' +
      errorDate[i].post +
      ' dans le modèle.' +
      '</li>';
      $('#dpsir-error-list').append(html);
    }

    // Check if the model contains : one state, at least one pressure,
    // at least one impact :

    for (var i = 0; i < dpsirModel.length; i++) {
      // Look for at least one state
      if (dpsirModel[i].attribute == 'state') {
        stateCount = stateCount + 1;
      }
      // Look for at least one pressure
      if (dpsirModel[i].attribute == 'pressure') {
        pressure = true;
      }
      // Look for at least one Impact
      if (dpsirModel[i].attribute == 'impact') {
        impact = true;
      }
    }

    // Is there more than one state ?
    if (stateCount < 1) {
      $('#missing-state').show();
      $('#too-many-states').hide();
    }
    if (stateCount == 1) {
      $('#missing-state').hide();
      $('#too-many-states').hide();
    }
    if (stateCount > 1) {
      $('#missing-state').hide();
      $('#too-many-states').show();
      errors = errors + 1;
    }

    // Is there at least one pressure ?
    if (pressure == true) {
      $('#missing-pressure').hide();
    } else {
      $('#missing-pressure').show();
      errors = errors + 1;
    }

    // Is there at least one impact ?
    if (impact == true) {
      $('#missing-impact').hide();
    } else {
      $('#missing-impact').show();
      errors = errors + 1;
    }

    // Keep this part at the end of the function :
    // Is there at least one error ?
    if (errors == 0) {
      $('#dpsir-message').removeClass('invalid').addClass('valid');
      $('#dpsir-message-title').html('Modèle valide');
    } else {
      $('#dpsir-message').removeClass('valid').addClass('invalid');
      $('#dpsir-message-title').html('Modèle invalide');
    }

  };

  /* Drawing SVG arrows in the DPSIR model diagram */

  // Initializing measuring Variables
  var diagramDimensions = {
    driver: {h:0, w:0},
    pressure: {h:0, w:0},
    state: {h:0, w:0},
    impact: {h:0, w:0},
    response: {h:0, w:0},
    total: {h:0, w:0}
  };

  // Initializing start and end points for each line
  var lines = {
    driverpressure : {x1:75 , y1:0 , x2:75 , y2:16 },
    pressurestate : {x1:75 , y1:0 , x2:75 , y2:16 },
    stateimpact : {x1:75 , y1:0 , x2:75 , y2:16 },
    impactresponse : {x1:150 , y1:178 , x2:190 , y2:108 },
    responseimpact : {x1:190 , y1:98 , x2:150 , y2:168 },
    responsestate : {x1:190 , y1:94 , x2:154 , y2:118 },
    responsepressure : {x1:190 , y1:88 , x2:154 , y2:68 }
  }

  // Function for updating measuring Variables
  function measureDiagram() {
    diagramDimensions.driver.h = $('#diagram-driver').height() + 8;
    diagramDimensions.driver.w = $('#diagram-driver').width() + 8;
    diagramDimensions.pressure.h = $('#diagram-pressure').height() + 8;
    diagramDimensions.pressure.w = $('#diagram-pressure').width() + 8;
    diagramDimensions.state.h = $('#diagram-state').height() + 8;
    diagramDimensions.state.w = $('#diagram-state').width() + 8;
    diagramDimensions.impact.h = $('#diagram-impact').height() + 8;
    diagramDimensions.impact.w = $('#diagram-impact').width() + 8;
    diagramDimensions.response.h = $('#diagram-response').height() + 8;
    diagramDimensions.response.w = $('#diagram-response').width() + 8;
    diagramDimensions.total.h = $('#diagram-section').height();
    diagramDimensions.total.w = $('#diagram-section').width();
  };

  // Function know how many diagram parts are ready (heights above 8px)
  // 8px = padding, so height > 8px means the element isn't empty
  function checkHeights() {
    var ready = 0;
    measureDiagram();
    if (diagramDimensions.driver.h > 8) {
      ready = ready + 1;
    }
    if (diagramDimensions.pressure.h > 8) {
      ready = ready + 1;
    }
    if (diagramDimensions.state.h > 8) {
      ready = ready + 1;
    }
    if (diagramDimensions.impact.h > 8) {
      ready = ready + 1;
    }
    if (diagramDimensions.response.h > 8) {
      ready = ready + 1;
    }
    return ready;
  };

  // Function to get the x1, y1, x2, y2 for each arrow
  function diagramArrows() {
    var d = diagramDimensions;
    var line = "";
    // driver-pressure arrow
    line = lines.driverpressure;
    line.x1 = d.driver.w / 2;
    line.y1 = 0;
    line.x2 = line.x1 ;
    line.y2 = 16;
    // pressure-state arrow
    line = lines.pressurestate;
    line.x1 = d.state.w / 2;
    line.y1 = 0;
    line.x2 = line.x1;
    line.y2 = 16;
    // state-impact arrow
    line = lines.stateimpact;
    line.x1 = d.impact.w / 2;
    line.y1 = 0;
    line.x2 = line.x1;
    line.y2 = 16;
    // impact-response arrow
    line = lines.impactresponse;
    line.x1 = d.impact.w;
    line.y1 = d.total.h - (d.impact.h / 2) + 6;
    line.x2 = d.total.w - (d.response.w / 1.2);
    line.y2 = (d.total.h / 2) + (d.response.h / 2) + 4;
    // response-impact arrow
    line = lines.responseimpact;
    line.x1 = d.total.w - d.response.w;
    line.y1 = d.total.h / 2 + 4;
    line.x2 = d.impact.w + 2;
    line.y2 = d.total.h - (d.impact.h / 2) - 6;
    // response-state arrow
    line = lines.responsestate;
    line.x1 = d.total.w - d.response.w;
    line.y1 = d.total.h / 2;
    line.x2 = d.state.w + 4;
    line.y2 = d.driver.h + d.pressure.h + (d.state.h / 2) + 40;
    // response-pressure arrow
    line = lines.responsepressure;
    line.x1 = d.total.w - d.response.w;
    line.y1 = d.total.h / 2 - 4;
    line.x2 = d.pressure.w + 4;
    line.y2 = d.driver.h + (d.pressure.h / 2) + 20;
  };

  // Function to draw the SVG arrows
  function drawSVG() {
    // Get the right coordinates
    measureDiagram();
    diagramArrows();
    // Iterating through the lines object to update SVG polylines
    var points = "";
    var entries = Object.entries(lines);
    for (entries of entries) {
      var coord = entries[1];
      points = coord.x1 + "," + coord.y1 + " " + coord.x2 + "," + coord.y2;
      $('#' + entries[0]).attr('points', points);
    }

  };

  /* Check if all the elements are ready, only when the "modèles" tool is active */
  // Do it only when "Modèles" is first clicked
  // If not used, diagram may have trouble displaying when "Modèles" loads
  var firstModeleClick = true;
  $('#navlink-Modeles').on('click', function() {
    if (firstModeleClick == true) {
      firstModeleClick = false;
      var checkExist = setInterval(function() {
        var ready = checkHeights();
        if (ready == 5) {
          drawSVG();
          $('#diagram-section').css("visibility", "visible");
          clearInterval(checkExist);
        }
      }, 100);
    }
  });

  /* Update arrows position when user redimensions app window */
  // Wait for end of resizing
  var waitForFinalEvent = (function () {
          var timers = {};
          return function (callback, ms, uniqueId) {
              if (!uniqueId) {
                  uniqueId = "Don't call this twice without a uniqueId";
              }
              if (timers[uniqueId]) {
                  clearTimeout(timers[uniqueId]);
              }
              timers[uniqueId] = setTimeout(callback, ms);
          };
      })();
  // Apply function on window resizing
  $(window).on('resize', function() {
    waitForFinalEvent(function() {
      drawSVG();
    }, 500, "en attente de la fin du redimensionnement");
  });

  /* Update DPSIR model */
  // Stock / update dpsir attributes in a table
  $('.dpsir-line-select').change(function () {
    var layer = $(this).parent().attr('id').replace("-dpsir", "");
    var dpsirAttr = $(this).val();
    var exists = false;

    // Update element in the array
    for (var i = 0; i < dpsirModel.length; i++) {
      if (layer == dpsirModel[i].layer) {
        var exists = true;
        // Get where was the layer stored before applying changes
        var formerAttr = dpsirModel[i].attribute;
        // Remove is DPSIR attribute is 'none'
        if ( dpsirAttr == 'none' ) {
          dpsirModel.splice(i, 1);
          removeFromDiagram(layer);
          console.log("remove");
        } else {
          // Update layer in the table
          dpsirModel[i].attribute = dpsirAttr;
          // Remove layer from current position in diagram
          removeFromDiagram(layer);
          // Add layer on new diagram position
          addToDiagram(dpsirAttr, layer);
          console.log("update");
        }
      }
    }

    // Add new element to array and diagram
    if ( exists == false ) {
      var newElement = {layer : layer, attribute : dpsirAttr};
      dpsirModel.push(newElement);
      addToDiagram(dpsirAttr, layer);
      console.log("add");
    }

    // console.log(dpsirModel);
    errorsDPSIR();

    // Redraw SVG arrows
    drawSVG();

  });


// End of the Document Ready function (wraps the whole above code)
});

/*=======================================================================================================================*/
/* ===================================================================================================================== */
/*                     Functions to be accessible outside this script (used in load_stories.js)                          */
/* ===================================================================================================================== */

/*================================================================*/
// Show, hide and toggle layers

// Function to change displayed basemap
function changeFondDeCarte(fond) {
  // Hiding all "Fonds de Carte"
  $('.plan').each(function() {
    $(this).removeClass('plan-active');
    var remove = $(this).attr('id').replace("-toggle", "");
    map.removeLayer(window[remove]);
  });
  // Displaying saved "Fond de Carte"
  $('#' + fond + '-toggle').addClass('plan-active');
  map.addLayer(window[fond]);
};

// Function to hide all layers on the map
function hideAllLayers() {
  // Uncheck and hide all Layers
  $('.layer-toggle > input[type=checkbox]').each(function() {
    var layerName      = $(this).attr('id').replace("-checkbox", "");
    var layer          = window[layerName];
    var getLegendId    = layerName + "-floatbox";
    var floatingLegend = $('#'+getLegendId);
    var visible        = layer.get('visible');
    $(this).prop('checked', false);
    layer.setVisible(false);
    floatingLegend.hide();
  });
};

// Function to trigger a "click" event on a layer checkbox
// Use it to display / hide layers
function triggerLayer(layer) {
  $('#' + layer + '-checkbox').trigger('click');
};

// Same function but only to display layer
function displayLayer(layer) {
  var checkbox = $('#' + layer + '-checkbox');
  if (checkbox.prop('checked') === false) {
    checkbox.trigger('click');
  }
};

// Same function but only to hide layer
function hideLayer(layer) {
  var checkbox = $('#' + layer + '-checkbox');
  if (checkbox.prop('checked') === true) {
    checkbox.trigger('click');
  }
};

// Check if no layer is displayed so we can show a message in the floating legend
function emptyLegendMessage() { // TODO
  var empty = true;
  $('.layer-toggle > input[type=checkbox]').each(function () {
    if ($(this).is(':checked')) {
      empty = false;
    }
  });

  if (empty == true) {
    $('.floatLegend').hide();
    $('#float-empty-message').show();
  } else {
    $('.floatLegend').show();
    $('#float-empty-message').hide();
  }
}
