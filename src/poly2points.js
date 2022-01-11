export function poly2points(geojson, largest){
  geojson = JSON.parse(JSON.stringify(geojson));
  const largestPolygon = function (d) {
    var best = {};
    var bestArea = 0;
    d.geometry.coordinates.forEach(function (coords) {
      var poly = { type: "Polygon", coordinates: coords };
      var area = d3.geoArea(poly);
      if (area > bestArea) {
        bestArea = area;
        best = poly;
      }
    });
    return best;
  };

  let centers = geojson.features.map((d) => {
    d.geometry.coordinates = d3.geoCentroid(
      largest == true
        ? d.geometry.type == "Polygon"
          ? d
          : largestPolygon(d)
        : d
    );
    d.geometry.type = "Point";
    return d;
  });

  return centers;
}
