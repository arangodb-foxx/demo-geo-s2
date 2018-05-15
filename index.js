'use strict';

const joi = require('joi');
const db = require('@arangodb').db;
const aql = require('@arangodb').aql;
const errors = require('@arangodb').errors;
const DOC_NOT_FOUND = errors.ERROR_ARANGO_DOCUMENT_NOT_FOUND.code;

const restaurants = db._collection('restaurants');
const neighborhoods = db._collection('neighborhoods');

const createRouter = require('@arangodb/foxx/router');
const router = createRouter();

module.context.use(router);

router.get('/restaurants', function (req, res) {
  try {
    // const data = foxxColl.document(req.pathParams.key);
    const data = restaurants.any();
    res.send(data);
  } catch (e) {
    if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
      throw e;
    }
    res.throw(404, 'The entry does not exist', e);
  }
})
.response(joi.object().required(), 'Returns a random entry.')
.summary('Retrieve a random restaurant entry.')
.description('Returns a random restaurant entry of the restaurants collection.');

router.get('/neighborhoods', function (req, res) {
  try {
    // const data = foxxColl.document(req.pathParams.key);
    const data = neighborhoods.any();
    res.send(data);
  } catch (e) {
    if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
      throw e;
    }
    res.throw(404, 'The entry does not exist', e);
  }
})
.response(joi.object().required(), 'Returns a random entry.')
.summary('Retrieve a random neighborhood entry.')
.description('Returns a random neighborhoods entry of the neighborhoods collection.');

router.get('/pointsInNeighborhood/:id', function (req, res) {
  try {
    var id = req.pathParams.id;
    var neighborhood = neighborhoods.document(id);

    const keys = db._query(aql`
      FOR restaurant IN restaurants
        FILTER GEO_CONTAINS(${neighborhood.geometry}, restaurant.location)
      RETURN restaurant
    `);
    res.send(keys);
  } catch (e) {
    if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
      throw e;
    }
    res.throw(404, 'The entry does not exist', e);
  }
})
.response(joi.object().required(), 'Returns restaurants within a given neighborhood.')
.summary('Restaurants in a neighborhood.')
.description('Returns restaurants within a given neighborhood.');

router.get('/geoContainsBenchmark/:count', function (req, res) {
  try {
    var count;
    if (req.pathParams.count) {
      count = JSON.parse(req.pathParams.count);
    }

    var keys = [];
    for (var i = 0; i < count; i++) {
      keys.push(db._query(aql`
        FOR neighborhood IN neighborhoods
          FOR restaurant in restaurants
            FILTER GEO_CONTAINS(neighborhood.geometry, restaurant.location)
        RETURN restaurant
      `).getExtra().stats.executionTime);
    }
    res.send(keys);
  } catch (e) {
    if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
      throw e;
    }
    res.throw(404, 'The entry does not exist', e);
  }
})
.response(joi.object().required(), 'Returns execution times of n-geo_contain runs.')
.summary('GEO_CONTAINS Benchmark.')
.description('Returns execution times of n-geo_contain runs.');

router.get('/geoDistanceBenchmark/:count', function (req, res) {
  try {
    var count;
    if (req.pathParams.count) {
      count = JSON.parse(req.pathParams.count);
    }

    // Point coordinate is the statue of liberty
    var keys = [];
    for (var i = 0; i < count; i++) {
      keys.push(db._query(aql`
        FOR neighborhood IN neighborhoods
        RETURN GEO_DISTANCE({type: "Point", coordinates: [-74.044500, 40.689306]}, neighborhood.geometry)
      `).getExtra().stats.executionTime);
    }
    res.send(keys);
  } catch (e) {
    if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
      throw e;
    }
    res.throw(404, 'The entry does not exist', e);
  }
})
.response(joi.object().required(), 'Returns execution times of n-distance runs.')
.summary('GEO_DISTANCE Benchmark.')
.description('Returns execution times of n-geo_distance between all neighborhoods and the statue of liberty.');

router.get('/geoNearBenchmark/:count', function (req, res) {
  try {
    var count;
    if (req.pathParams.count) {
      count = JSON.parse(req.pathParams.count);
    }

    // Point coordinate is the statue of liberty
    var keys = [];
    for (var i = 0; i < count; i++) {
      keys.push(db._query(aql`
        FOR neighborhood IN neighborhoods
          FILTER GEO_DISTANCE({type: "Point", coordinates: [-74.044500, 40.689306]}, neighborhood.geometry) <= 20000
          RETURN neighborhood._key
      `).getExtra().stats.executionTime);
    }
    res.send(keys);
  } catch (e) {
    if (!e.isArangoError || e.errorNum !== DOC_NOT_FOUND) {
      throw e;
    }
    res.throw(404, 'The entry does not exist', e);
  }
})
.response(joi.object().required(), 'Returns execution times of n-distance runs.')
.summary('GEO_DISTANCE Benchmark.')
.description('Returns execution times of n-geo_distance between all neighborhoods and the statue of liberty.');
