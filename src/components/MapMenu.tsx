import Control from "react-leaflet-custom-control";
import islands from "../islands";
export default 
function MapMenu(props: {clickHandler: React.MouseEventHandler<HTMLLIElement>, selectedIsland: string}) {
  return (
	<Control prepend={true} position="bottomleft">
	  <div className="menu">
		<ul>
			{ islands.map((island) => {
				const selectedClass = island.name == props.selectedIsland ? 'selected' : '';
				return (
		  <li key={island.name} className={selectedClass} onClick={props.clickHandler}>{island.name}</li>
				);
			})}
		  </ul>
		  </div>
		  </Control>
		  )
}