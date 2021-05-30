/*
===============================================================================
Initializing the map and popups
===============================================================================
*/
var mainView = new ol.View({
    center: ol.proj.fromLonLat([-17.2,43.6]),
    zoom: 2,
    minZoom: 0,
    maxZoom: 20,
});

// Creating the map
var map = new ol.Map({
  target: 'map',
  view: mainView,
  controls: ol.control.defaults().extend([
    new ol.control.ScaleLine()
  ])
});

/*
===============================================================================
Emprises
===============================================================================
*/
// Emprises and zooms
// [ol.proj.fromLonLat([lon, lat]), zoom]
// lon and lat in EPSG:4326 (WGS84, NOT web-mercator)
// zoom is the desired zoom level

var empriseWorld = [ol.proj.fromLonLat([-17.2,43.6]), 2];

// Insert your new emprise bounds here

/*
===============================================================================
Basemaps
===============================================================================
*/
// Set Open Street Map layer
var planOSM = new ol.layer.Tile({
  source: new ol.source.OSM({}),
  visible: true,
  title: 'planOSM',
  zIndex: -1
});

// Set ESRI imagery layer
var planESRI = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
          'rest/services/World_Imagery">ArcGIS</a>'
  }),
  visible: true,
  title: 'planESRI',
  zIndex: -1
});

// Set ESRI World Topographic Map
var planESRI_WTM = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
          'rest/services/World_Topo_Map">ArcGIS</a>'
  }),
  visible: true,
  title: 'planESRI_WTM',
  zIndex: -1
});

// OSM layer displayed by default
map.addLayer(planOSM);

// All basmap layers in one array (needed for looping though these)
var basemaps = [
  'planOSM', // First from list is considered as default
  'planESRI',
  'planESRI_WTM',
];
