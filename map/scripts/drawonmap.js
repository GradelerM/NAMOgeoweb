jQuery(document).ready(function() {

  /* Initializing variables to be called later in the code */
  var addMarker = false;
  var editMarker = false;
  var removeMarker = false;

  var draw; // Declared here so it is a global variable
  var edit; // Declared here so it is a global variable
  var feature; // Declared here so it is a global variable

  var markerPopContainer  = document.getElementById('delete-marker-pop');
  var markerPopContent    = document.getElementById('delete-marker-pop-content');

  // Creating the confirmation pop-up overlay for deletion
  var markerDeleteOverlay = new ol.Overlay({
    element: markerPopContainer,
    autoPan: true,
    autoPanAnimation: {duration: 250},
  });
  map.addOverlay(markerDeleteOverlay);

  // Creating the drawing layer
  var markerSource = new ol.source.Vector({wrapX: false});
  var markerLayer = new ol.layer.Vector({
    source: markerSource,
    zIndex: 3000,
  });
  map.addLayer(markerLayer);

  /* Initializing functions to be called later in the code */
  // Function to add a marker to the map
  function drawMarker() {
      draw = new ol.interaction.Draw({
        source: markerSource,
        type: 'Point'
      });
    map.addInteraction(draw);
  };

  // Function to stop drawing
  function stopDrawMarker() {
    addMarker = false;
    $('#add-marker').removeClass('using');
    map.removeInteraction(draw);
  };

  // Declaring marker edition interaction
  edit = new ol.interaction.Modify({
    source: markerSource,
  });

  // Function to stop editing markers
  function stopEditMarker() {
    editMarker = false;
    $('#edit-marker').removeClass('using');
    map.removeInteraction(edit);
  };

  // Function to stop deleting a marker
  function stopDeleteMarker() {
    removeMarker = false;
    $('#remove-marker').removeClass('using');
    markerDeleteOverlay.setPosition(undefined);
  };

  // Function to delete a marker
  function deleteMarker(e) {
    var coordinates = e.coordinate;
    var feature = map.forEachFeatureAtPixel(
      e.pixel,
      function (feature) {return feature;},
      {layerFilter: function (layer) {return layer === markerLayer;}}
    );
    if (feature != undefined) {
      // Display information pop-up for confirmation
      markerDeleteOverlay.setPosition(coordinates);
      return feature;
    } else {
      stopDeleteMarker();
    }
  };

  /* Calling functions */
  // Custom dropdown control for adding a marker to the map
  $('#marker-control').on('click', function() {
    var dropdown = $(this).next('.control-dropdown');
    if (dropdown.hasClass('collapsed') == true) {
      $(this).addClass('focus');
      dropdown.removeClass('collapsed');
      dropdown.slideDown('fast');
    } else {
      $(this).removeClass('focus');
      dropdown.slideUp('fast');
      setTimeout(function() {
      dropdown.addClass('collapsed');
      }, 200);
      // Cancel all actions on the marker layer
      stopDrawMarker();
      stopEditMarker();
      stopDeleteMarker();
    }
  });

  // Adding marker when the add-marker button is clicked
  // Allow user to cancel drawing when he clicks again on the add-marker button
  $('#add-marker').on('click', function() {
    // Stop other interactions with markerLayer
    stopEditMarker();
    stopDeleteMarker();

    // Start the drawing interaction
    if (addMarker == false) { // Start drawing
      addMarker = true;
      $(this).addClass('using');
      drawMarker();
      // Cancel the two other options if they were selected

    } else { // Cancel drawing
      stopDrawMarker();
    }
  });

  // Start editing the map when the right tool is selected
  $('#edit-marker').on('click', function() {
    // Stop other interactions with markerLayer
    stopDrawMarker();
    stopDeleteMarker();

    // Start the editing interaction
    if (editMarker == false) { // Start editing
      editMarker = true;
      $(this).addClass('using');
      map.addInteraction(edit);
    } else {
      stopEditMarker();
    }
  });

  // Selecting "delete marker" tool
  $('#remove-marker').on('click', function() {
    // Stop other interactions with markerLayer
    stopDrawMarker();
    stopEditMarker();

    // Start the removing interaction
    if (removeMarker == false) { // Start deleting
      removeMarker = true;
      $(this).addClass('using');
      // On which feature of the map did the user click ?
      map.on('click', function(e) {
        if (removeMarker == true) {
          feature = deleteMarker(e);
        }
      });
    } else {
      stopDeleteMarker();
    }
  });

  // The user confirms he wants to delete this feature
  $('#delete-marker-confirm').on('click', function() {
    markerSource.removeFeature(feature);
    stopDeleteMarker();
  });

  // The user wants to keep his marker
  $('#delete-marker-abort').on('click', function() {
    stopDeleteMarker();
  });

  // Stop interactions after the map has been clicked once
  $('#map').on('click', function() {
    stopDrawMarker();
    stopEditMarker();
  });

});
