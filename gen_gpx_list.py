import os
import json

gpx_dir = 'gpx_strava'
files = [f"{gpx_dir}/" + f for f in os.listdir(gpx_dir) if f.endswith('.gpx')]

with open('gpx_list.json', 'w') as out:
    json.dump(files, out, indent=2)

print(f"{len(files)} fichiers GPX listés dans gpx_list.json")
