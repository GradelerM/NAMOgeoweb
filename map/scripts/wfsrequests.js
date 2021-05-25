jQuery(document).ready(function() {

/* This script is for requesting features from geoserver and adding them to a layer made for visualisation only. */

/*
===============================================================================
Testing CORS - development purpose, delete later
===============================================================================
*/

// Generating the empty layer for storing selection
var testSource = new ol.source.Vector();
var testLayer = new ol.layer.Vector({
  source: testSource,
  opacity: 1,
  visible: true,
  zIndex: 1100,
});
map.addLayer(testLayer);


// Writing the ajax request for Montpellier
function loadMontpellier() {
    $.ajax({
        method: 'POST',
        url: 'https://resteaurlag.anatidaepho.be/geoserver/wfs',
        data: {
        "service": "WFS",
        "request": "GetFeature",
        "typename": "tests:test_toponymes",
        "outputFormat": "application/json",
        "srsname": "EPSG:3857",
        "maxFeatures": 50,
        "CQL_FILTER": "name='Montpellier'"
        },
        success: function (response) {
        console.log("Response :");
        console.log(response.features);

        var features = new ol.format.GeoJSON().readFeatures(response);
        testSource.addFeatures(features);

        map.getView().fit(testSource.getExtent());
        },
        fail: function (jqXHR, textStatus) {
        console.log("Couldn't request WFS layer: " + textStatus);
        console.log("Ma requête :");
        }
    });
};

// Writing the ajax request for Mauguio
function loadMauguio() {
  $.ajax({
      method: 'POST',
      url: 'https://resteaurlag.anatidaepho.be/geoserver/wfs',
      data: {
      "service": "WFS",
      "request": "GetFeature",
      "typename": "tests:test_toponymes",
      "outputFormat": "application/json",
      "srsname": "EPSG:3857",
      "maxFeatures": 50,
      "CQL_FILTER": "name='Mauguio'"
      },
      success: function (response) {
      console.log("Response :");
      console.log(response.features);

      var features = new ol.format.GeoJSON().readFeatures(response);
      testSource.addFeatures(features);

      map.getView().fit(testSource.getExtent());
      },
      fail: function (jqXHR, textStatus) {
      console.log("Couldn't request WFS layer: " + textStatus);
      console.log("Ma requête :");
      }
  });
};

// Add Montpellier feature
$('#test_button_Montpellier').click(function() {
    loadMontpellier();
    console.log("Added Montpellier");
});

// Add Maugio feature
$('#test_button_Mauguio').click(function() {
  loadMauguio();
  console.log("Added Mauguio");
});

// Check the layer's content
$('#test_button_content').click(function() {
  console.log("Layer's content atm :");
  console.log(testSource.getFeatures());
});

// Empty the layer
$('#test_button_empty').click(function() {
  console.log("Emptied layer");
  testSource.clear();
});


});