#!/bin/env python3
# -*- coding: utf-8 -*-
__author__ = "Vincent Delbar"
__copyright__ = "Copyright 2019, Projet RestEAUr'Lag"
__credits__ = ["Vincent Delbar"]

import os
import sys
import gdal
import numpy as np
import argparse
from pathlib import Path
from shutil import rmtree, copytree, move

import skimage
from skimage import io, measure, feature, exposure, color

from tools import to_nparray, to_tiff


def process_img(path: str, stretch: bool = True, threshold: float = 0.666):
    """Traitements de l'image en amont d'une vectorisation"""

    image = skimage.io.imread(path)
    # Passage en niveaux de gris
    grays = color.rgb2gray(image)
    # Nodata devient valeur max
    grays = np.where(grays == 0, 1, grays)
    # Etirement du contraste
    if stretch:
        grays = exposure.rescale_intensity(grays)
    # Seuil (2/3 de luminance par défaut)
    strokes = np.where(grays > threshold, 0, 1)
    return strokes


def extract_lines(path, stretch, threshold, max_length, snap=1):
    """Extraction de lignes depuis un scan de cadastre géoréférencé"""

    _, basename = os.path.split(path)
    name, ext = os.path.splitext(basename)
    if ext not in ['.tif', '.tiff', '.TIF', '.TIFF']:
        return False

    ds = gdal.Open(path)
    proj = ds.GetProjection()
    geot = ds.GetGeoTransform()
    ds = None
    # Pré-traitements
    strokes = process_img(path, stretch, threshold)
    bin_output = os.path.join('bin', basename)
    to_tiff(np.where(strokes == 1, 0, 255), 'byte', proj, geot, bin_output)
    # Squelette
    skel = os.path.join('skel', basename)
    params = {'input' : bin_output, 'iterations' : 200, 'output' : skel}
    processing.run('grass7:r.thin', params, None, feedback)
    # Vectorisation
    lines = os.path.join('tmp', name + '_tmp.shp')
    params = {'-b' : False, '-s' : False, '-t' : True, '-v' : False, '-z' : False,
              'GRASS_OUTPUT_TYPE_PARAMETER' : 2, 'input' : skel, 'output' : lines, 'type' : 0 }
    processing.run('grass7:r.to.vect', params, None, feedback)
    # Nettoyage de la topologie : break, snap, prune
    clean = os.path.join('tmp', name + '_clean.shp')
    params = {'-b' : False, '-c' : True, 'GRASS_MIN_AREA_PARAMETER' : 0.0001,
              'GRASS_OUTPUT_TYPE_PARAMETER' : 2, 'GRASS_SNAP_TOLERANCE_PARAMETER' : -1,
              'input' : lines, 'output': clean, 'error': 'TEMPORARY_OUTPUT',
              'threshold' : '0,{},1'.format(snap), 'tool' : [0,1,9], 'type' : [1] }
    processing.run('grass7:v.clean', params, None, feedback)
    # Reprojection parce que GRASS utilise un SRC inconnu
    layer = reproj(clean, 'EPSG:2154')
    # Explosion des lignes
    params = {'INPUT': layer, 'OUTPUT':'memory:'}
    res = processing.run('qgis:explodelines', params, None, feedback)
    layer = res['OUTPUT']
    # Calcul de champs
    layer.addExpressionField('$id', QgsField('gid', QVariant.Int))
    layer.addExpressionField('$length', QgsField('length', QVariant.Double))
    # Nettoyage des petits segments
    params = {
        'INPUT': layer,
        'EXPRESSION': """ "length" < {} """.format(max_length),
        'METHOD': 0
    }
    processing.run('qgis:selectbyexpression', params, None, feedback)
    layer.dataProvider().deleteFeatures([f.id() for f in layer.getSelectedFeatures()])
    # Export final
    return to_shp(layer, os.path.join('clean', name + '.shp'))


parser = argparse.ArgumentParser(description='Extraction des lignes à partir de feuilles de cadastre napoléonien')
parser.add_argument('data', type=str, help='Fichier .tiff ou dossier contenant des feuilles de cadastre découpées et géoréférencées')
parser.add_argument('outdir', type=str, help='Dossier de sortie')
parser.add_argument('--threshold', '-t', help='Seuil de luminosité pour extraction des lignes', type=float, default=0.666, metavar='')
parser.add_argument('--stretch', '-s', help="Contrôle de l'étirement du contraste", type=bool, default=True, metavar='')
parser.add_argument('--max-length', '-m', help="Longueur maximum de la ligne pour nettoyage des petits segments", metavar='')
parser.add_argument('--clean-tmp', '-c',  type=bool, default=False, metavar='',
                    help="Indique si il faut conserver les données intermédiaires (images binaires, lignes avant nettoyage...)")

args = parser.parse_args()

data = Path(args.data)
outdir = Path(args.outdir)
threshold = args.threshold
stretch = args.stretch
max_length = args.max_length
clean_tmp = args.clean_tmp


if __name__ == '__main__':
    from qgis_tools import *
    # Prepare
    print("\nBegin:\n")
    tmp_dirs = ['bin', 'skel', 'tmp', 'clean']
    if not outdir.exists():
        os.makedirs(str(outdir))
    os.chdir(str(outdir))
    for subdir in tmp_dirs:
        if Path(subdir).exists():
            rmtree(str(subdir))
        os.makedirs(str(subdir))
    # Extract
    if data.is_dir():
        indir = data
        files = os.listdir(str(data))
        files.sort()
        for f in files:
            print('Processing file ' + f)
            extract_lines(str(indir/f), stretch, threshold, max_length)
    else:
        print('Processing file ' + data.name)
        extract_lines(str(data), stretch, threshold, max_length)

    # Clean
    if not Path('lines').exists():
        move('clean', 'lines')
    else:
        for f in os.listdir('clean'):
            move(str(Path('clean')/f), str(Path('lines')/f))

    if clean_tmp:
        for d in tmp_dirs:
            rmtree(d)
