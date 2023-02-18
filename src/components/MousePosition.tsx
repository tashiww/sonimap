import { LatLng } from "leaflet";
import React from "react";
import { useMapEvents } from "react-leaflet";
import Control from "react-leaflet-custom-control";

export default function MousePosition() {
    const [currentLatLng, setCurrentLatLng] = React.useState<LatLng>(new LatLng(0, 0));
    useMapEvents({
      mousemove(e) {
        setCurrentLatLng(e.latlng);
      },
    });

    return currentLatLng === null ? null : (
      <Control prepend={false} position="bottomleft">
              <div className="mouseposition">

        <span>{"X: " + currentLatLng.lng.toFixed(0) + ", Z: " + currentLatLng.lat.toFixed(0)}</span>

        </div>
      </Control>
    );
  }