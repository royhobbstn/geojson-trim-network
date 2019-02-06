const fs = require('fs').promises;
const createNodeLookup = require('./index.js');
const locations = require('./zip_lookup.json');

main();

async function main() {

  const geojson_raw = await fs.readFile('./simple_network.geojson');

  const geojson = JSON.parse(geojson_raw);

  const lookup = createNodeLookup(geojson, locations);

  await fs.writeFile('./lookup.json', JSON.stringify(lookup), 'utf8');

}
