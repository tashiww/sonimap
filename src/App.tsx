import "./App.css";

import {
  LayersControl,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { ImageOverlay } from "react-leaflet";

import React from "react";
import MapTitle from "./components/MapTitle";
import MapMenu from "./components/MapMenu";
import MousePosition from "./components/MousePosition";
import xy, { sf_remap } from "./util/MapCoordinates";

import islands, { Island } from "./types/islands";
import { useLocation, useSearchParams } from "react-router-dom";
import MarkerList from "./components/MarkerList";

function App() {
  const [params, setParams] = useSearchParams();
  const [island, setIsland] = React.useState(islands.find((island) => {
    return island.name === params.get("map");
  }) ?? islands[0]);

  function updateIsland(selectedIsland: Island) {
    setParams({map: selectedIsland.name});
    setIsland(islands.find((island) => {
      return island.name === selectedIsland.name;
    }) ?? islands[0] );
  }
// import 21525.599999904633 - 607
// or 800 - 85 ? first load 782, subsequent 817?
// fetch is 221 - 98 ????
// or 200 - 87,  222 - 200


  return (
    <div id="map">
      <MapContainer
        className="map"
        center={[0, 0]}
        minZoom={-3}
        maxZoom={2}
        scrollWheelZoom={true}
        zoomSnap={0.25}
        attributionControl={false}
        zoom={-2}
        crs={sf_remap}
      >
        <ImageOverlay
          url={"./base_img/" + island.filename + ".webp"}
          bounds={island.bounds}
        />

        <MousePosition />
        <MapMenu selectedIslandName={island.name} clickHandler={(e: any) => updateIsland(e)} />
        <MapTitle />
        <MarkerList selectedIsland={island} />
        
      </MapContainer>
    </div>
  );
}

export default App;
