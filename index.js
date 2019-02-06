const KDBush = require('kdbush');
const geokdbush = require('geokdbush');

module.exports = trimNetwork;
exports.trimNetwork = trimNetwork;

function trimNetwork(geojson, locations) {

  const new_geo = Array.isArray(geojson) ? geojson : geojson.features;

  const uniqueNodesSet = createValency(new_geo);

  // format for kdbush
  const points = Object.keys(uniqueNodesSet).map(node => {
    const coords = node.split(',');
    return {
      node,
      lon: Number(coords[0]),
      lat: Number(coords[1])
    };
  });

  // index all the points
  const index = new KDBush(points, (p) => p.lon, (p) => p.lat);

  // find closest neighbor for each pair of zip
  const closest = {};
  const used_zip_points = [];
  Object.keys(locations).forEach(key => {
    const obj = locations[key];
    const nearest = geokdbush.around(index, obj.lng, obj.lat, 1);
    closest[key] = nearest[0].node;
    used_zip_points.push(nearest[0].node);
  });


  // get all single valency points
  let single_valency = getSingleValency(uniqueNodesSet, used_zip_points);
  console.log(`initial single valency (and unused): ${single_valency.length}`);
  console.log(`out of ${Object.keys(uniqueNodesSet).length} unique points`);

  let geo = [...new_geo];

  while (single_valency.length) {
    geo = removeFromGeoJson(single_valency, geo);
    const uniqueNodes = createValency(geo);
    single_valency = getSingleValency(uniqueNodes, used_zip_points);

    console.log(`single valency (and unused): ${single_valency.length}`);
    console.log(`out of ${Object.keys(uniqueNodes).length} unique points`);
  }

  // combine alike segments
  return {
    "type": "FeatureCollection",
    "features": geo
  };

}


function getSingleValency(uniqueNodesSet, used_zip_points) {
  return Object.keys(uniqueNodesSet)
    .filter(key => {
      return uniqueNodesSet[key] === 1;
    })
    .filter(key => {
      // not one of the used_zip_points
      return !used_zip_points.includes(key);
    });

}

function removeFromGeoJson(single_valency, new_geo) {
  return new_geo.filter(feature => {
    if(!feature.geometry) {
      return false;
    }
    const coords = feature.geometry.coordinates;
    const start = coords[0].join(',');
    const end = coords[coords.length - 1].join(',');
    return !single_valency.includes(start) && !single_valency.includes(end);
  });
}

// createValency
function createValency(geo) {
  const uniqueNodesSet = {};
  geo.forEach(feature => {
    if(!feature.geometry) {
      return;
    }
    const coords = feature.geometry.coordinates;
    // start
    const start = coords[0].join(',');
    if (!uniqueNodesSet[start]) {
      uniqueNodesSet[start] = 1;
    } else {
      uniqueNodesSet[start]++;
    }
    // end
    const end = coords[coords.length - 1].join(',');
    if (!uniqueNodesSet[end]) {
      uniqueNodesSet[end] = 1;
    } else {
      uniqueNodesSet[end]++;
    }
  });
  return uniqueNodesSet;
}
