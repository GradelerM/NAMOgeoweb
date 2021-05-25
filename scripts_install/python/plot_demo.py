#!/bin/env python3
# -*- coding: utf-8 -*-
__author__ = "Vincent Delbar"
__copyright__ = "Copyright 2019, Projet RestEAUr'Lag"
__credits__ = ["Vincent Delbar"]

import os
import sys
import pandas as pd
import matplotlib.pyplot as plt


columns = {'PMUN15': 2015, 'PMUN14': 2014, 'PMUN13': 2013, 'PMUN12': 2012, 'PMUN11': 2011,
           'PMUN10': 2010, 'PMUN09': 2009, 'PMUN08': 2008, 'PMUN07': 2007, 'PMUN06': 2006,
           'PSDC99': 1999, 'PSDC90': 1990, 'PSDC82': 1982, 'PSDC75': 1975, 'PSDC68': 1968,
           'PSDC62': 1962, 'PTOT54': 1954, 'PTOT36': 1936, 'PTOT1931': 1931, 'PTOT1926': 1926,
           'PTOT1921': 1921, 'PTOT1911': 1911, 'PTOT1906': 1906, 'PTOT1901': 1901,
           'PTOT1896': 1896, 'PTOT1891': 1891, 'PTOT1886': 1886, 'PTOT1881': 1881, 'PTOT1876': 1876}

def plot_n_com(df: pd.DataFrame, communes: list):
    fig = plt.figure(figsize=(12, 8))
    for c in communes:
        tup = df.loc[c]
        name = tup[2]
        values = tup[3:].astype(int)
        values.rename(columns, inplace=True)
        values.sort_index(inplace=True)
        values.plot(kind='line', label=name, legend=True, xlim=(1876, 2020))
    fig.suptitle('Évolution de la population des communes entre 1876 et 2015')
    fig.savefig('demo_' + str.join('_', communes), bbox_inches='tight')


if __name__ == '__main__':
    infile = sys.argv[1]
    df = pd.read_excel(infile, 'pop_1876_2015', header=0, index_col=0, skiprows=5)
    for arg in sys.argv[2:]:
        plot_n_com(df, arg.split(','))
