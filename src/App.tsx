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

import islands from "./islands";
import { useLocation, useSearchParams } from "react-router-dom";


function App() {
  const location = useLocation();
  const [island, setIsland] = React.useState(islands[0]);

  React.useEffect(() => {

    const queryParams = new URLSearchParams(location.search);
    const queryIsland = queryParams.get('map');
    if (queryIsland) {
    setIsland(islands.find((island) => { return island.name === queryIsland } ) ?? islands[0]);
    } else { setParams('map=Kronos'); }

  }, [island]);
  const [params, setParams] = useSearchParams();
  console.log(params);

  function changeMap(e: React.MouseEvent<HTMLLIElement>) {
    const islandName = (e.target as HTMLLIElement).textContent;
    const selectedIsland = islands.find((island) => { return island.name === islandName; });
    if(selectedIsland) {
    setIsland(selectedIsland);
    setParams('map=' + selectedIsland.name);
  }
}
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
        <ImageOverlay url={'./base_img/' + island.filename + '.webp'} bounds={island.bounds} />
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
        <MapMenu selectedIsland={island.name} clickHandler={changeMap} />
        <MapTitle />
      </MapContainer>
    </div>
  );
}

export default App;
