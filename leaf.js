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

	 var drawnItems = new L.FeatureGroup();
     map.addLayer(drawnItems);
     var drawControl = new L.Control.Draw({
		 position: 'topleft',
		 draw: {
			 polyline: {
				 showLength: false,
				 zIndexOffset: 5555,
				 metric: true,
				 shapeOptions: {
					 color: 'rgb(130, 170, 220)',
					 weight: 5,
					 opacity: 1,
				 }

				
			 },
			 polygon: false,
			 rectangle: false,
			 circle: false,
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

  let Position = L.Control.extend({
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
  this.position = new Position();
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
		text.innerHTML = "<h1>SoniMap v0.3.8</h1>";
		text.innerHTML += "<p style='text-align: center;'>Yet another Sonic Frontiers map</p>";
		text.innerHTML += "<h2>Instructions</h2>";
		text.innerHTML += "<p>Choose a map from the lower-left Map menu. Then, enable objects from the Object Selector menu on the right.</p>";
		text.innerHTML += "<h2>Limitations</h2>";
		text.innerHTML += "<p>All map data is extracted from .gedit files, which I don't fully understand, so some data may be presented incorrectly. " +
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
    BlockObject: {
      iconUrl: './icons/character_15.png',
    },

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
    Knuckles: {
      iconUrl: './icons/character2_01.png',
    },
    Tails: { iconUrl: './icons/character2_02.png', },
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
    Sage: {
      iconUrl: './icons/character2_03.png',
    },
  };


	const coords = sf_remap([item.Position[0], -item.Position[2]], stage_name);
		let valid_image = true;
	              var iconUrl = iconList[item.TypeName]?.iconUrl;
		if (!iconUrl) {
			// circle marker path
			var radius = 8;
			if (item.TypeName == 'Gismo_exp') {
				const qty = parseInt(item.Quantity);
				if (qty >= 15)  {
					radius = 10;
				}
				else if (qty >=8) {
					radius = 8;
				}
				else {
					radius = 6;
				}
			}

			return (
              L.circleMarker(coords, {
				  radius: radius,
				  color: '#000000',
				  weight: 1,
				  opacity: 0.8,
				  fillOpacity: 0.7,
				  fillColor: colorList[item.TypeName],
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
			if (item.TypeName == 'PortalBit' && file.includes('boss')) {
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
	function sf_multi_remap(points, stage_name) {
		let remappedPoints = [];
		points.forEach((point) => {
			remappedPoint = sf_remap([point[0], point[1]], stage_name);
			remappedPoints.push(remappedPoint);
		});
			return remappedPoints;
	}
	function rotatePolygon(position, dimensions, angle) {
		const x = position[0];
		const z = -position[2];
		const halfWidth = dimensions[0] * 0.5;
		const halfHeight = dimensions[2] * 0.5;

		const leftOrigin = [x - (halfWidth * Math.cos(angle)), z - (halfWidth * Math.sin(angle))];
		const rightOrigin = [x + (halfWidth * Math.cos(angle)), z + (halfWidth * Math.sin(angle))];

		const heightX = halfHeight *  Math.sin(angle);
		const heightZ = halfHeight *  Math.cos(angle);

		const bottomLeftVertex = [leftOrigin[0] - heightX, leftOrigin[1] -heightZ] ;
		const topLeftVertex = [leftOrigin[0] - heightX, leftOrigin[1] +heightZ] ;
		const bottomRightVertex = [rightOrigin[0] +heightX, rightOrigin[1] -heightZ] ;
		const topRightVertex = [rightOrigin[0] +heightX,  rightOrigin[1] +heightZ] ;

		return [bottomLeftVertex, topLeftVertex, topRightVertex, bottomRightVertex];
	}
	function getRectangle(item, color) {
		if (!item.Dimensions) {
			return;
		}
		const originalCoords = rotatePolygon(item.Position, item.Dimensions, item.Rotation[1]);
		const bounds = sf_multi_remap(originalCoords, stage_name);
		const formattedCoords = originalCoords.map((value) => {
			return [Math.round(value[0]), Math.round(-value[1])];
		});
		const tooltip = "Corners: <ul class='rectangle_tooltip'><li> " + formattedCoords.join("</li><li>") + "</li></ul>";
		const rect = new L.polygon(bounds, {color: color, weight: 1}).bindPopup(tooltip);
		return rect;
}

function getPopup(item, filename) {
		var model = item.Model ? '<p><span class="emphasize">model: </span>' + item.Model + '</p>' : '';
		var contents = item.Contents ? '<p><span class="emphasize">contents: </span>' + item.Contents + '</p>' : '';
		var quantity = '';
		if (item.TypeName.includes('rings')) {
			quantity = '<p><span class="emphasize">quantity: </span>' + 
							(parseInt(item.Quantity) + item.Quantity2*10) + ' rings (' + item.Quantity2 + ' big, ' + item.Quantity + ' small)</p>';
		}
	else if (item.TypeName.includes('Gismo_')) {
			quantity = item.Quantity ? '<p><span class="emphasize">quantity: </span>' + 
							(	item.Contents == 'exp' ? item.Quantity*200 : item.Quantity) + '</p>' : '';
		}

	const extraParams = item.Model ? '<p>' + JSON.stringify(item.ParameterValues, null, 2) + '</p>' : '';
return (
                '<h1>' + item.ObjectName + '</h1>' +
                '<p><span class="emphasize">position:</span> ' +
                Math.round(item.Position[0]) + ", " + Math.round(item.Position[1]) + ", " +
                Math.round(item.Position[2]) + '</p>' +
                '<p><span class="emphasize">file:</span> ' + filename.split('/')[1] + "</p>" +
				model + 
				contents +
				quantity +
                '<p><span class="emphasize">params:</span><br>' + item.ParameterData + '</p>' + 
				extraParams 
);
}
  const layerList = {};
  const colorList = {};
  var fetches = [];
	var exp_boxes = [];
  fetch('./json_data/file_list.txt').then((response) => response.text())
    .then((json_files) => {
      json_files.split("\n").filter(Boolean).filter(x => x.includes(stage_name)).forEach(file => {
        fetches.push(
          fetch('./json_data/' + file)
          .then((response) => response.json())
          .then((json) => {
            json.forEach((item) => {
				if (item.Contents == 'exp') {
					exp_boxes.push({qty: item.Quantity, pos: item.Position, name: item.ObjectName});
				}
			  if (!layerList.hasOwnProperty(item.TypeName)) {
				layerList[item.TypeName] = L.layerGroup();
				const randomColor = Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
				  colorList[item.TypeName] = '#' + randomColor;
			  }
				const marker = getMarker(item, file, colorList[item.TypeName]);
				const popup = getPopup(item, file.replace('.json', ''));

				const box = getRectangle(item, colorList[item.TypeName]);
				if (box) {
					box.addTo(layerList[item.TypeName]);
				}

             marker.bindPopup(popup).addTo(layerList[item.TypeName]);
            });
          }));
      });
    }).then(() => {
      Promise.all(fetches).then(function() {
        addControl(map, layerList);

		const maxHeight = $(window).height();
		  $('section.leaflet-control-layers-list').css('height', maxHeight-100);

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
      });
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


