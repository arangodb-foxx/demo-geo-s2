/* global L, $, document */

(function () {
  'use strict';
  var map;
  var markers = [];
  var polygons = [];

  var initMap = function () {
    map = L.map('map').setView([40.81949109558767, -73.93383000695911], 13);

    /*
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    */
    L.tileLayer(
     'https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGtlcm5iYWNoIiwiYSI6ImNqaGowOWZ6YjAyZjYzMG1sMWNmanlya3IifQ.zUyh2nhwhbDRM8KvssjUyA', {
       tileSize: 512,
       zoomOffset: -1,
       attribution: '© <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> | <a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>'
     })
   .addTo(map);
  };

  var getRandomRestaurant = function () {
    $.ajax({
      cache: false,
      type: 'GET',
      url: 'restaurants',
      contentType: 'application/json',
      processData: false,
      success: function (data) {
        var marker = L.marker([data.location.coordinates[1], data.location.coordinates[0]]).addTo(map)
        .bindPopup('Name: ' + data.name + '.<br>Id: ' + data._id)
        .openPopup();
        markers.push(marker);
        centerLeafletMapOnMarker(marker);
      },
      error: function (data) {
        console.log(data);
      }
    });
  };

  var geoStyle = {
    color: '#3498db',
    opacity: 1,
    weight: 3
  };

  var geojsonMarkerOptions = {
    radius: 8,
    fillColor: '#2ecc71',
    color: 'white',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.64
  };

  var geojsonMarkerPoint = {
    radius: 8,
    fillColor: 'rgb(213, 54, 61)',
    color: 'white',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.64
  };

  var geojsonMarkerOptionsInter = {
    radius: 8,
    fillColor: 'rgb(213, 54, 61)',
    color: 'white',
    weight: 1,
    opacity: 1,
    fillOpacity: 0.64
  };
  
  var geoDistanceBetween = function () {
    clearAll();
    $.ajax({
      cache: false,
      type: 'GET',
      url: 'geoDistanceBetween',
      contentType: 'application/json',
      processData: false,
      success: function (data) {
        renderStats(data);
        // render visual help
        var c1 = L.circle([40.689306,-74.044500], 26000).addTo(map);
        var c2 = L.circle([40.689306,-74.044500], 25000).addTo(map);
        var x = new L.Marker([40.689306,-74.044500]).addTo(map).bindTooltip('Statue of Liberty', {sticky: true, permanent: true});
        markers.push(c1);
        markers.push(c2);
        markers.push(x);

        var markerslocal = [];
        var geojson;
        data.results.forEach(function (restaurant) {
          geojson = new L.GeoJSON(restaurant, {
            pointToLayer: function (feature, latlng) {
              var res = L.circleMarker(latlng, geojsonMarkerPoint);
              return res;
            }
          }).addTo(map);
          markers.push(geojson);
          markerslocal.push(geojson);
          var show = new L.featureGroup(markerslocal);
          map.fitBounds(show.getBounds());
        });

      },
      error: function (data) {
        console.log(data);
      }
    });
  };

  var geoIntersection = function () {
    clearAll();
    $.ajax({
      cache: false,
      type: 'GET',
      url: 'geoIntersection',
      contentType: 'application/json',
      processData: false,
      success: function (data) {
        var markerslocal = [];
        var geojson;
        data.results.forEach(function (restaurant) {
          geojson = new L.GeoJSON(restaurant, geojsonMarkerOptions).addTo(map);
          markers.push(geojson);
          markerslocal.push(geojson);
          var show = new L.featureGroup(markerslocal);
          map.fitBounds(show.getBounds());
        });
        var geojsonx = new L.GeoJSON(data.polygon, geojsonMarkerOptionsInter).addTo(map)
        .bindPopup('Custom intersection area.')
        .openPopup();
        markers.push(geojsonx);
        renderStats(data);
      },
      error: function (data) {
        console.log(data);
      }
    });
  };

  var geoDistanceNearest = function () {
    clearAll();
    $.ajax({
      cache: false,
      type: 'GET',
      url: 'geoDistanceNearest',
      contentType: 'application/json',
      processData: false,
      success: function (data) {
        var markerslocal = [];
        var geojson;
        data.results.forEach(function (restaurant) {
          geojson = new L.GeoJSON(restaurant, {
            pointToLayer: function (feature, latlng) {
              var res = L.circleMarker(latlng, geojsonMarkerPoint);
              return res;
            }
          }).addTo(map);
          markers.push(geojson);
          markerslocal.push(geojson);
          var show = new L.featureGroup(markerslocal);
          map.fitBounds(show.getBounds());
        });
        var marker = L.marker([40.689306, -74.044500]).addTo(map)
        .bindPopup('Name: Statue of Liberty')
        .openPopup();
        markers.push(marker);
        renderStats(data);
      },
      error: function (data) {
        console.log(data);
      }
    });
  };

  var geoDistance = function () {
    clearAll();
    $.ajax({
      cache: false,
      type: 'GET',
      url: 'geoDistance',
      contentType: 'application/json',
      processData: false,
      success: function (data) {
        var markerslocal = [];
        var geojson;
        data.results.forEach(function (restaurant) {
          geojson = new L.GeoJSON(restaurant, {
            pointToLayer: function (feature, latlng) {
              var res = L.circleMarker(latlng, geojsonMarkerPoint);
              return res;
            }
          }).addTo(map);
          markers.push(geojson);
          markerslocal.push(geojson);
          var show = new L.featureGroup(markerslocal);
          map.fitBounds(show.getBounds());
        });
        var marker = L.marker([40.689306, -74.044500]).addTo(map)
        .bindPopup('Name: Statue of Liberty')
        .openPopup();
        markers.push(marker);
        renderStats(data);
      },
      error: function (data) {
        console.log(data);
      }
    });
  };

  var renderStats = function (data) {
    // textareas
    $('#queryTextarea').val(data.query);
    console.log(data.stats.stats.executionTime);
    var number = Number(data.stats.stats.executionTime * 1000);
    $('#queryExecutionTime').val(number.toFixed(2) + ' ms');
  };

  var getRandomNeighborhood = function () {
    $.ajax({
      cache: false,
      type: 'GET',
      url: 'neighborhoods',
      contentType: 'application/json',
      processData: false,
      success: function (data) {
        // create a red polygon from an array of LatLng points
        if (data.geometry.type === 'Polygon') {
          var options = geojsonMarkerOptions;
          options.id = data._id;
          var polygon = new L.GeoJSON(data.geometry, geojsonMarkerOptions).addTo(map)
          .bindPopup('Name: ' + data.name + '.<br>Id: ' + data._id + '<br><br>Click area to show restauraunts.')
          .openPopup();

          polygons.push(polygon);
          polygon.on('click', function (x) {
            var id = x.target.options.id;
            getPointsInPolygon(id);
          });
          // zoom the map to the polygon
          map.fitBounds(polygon.getBounds());
        } else {
          getRandomNeighborhood();
        }
      },
      error: function (data) {
        console.log(data);
      }
    });
  };

  /*
  var geoContainsBenchmark = function () {
    $.ajax({
      cache: false,
      type: 'GET',
      url: 'geoContainsBenchmark/10',
      contentType: 'application/json',
      processData: false,
      success: function (data) {
        console.log(data);
      },
      error: function (data) {
        console.log(data);
      }
    });
  };

  var geoDistanceBenchmark = function () {
    $.ajax({
      cache: false,
      type: 'GET',
      url: 'geoDistanceBenchmark/10',
      contentType: 'application/json',
      processData: false,
      success: function (data) {
        console.log(data);
      },
      error: function (data) {
        console.log(data);
      }
    });
  };

  var geoNearBenchmark = function () {
    $.ajax({
      cache: false,
      type: 'GET',
      url: 'geoNearBenchmark/10',
      contentType: 'application/json',
      processData: false,
      success: function (data) {
        console.log(data);
      },
      error: function (data) {
        console.log(data);
      }
    });
  };*/

  var getPointsInPolygon = function (id) {
    $.ajax({
      cache: false,
      type: 'GET',
      url: 'pointsInNeighborhood/' + encodeURIComponent(id),
      contentType: 'application/json',
      processData: false,
      success: function (data) {
        var geojson;
        renderStats(data);
        data.result.forEach(function (restaurant) {
          geojson = new L.GeoJSON(restaurant.location, {
            pointToLayer: function (feature, latlng) {
              var res = L.circleMarker(latlng, geojsonMarkerPoint);
              return res;
            }
          }).addTo(map)
          .bindPopup('Name: ' + restaurant.name + '.<br>Id: ' + restaurant._id)
          .openPopup();
          markers.push(geojson);
        });
      },
      error: function (data) {
        console.log(data);
      }
    });
  };

  var centerLeafletMapOnMarker = function (marker) {
    var latLngs = [ marker.getLatLng() ];
    var markerBounds = L.latLngBounds(latLngs);
    map.fitBounds(markerBounds);
  };

  var clearAll = function () {
    clearMarkers();
    clearPolygons();
  };

  var clearMarkers = function () {
    var i;
    for (i = 0; i < markers.length; i++) {
      map.removeLayer(markers[i]);
    }
    markers = [];
  };
  var clearPolygons = function () {
    var i;
    for (i = 0; i < polygons.length; i++) {
      map.removeLayer(polygons[i]);
    }
    polygons = [];
  };

  document.addEventListener('DOMContentLoaded', function () {
    // init leaflet map
    initMap();

    // add bind events
    $('#randomRestaurant').on('click', function () {
      getRandomRestaurant();
    });
    $('#randomNeighborhood').on('click', function () {
      getRandomNeighborhood();
    });
    $('#geoDistance').on('click', function () {
      geoDistance();
    });
    $('#geoDistanceBetween').on('click', function () {
      geoDistanceBetween();
    });
    $('#geoDistanceNearest').on('click', function () {
      geoDistanceNearest();
    });
    $('#geoIntersection').on('click', function () {
      geoIntersection();
    });
    $('#clearAll').on('click', function () {
      clearMarkers();
      clearPolygons();
    });
  });
}());
