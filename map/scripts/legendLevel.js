jQuery(document).ready(function() {
  // Declaring global variables for this script
  var layerName   = "";
  var legendLevel = "";

  // Function to write the new layer's parameters
  function writeParamsLegendLevel(layerName, legendLevel) {
    // Getting the date in the source layer (the one declared in GeoServer)
    var paramLayers = window[layerName].values_.source.params_.LAYERS;
    var getLevel    = paramLayers.split("niv:").pop();

    // Checking if other parameters are declared after the date and removing them
    var otherParams = getLevel.indexOf("_");
    if (otherParams > -1) {
      getLevel = getLevel.substring(0, otherParams);
    }

    // Replacing getYear result with "annee" (function parameters)
    paramLayers = paramLayers.replace(("niv:" + getLevel), ("niv:" + legendLevel));
    window[layerName].values_.source.params_.LAYERS = paramLayers;

    // Refreshing the layer to show the changes
    window[layerName].values_.source.refresh();

    // Refreshing the legend to show the changes (refer to mapInteractions.js)
    // Full function comments are in Couches : widgets
    var resolution = map.getView().getResolution();
    var source = window[layerName].get('source').getLegendUrl(resolution)+
                  ('&LEGEND_OPTIONS=fontName:Roboto;fontColor:262236;') +
                  ('fontSize:12;fontAntiAliasing:true;forceLabels:on;');
    var target  = layerName + "-img";
    var img     = $('#'+target)[0];
    img.src = source;
    var target_float = layerName + "-float";
    var img_float = $('#'+target_float)[0];
    img_float.src = source;
  };

  // Function to get legendLevel from the choixAnnee widgets and replace layer
  $('.legendLevel-radiobtn').on('change', function() {
    legendLevel = this.value;
    layerName   = $(this).attr('id').substring(0, $(this).attr('id').indexOf("-"));
    writeParamsLegendLevel(layerName, legendLevel);
  });

  // End of jQuery(document).ready
});
