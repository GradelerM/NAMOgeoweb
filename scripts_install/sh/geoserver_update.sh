#!/bin/bash
# Author : Vincent Delbar

if [ "$1" = "" ]; then echo "Veuillez donner le numéro de version en argument du script" ; exit ; fi
GEOSERVER_VERSION=$1

mkdir -p /tmp/geoserver && cd /tmp/geoserver

sudo systemctl stop tomcat9

sudo rm -rf /var/lib/tomcat9/webapps/geoserver*
# Téléchargement du WAR de GeoServer et extraction dans le dossier "webapps" de tomcat

wget "https://freefr.dl.sourceforge.net/project/geoserver/GeoServer/"$GEOSERVER_VERSION"/geoserver-"$GEOSERVER_VERSION"-war.zip"
wget "https://freefr.dl.sourceforge.net/project/geoserver/GeoServer/"$GEOSERVER_VERSION"/extensions/geoserver-"$GEOSERVER_VERSION"-gdal-plugin.zip"
wget "https://freefr.dl.sourceforge.net/project/geoserver/GeoServer/"$GEOSERVER_VERSION"/extensions/geoserver-"$GEOSERVER_VERSION"-pyramid-plugin.zip"

sudo unzip -o "geoserver-"$GEOSERVER_VERSION"-war.zip" -d /tmp/geoserver
sudo mv /tmp/geoserver/geoserver.war /var/lib/tomcat9/webapps
sudo systemctl start tomcat9
sleep 5

sudo unzip -o "geoserver-"$GEOSERVER_VERSION"-gdal-plugin.zip" -d /var/lib/tomcat9/webapps/geoserver/WEB-INF/lib
sudo unzip -o "geoserver-"$GEOSERVER_VERSION"-pyramid-plugin.zip" -d /var/lib/tomcat9/webapps/geoserver/WEB-INF/lib

sudo chown tomcat:tomcat -R /var/lib/tomcat9/webapps/geoserver/WEB-INF/lib/

sudo rm -rf /tmp/geoserver

if [ -d /var/lib/tomcat9/webapps/geoserver/ ]; then
    echo "Nouvelle version de geoserver déployée !"
else
    echo "Une erreur s'est produite durant la mise à jour..."
fi