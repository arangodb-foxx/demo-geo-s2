/* global L, $, document */

(function () {
  'use strict';
  var map;
  var markers = [];
  var polygons = [];

  var initMap = function () {
    map = L.map('map').setView([40.81949109558767, -73.93383000695911], 13);

    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
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
          var latlngs = [];
          // fill latlng array
          data.geometry.coordinates[0].forEach(function (value) {
            latlngs.push([value[1], value[0]]);
          });
          var polygon = L.polygon(latlngs, {color: 'red', id: data._id}).addTo(map);
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
  };

  var getPointsInPolygon = function (id) {
    $.ajax({
      cache: false,
      type: 'GET',
      url: 'pointsInNeighborhood/' + encodeURIComponent(id),
      contentType: 'application/json',
      processData: false,
      success: function (data) {
        data.forEach(function (obj) {
          var marker = L.marker([obj.location.coordinates[1], obj.location.coordinates[0]]).addTo(map)
          .bindPopup('Name: ' + obj.name + '.<br>Id: ' + obj._id)
          .openPopup();
          markers.push(marker);
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
    $('#geoContainsBenchmark').on('click', function () {
      geoContainsBenchmark();
    });
    $('#geoDistanceBenchmark').on('click', function () {
      geoDistanceBenchmark();
    });
    $('#geoNearBenchmark').on('click', function () {
      geoNearBenchmark();
    });
    $('#clearAll').on('click', function () {
      clearMarkers();
      clearPolygons();
    });
  });
}());
