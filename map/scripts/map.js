/*
===============================================================================
Initializing the map and popups
===============================================================================
*/
// Defining main map max bounds (so we can't pan outside)
//var maxBoundsX = ol.proj.fromLonLat([16.5, 15.7]);
//var maxBoundsY = ol.proj.fromLonLat([-61.9, -60.8]);
//var maxBounds = maxBoundsX.concat(maxBoundsY);

var mainView = new ol.View({
    center: ol.proj.fromLonLat([-61.5,16.2]),
    zoom: 10,
    minZoom: 0,
    maxZoom: 20,
//    extent: maxBounds
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
/*
var empriseMediterrannee       = [ol.proj.fromLonLat([6.8, 43.04]), 5];
var empriseLaguneBiguglia      = [ol.proj.fromLonLat([9.46, 42.59]), 12];
var empriseOccitanieEst        = [ol.proj.fromLonLat([3.9, 43.6]), 9.5];
var empriseEtangOr             = [ol.proj.fromLonLat([4.05, 43.6]), 11.5];
var empriseEtangsPalavasiens   = [ol.proj.fromLonLat([3.86, 43.51]), 11.5];
*/
var empriseGuadeloupe          = [ol.proj.fromLonLat([-61.5, 16.2]), 10];
var empriseBasseTerre          = [ol.proj.fromLonLat([-61.68, 16.14]), 10.5];
var empriseBasseTerreSud       = [ol.proj.fromLonLat([-61.66, 16.02]), 12];
var empriseGrandeTerre         = [ol.proj.fromLonLat([-61.45, 16.35]), 11.2];
var empriseMarieGalante        = [ol.proj.fromLonLat([-61.26, 15.93]), 12.2];

// Insert your new emprise bounds here

/*
===============================================================================
Fonds de Carte
===============================================================================
*/
// IGN resolutions for displaying different levels of detail
var ignResolutions = [
  156543.03392804103,
  78271.5169640205,
  39135.75848201024,
  19567.879241005125,
  9783.939620502562,
  4891.969810251281,
  2445.9849051256406,
  1222.9924525628203,
  611.4962262814101,
  305.74811314070485,
  152.87405657035254,
  76.43702828517625,
  38.218514142588134,
  19.109257071294063,
  9.554628535647034,
  4.777314267823517,
  2.3886571339117584,
  1.1943285669558792,
  0.5971642834779396,
  0.29858214173896974,
  0.14929107086948493,
  0.07464553543474241
] ;

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

// Set IGN imagery layer
var planIGNimagerie = new ol.layer.Tile({
  source: new ol.source.WMTS({
    url: 'https://wxs.ign.fr/ljs6yxhtgodb3e7ndi50i06n/geoportail/wmts',
    layer: 'ORTHOIMAGERY.ORTHOPHOTOS',
    matrixSet: 'PM',
    format: 'image/jpeg',
    style: 'normal',
    attributions: 'IGN-F/Géoportail',
    tileGrid: new ol.tilegrid.WMTS({
      origin: [-20037508,20037508], // topLeftCorner
      resolutions: ignResolutions, // changing resolutions
      matrixIds: ["0","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19"] // ids des TileMatrix
    })
  }),
  visible: true,
  title: 'planIGNimagerie',
  zIndex: -1
});

// Set IGN topo layer
var planIGN = new ol.layer.Tile({
  source: new ol.source.WMTS({
    url: 'https://wxs.ign.fr/ljs6yxhtgodb3e7ndi50i06n/geoportail/wmts',
    layer: 'GEOGRAPHICALGRIDSYSTEMS.MAPS',
    matrixSet: 'PM',
    format: 'image/jpeg',
    style: 'normal',
    attributions: 'IGN-F/Géoportail',
    tileGrid: new ol.tilegrid.WMTS({
      origin: [-20037508,20037508], // topLeftCorner
      resolutions: ignResolutions, // changing resolutions
      matrixIds: ["0","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19"] // ids des TileMatrix
    })
  }),
  visible: true,
  title: 'planIGN',
  zIndex: -1
});


/*
// Add positron map
var planPositron = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
    attributions: 'Map tiles by Carto, under CC BY 3.0. Data by OpenStreetMap, under ODbL.'
  }),
  visible: true,
  title: 'planPositron'
});
*/

// OSM layer displayed by default
map.addLayer(planOSM);

// All basmap layers in one array (needed for looping though these)
var basemaps = [
  'planOSM', // First is considered as default
  'planESRI',
  'planESRI_WTM',
  //'planPositron'
];


/*
===============================================================================
Communes "invisible" layer: hover and select effects
===============================================================================
*/
/*http://resteaur-lag.teledetection.fr/geoserver/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=tetis:bd_topo_communes&outputFormat=application/json&PROPERTYNAME=nom&CQL_FILTER=nom=%27Mauguio%27*/

/*
// Communes WFS base layer
var communesWFS = new ol.source.Vector({
  url: 'http://resteaur-lag.teledetection.fr/geoserver/wfs?service=WFS' +
  '&version=1.1.0&request=GetFeature&typename=tetis:bd_topo_communes' +
  '&outputFormat=application/json' ,
  format: new ol.format.GeoJSON(),
  serverType: 'geoserver'
});
var communes = new ol.layer.Vector({
  source: communesWFS,
  visible: true,
  opacity: 0.5,
  zIndex: 1001,
  id: 'communes', // MUST be the same as the var name
  theme: 'UnitesAdministratives',
  title: 'Communes (BD TOPO)',
  widgets: ''
});
map.addLayer(communes);
*/

// Creating empty layer for communes selection
/*
var communeSelectedSource = new ol.source.Vector();
var communeSelected = new ol.layer.Vector({
  source: communeSelectedSource,
  style: new ol.style.Style({
    stroke: new ol.style.Stroke({
      color: 'rgba(0, 0, 255, 1.0)',
      width: 2,
    }),
  }),
});
*/

/*
===============================================================================
Couches : layers
===============================================================================
*/

/*
var tetis_WMS = 'https://resteaur-lag.teledetection.fr/geoserver/ows?service=wms&version=1.3.0';

// Occupation agricole du sol en 2017
var OccAgricoleSol_2017_WMS = new ol.source.ImageWMS({
  url: tetis_WMS,
  params: {'LAYERS': 'rivage:OccAgricoleSol_2017', 'TILED':true},
  serverType: 'geoserver'
});
var OccAgricoleSol_2017 = new ol.layer.Image({
  source: OccAgricoleSol_2017_WMS,
  visible: false,
  opacity: 1,
  zIndex: 1000,
  id: 'OccAgricoleSol_2017',
  theme: 'OccupationDuSol',
  title: 'Occupation agricole du sol en 2017',
  widgets: 'opacity legend'
});

// Zones urbaines en 2017
var ZoneUrbaine_2017_WMS = new ol.source.ImageWMS({
  url: tetis_WMS,
  params: {'LAYERS': 'rivage:ZoneUrbaine_2017', 'TILED':true},
  serverType: 'geoserver'
});
var ZoneUrbaine_2017 = new ol.layer.Image({
  source: ZoneUrbaine_2017_WMS,
  visible: false,
  opacity: 1,
  zIndex: 1000,
  id: 'ZoneUrbaine_2017',
  theme: 'OccupationDuSol',
  title: 'Tâche urbaine en 2017',
  widgets: 'opacity legend'
});

// Parcelles RPG en 2019
var RPG_Parcelles_2019_WMS = new ol.source.ImageWMS({
  url: tetis_WMS,
  params: {'LAYERS': 'rivage:RPG_Parcelles_2019', 'TILED':true},
  serverType: 'geoserver'
});
var RPG_Parcelles_2019 = new ol.layer.Image({
  source: RPG_Parcelles_2019_WMS,
  visible: false,
  opacity: 1,
  zIndex: 1000,
  id: 'RPG_Parcelles_2019',
  theme: 'OccupationDuSol',
  title: 'Parcelles RPG 2019',
  widgets: 'opacity legend'
});

// Localisation usine Hopewell
var UsineHopewell_WMS = new ol.source.ImageWMS({
  url: tetis_WMS,
  params: {'LAYERS': 'rivage:UsineHopewell', 'TILED':true},
  serverType: 'geoserver'
});
var UsineHopewell = new ol.layer.Image({
  source: UsineHopewell_WMS,
  visible: false,
  opacity: 1,
  zIndex: 1100,
  id: 'UsineHopewell',
  theme: 'Autres',
  title: 'Production de la chlordécone',
  widgets: 'opacity legend'
});

// Stations IFAC
var StationsIFAC_WMS = new ol.source.ImageWMS({
  url: tetis_WMS,
  params: {'LAYERS': 'rivage:StationsIFAC', 'TILED':true},
  serverType: 'geoserver'
});
var StationsIFAC = new ol.layer.Image({
  source: StationsIFAC_WMS,
  visible: false,
  opacity: 1,
  zIndex: 1100,
  id: 'StationsIFAC',
  theme: 'Autres',
  title: 'Stations IFAC',
  widgets: 'opacity legend'
});

// Risques contamination CLD en 2017
var RisqueContaminationCLD_2017_WMS = new ol.source.ImageWMS({
  url: tetis_WMS,
  params: {'LAYERS': 'rivage:RisqueContaminationCLD_2017', 'TILED':true},
  serverType: 'geoserver'
});
var RisqueContaminationCLD_2017 = new ol.layer.Image({
  source: RisqueContaminationCLD_2017_WMS,
  visible: false,
  opacity: 1,
  zIndex: 1000,
  id: 'RisqueContaminationCLD_2017',
  theme: 'Autres',
  title: 'Zone à risque',
  widgets: 'opacity legend'
});

// Influence agriculture
var InfluenceAgriculture_WMS = new ol.source.ImageWMS({
  url: tetis_WMS,
  params: {'LAYERS': 'rivage:InfluenceAgriculture', 'TILED':true},
  serverType: 'geoserver'
});
var InfluenceAgriculture = new ol.layer.Image({
  source: InfluenceAgriculture_WMS,
  visible: false,
  opacity: 0.6,
  zIndex: 1000,
  id: 'InfluenceAgriculture',
  theme: 'Autres',
  title: 'Role dans la diffusion du modèle de modernisation de l\'agriculture',
  widgets: 'opacity legend'
});

// Utiliation chlordécone
var UtilisationChlordecone_WMS = new ol.source.ImageWMS({
  url: tetis_WMS,
  params: {'LAYERS': 'rivage:UtilisationChlordecone', 'TILED':true},
  serverType: 'geoserver'
});
var UtilisationChlordecone = new ol.layer.Image({
  source: UtilisationChlordecone_WMS,
  visible: false,
  opacity: 1,
  zIndex: 1000,
  id: 'UtilisationChlordecone',
  theme: 'Autres',
  title: 'Statut d\'utilisation de la chlordécone en 1980',
  widgets: 'opacity legend'
});

// Occupation du sol IRD 1981
var Veg_OccSol_IRD1981_WMS = new ol.source.ImageWMS({
  url: tetis_WMS,
  params: {'LAYERS': 'rivage:Veg_OccSol_IRD1981', 'TILED':true},
  serverType: 'geoserver'
});
var Veg_OccSol_IRD1981 = new ol.layer.Image({
  source: Veg_OccSol_IRD1981_WMS,
  visible: false,
  opacity: 1,
  zIndex: 900,
  id: 'Veg_OccSol_IRD1981',
  theme: 'Autres',
  title: 'Occupation du sol IRD 1981',
  widgets: 'opacity'
});
*/

/*
// Test LizMap
var immersionanomaly2010_WMS = new ol.source.ImageWMS({
  url: 'https://ird-cirad.lizmap.com/odyssea/index.php/lizmap/service/?repository=2&project=lcg_hydro&VERSION=1.3.0',
  params: {'LAYERS': 'immersionanomaly2010', 'TILED':true},
  serverType: 'geoserver'
});
var immersionanomaly2010 = new ol.layer.Image({
  source: immersionanomaly2010_WMS,
  visible: false,
  opacity: 1,
  zIndex: 900,
  id: 'immersionanomaly2010',
  theme: 'Autres',
  title: 'Immersion anomaly 2010',
  widgets: 'opacity legend'
});
*/

/*
// Couche flux Vincent
var LignesFlechesInfluences_WMS = new ol.source.ImageWMS({
  url: 'https://it-amazonia.dev:8090/index.php/lizmap/service/?repository=namotest&project=Carte&VERSION=1.3.0',
  params: {'LAYERS': 'Influencedelagriculturemoderne', 'TILED':true},
  serverType: 'geoserver'
});
var LignesFlechesInfluences = new ol.layer.Image({
  source: LignesFlechesInfluences_WMS,
  visible: false,
  opacity: 1,
  zIndex: 1050,
  id: 'LignesFlechesInfluences',
  theme: 'Autres',
  title: 'Circuit de la diffusion',
  widgets: 'opacity legend'
});
*/

/*
===============================================================================
Couches : KaruGeo
===============================================================================
*/
// Les couches sont redirigées depuis la source WMS KaruGeo par GeoServer

/*
// dcea_2013 : Délimitation et caractérisation des espaces agricoles en 2013
var dcea_2013_WMS = new ol.source.ImageWMS({
  url: tetis_WMS,
  params: {'LAYERS': 'rivage:dcea_2013', 'TILED':true},
  serverType: 'geoserver'
});
var dcea_2013 = new ol.layer.Image({
  source: dcea_2013_WMS,
  visible: false,
  opacity: 1,
  zIndex: 1000,
  id: 'dcea_2013',
  theme: 'KaruGeo',
  title: 'Délimitation et caractérisation des espaces agricoles en 2013',
  widgets: 'opacity legend'
});

// c_valagro : Valeur agronomique des sols
var c_valagro_WMS = new ol.source.ImageWMS({
  url: tetis_WMS,
  params: {'LAYERS': 'rivage:c_valagro', 'TILED':true},
  serverType: 'geoserver'
});
var c_valagro = new ol.layer.Image({
  source: c_valagro_WMS,
  visible: false,
  opacity: 1,
  zIndex: 1000,
  id: 'c_valagro',
  theme: 'KaruGeo',
  title: 'Valeur agronomique des sols',
  widgets: 'opacity legend'
});

// tache_urb_1955 : Tache urbaine 1955
var tache_urb_1955_WMS = new ol.source.ImageWMS({
  url: tetis_WMS,
  params: {'LAYERS': 'rivage:tache_urb_1955', 'TILED':true},
  serverType: 'geoserver'
});
var tache_urb_1955 = new ol.layer.Image({
  source: tache_urb_1955_WMS,
  visible: false,
  opacity: 1,
  zIndex: 1000,
  id: 'tache_urb_1955',
  theme: 'KaruGeo',
  title: 'Tache urbaine 1955',
  widgets: 'opacity legend'
});

// tache_urb_2017 : Tache urbaine 2017
var tache_urb_2017_WMS = new ol.source.ImageWMS({
  url: tetis_WMS,
  params: {'LAYERS': 'rivage:tache_urb_2017', 'TILED':true},
  serverType: 'geoserver'
});
var tache_urb_2017 = new ol.layer.Image({
  source: tache_urb_2017_WMS,
  visible: false,
  opacity: 1,
  zIndex: 1000,
  id: 'tache_urb_2017',
  theme: 'KaruGeo',
  title: 'Tache urbaine 2017',
  widgets: 'opacity legend'
});

/*
// dcea_2010 : Délimitation et caractérisation des espaces agricoles en monoculture en 2010 (vectoriel)
var dcea_2010_WFS = new ol.source.Vector({
  url: 'http://carto.karugeo.fr/cgi-bin/mapservwfs?service=WFS&' +
  'version=1.1.0&request=GetFeature&typename=ms:dcea_2010&' +
  'outputFormat=application/json',
  format: new ol.format.GeoJSON(),
  serverType: 'geoserver'
});
var dcea_2010 = new ol.layer.Vector({
  source: dcea_2010_WFS,
  visible: false,
  opacity: 1,
  zIndex: 1002,
  id: 'dcea_2010', // MUST be the same as the var name
  theme: 'KaruGeo',
  title: 'Délimitation et caractérisation des espaces agricoles en monoculture en 2010 (vectoriel)',
  widgets: 'opacity customlegend',
  // As 'customlegend' widget is active, we MUST define a 'customlegendTitle'
  customlegendTitle: "Location" // Title appearing on the custom legend
});
*/

/*
// geoserver layers for testing purposes : WMS layer
var tiger_roadsWMS = new ol.source.ImageWMS({
  url: 'https://resteaurlag.anatidaepho.be/geoserver/wms',
  params: {'LAYERS': 'tiger:tiger_roads', 'TILED':true},
  serverType: 'geoserver'
});
var tiger_roads = new ol.layer.Image({
  source: tiger_roadsWMS,
  visible: false,
  opacity: 1,
  zIndex: 1000,
  id: 'tiger_roads',
  theme: 'OccupationDuSol',
  title: 'test : tiger roads',
  widgets: 'opacity legend'
});

var bugsitesWFS = new ol.source.Vector({
  url: 'https://resteaurlag.anatidaepho.be/geoserver/wfs?service=WFS&' +
  'version=1.1.0&request=GetFeature&typename=sf:bugsites&' +
  'outputFormat=application/json',
  format: new ol.format.GeoJSON(),
  serverType: 'geoserver'
});
var bugsites = new ol.layer.Vector({
  source: bugsitesWFS,
  visible: false,
  opacity: 1,
  zIndex: 1002,
  id: 'bugsites', // MUST be the same as the var name
  theme: 'OccupationDuSol',
  title: 'Spearfish bug locations',
  widgets: 'opacity customlegend',
  // As 'customlegend' widget is active, we MUST define a 'customlegendTitle'
  customlegendTitle: "Location" // Title appearing on the custom legend
});

var test_topoWFS = new ol.source.Vector({
  url: 'https://resteaurlag.anatidaepho.be/geoserver/wfs?service=WFS&' +
  'version=1.1.0&request=GetFeature&typename=tests:test_toponymes&' +
  'outputFormat=application/json',
  format: new ol.format.GeoJSON(),
  serverType: 'geoserver'
});
var test_topo = new ol.layer.Vector({
  source: test_topoWFS,
  visible: false,
  opacity: 1,
  zIndex: 1002,
  id: 'test_topo', // MUST be the same as the var name
  theme: 'OccupationDuSol',
  title: 'Tests toponymes',
  widgets: 'opacity customlegend',
  // As 'customlegend' widget is active, we MUST define a 'customlegendTitle'
  customlegendTitle: "Location" // Title appearing on the custom legend
});

// end of testing layers

// bd topo communes : WMS layer
var bd_topo_communesWMS = new ol.source.ImageWMS({
  url: 'https://resteaur-lag.teledetection.fr/geoserver/wms',
  params: {'LAYERS': 'tetis:bd_topo_communes', 'TILED':true},
  serverType: 'geoserver'
});
var bd_topo_communes = new ol.layer.Image({
  source: bd_topo_communesWMS,
  visible: false,
  opacity: 0.5,
  zIndex: 1000,
  id: 'bd_topo_communes', // MUST be the same as the var name
  theme: 'UnitesAdministratives',
  title: 'BD Topo : communes',
  widgets: 'opacity legend',
  debutTemp: '1900',
  finTemp: '2020'
});

// bdoh_herault : WMS layer
var bdoh_heraultWMS = new ol.source.ImageWMS({
  url: 'https://resteaur-lag.teledetection.fr/geoserver/wms',
  params: {'LAYERS': 'tetis:bdoh_herault', 'TILED':true},
  serverType: 'geoserver'
});
var bdoh_herault = new ol.layer.Image({
  source: bdoh_heraultWMS,
  visible: false,
  opacity: 1,
  zIndex: 1001,
  id: 'bdoh_herault', // MUST be the same as the var name
  theme: 'OrthoImagerie',
  title: 'bdoh Hérault',
  widgets: 'opacity',
  debutTemp: '1900',
  finTemp: '2020'
});

// pvah : WMS layer
var pvahWMS = new ol.source.ImageWMS({
  url: 'https://resteaur-lag.teledetection.fr/geoserver/wms',
  params: {'LAYERS': 'tetis:ifremer_pvah_herault', 'TILED':true},
  serverType: 'geoserver'
});
var pvah = new ol.layer.Image({
  source: pvahWMS,
  visible: false,
  opacity: 1,
  zIndex: 1001,
  id: 'pvah', // MUST be the same as the var name
  theme: 'OrthoImagerie',
  title: 'pvah Hérault',
  widgets: 'opacity',
  debutTemp: '800',
  finTemp: '900'
});

// pop_ancienne_occitanie : WFS layer
var pop_ancienne_occitanieWFS = new ol.source.Vector({
  url: 'https://resteaur-lag.teledetection.fr/geoserver/wfs?service=WFS&' +
  'version=1.1.0&request=GetFeature&typename=tetis:pop_ancienne_occitanie&' +
  'outputFormat=application/json',
  format: new ol.format.GeoJSON(),
  serverType: 'geoserver'
});
var pop_ancienne_occitanie = new ol.layer.Vector({
  source: pop_ancienne_occitanieWFS,
  visible: false,
  opacity: 1,
  zIndex: 1002,
  id: 'pop_ancienne_occitanie', // MUST be the same as the var name
  theme: 'Demographie',
  title: 'Population par année de rencensement',
  widgets: 'opacity customlegend',
  // As 'customlegend' widget is active, we MUST define a 'customlegendTitle'
  customlegendTitle: "Nombre d'habitants par commune en ", // Title appearing on the custom legend
  debutTemp: '1900',
  finTemp: '2020'
});

// Occupation du sol en 1963, niveau 1
var os_etang_orWMS = new ol.source.ImageWMS({
  url: 'https://resteaur-lag.teledetection.fr/geoserver/wms',
  params: {'LAYERS' : 'tetis:os_etang_or_date:1963_niv:1',
           'TILED' : true
          },
  serverType: 'geoserver'
});
var os_etang_or = new ol.layer.Image({
  source: os_etang_orWMS,
  visible: false,
  opacity: 1,
  zIndex: 1001,
  id: 'os_etang_or', // MUST be the same as the var name
  theme: 'OccupationDuSol',
  title: "Occupation du sol autour de l'étang de l'Or",
  widgets: 'opacity legend choixAnnee legendLevel',
  choixAnnee: '1963 1977 2017',
  debutTemp: '1963',
  finTemp: '1977'
});
*/


/*
===============================================================================
Couches : layer groups
===============================================================================
*/
// It is advised to always name layers groups starting with the string "theme"
// For example : themeMonTheme or themeMyTheme
// If not, the application will send a warning and ask you to nename these themes
// This notation convention is set to make further development easier (regex starting with 'theme')
// For further information, check the documentation

/*
// INSPIRE theme : "unités administratives"
var themeUnitesAdministratives = new ol.layer.Group({
  name: "Unités administratives",
  layers: [
    bd_topo_communes,
  ],
});



// INSPIRE theme : "ortho-imagerie"
var themeOrthoImagerie = new ol.layer.Group({
  name: "Ortho-imagerie",
  layers: [
    bdoh_herault,
    pvah
  ],
});



// INSPIRE theme : "démographie"
var themeDemographie = new ol.layer.Group({
  name: "Démographie",
  layers: [
    pop_ancienne_occitanie
  ],
});
*/

/*
// INSPIRE theme : "occupation du sol"
var themeOccupationDuSol = new ol.layer.Group({
  name: "Occupation du sol",
  layers: [
    //os_etang_or,
    //tiger_roads,
    //bugsites,
    //test_topo,
    OccAgricoleSol_2017,
    ZoneUrbaine_2017,
    RPG_Parcelles_2019,
    Veg_OccSol_IRD1981
  ]
});

// INSPIRE theme : "autres"
var themeAutres = new ol.layer.Group({
  name: "Autres",
  layers: [
    UsineHopewell,
    StationsIFAC,
    RisqueContaminationCLD_2017,
    InfluenceAgriculture,
    UtilisationChlordecone,
    //immersionanomaly2010,
    LignesFlechesInfluences
  ],
});

// themeKaruGeo
var themeKaruGeo = new ol.layer.Group({
  name: "KaruGeo",
  layers: [
    dcea_2013,
    c_valagro,
    tache_urb_1955,
    tache_urb_2017,
    //dcea_2010
  ],
});


// Add new layer group here

// All layer groups names in one array
var layerGroups = [
  //'themeUnitesAdministratives',
  //'themeOrthoImagerie',
  //'themeDemographie',
  'themeOccupationDuSol',
  'themeAutres',
  'themeKaruGeo'

  // Add your layer group's var name here
];

// Adding layers to the map
function addingLayers(e) {
  for ( var i = 0; i < e.length; i++ ) {
    var layer = window[e[i]];
    map.addLayer(layer);
  }
};
addingLayers(layerGroups);

*/
