// Disabled for now
/*
jQuery(document).ready(function() {
  // Code based on example from viglino.github.io
  // https://viglino.github.io/ol-ext/examples/search/map.control.searchfeature.html

  // Adding toponyms layer here
  var toponymesWFS = new ol.source.Vector({
    url: 'http://resteaur-lag.teledetection.fr/geoserver/wfs?service=WFS&' +
    'version=1.1.0&request=GetFeature&typename=tetis:toponymie_bd_topo&' +
    'outputFormat=application/json',
    format: new ol.format.GeoJSON(),
    serverType: 'geoserver'
  });
  var toponymes = new ol.layer.Vector({
    source: toponymesWFS,
    style: new ol.style.Style({
      image: new ol.style.Circle({
        radius: 0,
        fill: new ol.style.Fill({ color: '#ffffff'}),
      })
    }),
    visible: false,
    opacity: 1,
    zIndex: 1002
  });
  map.addLayer(toponymes);

  // Control select
  var select = new ol.interaction.Select({
    style: new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({ color: '#FF9D0A' }),
      })
    }),
  });

  // Adding the search control
  var search = new ol.control.SearchFeature({
    source: toponymesWFS,
    property: 'graphie',
    maxItems: 10,
  });
  map.addControl(search);

  // Select feature when click on the reference index
  search.on('select', function(e) {
    select.getFeatures().clear();
    select.getFeatures().push(e.search);
    var p = e.search.getGeometry().getFirstCoordinate();
    map.getView().animate({
      center: p,
      zoom: 12
    });
  });

  // Add layer only when research is needed
  $('.ol-search > button').click(function() {
    var visible = toponymes.get('visible');
    if (visible === false) {
      map.addInteraction(select);
      toponymes.setVisible(true);
    } else {
      map.removeInteraction(select);
      toponymes.setVisible(false);
    }
  });

  // Remove layer when user clicks on the map
  map.on('click', function() {
    var visible = toponymes.get('visible');
    if (visible === true) {
      map.removeInteraction(select);
      toponymes.setVisible(false);
    }
  });

  // Remove layer when user clicks on the map
  map.on('movestart', function() {
    var visible = toponymes.get('visible');
    if (visible === true) {
      map.removeInteraction(select);
      toponymes.setVisible(false);
    }
  });

  // End of jQuery document ready function
});
*/