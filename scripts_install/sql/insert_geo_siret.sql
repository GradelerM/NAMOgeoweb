DROP TABLE IF EXISTS geo_siret;

CREATE TABLE geo_siret(
    siren text, nic text, siret text, statutDiffusionEtablissement text, dateCreationEtablissement date, 
    trancheEffectifsEtablissement text, anneeEffectifsEtablissement integer, activitePrincipaleRegistreMetiersEtablissement text, 
    dateDernierTraitementEtablissement date, etablissementSiege text, nombrePeriodesEtablissement text, 
    complementAdresseEtablissement text, numeroVoieEtablissement text, indiceRepetitionEtablissement text, 
    typeVoieEtablissement text, libelleVoieEtablissement text, codePostalEtablissement text, libelleCommuneEtablissement text, 
    libelleCommuneEtrangerEtablissement text, distributionSpecialeEtablissement text, codeCommuneEtablissement text, 
    codeCedexEtablissement text, libelleCedexEtablissement text, codePaysEtrangerEtablissement text, libellePaysEtrangerEtablissement text, 
    complementAdresse2Etablissement text, numeroVoie2Etablissement text, indiceRepetition2Etablissement text, typeVoie2Etablissement text, 
    libelleVoie2Etablissement text, codePostal2Etablissement text, libelleCommune2Etablissement text, libelleCommuneEtranger2Etablissement text, 
    distributionSpeciale2Etablissement text, codeCommune2Etablissement text, codeCedex2Etablissement text, libelleCedex2Etablissement text, 
    codePaysEtranger2Etablissement text, libellePaysEtranger2Etablissement text, dateDebut date, etatAdministratifEtablissement text, 
    enseigne1Etablissement text, enseigne2Etablissement text, enseigne3Etablissement text, denominationUsuelleEtablissement text, 
    activitePrincipaleEtablissement text, nomenclatureActivitePrincipaleEtablissement text, caractereEmployeurEtablissement text, 
    longitude double precision, latitude double precision, geo_score double precision, geo_type text, geo_adresse text, geo_id text, geo_ligne text, geo_l4 text, geo_l5 text
);

\COPY geo_siret FROM 'geo_siret_2B.csv' CSV HEADER;
\COPY geo_siret FROM 'geo_siret_30.csv' CSV HEADER;
\COPY geo_siret FROM 'geo_siret_34.csv' CSV HEADER;

SELECT AddGeometryColumn ('geo_siret', 'geom', 4326, 'POINT', 2);
UPDATE geo_siret SET geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);
