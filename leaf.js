/* allow x,y coordinates to be used with leaflet */
const yx = L.latLng;
const xy = function(x, y) {
  if (Array.isArray(x)) { // When doing xy([x, y]);
    return yx(x[1], x[0]);
  }
  return yx(y, x); // When doing xy(x, y);
};

function sf_remap(coords, stage_name, mouse = false) {
  /* map images are 4096x4096 pixels while
   * in-game island size varies.
   * this function remaps in-game coordinates to
   * pixels
   * coords is [x, y] array
   * returns latlng object
   * * * * * * * * * * * * * * * * * * * * * * * */
  const origins = {
    w1r03: {
      origin: [1105, 2861],
      scale_factor: 1.433
    },
    w2r01: {
      origin: [2223, 2122],
      scale_factor: 1.2573
    },
    w3r01: {
      origin: [2040, 2045],
      scale_factor: 1.007
    },
    w1r05: {
      origin: [2029, 1661],
      scale_factor: 1.0796
    },
    w1r04: {
      origin: [2040, 706],
      scale_factor: 0.9761
    },
  };
  const origin = origins[stage_name].origin;
  const scale_factor = origins[stage_name].scale_factor;
	if(!Array.isArray(coords)) {
		return coords / scale_factor;
	}
  if (mouse) {
    const new_x = Math.round((coords[0] - origin[0]) / scale_factor);
    const new_y = Math.round((-coords[1] + origin[1]) / scale_factor);
    return [new_x, new_y];
  } else {
    return xy((scale_factor * coords[0]) + origin[0], (scale_factor * coords[1]) + origin[1]);
  }
}

var MapNames = {
  kronos: 'w1r03',
  ares: 'w2r01',
  chaos: 'w3r01',
  rhea: 'w1r05',
  ouranos: 'w1r04',
};

var mapsPlaceholder = [];
L.Map.addInitHook(function() {
  mapsPlaceholder.push(this); // Use whatever global scope variable you like.
});

const cyberStages = {"w6d01": {"Stage":"1-1", "RingMission": 150, "Time": 43,"ExtremeTime": 40},
"w6d02": {"Stage":"1-4", "RingMission": 20, "Time": 75,"ExtremeTime": 60},
"w6d03": {"Stage":"2-6", "RingMission": 100, "Time": 145,"ExtremeTime": 92},
"w6d04": {"Stage":"3-1", "RingMission": 20, "Time": 120,"ExtremeTime": 87},
"w6d05": {"Stage":"2-1", "RingMission": 30, "Time": 100,"ExtremeTime": 62},
"w6d06": {"Stage":"1-6", "RingMission": 50, "Time": 75,"ExtremeTime": 70},
"w6d07": {"Stage":"3-5", "RingMission": 90, "Time": 65,"ExtremeTime": 56},
"w6d08": {"Stage":"3-2", "RingMission": 30, "Time": 80,"ExtremeTime": 65},
"w6d09": {"Stage":"3-4", "RingMission": 30, "Time": 80,"ExtremeTime": 66},
"w6d10": {"Stage":"4-5", "RingMission": 180, "Time": 90,"ExtremeTime": 62},
"w7d01": {"Stage":"4-3", "RingMission": 70, "Time": 100,"ExtremeTime": 73},
"w7d02": {"Stage":"2-3", "RingMission": 90, "Time": 55,"ExtremeTime": 43},
"w7d03": {"Stage":"3-7", "RingMission": 80, "Time": 100,"ExtremeTime": 70},
"w7d04": {"Stage":"1-5", "RingMission": 40, "Time": 75,"ExtremeTime": 50},
"w7d05": {"Stage":"4-8", "RingMission": 15, "Time": 30,"ExtremeTime": 23},
"w7d06": {"Stage":"2-4", "RingMission": 75, "Time": 70,"ExtremeTime": 42},
"w7d07": {"Stage":"4-6", "RingMission": 40, "Time": 90,"ExtremeTime": 78},
"w7d08": {"Stage":"4-1", "RingMission": 130, "Time": 105,"ExtremeTime": 89},
"w8d01": {"Stage":"1-2", "RingMission": 80, "Time": 55,"ExtremeTime": 55},
"w8d02": {"Stage":"3-3", "RingMission": 25, "Time": 115,"ExtremeTime": 94},
"w8d03": {"Stage":"2-2", "RingMission": 30, "Time": 55,"ExtremeTime": 34},
"w8d04": {"Stage":"2-5", "RingMission": 30, "Time": 70,"ExtremeTime": 55},
"w8d05": {"Stage":"2-7", "RingMission": 30, "Time": 90,"ExtremeTime": 58},
"w8d06": {"Stage":"3-6", "RingMission": 30, "Time": 175,"ExtremeTime": 128},
"w9d02": {"Stage":"4-2", "RingMission": 120, "Time": 75,"ExtremeTime": 65},
"w9d03": {"Stage":"4-4", "RingMission": 150, "Time": 160,"ExtremeTime": 123},
"w9d04": {"Stage":"1-3", "RingMission": 80, "Time": 60,"ExtremeTime": 37},
"w9d05": {"Stage":"4-7", "RingMission": 80, "Time": 90,"ExtremeTime": 62},
"w9d06": {"Stage":"1-7", "RingMission": 50, "Time": 85,"ExtremeTime": 55},
"w9d07": {"Stage":"4-9", "RingMission": 120, "Time": 75,"ExtremeTime": 59}
};
	function sf_multi_remap(points, stage_name) {
		let remappedPoints = [];
		points.forEach((point) => {

			if(!isNaN(point[0]) && !isNaN(point[1])) {
			remappedPoint = sf_remap([point[0], point[1]], stage_name);
			remappedPoints.push(remappedPoint);
			}
		});
			return remappedPoints;
	}

 let drawnItems = new L.FeatureGroup();


function loadMap(stage_name) {

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('map', Object.keys(MapNames).find(key => MapNames[key] === stage_name));
    var newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
    history.pushState(null, '', newRelativePathQuery);

  var container = mapsPlaceholder.pop();
  if (container != null) {
    container.off();
    container.remove();
  }
  map = L.map('map', {
    crs: L.CRS.Simple,
    preferCanvas: true,
    attributionControl: false,
    zoomSnap: 0.25,
    minZoom: -3,
    maxZoom: 2,
  }).setView([1975, 2203], -1.5);

     map.addLayer(drawnItems);
     var drawControl = new L.Control.Draw({
		 position: 'topleft',
		 draw: {
			 polyline: {
				 showLength: false,
				 zIndexOffset: 5555,
				 metric: true,
				 shapeOptions: {
					 color: 'rgb(10, 110, 220)',
					 weight: 5,
					 opacity: 1,
				 }

				
			 },
			 polygon: false,
			 rectangle: false,
			 circle: {
				 showLength: false,
				 zIndexOffset: -50,
				 metric: true,
				 shapeOptions: {
					 color: 'rgb(210, 110, 20)',
					 fill: false,
					 weight: 3,
					 opacity: 1,
				 }
			 },

			 circlemarker: false,
		 },
         edit: {
             featureGroup: drawnItems
         }
     });
	map.on(L.Draw.Event.CREATED, function (event) {


  var layer = event.layer;
  drawnItems.addLayer(layer);
});
	map.addLayer(drawnItems);

  const bounds = [
    [0, 0],
    [4096, 4096]
  ];

$(document).ready(function() {
	let poly_color = $("input[type=color]").val();
	let loaded_paths = new L.FeatureGroup();
	loaded_paths.addTo(map);
	loaded_paths.on('popupopen', function(event) {
		const popup = event.popup;
	//	popup.setContent('Coordinates: ' + sf_remap([popup.getLatLng().lng, popup.getLatLng().lat], stage_name, true));
		console.log(popup);
	});
	$('div#coordinates>div').on("click", function() {
		if($("#coordinates form").css('display') == 'none') {
			$('div#coordinates form').css('display', 'flex');
			$('div#coordinates').css('width', 150);
			$(this).text( "Hide Inputs");
		}
		else {
			$('div#coordinates form').css('display', 'none');
			$('div#coordinates').css('width', 80);
			$(this).text( "Load CSV");

		}
	});
	$('input[type=color]').on("input", function() {
		poly_color = $(this).val();
		drawnItems.eachLayer((layer)=> {
				layer.setStyle({ color: poly_color });
		});
		loaded_paths.eachLayer((layer)=> {
				layer.setStyle({ color: poly_color });
		});
		/*
		map.eachLayer(function(layer) {
			if ( layer instanceof L.Polyline ) {
				layer.setStyle({ color: poly_color });
			}
		});
		*/
	});
	let line_tooltips = [];
	$("#coordinates form").on("submit", function(event) {
		event.preventDefault();

		const coordinates_array = $("#coordinates textarea").val()?.split('\n');

		let latlngs = [];
		coordinates_array.forEach((row) => {
			const values = row.split(',');
			if(Array.isArray(values) && values.length >= 3) {
			// const remapped_coordinates = sf_remap([values[0], values[2]], stage_name);
			latlngs.push([values[0], -values[2]]);
			line_tooltips.push(row);
			}
		});

		latlngs = sf_multi_remap(latlngs, stage_name);

		L.polyline(latlngs, {color: poly_color}).addTo(loaded_paths);
	});
	$("#coordinates button").on("click", function() {
		loaded_paths.eachLayer((layer)=> {
			layer.remove();
		});
	});

});

let colorPicker = L.Control.extend({

    _container: null,
    options: {
      position: 'topleft'
    },

    onAdd: function() {
      var menu = L.DomUtil.create('div', 'colors');
      menu.innerHTML = '<input type="color" value="#8adeff" >';
		return menu;
	},});


this.colorPicker = new colorPicker();
this.colorPicker.addTo(map);

  let MapSwitcher = L.Control.extend({
    _container: null,
    options: {
      position: 'bottomleft'
    },

    onAdd: function() {
      var menu = L.DomUtil.create('div', 'menu');
      menu.innerHTML = '<ul>' +
				'<li class=' + ( stage_name == 'w1r03' ? '"selected"' : '""' ) + ' onclick="loadMap(\'w1r03\')">Kronos</li>' +
        '<li class=' + ( stage_name == 'w2r01' ? '"selected"' : '""' ) + ' onclick="loadMap(\'w2r01\')">Ares</li>' +
        '<li class=' + ( stage_name == 'w3r01' ? '"selected"' : '""' ) + ' onclick="loadMap(\'w3r01\')">Chaos</li>' +
        '<li class=' + ( stage_name == 'w1r05' ? '"selected"' : '""' ) + ' onclick="loadMap(\'w1r05\')">Rhea</li>' +
        '<li class=' + ( stage_name == 'w1r04' ? '"selected"' : '""' ) + ' onclick="loadMap(\'w1r04\')">Ouranos</li></ul>';
      return menu;
    },

  });

  let position = L.Control.extend({
    _container: null,
    options: {
      position: 'bottomleft'
    },

    onAdd: function() {
      var latlng = L.DomUtil.create('div', 'mouseposition');
      this._latlng = latlng;
      this._latlng.innerHTML = "X,Z: 0, 0";
      return latlng;
    },

    updateHTML: function(lat, lng) {
      const [x, z] = sf_remap([lng, lat], stage_name, true);
      var latlng = x + "," + z;
      this._latlng.innerHTML = "X,Z: " + latlng;
    }
  });
  this.position = new position();
  map.addControl(this.position);

  this.mapswitcher = new MapSwitcher();
  this.mapswitcher.addTo(map);

  map.addEventListener('mousemove', (event) => {
    let lat = Math.round(event.latlng.lat);
    let lng = Math.round(event.latlng.lng);
    this.position.updateHTML(lat, lng);
  });

L.Control.textbox = L.Control.extend({
		onAdd: function() {
			
		var text = L.DomUtil.create('div');
		text.id = "title";
		text.innerHTML = "<h1>SoniMap v0.5.1</h1>";
		text.innerHTML += "<p style='text-align: center;'>Yet another Sonic Frontiers map</p>";
		text.innerHTML += "<h2>Instructions</h2>";
		text.innerHTML += "<p>Choose a map from the lower-left Map menu. Then, enable objects from the Object Selector menu on the right.</p>";
		text.innerHTML += "<h2>Limitations</h2>";
		text.innerHTML += "<p>All map data has been extracted from .gedits with <a href='https://github.com/Radfordhound/HedgeLib'>HedgeLib</a>. " +
				"Object coordinates should be accurate, but map placement may vary slightly due to not understanding map bounds and scaling.</p>";
		text.innerHTML += "<h2>Comments?</h2>";
		text.innerHTML += "<p>Message tashi on the Sonic Frontiers Speedrunning discord with any comments or questions.</p>";
		text.innerHTML += "<p>Thanks to everyone at the Sonic Frontiers Speedrunning discord.</p>";
		text.innerHTML += "<p><a href='https://github.com/tashiww/sonimap' target='_blank'>Source code</a></p>";
		return text;
		},

	});
	L.control.textbox = function(opts) { return new L.Control.textbox(opts);};
	L.control.textbox({ position: 'topleft'}).addTo(map);

     map.addControl(drawControl);

  let CoordinateInput = L.Control.extend({
    _container: null,
    options: {
      position: 'topleft'
    },

		onAdd: function() {
			
		var text = L.DomUtil.create('div');
		text.id = "coordinates";
			let html = "<div>Load CSV</div>";
				html += "<form action='' method='GET'>";
		html += "<textarea></textarea>";
		html += "<div><button type='submit'>Load path</button>";
		html += "<button type='button'>Clear path</button></div> ";
		html += "</form>";
		text.innerHTML = html;
		return text;
		},

	});
  this.coordinates = new CoordinateInput();
  this.coordinates.addTo(map);


  var img = L.imageOverlay('./base_img/' + stage_name + '.webp', bounds);
  img.addTo(map);

  get_marker_data(map, stage_name);


        // Truncate value based on number of decimals
        var _round = function(num, len) {
            return Math.round(num*(Math.pow(10, len)))/(Math.pow(10, len));
        };
        // Helper method to format LatLng object (x.xxxxxx, y.yyyyyy)
        var strLatLng = function(latlng) {
            return "("+_round(latlng.lat, 6)+", "+_round(latlng.lng, 6)+")";
        };

function getLinearDistance(pointA, pointB) {
	const distance = Math.sqrt( ((pointB[0] - pointA[0]) ** 2) + ((pointB[1] - pointA[1]) ** 2));
	return Math.round(distance, 0);
}

        var getPopupContent = function(layer) {
            // Marker - add lat/long
            if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
				const currentLatlng = layer.getLatLng();
				return 'X,Z: ' + sf_remap([currentLatlng.lng, currentLatlng.lat], stage_name, true).toString();

            // Circle - lat/long, radius
            } else if (layer instanceof L.Circle) {
                var center = layer.getLatLng(),
                    radius = layer.getRadius();
                return "Center: "+strLatLng(center)+"<br />" +"Radius: "+_round(radius, 2)+" m";
            // Rectangle/Polygon - area
            } else if (layer instanceof L.Polygon) {
                let latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
                    area = L.GeometryUtil.geodesicArea(latlngs);
                return "Area: "+L.GeometryUtil.readableArea(area, true);
            // Polyline - distance
            } else if (layer instanceof L.Polyline) {
                let latlngs = layer._defaultShape ? layer._defaultShape() : layer.getLatLngs(),
                    distance = 0;
                if (latlngs.length < 2) {
                    return "Distance: N/A";
                } else {
					let distances = [];
                    for (var i = 0; i < latlngs.length-1; i++) {
						const currentLatlng = sf_remap([latlngs[i].lng, latlngs[i].lat], stage_name, true);
						const nextLatlng = sf_remap([latlngs[i+1].lng, latlngs[i+1].lat], stage_name, true);
						const currentDistance = getLinearDistance(currentLatlng, nextLatlng);
						distances.push(currentDistance);
						distance += currentDistance;
                    }
					if (distances.length == 1) {
                    return "<ul class='distance'><li>Distance: "+ distance +" units</li></ul>";
					}
					else {
                    return "<ul class='distance'><li>Total Distance: "+ distance +" units</li>"+ 
						distances.map(function(item, index) { return "<li>Segment " + (parseInt(index)+1) + ": " + item + " units</li>"; }).join('') + '</ul>';
					}
                }

            }
            return null;
        };

        // Object created - bind popup to layer, add to feature group
        map.on(L.Draw.Event.CREATED, function(event) {
            var layer = event.layer;
            var content = getPopupContent(layer);
            if (content !== null) {
                layer.bindPopup(content);
            }
            drawnItems.addLayer(layer);
        });

        // Object(s) edited - update popups
        map.on(L.Draw.Event.EDITED, function(event) {
            var layers = event.layers,
                content = null;
            layers.eachLayer(function(layer) {
                content = getPopupContent(layer);
                if (content !== null) {
                    layer.setPopupContent(content);
                }
            });
        });


}



async function get_marker_data(map, stage_name) {

  function checkImage(src, bad) {
    var icon = new Image();
    icon.src = src;
    icon.onerror = bad;
  }

	function getMarker(item, file) {
		let medalIcon, strayIcon;
	switch(stage_name) {
		case 'w1r03':
			medalIcon = './icons/character_04.png';
			strayIcon = './icons/cockpit_08.png';
			break;
		case 'w2r01':
			medalIcon = './icons/character_05.png';
			strayIcon = './icons/cockpit_07.png';
			break;
		case 'w3r01':
			medalIcon = './icons/character_06.png';
			strayIcon = './icons/cockpit_06.png';
			break;
		case 'w1r04':
			medalIcon = './icons/character_04.png';
			strayIcon = './icons/cockpit_08.png';
			break;
	}


  const iconList = {
    Portal: {
      iconUrl: './icons/character2_04.png',
    },
    Kodama: {
      iconUrl: './icons/map4_00.png',
    },
    Ring: {
      iconUrl: './icons/character_12.png',
    },
    FishingPortal: {
      iconUrl: './icons/map4_20.png',
    },
    KodamaElder: {
      iconUrl: './icons/map4_01.png',
    },
    KodamaHermit: {
      iconUrl: './icons/map4_02.png',
    },
    StorageKey: {
      iconUrl: './icons/character_10.png',
    },
    PortalBit: {
      iconUrl: './icons/character_01.png',
    },
    Amy: {
      iconUrl: './icons/character2_00.png',
    },
    Amy_main: {
      iconUrl: './icons/character2_00_colored.png',
    },
    Knuckles: {
      iconUrl: './icons/character2_01.png',
    },
    Knuckles_main: {
      iconUrl: './icons/character2_01_colored.png',
    },
	  ChaosEmeraldStorage: { iconUrl: './icons/character2_05.png', },
    Tails: { iconUrl: './icons/character2_02.png', },
    Tails_main: { iconUrl: './icons/character2_02_colored.png', },
    SequenceItem: { iconUrl: strayIcon, },
    Gismo_atk: { iconUrl: './icons/character_08.png', },
    Gismo_def: { iconUrl: './icons/character_07.png', },
    Gismo_exp: { iconUrl: './icons/character_09.png', },
    Gismo_rings: { iconUrl: './icons/character_12.png', },
    DroppedItem: { iconUrl: medalIcon, },
    StartPosition: { iconUrl: './icons/cockpit_12.png', },
    GiantTower: {
      iconUrl: './icons/character2_15.png',
    },
    FishCoin: {
      iconUrl: './icons/character_02.png',
    },
    Sage: { iconUrl: './icons/character2_03.png', },
    Sage_main: { iconUrl: './icons/character2_03_colored.png', },
  };


		if (!item.position) {
			return;
		}
	const coords = sf_remap([item?.position[0], -item?.position[2]], stage_name);
		let valid_image = true;
		  var iconUrl = item.parameters?.purposeOfUse == 'Normal' ? iconList[item.type + '_main']?.iconUrl : iconList[item.type]?.iconUrl;
		if (!iconUrl) {
			// circle marker path
			var radius = 8;
			let color = colorList[item.type];
			if (item.type == 'QuestBox') {
				const qty = item.parameters.heightBoxNum * item.parameters.SideBoxNum * 
					item.parameters.depthBoxNum * item.parameters.dropItemParam.dropNum;
				radius = qty / 4;
				switch(item.parameters.size) {
					case "SMALL":
						color = '#FFFF00';
						break;
					case "LARGE":
						color = '#AA00AA';
						break;
					case "MIDDLE":
						color = '#0000FF';
						break;
				}
			}
			if (item.type == 'AirFloor') {
				return;
			}

			return (
              L.circleMarker(coords, {
				  radius: radius,
				  color: '#000000',
				  weight: 1,
				  opacity: 0.8,
				  fillOpacity: 0.7,
				  fillColor: color,
                })
              );
		}
		else {
              checkImage(iconUrl, function() {
				  valid_image = false;
              });


		if ( !valid_image ) {
			console.log('no img');
		}
			var size = 30;
			if (item.type == 'PortalBit' && file.includes('boss')) {
				size = 20;
			}
			
		return (
              L.canvasMarker(coords, {
                img: {
                  url: iconUrl,
                  size: [size, size],
                }
              })
		);
		}
 	
	}
	function rotatePolygon(position, dimensions, quaternion) {
		let axis = [0,0,0];
		const magnitude = 2 * Math.acos(quaternion[3]);

		if (1 - (quaternion[3] ** 2) < 0.000001) {
			axis[0] = quaternion[0];
			axis[1] = quaternion[1];
			axis[2] = quaternion[2];
		}
		else {
			const s = Math.sqrt(1 - (quaternion[3] ** 2));
			axis[0] = quaternion[0] / s;
			axis[1] = quaternion[1] / s;
			axis[2] = quaternion[2] / s;

		}

		const angle = axis[1] * magnitude;

		const x = position[0];
		const z = -position[2];
		const halfWidth = dimensions[0] * 0.5;
		const halfHeight = dimensions[2] * 0.5;

		const leftOrigin = [x - (halfWidth * Math.cos(angle)), z - (halfWidth * Math.sin(angle))];
		const rightOrigin = [x + (halfWidth * Math.cos(angle)), z + (halfWidth * Math.sin(angle))];

		const heightX = halfHeight *  Math.sin(angle);
		const heightZ = halfHeight *  Math.cos(angle);

		const bottomLeftVertex = [leftOrigin[0] + heightX, leftOrigin[1] -heightZ] ;
		const topLeftVertex = [leftOrigin[0] - heightX, leftOrigin[1] +heightZ] ;
		const bottomRightVertex = [rightOrigin[0] +heightX, rightOrigin[1] -heightZ] ;
		const topRightVertex = [rightOrigin[0] -heightX,  rightOrigin[1] +heightZ] ;

		if(isNaN(bottomLeftVertex)) {
		}
		return [bottomLeftVertex, topLeftVertex, topRightVertex, bottomRightVertex];
	}
	function getRectangle(item, color) {
		if (!item.parameters.extents && (!item.parameters.size ||  !Array.isArray(item.parameters.size) || item.parameters.size.length != 3)){
			if (item.type != 'AirFloor') {
			return;
			}
		}

		const quaternion = item.rotation ? item.rotation : [0,0,0,0];
		let size = item.parameters.size ?? item.parameters.extents;
		if (item.type == 'AirFloor') {
			switch(item.parameters.size) {
				case "LARGE":
					size = [20,0,20];
					break;
				case "MIDDLE":
					size = [10,0,10];
					break;
				case "SMALL":
					size = [5,0,5];
					break;
			}

		}
		const originalCoords = rotatePolygon(item.position, size, quaternion);
		if(isNaN(originalCoords[0][0])) {
			console.log(item);
		}
		const bounds = sf_multi_remap(originalCoords, stage_name);
		const formattedCoords = originalCoords.map((value) => {
			return [Math.round(value[0]), Math.round(-value[1])];
		});
		const tooltip = "Corners: <ul class='rectangle_tooltip'><li> " + formattedCoords.join("</li><li>") + "</li></ul>";

//		const rect = new L.polygon(bounds, {color: color, weight: 1}).bindPopup(tooltip);
 const rect = item.parameters.shape == 'Capsule' ? new L.circle(sf_remap([item.position[0], -item.position[2]], stage_name), {radius: sf_remap(item.parameters.radius, stage_name)}) : new L.polygon(bounds, {color: color, weight: 1}).bindPopup(tooltip);
		if (item.parameters.shape == 'Capsule') {
		}
		return rect;
}

function getPopup(item, filename) {
		var model = item.parameters.name ? '<p><span class="emphasize">model: </span>' + item.parameters.name + '</p>' : '';
		var contents = item.parameters?.dropItemParam?.dropItem ? '<p><span class="emphasize">contents: </span>' + item.parameters.dropItemParam.dropItem + '</p>' : '';
		var dimensions = Array.isArray(item.parameters?.size) ? '<p><span class="emphasize">dimensions: </span>' + item.parameters.size.join(', ') + '</p>' : '';
	var cyberInfo = item.parameters?.stageCode ? '<pre>'+ JSON.stringify(cyberStages[item.parameters.stageCode]) + '</pre>' : '';
		var quantity = '';
		if (item?.parameters.dropItemParam?.dropItem == 'RING') {
			quantity = '<p><span class="emphasize">quantity: </span>' + 
							(parseInt(item.parameters.dropItemParam.dropNum) + item.parameters.dropItemParam.dropSuperRingNum*10) + ' rings (' + item.parameters.dropItemParam.dropSuperRingNum + ' big, ' + item.parameters.dropItemParam.dropNum + ' small)</p>';
		}
	else if (item.type == 'QuestBox') {
			quantity = '<p><span class="emphasize">quantity: </span>' + item.parameters.heightBoxNum * item.parameters.SideBoxNum * item.parameters.depthBoxNum * item.parameters.dropItemParam.dropNum;
	}
	else if (item?.parameters.dropItemParam?.dropItem == 'SKILL_PIECE') {
			quantity = item.parameters?.dropItemParam?.dropNum ? '<p><span class="emphasize">quantity: </span>' + 
							item.parameters.dropItemParam.dropNum * 200 + '</p>' : '';
		}

return (
                '<h1>' + item.name + '</h1>' +
                '<p><span class="emphasize">position:</span> ' +
                Math.round(item.position[0]) + ", " + Math.round(item.position[1]) + ", " +
                Math.round(item.position[2]) + '</p>' +
                '<p><span class="emphasize">file:</span> ' + filename + "</p>" +
				cyberInfo + 
				model + 
				contents +
				quantity +
				dimensions + '<pre>'+ JSON.stringify(item, null, 2) + '</pre>'

);
}
  const layerList = {};
  const colorList = {};
  var fetches = [];
	fetch('./hson/file_list.txt').then((response) => response.text())
    .then((json_files) => {
      json_files.split("\n").filter(Boolean).filter(x => x.includes(stage_name)).forEach(file => {
        fetches.push(
          fetch('./hson/' + file)
          .then((response) => response.json())
          .then((json) => {
			  if(!json?.objects) { 
				  return ''; }
            json.objects.forEach((item) => {
				if(!item.position) {
					return;
				}
			if (item.parameters?.dropItemParam?.dropItem) {
				switch(item.parameters.dropItemParam.dropItem) {
					case "SKILL_PIECE":
						item.type = "Gismo_exp";
						break;
					case "RING":
						item.type = "Gismo_rings";
						break;
					case "GUARD_SEED":
						item.type = "Gismo_def";
						break;
					case "POWER_SEED":
						item.type = "Gismo_atk";
						break;

				}

			}
			  if (!layerList.hasOwnProperty(item.type)) {
				layerList[item.type] = L.layerGroup();
				const randomColor = Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
				  colorList[item.type] = '#' + randomColor;
			  }
				const filename = file.replace('.hson','');
				const marker = getMarker(item, filename, colorList[item.type]);
				if (item.type == 'Tails') {
					console.log(marker);
				}
				const popup = getPopup(item, filename);

				const box = getRectangle(item, colorList[item.type]);
				if (box && !marker?.options?.img?.url) {
					if(box.radius) {
						console.log(box);
					}
					box.bindPopup(popup, {maxWidth: 550}).addTo(layerList[item.type]);
				}
				else if (marker) {
				 marker.bindPopup(popup, {maxWidth:550}).addTo(layerList[item.type]);
				}
            });
          }));
      });
    }).then(() => {
      Promise.all(fetches).then(function() {
        addControl(map, layerList);

		  $('section.leaflet-control-layers-list').css('height', 'calc(100vh - 100px)');

		const searchParams = new URLSearchParams(window.location.search);
		selectedMarkers = searchParams.getAll('markers') ?? 'StartPosition';
		  selectedMarkers.forEach((marker) => {
			  if(layerList.hasOwnProperty(marker)) {
				  layerList[marker].addTo(map);
			  }
		  });
				$("label").filter(function() { return (selectedMarkers.includes($(this).text().trim()));}).each(function() {
					const layerName = $(this).text().trim();
					const markerType = getMarkerType(layerList[layerName]._layers);
					const bgColor = (markerType === 'circle') ? colorList[layerName] : '#ffff88';
					$(this).css('background-color', bgColor + '88');
				});
		  addLayerInfoControl(map, layerList, selectedMarkers, colorList);
		  $('div.leaflet-control-layers.leaflet-control').prepend('<input autocomplete="off" id="objectFilter" type="search"></input>');
		  $('div.leaflet-control-layers.leaflet-control').prepend('<h2>Object Filters</h2>');
		  $("#objectFilter").on('input', function(e) {
			  let searchValue = e.target.value.toLowerCase();
			 $('.leaflet-control-layers-overlays>label').each(function() {
				 if ( $(this).text().toLowerCase().indexOf(searchValue)>= 0) {
					 $(this).show();
				 }
				 else {
					 $(this).hide();
				 }
			 });
		  });


	map.on({
	overlayadd: function(e) {
		const layerName = e.name;
		const markerType = getMarkerType(e.layer._layers);
		const bgColor = (markerType === 'circle') ? colorList[layerName] : '#ffff88';
		$("label").filter(function() { return ($(this).text() === ' '+layerName);}).css('background-color', bgColor + '88');

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.append('markers', encodeURIComponent(layerName));
    var newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
    history.pushState(null, '', newRelativePathQuery);
		let selectedMarkers = searchParams.getAll('markers') ?? 'StartPosition';

		  addLayerInfoControl(map, layerList, selectedMarkers, colorList);
	},
	overlayremove: function(e) {
		const layerName = e.name;
		$("label").filter(function() { return ($(this).text() === ' '+layerName);}).css('background-color', 'white');
		const searchParams = new URLSearchParams(window.location.search);
		const markerArray = searchParams.getAll('markers');
		searchParams.delete('markers');
		markerArray.forEach(function(marker) {
			if (marker != layerName) {
				searchParams.append('markers', marker);
			}
		let selectedMarkers = searchParams.getAll('markers');
		  addLayerInfoControl(map, layerList, selectedMarkers, colorList);

		});

		if (markerArray.length == 1) {

	$('#layerinfo').remove();
		}
    var newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
    history.pushState(null, '', newRelativePathQuery);
	},
});
}).catch((error) => {
		  console.warn(error);
		console.log('oh no 1');
		  return '';
	  });
    }).catch(() => {
		console.log('oh no 2');
		return '';
	});

}

function getMarkerType(layers) {
	const id = Object.keys(layers)[0];
	if (layers[id].options.hasOwnProperty('color')) {
		return 'circle';
	}
	else {
		return 'image';
	}
}


async function addControl(map, markers) {
  L.control.layers(null, markers, {
    collapsed: false,
    sortLayers: true,
  }).addTo(map);
}


function setMap(name) {
  loadImage(name);
}

function resetMarkers(map, layers, selectedLayerNames) {
		$('div.leaflet-control-layers-overlays input:checkbox').removeAttr('checked');
		$('div.leaflet-control-layers-overlays input').prop('checked', false);
		$('div.leaflet-control-layers-overlays label').css('background-color', 'white');
	$('#layerinfo').remove();
		const searchParams = new URLSearchParams(window.location.search);
		searchParams.delete('markers');
    var newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
    history.pushState(null, '', newRelativePathQuery);

	selectedLayerNames.forEach(function(layerName) {
		map.removeLayer(layers[layerName]);

	});
	$("#objectFilter").trigger('input');

}
function addLayerInfoControl(map, layers, selectedLayerNames, colorList=null) {

	if (selectedLayerNames.length == 0) {
		return;
	}
	$('#layerinfo').remove();

	L.Control.textbox = L.Control.extend({
		onAdd: function() {
			
		var text = L.DomUtil.create('div');
		text.id = "layerinfo";
		let html = "<ul>";
			html += "<li id='clear_markers'>Clear All</li>";
		selectedLayerNames.forEach( (layerName) => {
			if(layers.hasOwnProperty(layerName)) {
				let color = 'none';
				if (colorList && getMarkerType(layers[layerName]._layers) == 'circle') {
					color = colorList[layerName] + '88';
				}

			html += "<li style='background-color:" + color + "' >" + layerName + 
				" (" + Object.keys(layers[layerName]._layers).length + ")</li>";
			}
		});
		html += "</ul>";
		text.innerHTML = html;
		return text;
		},

	});
	L.control.textbox = function(opts) { return new L.Control.textbox(opts);};
	L.control.textbox({ position: 'topright'}).addTo(map);

	$('#clear_markers').on('click', function() {
		resetMarkers(map, layers, selectedLayerNames);
	});

}

const searchParams = new URLSearchParams(window.location.search);
const stage_name = MapNames[searchParams.get('map')] ?? 'w1r03';

loadMap(stage_name);


