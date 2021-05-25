jQuery(document).ready(function() {
  // Declaring global variables for this script
  var layerName   = "";
  var annee       = "";

  // Function to write the new layer's parameters
  function writeParamsDate(layerName, annee) {
    // Getting the date in the source layer (the one declared in GeoServer)
    var paramLayers = window[layerName].values_.source.params_.LAYERS;
    var getYear     = paramLayers.split("date:").pop();

    // Checking if other parameters are declared after the date and removing them
    var otherParams = getYear.indexOf("_");
    if (otherParams > -1) {
      getYear = getYear.substring(0, otherParams);
    }

    // Replacing getYear result with "annee" (function parameters)
    paramLayers = paramLayers.replace(getYear, annee);
    window[layerName].values_.source.params_.LAYERS = paramLayers;

    // Refreshing the layer to show the changes
    window[layerName].values_.source.refresh();
  };

  // Function to get year from the choixAnnee widgets and replace layer
  $('.widget-choixAnnee-choix').on('change', function() {
    annee = this.value;
    layerName = $(this).attr('id').replace("-choixAnnee-choix", "");
    writeParamsDate(layerName, annee);
  });

  // End of jQuery(document).ready
});
