import "./App.css";
import Kronos from "./base_img/w1r03.webp";

import {
  LayersControl,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { ImageOverlay } from "react-leaflet";

import L, { LatLng, latLngBounds, latLng, LatLngBounds } from "leaflet";
import React from "react";
import Control from "react-leaflet-custom-control";
import MapTitle from "./components/MapTitle";
import MapMenu from "./components/MapMenu";
import MousePosition from "./components/MousePosition";
import xy, { sf_remap } from "./util/MapCoordinates";

import islands, { Island } from "./islands";
import { useLocation, useSearchParams } from "react-router-dom";

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
        <LayersControl collapsed={false} position="topright">
          <LayersControl.Overlay name="what">
            <Marker position={[0, 0]}>
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>
          </LayersControl.Overlay>
        </LayersControl>

        <MousePosition />
        <MapMenu selectedIsland={island.name} clickHandler={setIsland} />
        <MapTitle />
      </MapContainer>
    </div>
  );
}

export default App;
