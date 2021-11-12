// Imports
import * as d3selection from "d3-selection";
import * as d3geo from "d3-geo";
import * as d3geoprojection from "d3-geo-projection";
const d3 = Object.assign({}, d3selection, d3geo, d3geoprojection);

export function getheight(layers, extent, projection, width) {

  let ref;
  let delta;

  if (extent) {
    ref = extent;
    delta = 1;
  } else {
    if (layers.find((d) => d.type == "outline") != undefined) {
      let outline = layers.find((d) => d.type == "outline");
      ref = { type: "Sphere" };
      delta = outline.strokewidth ? outline.strokewidth : 0;
    } else {
      let l = layers.map((d) => d.geojson).filter((d) => d !== undefined);
      let all = [];
      l.forEach((d) => all.push(d.features));
      ref = {
        type: "FeatureCollection",
        features: all.flat()
      };
      delta = 1;
    }
  }

  const [[x0, y0], [x1, y1]] = d3
    .geoPath(projection.fitWidth(width, ref))
    .bounds(ref);
  const dy = Math.ceil(y1 - y0),
    l = Math.min(Math.ceil(x1 - x0), dy);
  projection.scale((projection.scale() * (l - delta)) / l).precision(0.2);
  let height = dy;
  //let height = dy + header.fontsize + footer.fontsize;
  return height;
  //return ref;
}