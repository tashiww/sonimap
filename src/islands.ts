import { LatLngBounds, latLngBounds } from "leaflet";
import xy from "./util/MapCoordinates";

interface Island {
	name: string;
	filename: string;
	scale: number;
	bounds: LatLngBounds;
  }
  
const islands: Island[] = [
    {
      name: "Kronos",
      filename: "w1r03",
      scale: 1.433,
      bounds: latLngBounds(xy(-770, 2048), xy(2088, -880)),
    },
    {
      name: "Ares",
      filename: "w2r01",
      scale: 1.2573,
      bounds: latLngBounds(xy(0, 0), xy(4096, 4096)),
    },
    {
      name: "Chaos",
      filename: "w3r01",
      scale: 1.007,
      bounds: latLngBounds(xy(0, 0), xy(4096, 4096)),
    },
    {
      name: "Rhea",
      filename: "w1r05",
      scale: 1.0796,
      bounds: latLngBounds(xy(0, 0), xy(4096, 4096)),
    },
    {
      name: "Ouranos",
      filename: "w1r04",
      scale: 0.9761,
      bounds: latLngBounds(xy(0, 0), xy(4096, 4096)),
    },
  ];

  export default islands;