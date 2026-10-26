import json,hashlib,tempfile,unittest
from pathlib import Path
import numpy as np
from chirps_v3 import source_url,annual_run,build_publish
class PipelineTests(unittest.TestCase):
 def test_source_url(self):
  self.assertEqual(source_url(1991,2),'https://data.chc.ucsb.edu/products/CHIRPS/v3.0/monthly/global/cogs/chirps-v3.0.1991.02.cog')
 def test_reject_missing(self):
  with tempfile.TemporaryDirectory() as d:
   with self.assertRaises(FileNotFoundError):build_publish(Path(d),Path(d)/'publish')
   self.assertFalse((Path(d)/'publish'/'chirps-v3-daklak.json').exists())
 def test_complete_30_years_synthetic(self):
  with tempfile.TemporaryDirectory() as d:
   path=Path(d);g={'west':107.2,'north':13.9,'dx':.05,'dy':-.05,'width':8,'height':7,'crs':'EPSG:4326'}
   for year in [*range(1991,2021),2025]:
    values=np.empty((12,7,8),dtype='float32');recs=[]
    for m in range(12):
     values[m]=year-1990+m
     digest=hashlib.sha256(values[m].astype('<f4').tobytes()).hexdigest()
     recs.append(dict(year=year,month=m+1,sourceUrl=source_url(year,m+1),readMethod='COG range',windowDataSha256=digest,validCells=56,totalCells=56,invalidCells=0))
    np.savez_compressed(path/f'year_{year}.npz',values=values,grid=json.dumps(g),receipts=json.dumps(recs))
   out=build_publish(path,path/'data')
   data=json.loads(out.read_text())
   manifest=json.loads((path/'data'/'chirps-v3-cog-audit.json').read_text())
   self.assertEqual(manifest['officialPublisherFilesChecked'],372)
   self.assertEqual(data['baseline']['sourceCount'],360)
   self.assertAlmostEqual(data['baseline']['months'][0]['values'][0],15.5)
if __name__=='__main__':unittest.main()
