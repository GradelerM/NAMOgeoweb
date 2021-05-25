# -*- coding: utf-8 -*-
__author__ = "Vincent Delbar"
__copyright__ = "Copyright 2019, Projet RestEAUr'Lag"
__credits__ = ["Vincent Delbar"]

import os
import sys
import gdal
import numpy as np
from pathlib import Path

def find_qgis():
    """Retourne l'emplacement de QGIS sur la machine"""

    qgs_root = None
    qgs_pyqgis = None

    if sys.platform == 'linux':
        for d in ['/usr', '/usr/local', '/opt/qgis', '/opt/qgis-dev']:
            if Path(d + '/lib/qgis').exists():
                qgs_root = Path(d)
                qgs_pyqgis = qgs_root/'share/qgis/python'
    elif sys.platform == 'win32':
        for d in Path('C:/Program Files').iterdir():
            if 'QGIS 3' in str(d) or 'OSGeo4W64' in str(d):
                qgs_root = d
        if not qgs_root:
            for d in Path('C:/').iterdir():
                if 'OSGeo4W64' in str(d):
                    qgs_root = d
        if qgs_root:
            qgs_pyqgis = qgs_root/'apps/qgis/python'
            if not qgs_pyqgis.exists():
               qgs_pyqgis = qgs_root/'apps/qgis-ltr/python' 
    elif sys.platform == 'darwin':
        if Path('/Applications/QGIS.app').exists():
            qgs_root = Path('/Applications/QGIS.app')
            qgs_pyqgis = qgs_root/'Contents/Resources/python'

    return str(qgs_root), str(qgs_pyqgis)


HOME = Path.home()
QGS_ROOT, PYQGIS_DIR = find_qgis()
if not QGS_ROOT:
    sys.exit("Can't find QGIS.")
sys.path.append(str(Path(PYQGIS_DIR)/'plugins'))
sys.path.append(PYQGIS_DIR)

from qgis.core import (
    QgsApplication,
    QgsField,
    QgsRectangle,
    QgsVectorFileWriter,
    QgsVectorLayer,
    QgsProcessingFeedback,
    QgsProcessingException
)
from qgis.analysis import QgsNativeAlgorithms
from PyQt5.QtCore import QVariant
import processing
from processing.core.Processing import Processing
# Init QGIS
qgs = QgsApplication([b''], False)
qgs.initQgis()
qgs.setPrefixPath(str(QGS_ROOT))
Processing.initialize()
qgs.processingRegistry().addProvider(QgsNativeAlgorithms())
feedback = QgsProcessingFeedback()

def reproj(file, crs, outdir='memory:'):
    """Reprojection d'une couche"""

    path = str(file)
    name = os.path.basename(path).split('.')[0]
    layer = QgsVectorLayer(path, name)
    params = {
        'INPUT': layer,
        'TARGET_CRS': crs
    }
    if outdir == 'memory:':
            params['OUTPUT'] = outdir + name
    else:
        params['OUTPUT'] = str(outdir/(name + '.shp'))
    res = processing.run('native:reprojectlayer', params, None, feedback)
    del layer

    if isinstance(res['OUTPUT'], QgsVectorLayer):
        return res['OUTPUT']

    return QgsVectorLayer(res['OUTPUT'], name)


def to_shp(layer, path):
    """Enregistre un objet QgsVectorLayer sur le disque"""

    writer = QgsVectorFileWriter(
        str(path),
        'utf-8',
        layer.fields(),
        layer.wkbType(),
        layer.sourceCrs(),
        'ESRI Shapefile'
    )
    writer.addFeatures(layer.getFeatures())
    return True


def merge(layer_list, out='memory:'):
        """Pour fusionner un ensemble de couches a partir d'une liste"""

        params = {
            'LAYERS': layer_list
        }
        if out == 'memory:':
            params['OUTPUT'] = out + 'merged'
        elif '.shp' in str(out):
            params['OUTPUT'] = str(out)
        else:
            params['OUTPUT'] = str(out/'merged.shp')
        res = processing.run('native:mergevectorlayers', params, None, feedback)

        if isinstance(res['OUTPUT'], QgsVectorLayer):
            return res['OUTPUT']

        return QgsVectorLayer(res['OUTPUT'], 'merged')


def r_intersects(raster, layer):
    """Contrôle si un raster intersecte un shapefile"""

    intersects = False
    ds = gdal.Open(raster)
    xsize, ysize = ds.RasterXSize, ds.RasterYSize
    xmin, xpix, _, ymax, _, ypix = ds.GetGeoTransform()
    ds = None
    extent = QgsRectangle(xmin, ymax - (ysize * -ypix), xmin + (xsize * xpix), ymax)
    for feat in layer.getFeatures():
        if feat.geometry().intersects(extent):
            intersects = True
            break

    return intersects
