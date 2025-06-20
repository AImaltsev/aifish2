// server/utils/isVolga.js
const fs = require('fs');
const turf = require('@turf/turf');
const volgaGeoJson = JSON.parse(fs.readFileSync(__dirname + '/../data/volga.geojson', 'utf8'));

function isValidPolygonFeature(f) {
  return f &&
    f.type === "Feature" &&
    f.geometry &&
    (f.geometry.type === "Polygon" || f.geometry.type === "MultiPolygon") &&
    Array.isArray(f.geometry.coordinates) &&
    f.geometry.coordinates.length > 0;
}

function isPointOnVolga(lat, lon) {
  const pt = turf.point([lon, lat]);
  if (volgaGeoJson.type === "FeatureCollection") {
    // Только валидные полигоны
    return volgaGeoJson.features
      .filter(isValidPolygonFeature)
      .some(f => turf.booleanPointInPolygon(pt, f));
  } else if (volgaGeoJson.type === "Feature" && isValidPolygonFeature(volgaGeoJson)) {
    return turf.booleanPointInPolygon(pt, volgaGeoJson);
  }
  // Если не найдено ни одного полигона
  return false;
}

module.exports = { isPointOnVolga };
