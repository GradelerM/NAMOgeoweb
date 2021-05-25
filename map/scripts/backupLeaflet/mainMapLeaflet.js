// Create "map" object with basic caracteristics
var map = L.map("map", {
  center: [43.04, 6.08],
  minZoom: 7,
  maxZoom: 16,
  zoomControl: false
  // The Control.Zoom is defined later to be placed on topright instead of default topleft
});

// Set max bounds so we can't pan outside this defined area
map.bounds = [],
  map.setMaxBounds([
    [44.00, 1.45],
    [41.00, 12.45]
  ]);

// Set zoomControl position (topright instead of default topleft)
new L.Control.Zoom({position:"topright"}).addTo(map);

// Add scalebar (bottom right, display meters but not imperial / feet)
L.control.scale({metric:true, imperial:false, position:"bottomright"}).addTo(map);

/*
===============================================================================
Main const/var to concatenate URLs
===============================================================================
*/
// URL to call geoserver layers
var geoserverLink = 'http://resteaur-lag.teledetection.fr/geoserver/wms?';
// URL to call qgisserver layers : not used but in case it is needed
var qgisserverLink = 'http://http://resteaur-lag.teledetection.fr/qgisserver?&SERVICE=WMS&REQUEST=GetMap';

/*
===============================================================================
Fonds de Carte
===============================================================================
*/
// Set Open Street Map layer
var planOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
});
// Set ESRI layer
var planESRI = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'ESRI'
});
// Set IGN imagery layer
var planIGNimagerie = L.tileLayer('https://wxs.ign.fr/d0yd9eg2ld67ike7fy756ano/geoportail/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=PM&tilematrix={z}&tilecol={x}&tilerow={y}&layer=ORTHOIMAGERY.ORTHOPHOTOS&format=image/jpeg&style=normal', {
  tileSize: 256,
  attribution: 'IGN-F/Géoportail'
});
// Set IGN topo layer
var planIGN = L.tileLayer('https://wxs.ign.fr/d0yd9eg2ld67ike7fy756ano/geoportail/wmts?service=WMTS&request=GetTile&version=1.0.0&tilematrixset=PM&tilematrix={z}&tilecol={x}&tilerow={y}&layer=GEOGRAPHICALGRIDSYSTEMS.MAPS&format=image/jpeg&style=normal', {
  tileSize: 256,
  attribution: 'IGN-F/Géoportail'
});
// Insert new map layer here

/*
===============================================================================
Couches
===============================================================================
*/
var geoserverLink = "http://resteaur-lag.teledetection.fr/geoserver/wms?";
var qgisserverLink  = "http://resteaur-lag.teledetection.fr/qgisserver?&SERVICE=WMS&REQUEST=GetMap";

var s2_20190627_rgb = L.tileLayer.wms(geoserverLink, {layers: 's2_20190627', styles: 's2_20190627_rgb', transparent: 'true', format: 'image/png'});
var s2_20190627_nir = L.tileLayer.wms(geoserverLink, {layers: 's2_20190627', styles: 's2_20190627_nir', transparent: 'true', format: 'image/png'});
var bdoh = L.tileLayer.wms(geoserverLink, {layers: 'bdoh_herault', transparent: 'true', format: 'image/png'});
var pvah = L.tileLayer.wms(geoserverLink, {layers: 'ifremer_pvah_herault', transparent: 'true', format: 'image/png'});
var litto3d = L.tileLayer.wms(geoserverLink, {layers: 'mnt_1m_herault', transparent: 'true', format: 'image/png'});
var etat_major = L.tileLayer.wms(geoserverLink,  {layers: 'em_herault', transparent: 'true', format: 'image/png'});
var cassini = L.tileLayer.wms(geoserverLink,  {layers: 'cassini_loc_herault', transparent: 'true', format: 'image/png'});

var ombrage_1m = L.tileLayer.wms(geoserverLink, {layers: 'ombrage_1m_herault', transparent: 'true', format: 'image/png'});
var ombrage_5m = L.tileLayer.wms(geoserverLink, {layers: 'ombrage_5m_herault', transparent: 'true', format: 'image/png'});
var ramsar = L.tileLayer.wms(geoserverLink, {layers: 'sites_ramsar', transparent: 'true', format: 'image/png'});
var em_mauguio = L.tileLayer.wms(qgisserverLink + "&MAP=/data/qgisserver/em_40k_mauguio/em_40k_mauguio.qgs",
								   {layers: 'mauguio_l,mauguio_s', opacity: 0.5, transparent: 'true', format: 'image/png'});

var bd_topo_communes = L.tileLayer.wms(geoserverLink, {layers: 'bd_topo_communes', transparent: 'true', format: 'image/png'});

// WFS bd_topo_communes
var owsrootUrl = 'https://resteaur-lag.teledetection.fr/geoserver/tetis/ows?';

var bd_topo_communes_Parameters = {
  service: 'WFS',
  version: '1.0.0',
  request: 'GetFeature',
  typeName: 'tetis:bd_topo_communes',
  maxFeatures: '50',
  outputFormat: 'application/json',
};

var parameters_bd_topo_communes = L.Util.extend(bd_topo_communes_Parameters);
var URL = owsrootUrl + L.Util.getParamString(parameters_bd_topo_communes);
console.log('parameters : ' + parameters_bd_topo_communes);
console.log('URL : ' + URL);

$.ajax({url: URL, success: function (data) {
    var geojson_layer_1 = new L.geoJson(data, {style: style, onEachFeature:doNothing});
    geojson_layer_1.addTo(map);
  }
});


var baseLayers = {
		  'Sentinel2 - Juin 2019 (RGB)': s2_20190627_rgb,
		  'Sentinel2 - Juin 2019 (NIR)': s2_20190627_nir,
		  'BDOrtho historique': bdoh,
	      'PVA 1937': pvah,
		  'Carte d\'état major': etat_major,
		  'Cassini (LOC)': cassini,
	  	  'Litto 3D': litto3d};

var overlays = {'Ombrage Litto 3D 1m': ombrage_1m,
				'Ombrage RGEAlti 5m': ombrage_5m,
				'Sites RAMSAR': ramsar,
				'Etat major Mauguio': em_mauguio,
        'BD TOPO': bd_topo_communes};

s2_20190627_rgb.addTo(map);
L.control.layers(baseLayers, overlays).addTo(map);
L.control.scale().addTo(map);


// Set map view on page loading
map.setView([43.04, 6.08], 7);
