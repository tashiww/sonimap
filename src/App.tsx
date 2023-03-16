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

import islands from "./types/islands";
import { useLocation, useSearchParams } from "react-router-dom";
import MarkerList from "./components/MarkerList";

function App() {
  const location = useLocation();
  const [island, setIsland] = React.useState(islands[0]);
  const [params, setParams] = useSearchParams();

  React.useEffect(() => {
    const queryIsland = params.get("map");
    if (queryIsland) {
      const islandMatch = islands.find((island) => {
        return island.name === queryIsland;
      });
      if (islandMatch) {
        setIsland(islandMatch);
      }
    }
  }, []);
  
  React.useEffect(() => {
    setParams("map=" + island.name);
  }, [island]);

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
        <MarkerList selectedIsland={island} />
        
        <MousePosition />
        <MapMenu selectedIslandName={island.name} clickHandler={setIsland} />
        <MapTitle />
      </MapContainer>
    </div>
  );
}

export default App;
