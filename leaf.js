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
      origin: [2050, 2040],
      scale_factor: 1.022
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

  if ('URLSearchParams' in window) {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('map', Object.keys(MapNames).find(key => MapNames[key] === stage_name));
    var newRelativePathQuery = window.location.pathname + '?' + searchParams.toString();
    history.pushState(null, '', newRelativePathQuery);
  }
  var container = mapsPlaceholder.pop();
  if (container != null) {
    container.off();
    container.remove();
  }
  var map = L.map('map', {
    crs: L.CRS.Simple,
    preferCanvas: true,
    attributionControl: false,
    zoomSnap: 0.5,
    minZoom: -3,
    maxZoom: 2
  }).setView([1975, 2203], -1.5);

  const bounds = [
    [0, 0],
    [4096, 4096]
  ];

  var img = L.imageOverlay('./base_img/' + stage_name + '.png', bounds);
  img.addTo(map);

  let MapSwitcher = L.Control.extend({
    _container: null,
    options: {
      position: 'bottomleft'
    },

    onAdd: function() {
			console.log(stage_name);
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
		text.innerHTML = "<h1>SoniMap v0.3</h1>";
		text.innerHTML += "<p style='text-align: center;'>Yet another Sonic Frontiers map</p>";
		text.innerHTML += "<h2>Instructions</h2>";
		text.innerHTML += "<p>Choose a map from the lower-left Map menu. Then, enable objects from the Object Selector menu on the right.</p>";
		text.innerHTML += "<h2>Limitations</h2>";
		text.innerHTML += "<p>All map data is extracted from .gedit files, which I don't fully understand, so some data may be presented incorrectly. " +
				"Certain objects, like experience crates and attack/defense crates, aren't properly differentiated because of this. " +
				"Object coordinates should be accurate, but map placement may vary by ~1% due to not understanding map bounds and scaling.</p>";
		text.innerHTML += "<h2>Comments?</h2>";
		text.innerHTML += "<p>Message tashi on the Sonic Frontiers Speedrunning discord with any comments or questions.</p>";
		text.innerHTML += "<p>Thanks to everyone at the Sonic Frontiers Speedrunning discord.</p>";
		text.innerHTML += "<p><a href='https://github.com/tashiww/sonimap' target='_blank'>Source code</a></p>";
		return text;
		},

	});
	L.control.textbox = function(opts) { return new L.Control.textbox(opts);};
	L.control.textbox({ position: 'topleft'}).addTo(map);


  get_marker_data(map, stage_name);
}



async function get_marker_data(map, stage_name) {
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
    Tails: {
      iconUrl: './icons/character2_02.png',
    },
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

  function checkImage(src, bad) {
    var icon = new Image();
    icon.src = src;
    icon.onerror = bad;
  }

  const layerList = {};
  var fetches = [];
  fetch('./json_data/' + stage_name + '/file_list.txt').then((response) => response.text())
    .then((json_files) => {
      json_files.split("\n").filter(Boolean).forEach(file => {
        fetches.push(
          fetch('./json_data/' + stage_name + '/' + file)
          .then((response) => response.json())
          .then((json) => {
            json.forEach((item) => {
              var iconUrl = iconList[item.TypeName]?.iconUrl ?? './icons/default.png';
              checkImage(iconUrl, function() {
                iconUrl = './icons/default.png';
              });

              if (!layerList.hasOwnProperty(item.TypeName)) {
                layerList[item.TypeName] = L.layerGroup();
              }

              L.canvasMarker(sf_remap([item.Position[0], -item.Position[2]], stage_name), {
                img: {
                  url: iconUrl,
                  size: [30, 30],
                }
              }).bindPopup(
                '<h1>' + item.ObjectName + '</h1>' +
                '<p><span class="emphasize">position:</span> ' +
                Math.round(item.Position[0]) + ", " + Math.round(item.Position[1]) + ", " +
                Math.round(item.Position[2]) + '</p>' +
                '<p><span class="emphasize">file:</span> ' + file.replace('.json', '') + "</p>" +
                '<p><span class="emphasize">params:</span><br>' + item.ParameterData +
                '</p>'
              ).addTo(layerList[item.TypeName]);
            });
          }));
      });
    }).then(() => {
      Promise.all(fetches).then(function() {
        addControl(map, layerList);
      });
    });

}


function addControl(map, markers) {
  L.control.layers(null, markers, {
    collapsed: false,
    sortLayers: true,
  }).addTo(map);
}


function setMap(name) {
  loadImage(name);
  console.log(name);
}


const searchParams = new URLSearchParams(window.location.search);
const stage_name = MapNames[searchParams.get('map')] ?? 'w1r03';

loadMap(stage_name);
