#!/bin/bash
# -*- coding: utf-8 -*-
# Author : Vincent Delbar


GEOSERVER_DATA_DIR=/data/geoserver
GEOSERVER_VERSION=2.16.4
# Mot de passe admin
ADMIN_PASSWORD=false
while [[ "$ADMIN_PASSWORD" != "$ADMIN_PASSWORD2" ]]; do
    echo -n "Mot de passe admin (pour tomcat et postgres) :"
    read -s ADMIN_PASSWORD ; echo
    echo -n "Confirmez le mot de passe :"
    read -s ADMIN_PASSWORD2 ; echo
done

sudo apt update && sudo apt install htop gdal-bin python-gdal python3-gdal libgdal-java

if [ ! -d /usr/share/tomcat9 ]; then
    sudo apt-get install tomcat9 tomcat9-user tomcat9-admin
    # Ajout d'un utilisateur de tomcat "admin"
    sed -i '$d' /etc/tomcat9/tomcat-users.xml
    sudo sh -c "cat >> /etc/tomcat9/tomcat-users.xml << EOF
        <role rolename=\"admin\"/>
        <role rolename=\"admin-gui\"/>
        <role rolename=\"manager-gui\"/>
        <user username=\"admin\" password=\"$ADMIN_PASSWORD\" roles=\"admin,manager-gui,admin-gui\"/>
    <tomcat-users/>
    EOF"
    # Il faut ajouter ReadWritePaths=$GEOSERVER_DATA_DIR dans la conf du service tomcat, sinon il n'aura pas accès au dossier
    sudo nano /lib/systemd/system/tomcat9.service
fi

# Apache 2
if [ ! -d /etc/apache2/sites-available/resteaur-lag.conf ]; then
    sudo apt-get install apache2
    sudo systemctl stop apache2
    sudo sh -c "cat > /etc/apache2/sites-available/geoserver.conf << EOF
    <VirtualHost *:80>

            ServerName resteaur-lag.teledetection.fr
            ServerAlias resteaur-lag

            ServerAdmin root@localhost
            DocumentRoot /var/www/html

            LogLevel info
            ErrorLog /var/log/apache2/error.log
            CustomLog  /var/log/apache2/access.log combined

            LoadModule proxy_module /usr/lib/apache2/modules/mod_proxy.so
            LoadModule proxy_http_module /usr/lib/apache2/modules/mod_proxy_http.so

            ProxyRequests Off
            ProxyPass         /geoserver  http://localhost:8080/geoserver
            ProxyPassReverse  /geoserver  http://localhost:8080/geoserver
            ProxyPreserveHost On
            ProxyStatus On

            FcgidInitialEnv QGIS_SERVER_LOG_LEVEL \"1\"
            FcgidInitialEnv QGIS_SERVER_LOG_FILE /var/log/qgis/qgisserver.log

            <Location /qgisserver>
                SetHandler fcgid-script
                FcgidWrapper /usr/lib/cgi-bin/qgis_mapserv.fcgi virtual
                Options +ExecCGI -MultiViews +FollowSymLinks
                Require all granted
            </Location>

    </VirtualHost>
    EOF"
    sudo nano /etc/tomcat9/server.xml
    # <Connector port="8080" protocol="HTTP/1.1"
    #            proxyName="resteaur-lag.teledetection.fr"
    #            proxyPort="80"
    #            connectionTimeout="20000"
    #            redirectPort="8443" />

    sudo rm -f /etc/apache2/sites-enabled/000-default.conf
    sudo ln -s /etc/apache2/sites-available/resteaur-lag.conf /etc/apache2/sites-enabled/resteaur-lag.conf
    sudo systemctl start apache2
fi

# Installation postgresql + postgis
if [ ! -d /var/lib/postgresql ]; then

    sudo apt install postgresql-common postgresql-11 postgresql-11-postgis-2.5 postgresql-11-postgis-2.5-scripts

    sudo pg_dropcluster 11 main --stop
    # On recréé une grappe avec langue FR
    sudo pg_createcluster --locale fr_FR.UTF8 --start 11 main

    ## Modifier les adresses écoutées
    #listen_addresses = '*'          # what IP address(es) to listen on;
    sudo nano /etc/postgresql/11/main/postgresql.conf
    ## Modifier les modes d'authenf:
    ## "local" is for Unix domain socket connections only
    #local   all             all                                     trust   
    ## IPv4 local connections:
    #host    all             all             0.0.0.0/0                   md5
    sudo nano /etc/postgresql/11/main/pg_hba.conf

    # Création de rôles et utilisateurs
    sudo -u postgres psql -c "CREATE ROLE admins WITH SUPERUSER LOGIN CREATEROLE CREATEDB;"
    sudo -u postgres psql -c "CREATE USER geoserver WITH PASSWORD '$ADMIN_PASSWORD';"
    sudo -u postgres psql -c "CREATE DATABASE reldb WITH OWNER geoserver;"
    sudo -u postgres psql -d reldb -c "CREATE EXTENSION postgis;"
    sudo -u postgres psql -d reldb -c "REVOKE CREATE ON SCHEMA public FROM PUBLIC;"
    sudo -u postgres psql -d reldb -c "GRANT ALL ON geometry_columns TO PUBLIC;"
    sudo -u postgres psql -d reldb -c "GRANT ALL ON spatial_ref_sys TO PUBLIC;"

    sudo -u postgres psql -c "CREATE ROLE geoadmins WITH LOGIN NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION;"
    sudo -u postgres psql -d reldb -c "GRANT CREATE, USAGE ON SCHEMA public TO geoadmins;"
    sudo -u postgres psql -d reldb -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO geoadmins;"
    sudo -u postgres psql -d reldb -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO geoadmins;"

    sudo -u postgres psql -c "CREATE ROLE guests WITH LOGIN NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION;"
    sudo -u postgres psql -d reldb -c "GRANT USAGE ON SCHEMA public TO guests;"
    sudo -u postgres psql -d reldb -c "GRANT SELECT ON ALL TABLES IN SCHEMA public TO guests;"
    sudo -u postgres psql -d reldb -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO guests;"
fi

# QGIS Server
if [ "`grep qgis.org /etc/apt/sources.list`" = "" ]; then
    sudo sh -c 'echo "deb http://qgis.org/debian-ltr buster main" >> /etc/apt/sources.list'
    gpg --recv-key CAEB3DC3BDF7FB45
    gpg --export --armor CAEB3DC3BDF7FB45 | sudo apt-key add -
    sudo apt update && sudo apt install -y qgis qgis-server python-qgis libapache2-mod-fcgid
    
    sudo mkdir /var/log/qgis && sudo chown www-data:www-data /var/log/qgis
fi

# Création du dossier de GeoServer; et on l'indique dans les variables Catalina/Tomcat
if [ ! -d $GEOSERVER_DATA_DIR ]; then
    sudo mkdir -p $GEOSERVER_DATA_DIR && sudo chown -R tomcat:tomcat $GEOSERVER_DATA_DIR
    sudo sh -c "echo 'CATALINA_OPTS=\"-Xmx4096m -DGEOSERVER_DATA_DIR=$GEOSERVER_DATA_DIR\"' >> /usr/share/tomcat9/bin/setclasspath.sh"
fi

# Téléchargement du WAR de GeoServer et extraction dans le dossier "webapps" de tomcat
if [ ! -e "./geoserver-"$GEOSERVER_VERSION"-war.zip" ]; then
    wget "https://freefr.dl.sourceforge.net/project/geoserver/GeoServer/"$GEOSERVER_VERSION"/geoserver-"$GEOSERVER_VERSION"-war.zip"
fi

if [ ! -e "./geoserver-"$GEOSERVER_VERSION"-gdal-plugin.zip" ]; then
    wget "https://freefr.dl.sourceforge.net/project/geoserver/GeoServer/"$GEOSERVER_VERSION"/extensions/geoserver-"$GEOSERVER_VERSION"-gdal-plugin.zip"
fi

if [ ! -e "./geoserver-"$GEOSERVER_VERSION"-pyramid-plugin.zip" ]; then
    wget "https://freefr.dl.sourceforge.net/project/geoserver/GeoServer/"$GEOSERVER_VERSION"/extensions/geoserver-"$GEOSERVER_VERSION"-pyramid-plugin.zip"
fi

sudo systemctl stop tomcat9
sudo unzip "geoserver-"$GEOSERVER_VERSION"-war.zip" -d /var/lib/tomcat9/webapps
sudo systemctl start tomcat9
sleep 30
sudo unzip "geoserver-"$GEOSERVER_VERSION"-gdal-plugin.zip" -d /var/lib/tomcat9/webapps/geoserver/WEB-INF/lib
sudo unzip "geoserver-"$GEOSERVER_VERSION"-pyramid-plugin.zip" -d /var/lib/tomcat9/webapps/geoserver/WEB-INF/lib

sudo chown tomcat:tomcat -R /var/lib/tomcat9/webapps/geoserver/WEB-INF/lib/

echo "Installation terminée !"
