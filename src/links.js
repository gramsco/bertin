import { figuration } from "./helpers/figuration.js";
import {poly2points } from "./helpers/poly2points.js";
import { topo2geo } from "./helpers/topo2geo.js";

export function links(options = {}) {
  let geojson = topo2geo(options.geojson);
  let geojson_id = options.geojson_id;
  let data = options.data;
  let data_i = options.data_i ?? "i";
  let data_j = options.data_j ?? "j";

  let dots;
  if (figuration(geojson) == "p") {
    dots = geojson.features;
  } else {
    dots = poly2points(geojson);
  }

  const coordsbyid = new Map(
    dots.map((d) => [d.properties[geojson_id], d.geometry.coordinates])
  );

  // PUISQUE 2 POINTS UFFISENT, FAIRE SANS TURF.JS
  let features = [];
  data.forEach((d) => {

    if(coordsbyid.get(d[data_i]) != undefined && coordsbyid.get(d[data_j]) != undefined){
      features.push({
        type: "Feature",
        properties: d,
        geometry: {
          type: "LineString",
          coordinates: [coordsbyid.get(d[data_i]), coordsbyid.get(d[data_j])]
        }
      })
}


  });

  return { type: "FeatureCollection", features: features };
}
