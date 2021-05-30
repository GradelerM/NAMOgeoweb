# Bienvenue sur le dépôt de code de l'application NAMO GeoWeb

![Logo horizontal NAMO](./logos/horizontalNAMO.svg)

Ce dépôt contient les fichiers de l'application de cartographie interactive et narrative NAMO GeoWeb produite initialement pour les projets [RestEAUr'Lag](https://gitlab.com/GradelerM/resteaur-lag) et [Rivage](https://gitlab.com/GradelerM/rivage-guadeloupe).

Les fichiers HTML, CSS et JavaScript à la racine du projet concernent la page d'accueil de l'application et permettent de rediriger l'utilisateur sur la carte et le répertoire [map](map) contient tous les fichiers nécessaires au bon fonctionnement de la plateforme cartographique.


## Information sur les navigateurs

L'application est testée sur **Firefox** et **Google Chrome**. **Internet Explorer n'est en revanche pas supporté.**
En théorie, elle fonctionne pour :
* Firefox > 16
* Chrome > 40
* Microsoft Edge
* Safari > 8
* Opera > 27


## Fonctionnement de l'application

L'application web cartographique RestEAUr'Lag est construite de la manière suivante :

#### Back-end

- [Debian 10 (buster)](https://www.debian.org/releases/buster/)
- [PostgreSQL](https://www.postgresql.org/) 11.9
- [PostGIS](https://postgis.net/) 2.5
- [GeoServer](http://geoserver.org/) 2.16.4 - installé dans [Tomcat](https://tomcat.apache.org/) 9.0.31
- [Apache](https://httpd.apache.org/) 2.4
- [PHP](https://www.php.net/) 7.4

#### Front-end

- [OpenLayers](https://openlayers.org/) 6.4.2
- [OpenLayers-ext](https://github.com/Viglino/OpenLayers-ext)
- [jQuery](https://jquery.com/) 3.5.1
- [jQuery UI](https://jqueryui.com/) 1.12.1
- [jQuery-csv](https://github.com/typeiii/jquery-csv) 1.0.11
- [Remarkable](https://github.com/jonschlinkert/remarkable) 2.0.1
- [Papa Parse](https://www.papaparse.com/) 5.0
- [D3](https://d3js.org/) 6.3.1
- [DataTables](https://datatables.net/) 1.10.24
