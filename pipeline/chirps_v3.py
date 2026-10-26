#!/usr/bin/env python3
"""Build an audited, source-derived CHIRPS v3 monthly grid for the CWI website.

This module NEVER creates climate values when the publisher cannot be reached.
The study viewport is a WGS84 BOX, not an administrative boundary mask.
Run `smoke` first; `year` outputs per-year artifacts; `publish` requires all 31 years.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import json
import math
import os
from pathlib import Path
import tempfile
import time
import urllib.error
import urllib.request

import numpy as np
import rasterio
from rasterio.windows import from_bounds

SOURCE = "https://data.chc.ucsb.edu/products/CHIRPS/v3.0/monthly/global/cogs"
# The current SVG map uses 107.2 west, 13.9 north, 345 px per geographic degree.
# This is intentionally a rectangular coverage area, not a Dak Lak provincial mask.
BBOX = (107.2, 11.87, 109.72, 13.9)  # west, south, east, north
YREF = tuple(range(1991, 2021))
TARGET = 2025
VALID_LIMIT_MM = 10000
GDAL_CONFIG = {
    "GDAL_DISABLE_READDIR_ON_OPEN": "EMPTY_DIR",
    "CPL_VSIL_CURL_ALLOWED_EXTENSIONS": ".cog,.tif",
    "GDAL_HTTP_MAX_RETRY": "3",
    "GDAL_HTTP_RETRY_DELAY": "2",
    "GDAL_HTTP_TIMEOUT": "75",
    "VSI_CACHE": "TRUE",
    "VSI_CACHE_SIZE": "20000000",
}


def source_url(year:int, month:int)->str:
    if not (1981 <= year <= 2100 and 1 <= month <= 12):
        raise ValueError("Invalid CHIRPS period")
    return f"{SOURCE}/chirps-v3.0.{year}.{month:02d}.cog"


def read_month(year:int, month:int, *, retries:int=4, sleep=time.sleep):
    """Read a COG window; fall back to an independently downloaded publisher GeoTIFF.

    Fallback matters because remote GDAL range requests occasionally fail on CHC.
    SHA256 is of cropped decoded raster (not full original COG), so cannot be
    misconstrued as the publisher's whole-file digest.
    """
    url=source_url(year,month)
    errors=[]
    for attempt in range(retries):
        try:
            with rasterio.Env(**GDAL_CONFIG):
                # GDAL /vsicurl requires Accept-Ranges support from the publisher.
                with rasterio.open('/vsicurl/'+url) as src:
                    return _extract(src,url,access='COG range')
        except Exception as exc:
            errors.append(f"COG attempt {attempt+1}: {str(exc)[:210]}")
            if attempt < retries-1:sleep(min(2**attempt,12))
    # The fallback is the official GeoTIFF, *not* a model or substitute rainfall product.
    tif_url=f"https://data.chc.ucsb.edu/products/CHIRPS/v3.0/monthly/global/tifs/chirps-v3.0.{year}.{month:02d}.tif"
    # Keep a strict size cap; the global TIFFs are large and are deleted immediately.
    for attempt in range(2):
        try:
            with tempfile.TemporaryDirectory() as folder:
                fn=Path(folder)/'official.tif'
                req=urllib.request.Request(tif_url,headers={"User-Agent":"CWI-CHIRPS-validation/1.0"})
                with urllib.request.urlopen(req,timeout=100) as response,open(fn,'wb') as fd:
                    size=0
                    while block:=response.read(1024*1024):
                        size+=len(block)
                        if size>140*1024*1024:raise ValueError('Original GeoTIFF exceeds 140 MB safety limit')
                        fd.write(block)
                with rasterio.open(fn) as src: return _extract(src,tif_url,access='TIFF full-file fallback')
        except Exception as exc:
            errors.append(f"TIFF fallback {attempt+1}: {str(exc)[:210]}")
            if attempt<1:sleep(5)
    raise RuntimeError(f"Official CHIRPS source failed for {year}-{month:02d}: {'; '.join(errors)}")


def _extract(ds,url:str,access:str):
    if ds.count!=1:raise ValueError('Unexpected multiband CHIRPS file')
    if not ds.crs or ds.crs.to_epsg()!=4326:raise ValueError('CHIRPS CRS is not EPSG:4326')
    if not (abs(ds.res[0]-.05)<.005 and abs(ds.res[1]-.05)<.005):
        raise ValueError(f'Unexpected grid resolution {ds.res}')
    if ds.transform.a <= 0 or ds.transform.e >= 0:raise ValueError('Unexpected pixel orientation')
    west,south,east,north=BBOX
    window=from_bounds(west,south,east,north,transform=ds.transform).round_offsets().round_lengths()
    values=ds.read(1,window=window,masked=False).astype('float64')
    if values.ndim!=2 or values.size<300 or values.size>20000:raise ValueError('Viewport dimensions unexpected')
    if values.shape[0]!=int(window.height) or values.shape[1]!=int(window.width):raise ValueError('Window read incomplete')
    transform=ds.window_transform(window)
    valid=np.isfinite(values)&(values>=0)&(values<=VALID_LIMIT_MM)
    if np.count_nonzero(valid)<.60*values.size:raise ValueError('Too few valid source precipitation cells')
    values[~valid]=np.nan
    grid={"west":round(float(transform.c),8),"north":round(float(transform.f),8),"dx":round(float(transform.a),8),"dy":round(float(transform.e),8),"width":int(values.shape[1]),"height":int(values.shape[0]),"crs":"EPSG:4326"}
    digest=hashlib.sha256(np.nan_to_num(values,nan=-9999).astype('<f4').tobytes()).hexdigest()
    receipt={"sourceUrl":url,"readMethod":access,"windowDataSha256":digest,"validCells":int(valid.sum()),"totalCells":int(values.size),"invalidCells":int((~valid).sum())}
    return values.astype('float32'),grid,receipt


def annual_run(year:int,outdir:Path, reader=read_month):
    outdir.mkdir(parents=True,exist_ok=True)
    monthly=[];receipts=[];common=None
    for month in range(1,13):
        vals,grid,receipt=reader(year,month)
        if common is None:common=grid
        if grid!=common:raise ValueError(f'Inconsistent transform/shape at {year}-{month:02d}')
        monthly.append(vals); receipts.append(dict(year=year,month=month,**receipt))
        print(f'{year}-{month:02d}: {receipt["validCells"]}/{receipt["totalCells"]} official cells ({receipt["readMethod"]})',flush=True)
    data=np.stack(monthly,axis=0)
    np.savez_compressed(outdir/f'year_{year}.npz',values=data,grid=json.dumps(common,separators=(',',':')),receipts=json.dumps(receipts,separators=(',',':')))
    return outdir/f'year_{year}.npz'


def _load_year(path:Path):
    if not path.exists():raise FileNotFoundError(path)
    with np.load(path,allow_pickle=False) as arr:
        return arr['values'],json.loads(str(arr['grid'])),json.loads(str(arr['receipts']))


def _avg_cos_lat(arr:np.ndarray,grid:dict):
    lat=grid['north']+(np.arange(grid['height'])+.5)*grid['dy']
    w=np.cos(np.deg2rad(lat))[:,None]
    ok=np.isfinite(arr)
    denom=np.sum(w*ok)
    return float(np.nansum(np.where(ok,arr,0)*w)/denom) if denom else None


def _as_list(arr):
    # Preserve nan as JSON null, round values only AFTER validating full precision.
    return [None if not math.isfinite(float(v)) else round(float(v),4) for v in np.ravel(arr)]


def build_publish(inputs:Path,output:Path, now:dt.datetime|None=None):
    """Fail closed until all 360 baseline AND 12 target monthly source windows pass."""
    all_years=(*YREF,TARGET)
    cube=[];receipts=[];grid=None
    for year in all_years:
        arr,metadata,year_receipts=_load_year(inputs/f'year_{year}.npz')
        if arr.ndim!=3 or arr.shape[0]!=12 or not np.isfinite(arr).any():raise ValueError(f'Bad year {year}')
        if grid is None:grid=metadata
        if metadata!=grid or arr.shape[1:]!=(grid['height'],grid['width']):raise ValueError('Grid transform mismatch')
        if len(year_receipts)!=12:raise ValueError(f'Incomplete receipts for {year}')
        for i,rec in enumerate(year_receipts,1):
            if (rec['year'],rec['month'])!=(year,i) or not rec.get('sourceUrl','').startswith('https://data.chc.ucsb.edu/products/CHIRPS/v3.0/'):
                raise ValueError('Invalid provenance')
            if rec['validCells']!=int(np.isfinite(arr[i-1]).sum()):raise ValueError('Receipt count mismatch')
            h=hashlib.sha256(np.nan_to_num(arr[i-1],nan=-9999).astype('<f4').tobytes()).hexdigest()
            if h!=rec['windowDataSha256']:raise ValueError(f'Source window hash mismatch: {year}-{i}')
        cube.append(arr);receipts.extend(year_receipts)
    reference=np.stack(cube[:30],axis=0) # [30 years, 12 months, row, col]
    years_per_cell=np.isfinite(reference).sum(axis=0)
    full=(years_per_cell==30)
    mean=np.where(full, np.nanmean(reference,axis=0),np.nan)
    sd=np.where(full,np.nanstd(reference,axis=0,ddof=0),np.nan)
    valid_fraction=np.isfinite(mean).sum()/mean.size
    if valid_fraction < .60:raise ValueError('1991-2020 reference baseline insufficient coverage')
    future=cube[-1]
    baseline={"startYear":1991,"endYear":2020,"yearsCount":30,"sourceCount":360,"months":[{"month":m+1,"values":_as_list(mean[m]),"std":_as_list(sd[m])} for m in range(12)],"stdMethod":"population standard deviation over 30 historical years, complete-cell only"}
    periods=[]
    target_receipts=receipts[-12:]
    for m in range(12):
        r=target_receipts[m];arr=future[m]
        periods.append({"year":TARGET,"month":m+1,"values":_as_list(arr),"validCells":int(np.isfinite(arr).sum()),"areaWeightedMeanMm":_avg_cos_lat(arr,grid),"sourceUrl":r['sourceUrl'],"sourceWindowSha256":r['windowDataSha256']})
    output.mkdir(parents=True,exist_ok=True)
    obj={"schema":"cwi.chirps.v3.monthly.grid.v1","dataset":"CHIRPS v3.0 monthly final","provider":"Climate Hazards Center, UC Santa Barbara","grid":grid,"periods":periods,"baseline":baseline,
         "boundaryMask":"none; WGS84 rectangular map viewport (contains locations outside Dak Lak); NOT a province average",
         "spatialMeanMethod":"cos(latitude) weighted average over valid cells in rectangular viewport, not administrative province",
         "sourceManifest":"chirps-v3-cog-audit.json","notFor":"Household irrigation shortage, causal effects, or municipality/household estimates"}
    outpath=output/'chirps-v3-daklak.json'
    data=json.dumps(obj,ensure_ascii=False,allow_nan=False,separators=(',',':'))
    outpath.write_text(data,encoding='utf-8')
    manifest={"status":"PASS","schema":"cwi.chirps.v3.audit.v1","createdAt":(now or dt.datetime.now(dt.timezone.utc)).isoformat(),"dataset":"CHIRPS v3.0 monthly final","referencePeriod":"1991-2020","referenceSourceCount":360,"targetYear":TARGET,"targetSourceCount":12,
              "officialPublisherCOGWindowsChecked":sum(r['readMethod']=='COG range' for r in receipts),"officialPublisherTiffFallbacks":sum(r['readMethod']=='TIFF full-file fallback' for r in receipts),
              "officialPublisherFilesChecked":372,"sourceWindowDigests":receipts,"studyArea":"rectangular map viewport, not administrative polygon","grid":grid,"fullyObservedBaselineCellMonthPct":float(100*valid_fraction),
              "baselineCalculation":"mean and population standard deviation, corresponding month across 30 years, complete-cell only", "geotiffNote":"windowDataSha256 is SHA-256 of cropped decoded float32 values, NOT publisher full COG file sha256", "outputSha256":hashlib.sha256(data.encode('utf-8')).hexdigest(),"mapFile":"chirps-v3-daklak.json"}
    (output/'chirps-v3-cog-audit.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'PASS: {len(receipts)} official publisher months, {grid["width"]}x{grid["height"]} cells, {100*valid_fraction:.1f}% complete baseline cell-months',flush=True)
    return outpath


def main():
    parser=argparse.ArgumentParser();commands=parser.add_subparsers(dest='command',required=True)
    a=commands.add_parser('smoke');a.add_argument('--output',default='_work/smoke.json')
    a=commands.add_parser('year');a.add_argument('--year',type=int,required=True);a.add_argument('--outdir',default='_work')
    a=commands.add_parser('publish');a.add_argument('--indir',default='_work');a.add_argument('--output',default='data')
    args=parser.parse_args()
    if args.command=='smoke':
        _,grid,receipt=read_month(2025,1)
        Path(args.output).parent.mkdir(parents=True,exist_ok=True)
        Path(args.output).write_text(json.dumps({"status":"PASS","period":"2025-01","grid":grid,"receipt":receipt},indent=2))
        print('Official CHIRPS monthly source smoke PASS',flush=True)
    elif args.command=='year':
        if args.year not in (*YREF,TARGET):raise ValueError('Year must be 1991–2020 or 2025')
        annual_run(args.year,Path(args.outdir))
    else:build_publish(Path(args.indir),Path(args.output))

if __name__=='__main__':main()