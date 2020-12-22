//Store API Endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

//Create function to determine color
function getColor(magnitude){
    if (magnitude>5){
        return "red"
    }
    else if (magnitude > 4){
        return 'orangered'
    }
    else if (magnitude > 3){
        return 'orange'
    }
    else if (magnitude > 2){
        return 'yellow'
    }
    else if (magnitude > 1){
        return 'darkgreeen'
    }
    else{
        return 'lightgreen'
    }
}
function createFeatures(earthquakeData){
    function OnEachFeature(feature,layer){
        layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p><u>Occurance:</u>" + new Date(feature.properties.time) + "</p>" +
        "</h3><p><u>Magnitude:</u> " + feature.properties.mag + "</p>");
}
    var earthquakes = L.geoJSON(earthquakeData,{
        OnEachFeature: OnEachFeature,
        pointToLayer: function (feature, latlng){
            var markerStyle = {
                fillColor: getColor(feature.properties.mag),
                color: "black",
                weight: 1,
                opacity: 1,
                fillOpacity:0.8,
                radius: 4 * feature.properties.mag
            };
            return L.circleMarker(latlng, markerStyle);
        }
        
    });
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}
    
 
function createMap (earthquakes) {


    //Define tile layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data&copy; <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
      });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
      });

    
    //Define baseMaps object to hold base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap
    };

    //Create overlay object to hold overlay layer
    var overlayMaps = {
        "Earthquakes": earthquakes
    };

    //Create our map, giving the streetmap and earthquake layers to display on load
    var myMap = L.map("map", {
        center: [37.09, -95.71],
        zoom: 4.2,
        layers: [streetmap, earthquakes]
      });
    
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
    
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map){
        var div = L.DomUtil.create('div', 'info legend'),
        magnitudes = [0, 1, 2, 3, 4],
        labels = [];

        div.innerHTML +='Magnitude<br><hr>'

        for (var i=0; i < magnitudes.length; i++){
            div.innerHTML +=
                '<i style="background:' + getColor(magnitudes[i]+ 1) + '>&nbsp&nbsp&nbsp&nbsp</i> ' + 
                magnitudes[i]+ (magnitudes[i+ 1] ? '&ndash;' + magnitudes[i+1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);
}
    