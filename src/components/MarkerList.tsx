import React from "react";
import { LayersControl, Popup, Marker, LayerGroup } from "react-leaflet";
import Control from "react-leaflet-custom-control";
import { Island } from "../types/islands";
import { SFObject } from "../types/SFObject";
import xy from "../util/MapCoordinates";

export default function MarkerList(props: { selectedIsland: Island }) {
//   const [markerList, setMarkerList] = React.useState<{objectType: string, objects: SFObject[]}>();
  const [markerList, setMarkerList] = React.useState<MarkerObject[] | undefined>([]);

  async function getObjectTypes(
    selectedIslandFilename: string
  ): Promise<string[]> {
    const response = await fetch("./json/" + selectedIslandFilename + "/index.json");
    const json = await response.json();
    console.log(json);
	console.log('object types? ',  performance.now());

    return json;
  }

  interface MarkerObject {
    objectType: string,
    markers?: {
      position: [number, number, number]
      name: string,
    }[],
  }

  async function makeMarkers(markerList: SFObject[]): Promise<JSX.Element> {
    return (
      <LayersControl.Overlay
        key={markerList[0].TypeName}
        name={markerList[0].TypeName}
      >
        <LayerGroup>
          {markerList.map((marker, index) => {
            return (
              <Marker
                key={marker.FileName + marker.ObjectName}
                position={xy(marker.Position[0], marker.Position[2])}
              >
                <Popup>
                  <h1>{marker.TypeName}</h1>
                  <h2>{marker.ObjectName}</h2>
                  <span>
                    X: {Math.round(marker.Position[0])}, Y:{" "}
                    {Math.round(marker.Position[1])}, Z:{" "}
                    {Math.round(marker.Position[2])}
                  </span>
                </Popup>
              </Marker>
            );
          })}
        </LayerGroup>
      </LayersControl.Overlay>
    );
  }

  async function getObjects(filename: string): Promise<SFObject[]> {
    const response = await fetch(
      "./json/" + props.selectedIsland.filename + "/" + filename + ".json"
    );
    const json = await response.json();
    return json;
  }
  React.useEffect(() => {
	setMarkerList([]);
	let markerListHolder: MarkerObject[] = [];
    const objectTypes = getObjectTypes(props.selectedIsland.filename);
    /* do this when object type box is selected instead? */
    objectTypes.then((objectTypes) => {
      objectTypes.sort();
      objectTypes.forEach((objectType: string) => {
		return (markerListHolder.push({objectType: objectType}))

      });
	  
  console.log(markerListHolder);
	setMarkerList(markerListHolder)
    });
  }, [props.selectedIsland]);

  function ActualMarkerList(): JSX.Element {
    const markerControls = markerList?.map((marker: MarkerObject) => {
      return (
        <li key={marker.objectType}>{marker.objectType}</li>
          
          
          )

    })
    return (
      <ul>
        {markerControls}

      </ul>
    );
  }


  return (
    <Control prepend={true} position="topright">
      <h1>Markers</h1>

      <input type="search" autoComplete="off" />
      <LayersControl collapsed={false} position="topright">
		
	  <ActualMarkerList />

      </LayersControl>
    </Control>
  );
}
