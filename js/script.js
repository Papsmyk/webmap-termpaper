 // Use the Geolocation API to get the user's current position
 navigator.geolocation.getCurrentPosition(function(position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
   

    var map = L.map('map').setView([lat, lng], 12);

    //Single Marker
    
    var singleMarker = L.marker([lat,lng]);
    singleMarker.addTo(map);
    
singleMarker.on('click', function(e) {
    var popupContent = getWarningsForLocation(e.latlng); // Function to get warnings based on location
    L.popup()
        .setLatLng(e.latlng)
        .setContent(popupContent)
        .openOn(map);
});

function getWarningsForLocation(location) {
    var warnings = [];

    // Iterate through polygon GeoJSON layers to check for warnings in the vicinity
    map.eachLayer(function(layer) {
        if (layer instanceof L.GeoJSON && layer.feature && layer.feature.geometry && layer.feature.geometry.type === 'Polygon') {
            var polygon = layer.toGeoJSON();
            var withinPolygon = leafletPip.pointInLayer([location.lng, location.lat], layer);
            if (withinPolygon.length > 0 && layer.feature.properties && layer.feature.properties.warning) {
                warnings.push(layer.feature.properties.warning);
            }
        }
    });

    // Format warnings for display
    var popupContent = '<h4>Warnings in this area:</h4>';
    if (warnings.length > 0) {
        popupContent += '<ul>';
        warnings.forEach(function(warning) {
            popupContent += '<li>' + warning + '</li>';
        });
        popupContent += '</ul>';
    } else {
        popupContent += '<p>No warnings found in this area.</p>';
    }

    return popupContent;
}


// Add base layer (optional)
/*===================================================
                     TILE LAYER               
===================================================*/
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
osm.addTo(map);

var CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
subdomains: 'abcd',
	maxZoom: 19
});
CartoDB_DarkMatter.addTo(map);

// Google Map Layer

var googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3']
 });
 googleStreets.addTo(map);

 // Satelite Layer
var googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
   maxZoom: 20,
   subdomains:['mt0','mt1','mt2','mt3']
 });
googleSat.addTo(map);




/*===================================================
                      GEOJSON               
===================================================*/
var countydata = L.geoJSON(countyJSON, {
    onEachFeature: function(feature, layer) {
        var label = L.marker(layer.getBounds().getCenter(), {
            icon: L.divIcon({
                className: 'label',
                html: feature.properties.Name
            })
        }).addTo(map);
        
    },
    style: {
        fillColor: 'transparent',
        fillOpacity: 0.4,
        color: 'red'
    }
}).addTo(map);

var parksdata = L.geoJSON(parksJSON, {
    onEachFeature: function(feature, layer) {
        var label = L.marker(layer.getBounds().getCenter(), {
            icon: L.divIcon({
                className: 'label',
                html: feature.properties.name
            })
        }).addTo(map);
        
    },
    style: {
        fillColor: 'green',
        fillOpacity: 0.4,
        color: 'black'
    }
}).addTo(map);


var airportdata = L.geoJSON(airportJSON, {
    onEachFeature: function(feature, layer) {
        var bufferDistance = feature.properties.BUFF_DIST;

        // Generate warnings based on buffer distance
        if (bufferDistance >= 1 ) {
            feature.properties.warning = "Fly with Caution About 1 km Proximity to " + feature.properties.name;
        } else if (bufferDistance >= 3 ) {
            feature.properties.warning = "Fly with Caution About 3kms Proximity to " + feature.properties.name;
        } else if (bufferDistance >= 5 ) {
            feature.properties.warning = "Fly with Caution About 5kms Proximity to " + feature.properties.name;
        } else if (bufferDistance >= 7) {
            feature.properties.warning =  "Fly with Caution About 7kms Proximity to " + feature.properties.name;
        }

        // Update choropleth style based on buffer distance
        if (bufferDistance >= 7) {
            layer.setStyle({
                fillColor: '#feebe2', // Adjust color for military restricted zones
                fillOpacity: 0.2
            });
        } else if (bufferDistance >= 5 ) {
            layer.setStyle({
                fillColor: '#fbb4b9', // Adjust color for police station zones
                fillOpacity: 0.2
            });
        } else if (bufferDistance >= 3 ) {
            layer.setStyle({
                fillColor: '#f768a1', // Adjust color for police station zones
                fillOpacity: 0.2
            });
        } else if (bufferDistance >= 1) {
            layer.setStyle({
                fillColor: '#ae017e', // Adjust color for police station zones
                fillOpacity: 0.2
            });
        }
    }
}).addTo(map);

var policedata = L.geoJSON(policeJSON, {
    onEachFeature: function(feature, layer) {
        var bufferDistance = feature.properties.BUFF_DIST;

        // Generate warnings based on buffer distance
        if (bufferDistance >= 50 && bufferDistance <= 300) {
            feature.properties.warning = "Fly with Caution Proximity to " + feature.properties.name;
        } else if (bufferDistance === null || bufferDistance === undefined) {
            feature.properties.warning = "Proximity to Police Station";
        }

        // Update choropleth style based on buffer distance
        if (bufferDistance >= 50 && bufferDistance <= 300) {
            layer.setStyle({
                fillColor: '#bdc9e1', // Adjust color for military restricted zones
                fillOpacity: 0.2
            });
        } else if (bufferDistance < 50) {
            layer.setStyle({
                fillColor: '#0570b0', // Adjust color for police station zones
                fillOpacity: 0.2
            });
        }
    }
}).addTo(map);


var militarydata = L.geoJSON(policeJSON, {
    onEachFeature: function(feature, layer) {
        var bufferDistance = feature.properties.BUFF_DIST;

        // Generate warnings based on buffer distance
        if (bufferDistance >= 50 && bufferDistance <= 500) {
            feature.properties.warning = "Fly with Caution Proximity to " + feature.properties.name;
        } else if (bufferDistance === null || bufferDistance === undefined) {
            feature.properties.warning = "Proximity to Military Restricted Zone";
        }

        // Update choropleth style based on buffer distance
        if (bufferDistance >= 50 && bufferDistance <= 300) {
            layer.setStyle({
                fillColor: '#bdc9e1', // Adjust color for military restricted zones
                fillOpacity: 0.2
            });
        } else if (bufferDistance < 50) {
            layer.setStyle({
                fillColor: '#0570b0', // Adjust color for police station zones
                fillOpacity: 0.2
            });
        }
    }
}).addTo(map);


// Create a legend
var legend = L.control({position: 'bottomright'});
legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML += '<i style="background: #e41a1c"></i> Military Restricted Zone<br>';
    div.innerHTML += '<i style="background: #377eb8"></i> Police Station Zone<br>';
    div.innerHTML += '<i style="background: #984ea3"></i> Aerodome Zone<br>';
    div.innerHTML += '<i style="background: #4daf4a"></i> Nature Parks & Reserves Zone<br>';
    return div;
};
legend.addTo(map);


/*===================================================
                      LAYER CONTROL               
===================================================*/
var baseMaps = {
    "Satellite": googleSat,
    "Google Map": googleStreets,
    "CartoDB_DarkMatter": CartoDB_DarkMatter,
    "OpenStreetMap": osm,
};

var overlays = {
    "Marker": singleMarker,
    "ParksData": parksdata,
    "MilitaryData": militarydata,
    "PoliceData": policedata,
    "CountyData": countydata,
    "AirportData": airportdata
};

L.control.layers(baseMaps, overlays).addTo(map);

/*===================================================
                      SEARCH BUTTON               
===================================================*/

L.control.geocoder().addTo(map);
 });