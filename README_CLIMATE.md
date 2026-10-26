# CHIRPS v3 official climate pipeline for Coffee Water Intelligence

This implementation computes a 1991–2020 monthly baseline and 2025 monthly raster from Climate Hazards Center monthly CHIRPS v3.0 official products. It operates on the **map viewport bounding box** (107.2°–109.72° E and 11.87°–13.9° N), **not a Dak Lak administrative polygon**.

## Pipeline and publication

The GitHub Actions workflow runs a source smoke test on workflow publication. Only after it succeeds should the workflow be manually dispatched with the `full` operation. The full workflow processes 1991–2020 plus 2025 in 31 isolated years; final publication requires all 372 monthly source windows, consistent CRS, grid transform, valid numbers and hashes. Partial/incomplete data are never published.

The archived, open-source Python implementation is stored in `pipeline/sources.tar.gz.b64` to facilitate distribution via the connected GitHub uploader. You can unpack it using:

```
mkdir -p pipeline
base64 -d pipeline/sources.tar.gz.b64 | tar -xz -C pipeline
```

It contains `chirps_v3.py` and `test_chirps_v3.py`, with full comments and transparent formulas. The GitHub Actions workflow decodes and runs exactly these files. No dummy climate data are included in the repository; fixture data only exist inside unit tests.

## Scientific scope

The dataset is CHIRPS v3 **monthly final** in mm/month. Baselines are the 30 corresponding months across 1991–2020 for each grid cell, requiring all 30 valid monthly values. Population standard deviation is used for descriptive anomalies; it is NOT an SPI index. Year 2025 has 12 monthly layers. The monthly raster is not a household-level irrigation-water estimate, nor a representation of the coffee household sample. The box includes locations outside the administrative province.

The website reads `data/chirps-v3-cog-audit.json` and loads the corresponding verified `data/chirps-v3-daklak.json` only after a `PASS` audit from the publisher processing workflow. The audit manifest has a SHA256 digest for the final JSON and cropped source windows. The hashes are **not whole-file checksums of the publisher's COG**. If the pipeline fails, the website retains the existing placeholder and external source links; it does not invent rainfall.

## Data sources

- CHC: https://www.chc.ucsb.edu/data/chirps3
- CHC monthly: https://data.chc.ucsb.edu/products/CHIRPS/v3.0/monthly/global/cogs/

Python packages: numpy, rasterio (Python 3.11+). In local environments with reliable access to CHC, run `python pipeline/chirps_v3.py smoke` before `year` or `publish`.