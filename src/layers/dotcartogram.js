import * as d3selection from "d3-selection";
import * as d3geo from "d3-geo";
import * as d3array from "d3-array";
import * as d3force from "d3-force";
const d3 = Object.assign({}, d3selection, d3array, d3geo, d3force);

import { topo2geo } from "../helpers/topo2geo.js";
import { addtooltip, tooltiptype } from "../helpers/tooltip.js";
import {poly2points } from "../helpers/poly2points.js";
import {figuration } from "../helpers/figuration.js";
import {chorotypo } from "../helpers/chorotypo.js";
import {thickness } from "../helpers/thickness.js";
import {legends } from "../helpers/legends.js";

export function dotcartogram(selection, projection, options = {}, clipid, width, height){
  let cols = [
    "#66c2a5",
    "#fc8d62",
    "#8da0cb",
    "#e78ac3"
  ];

  let geojson = topo2geo(options.geojson);
  let values = options.values;
  let radius = options.radius ?? 4;
  let nbmax = options.nbmax ?? 200
  let onedot = options.onedot ?? Math.round(d3.sum(geojson.features.map((d) => +d.properties[values])) / nbmax)
  let span = options.span ?? 0.5
  let fill = options.fill ?? cols[Math.floor(Math.random() * cols.length)];
  let stroke = options.stroke ?? "none";
  let strokeWidth = options.strokeWidth ?? 0;
  let fillOpacity = options.fillOpacity ?? 1;
  let strokeDasharray = options.strokeDasharray ?? "none";
  let strokeOpacity = options.strokeOpacity ?? 1;
  let tooltip = options.tooltip ? options.tooltip : false;
  if (Array.isArray(tooltip)) { tooltip = { fields: tooltip }; }
  if (typeof tooltip == "string") { tooltip = { fields: [tooltip] };}
  let iteration = options.iteration ?? 200;

  let features;

  if (figuration(geojson) == "p") {
    features = geojson.features;
  } else {
    features = poly2points(geojson);
  }

  // Dissolve

  let dots = [];
  for (let i = 0; i <= features.length - 1; i++) {
    let nb = Math.round(+features[i].properties[values] / onedot);
    for (let j = 1; j <= nb; j++) {
      dots.push({ ...features[i] });
    }
  }

  // Simulation

    const simulation = d3
      .forceSimulation(dots)
      .force(
        "x",
        d3.forceX((d) => projection(d.geometry.coordinates)[0] )
      )
      .force(
        "y",
        d3.forceY((d) => projection(d.geometry.coordinates)[1])
      )
      .force(
        "collide",
        d3.forceCollide(radius + span + strokeWidth / 2)
      );

    for (let i = 0; i < iteration; i++) {
      simulation.tick();
    }

  // Draw

  selection
    .append("g")
    .selectAll("circle")
    .data(
      dots
        .filter((d) => d.geometry.coordinates != undefined)
        )
    .join("circle")
    .attr("fill", (d) =>
      chorotypo(dots, fill).getcol(d.properties[fill.values] || undefined)
    )
    .attr("stroke", (d) =>
      chorotypo(dots, stroke).getcol(d.properties[stroke.values] || undefined)
    )
    .attr("stroke-width", (d) =>
   thickness(dots, strokeWidth).getthickness(d.properties[strokeWidth.values] || undefined)
 )
    .attr("fill-opacity", fillOpacity)
    .attr("stroke-dasharray", strokeDasharray)
    .attr("stroke-opacity", strokeOpacity)
    .attr("cx", (d) => d.x)
    .attr("cy", (d) => d.y)
    .attr("r", radius)
    .on("touchmove mousemove", function (event, d) {

  if (tooltip) {
      selection.select("#info").call(
        addtooltip,

        {
          fields: (function () {
            const fields = Array.isArray(tooltip.fields)
              ? tooltip.fields
              : [tooltip.fields];
            let result = [];
            fields.forEach((e) => {
              result.push(
                e[0] == "$" ? `${d.properties[e.substr(1, e.length)]}` : e
              );
            });
            return result;
          })(),
          fontWeight: tooltip.fontWeight,
          fontSize: tooltip.fontSize,
          fontStyle: tooltip.fontStyle,
          fill: tooltip.fill,
          stroke: tooltip.stroke,
          strokeWidth: tooltip.strokeWidth,
          fillOpacity: tooltip.fillOpacity,
          strokeOpacity: tooltip.strokeOpacity,
          col:tooltip.col,
          type: tooltiptype(d3.pointer(event, this), width, height)
        }
      );
    }
    if (tooltip) {
      selection
        .select("#info")
        .attr("transform", `translate(${d3.pointer(event, this)})`);
        d3.select(this)
          .attr("stroke-opacity", strokeOpacity - 0.3)
          .attr("fill-opacity", fillOpacity - 0.3)
          //.raise();
    }
  })
  .on("touchend mouseleave", function () {
    selection.select("#info").call(addtooltip, null);
    d3.select(this)
    .attr("stroke-opacity", strokeOpacity)
   .attr("fill-opacity", fillOpacity)
   //.lower();
  });


// legend

const leg_x = options.leg_x ?? null
const leg_y = options.leg_y ?? null
const leg_title = options.leg_title ?? "leg_title"
const leg_fontSize = options.leg_fontSize ?? 14
const leg_fontSize2 = options.leg_fontSize2 ?? 10
const leg_txtcol = options.leg_txtcol ?? "#363636"
const leg_stroke = options.leg_stroke ?? stroke
const leg_strokeWidth = options.leg_strokeWidth ?? strokeWidth
const leg_fill = typeof fill == "string" ? fill : options.leg_fill
const leg_txt = options.leg_txt ?? onedot

  if (leg_x != null && leg_y != null) {
let delta = 0
let leg = selection.append("g");
if (leg_title != null) {
  delta = (leg_title.split("\n").length + 1) * leg_fontSize;
  leg
    .append("g")
    .selectAll("text")
    .data(leg_title.split("\n"))
    .join("text")
    .attr("x", leg_x)
    .attr("y", leg_y)
    .attr("font-size", `${leg_fontSize}px`)
    .attr("dy", (d, i) => i * leg_fontSize)
    .attr("text-anchor", "start")
    .attr("dominant-baseline", "hanging")
    .attr("fill", leg_txtcol)
    .text((d) => d);
}
    leg
      .append("circle")
      .attr("r", radius)
      .attr("fill", leg_fill)
      .attr("stroke", leg_stroke)
      .attr("stroke-width", leg_strokeWidth)
      .attr("cx",leg_x + radius)
      .attr("cy", leg_y + radius * 2 + (leg_title.split("\n").length ) * leg_fontSize)


      leg
        .append("text")
        .attr("fill", leg_txtcol)
        .attr("font-size", `${leg_fontSize2}px`)
        .attr("dominant-baseline", "middle")
        .attr("x",leg_x + radius * 2 + leg_fontSize2)
        .attr("y", leg_y + radius * 2 + (leg_title.split("\n").length) * leg_fontSize)
        .text(leg_txt)

}

          // legend (classes)
          legends(geojson, selection, fill, stroke, strokeWidth)


}
