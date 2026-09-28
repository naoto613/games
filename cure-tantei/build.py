#!/usr/bin/env python3
"""Concatenate src/*.js (sorted) into a single self-contained index.html."""
import os,glob
d=os.path.dirname(os.path.abspath(__file__))
head=open(os.path.join(d,'src/_head.html'),encoding='utf-8').read()
tail=open(os.path.join(d,'src/_tail.html'),encoding='utf-8').read()
js=''.join(open(f,encoding='utf-8').read() for f in sorted(glob.glob(os.path.join(d,'src/*.js'))))
open(os.path.join(d,'index.html'),'w',encoding='utf-8').write(head+js+tail)
print('built',len(head+js+tail),'bytes')
