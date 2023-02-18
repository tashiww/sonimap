import L, { LatLng, latLng } from "leaflet";

let yx = latLng;
let xy = function (x: number, y: number) {
  if (Array.isArray(x)) {
    // When doing xy([x, y]);
    return yx(x[1], x[0]);
  }
  return yx(y, x); // When doing xy(x, y);
};
export const sf_remap = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1.433, 770, 1.433, 2222),
  projection: L.Projection.LonLat,
  distance: function (latlng1: LatLng, latlng2: LatLng) {
    var dx = latlng2.lng - latlng1.lng,
      dy = latlng2.lat - latlng1.lat;
    return Math.sqrt(dx * dx + dy * dy);
  },
});


export default xy;