import React from "react";
import { LayersControl, Popup, Marker, LayerGroup } from "react-leaflet";
import Control from "react-leaflet-custom-control";
import { Island } from "../types/islands";
import { SFObject } from "../types/SFObject";

export default function MarkerList(props: { selectedIsland: Island }) {

	const [markerList, setMarkerList] = React.useState<JSX.Element[]>([]);
	
	async function getFileNames(selectedIslandFilename: string): Promise<string[]> {
		const response = fetch('./json/file_list.json');
		const json = await (await response).json();
		return json[selectedIslandFilename];
	}
React.useEffect(function() {
	const foo = getFileNames(props.selectedIsland.filename);
	foo.then((bar: string[]) => {
		bar.slice(0, 5).forEach(file => {
		const objects = getObjects(file);
		objects.then(foo => {
			setMarkerList([...markerList, ...makeMarkers(foo)]);
			console.log(foo);
		});
	});
		console.log(bar);


	});
}, []);

	async function getObjects(filename: string) {
		const response = fetch('./json/' + filename);
		const json = await (await response).json();
		return json;
	}

	function makeMarkers(markerList: SFObject[]) {
		const markers: JSX.Element[] = markerList.map((marker, index) => {
			return (
				<LayersControl.Overlay key={marker.TypeName} name={marker.TypeName}>
				<LayerGroup>
		  
			<Marker key={marker.ObjectName+index} position={[marker.Position[0], marker.Position[2]]} >
				<Popup><h1>{marker.TypeName}</h1><h2>{marker.ObjectName}</h2>
				</Popup>
			</Marker>
			</LayerGroup>
			</LayersControl.Overlay>);
		})
		return markers;
		
	}

	return (
		<Control prepend={true} position="topright">
<h1>Markers</h1>
<input type="search" autoComplete="off" />
<LayersControl collapsed={false} position="topright">

		{markerList}
		
	  <LayersControl.Overlay name="bar">

	  <Marker position={[220, 220]}>
			
			<Popup>
			  A pretty CSS3 popup. <br /> Easily customizable.
			</Popup>
		  </Marker>
  
</LayersControl.Overlay>
	</LayersControl>
	</Control>
  );
}
