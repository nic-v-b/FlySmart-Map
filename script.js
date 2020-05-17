
// Creates map based on selected map syle from radio buttons ------------------------------------------

mapboxgl.accessToken = 'pk.eyJ1IjoibmljdmIiLCJhIjoiY2thNzBxMnl0MDAyYzJ0bmZpeW1jOHNlayJ9.p5h0jJ78qIUWcRLQ19muYw';
var map = new mapboxgl.Map({
container: 'map',
style: 'mapbox://styles/mapbox/streets-v11',
zoom: 14,
//center: [-119.5591, 37.715],  // mountainous area Yosemite
//center: [-73.878258, 40.676586],  // JFK area
center: [-122.421970, 37.757329],  // San Francisco area
// center: [-74.008828, 40.710130],  // lower manhattan area (high buidlings)
pitch: 45,
});
 
var layerList = document.getElementById('menu');
var inputs = layerList.getElementsByTagName('input');
 
function switchLayer(layer) {
var layerId = layer.target.id;
map.setStyle('mapbox://styles/mapbox/' + layerId);
}
 
for (var i = 0; i < inputs.length; i++) {
inputs[i].onclick = switchLayer;
}

// Button to display waypoints (NOT WORKING) ---------------------------------------------------------------------------------


// Map controls ---------------------------------------------------------------------------------
    
    // Add a geocoder
    map.addControl(
        new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl
        })
        );

    // Adds control to change the location of the mapbox watermarks
    //map.addControl(new mapboxgl.AttributionControl(), 'top-left');

    // Adds zoom and rotation controls to top right of map 
    map.addControl(new mapboxgl.NavigationControl());

    // Adds geolocation control to top right of map
    map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    }));

    // Adds fullscreen control to top right of map
    map.addControl(new mapboxgl.FullscreenControl({container:document.querySelector('body')}));

    // Adds scale control to top right of map
    var scale = new mapboxgl.ScaleControl({
        maxWidth: 80,
        unit: 'imperial'
    });
    map.addControl(scale);
scale.setUnit('metric');

// Loads data on map ---------------------------------------------------------------------------------

map.on('load', function () {
    map.addSource('dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.terrain-rgb'
    });

    // // Adds hillshade layer to maps (good to pair with topo map styles)
    // map.addLayer(
    //     {
    //         'id': 'hillshading',
    //         'source': 'dem',
    //         'type': 'hillshade'
    //         // insert below waterway-river-canal-shadow;
    //         // where hillshading sits in the Mapbox Outdoors style
    //     },
    //     'waterway-river-canal-shadow'
    // );

    // Adds 3d buildings 
    map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 1,
        'paint': {
            'fill-extrusion-color': '#aaa',

            // use an 'interpolate' expression to add a smooth transition effect to the
            // buildings as the user zooms in
            'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                1,
                0,
                10,
                ['get', 'height']
            ],
            'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                1,
                0,
                10,
                ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
        }
    });

    // Adds dataset points with color scale based on ethnicity value
    map.addSource('ethnicity', {
        type: 'vector',
        url: 'mapbox://examples.8fgz4egr'
    });
    map.addLayer({
        'id': 'population',
        'type': 'circle',
        'source': 'ethnicity',
        'source-layer': 'sf2010',
        'paint': {
            // make circles larger as the user zooms from z12 to z22
            'circle-radius': {
                'base': 1.75,
                'stops': [
                    [12, 2],
                    [22, 180]
                ]
            },
            // color circles by ethnicity, using a match expression
            // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
            'circle-color': [
                'match',
                ['get', 'ethnicity'],
                'White',
                '#fbb03b',
                'Black',
                '#223b53',
                'Hispanic',
                '#e55e5e',
                'Asian',
                '#3bb2d0',
            /* other */ '#ccc'
            ]
        }
    });
});