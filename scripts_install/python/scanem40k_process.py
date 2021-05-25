#!/bin/env python3
# -*- coding: utf-8 -*-
__author__ = "Vincent Delbar"
__copyright__ = "Copyright 2019, Projet RestEAUr'Lag"
__credits__ = ["Vincent Delbar"]

import os
import sys
import gdal
import numpy as np
from pathlib import Path
from shutil import rmtree, copytree

from skimage import filters, morphology

from qgis_tools import *
from tools import to_tiff, find_shapefiles


def extract_reds(array):
    try:
        # La formule magique
        reds = (((array[0] - array[1]) / (array[0] + array[1])) ** 2) * 100
        threshold = filters.threshold_yen(reds)
        bin_img = reds > threshold
        clean = morphology.remove_small_holes(bin_img, 24)
        return morphology.remove_small_objects(clean, 8)
    except (ValueError, ZeroDivisionError):
        raise


def process_img(path):

    name, _ = os.path.splitext(os.path.basename(path))
    ds = gdal.Open(path)
    proj = ds.GetProjection()
    geot = ds.GetGeoTransform()
    array = ds.ReadAsArray().astype(np.float32)
    ds = None
    # Extraction du rouge
    reds_bin = extract_reds(array)

    if reds_bin is None:
        return False

    bin_file = os.path.join('tmp', name + '.tif')
    to_tiff(reds_bin, 'float32', proj, geot, bin_file, nodata=0)
    outfile = os.path.join('tmp', name + '.shp')
    # Vectorisation
    params = {'-b': False, '-s': True, '-t': False, '-v': False, '-z': False,
              'GRASS_OUTPUT_TYPE_PARAMETER': 3, 'GRASS_VECTOR_EXPORT_NOCAT': False,
              'column': 'value', 'input' : bin_file, 'output' : outfile, 'type' : 2 }
    processing.run('grass7:r.to.vect', params, None, feedback)

    return True


indir = sys.argv[1]
outdir = sys.argv[2]
vector = sys.argv[3]
if not os.path.exists(outdir):
    os.makedirs(outdir)
os.chdir(outdir)
os.mkdir('tmp')

if __name__ == "__main__":
    print('\nBegin:\n')
    roi = QgsVectorLayer(vector)
    for basename in os.listdir(indir):
        _, ext = os.path.splitext(basename)
        if ext.lower() in ['.jp2', '.tif']:
            path = os.path.join(indir, basename)
            if r_intersects(path, roi):
                print('Processing ' + basename)
                process_img(path)
    print('\nMerging layers...\n')
    merge(find_shapefiles('tmp'), 'scanem40k_reds.shp')
    rmtree('tmp')
    print('End.')
