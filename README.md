# geojson-trim-network
Given a GeoJSON LineString network and a Location object, remove unused network areas.


# What?

When given a list of all possible origin / destination locations, trim areas of network that would not logically be traveled.  

(A naive approach that only trims with 100% certainty, does not yet take into account segment weight).

## Install

```
npm install geojson-trim-network --save
```

## Usage

```
const fs = require('fs').promises;
const trimNetwork = require('geojson-trim-network');

main();

async function main() {

    const geojson_raw = await fs.readFile('./file.geojson');

    const geojson = JSON.parse(geojson_raw);

    const locations = {
                    "10001": {
                      "lat": 40.7506364,
                      "lng": -73.9971766
                    },
                    "10002": {
                      "lat": 40.7157758,
                      "lng": -73.9862109
                    }
                  };

    const lookup = trimNetwork(geojson, locations);

    // similar geojson network (with fewer segments) is returned

}


```