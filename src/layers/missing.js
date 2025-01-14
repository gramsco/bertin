// import * as d3selection from "d3-selection";
import * as d3selection from "d3-selection";
import * as d3geo from "d3-geo";
import * as d3geoprojection from "d3-geo-projection";
const d3 = Object.assign({}, d3selection, d3geo, d3geoprojection);

import { topo2geo } from "../helpers/topo2geo.js";
import {figuration } from "../helpers/figuration.js";
import {addtooltip } from "../helpers/tooltip.js";
import {legbox } from "../helpers/leg-box.js";

export function missing(selection, projection, options = {}, clipid){
  let geojson = topo2geo(options.geojson);
  let values = options.values;
  let fill = options.fill ? options.fill : "white";
  let stroke = options.stroke ? options.stroke : "white";
  let strokeWidth = options.strokeWidth ? options.strokeWidth : 0.5;
  let fillOpacity = options.fillOpacity ? options.fillOpacity : 1;

  let missing = geojson.features.filter(
    (d) => d.properties[values] == undefined
  );

  // If lines
  if (figuration(geojson) == "l") {
    stroke = options.stroke ? options.stroke : "white";
    fill = options.fill ? options.fill : "none";
    strokeWidth = options.strokeWidth ? options.strokeWidth : 1;
  }

  selection
    .append("g")
    .attr("clip-path", clipid == null ? `none` : `url(#clip_${clipid}`)
    .selectAll("path")
    .data(missing)
    .join("path")
    .attr("d", d3.geoPath(projection))
    .attr("fill", fill)
    .attr("stroke", stroke)
    .attr("stroke-width", strokeWidth)
    .attr("fill-opacity", fillOpacity)


  // Legend

  legbox(selection, {
    x: options.leg_x,
    y: options.leg_y,
    w: options.leg_w,
    h: options.leg_h,
    text: options.leg_text ? options.leg_text : "Missing data",
    fontSize: options.leg_fontSize2,
    stroke: options.leg_stroke,
    fillOpacity: options.leg_fillOpacity
      ? options.leg_fillOpacity
      : fillOpacity,
    fill: fill,
    strokeWidth: options.leg_strokeWidth,
    txtcol: options.leg_txtcol
  });
}
