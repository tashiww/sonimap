import Control from "react-leaflet-custom-control";
import islands, { Island } from "../types/islands";
export default 
function MapMenu(props: {clickHandler: any, selectedIslandName: string}) {
  return (
	<Control prepend={true} position="bottomleft">
	  <div className="menu">
		<ul>
			{ islands.map((island) => {
				const selectedClass = island.name == props.selectedIslandName ? 'selected' : '';
				return (
		  <li key={island.name} className={selectedClass} onClick={() => props.clickHandler(island)}>{island.name}</li>
				);
			})}
		  </ul>
		  </div>
		  </Control>
		  )
}