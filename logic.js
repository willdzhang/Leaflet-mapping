// USGS earthquake json URL
var quakeURL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// tectonic plate fault lines json url 
var plateURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

// GET request earthquake data from URL
d3.json(quakeURL, function(data) {
    createFeatures(data.features)
});

// function for color scale based on magnitude
function colorScale(shade) {
  if (shade < 2.5) {
    return '#ffd1b3'
  }
  else if (shade < 5.5) {
    return '#ffa366'
  }
  else if (shade < 6.1) {
    return '#ff751a'
  }
  else if (shade < 7) {
    return '#cc5200'
  }
  else if (shade < 8) {
    return '#803300'
  }
  else {
    return '#331400'
  }
}

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
      "<hr><p>" + "Earthquake Magnitude: " + feature.properties.mag + "</p>")
  };

  // function to determine circle size
  function markerSize(mag) {
    return mag * 25000;
  };

  // Give each marker sizing based on magnitude
  function pointToLayer(feature, coord) {
    return new L.circle(coord, {
      radius: markerSize(feature.properties.mag),
      fillColor: colorScale(feature.properties.mag),
      fillOpacity: 0.5,
      color: 'black',
      stroke: true,
      weight: 0.8
    })
  };

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: pointToLayer
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define map layers
  var outdoormap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
  });

  var satmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var greymap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Outdoor Map": outdoormap,
    "Satellite Map": satmap,
    "Greyscale Map": greymap
  };

  // GET request tectonic plates geographic data points used to plot lines
  d3.json(plateURL, function(plateData) {
    L.geoJSON(plateData, {
      color: "white",
      weight: 2
    }).addTo(tectonicPlates)
  });

  var tectonicPlates = new L.LayerGroup();

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    'Earthquakes': earthquakes,
    'Tectonic Plates': tectonicPlates
  };

  // Create our map, giving it the daymap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4,
    layers: [outdoormap, tectonicPlates]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: true
  }).addTo(myMap);

  // legend set up
  var legend = L.control({position: "bottomleft"});

  legend.onAdd = function(myMap) {
    var div = L.DomUtil.create("div", "info legend");
      magnitude = [0, 2.5, 5.5, 6, 7, 8]

    // insert legend title
    div.innerHTML += '<h3>Earthquake Magnitude</h3>'

    // loop through color scale for legend
    for (var i = 0; i < magnitude.length; i++) {
      div.innerHTML += '<i style="background:' + colorScale(magnitude[i] + 1) + '"></i> ' +
        magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
      }
    return div;
  };
  legend.addTo(myMap);
}
