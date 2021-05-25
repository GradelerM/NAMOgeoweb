# -*- coding: utf-8 -*-
__author__ = "Vincent Delbar"
__copyright__ = "Copyright 2019, Projet RestEAUr'Lag"
__credits__ = ["Vincent Delbar"]
import os
import ogr
import gdal
import numpy as np

def to_nparray(tif, dtype=None) -> np.ndarray:
    """Convertit un tif en numpy array"""

    arr = None
    ds = gdal.Open(str(tif))
    if dtype:
        arr = ds.ReadAsArray().astype(dtype)
    else:
        arr = ds.ReadAsArray()
    ds = None
    return arr


def to_tiff(array, dtype, proj, geot, path, mask=None, nodata=None):
    """Enregistre un fichier .tif à partir d'un array et de variables GDAL"""

    _dtypes = {
        'byte': (gdal.GDT_Byte, 2 ** 8 - 1),
        'float32': (gdal.GDT_Float32, (2 - 2 ** -23) * 2 ** 127),
        'uint16': (gdal.GDT_UInt16, 2 ** 16 - 1),
        'uint32': (gdal.GDT_UInt32, 2 ** 32 - 1)
    }
    cols, rows = array.shape[1], array.shape[0]  # x, y
    driver = gdal.GetDriverByName('GTiff')
    dt, v = _dtypes[dtype]
    if nodata is not None:
        v = nodata
    if mask is not None:
        array = np.where(mask == 1, v, array)

    ds = driver.Create(str(path), cols, rows, 1, dt)
    ds.SetProjection(proj)
    ds.SetGeoTransform(geot)
    ds.GetRasterBand(1).SetNoDataValue(v)
    ds.GetRasterBand(1).WriteArray(array)
    ds = None
    return True


def find_shapefiles(path: str, recursive=True, followlinks=False):
    """Recherche les fichiers shp dans un dossier"""

    res = []
    if not recursive:
        for f in os.listdir(path):
            if os.path.splitext(f)[1] in ['.shp', '.SHP']:
                res.append(os.path.join(path, f))
    else:
        for root, _, files in os.walk(path, followlinks=followlinks):
            for f in files:
                if os.path.splitext(f)[1] in ['.shp', '.SHP']:
                    res.append(os.path.join(root, f))

    return res
