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
    const queryString = `FOR restaurant IN restaurants
        FILTER GEO_CONTAINS(${JSON.stringify(neighborhood.geometry)}, restaurant.location)
      RETURN restaurant`;

    const result = db._query(aql`
        FOR restaurant IN restaurants
          FILTER GEO_CONTAINS(${neighborhood.geometry}, restaurant.location)
        RETURN restaurant
      `);
    res.send({
      result: result._documents,
      query: queryString,
      stats: result.getExtra()
    });
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

router.get('/geoIntersection', function (req, res) {
    var queryString = `LET someAreaInNYC = GEO_POLYGON([
        [-73.95103454589844, 40.74517613004631],
        [-73.93610000610352, 40.73971363429379],
        [-73.89507293701172, 40.7737818731648],
        [-73.91395568847656, 40.782751138401245],
        [-73.95103454589844, 40.74517613004631]
      ])
      FOR n IN neighborhoods
        FILTER GEO_INTERSECTS(someAreaInNYC, n.geometry)
      RETURN n.geometry`;
  try {
    var query = db._query(queryString);
    res.send({
      results: query._documents,
      stats: query.getExtra(),
      query: queryString,
      polygon: {
        type: 'Polygon',
        coordinates: [[
          [-73.95103454589844, 40.74517613004631],
          [-73.93610000610352, 40.73971363429379],
          [-73.89507293701172, 40.7737818731648],
          [-73.91395568847656, 40.782751138401245],
          [-73.95103454589844, 40.74517613004631]
        ]]
      }
    });
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

router.get('/geoDistanceNearest', function (req, res) {
    var queryString = `FOR restaurant IN restaurants
      LET statueOfLiberty = GEO_POINT(-74.044500, 40.689306)
      SORT GEO_DISTANCE(statueOfLiberty, restaurant.location) ASC
      LIMIT 100
    RETURN restaurant.location`;
  try {
    var query = db._query(queryString);
    res.send({
      results: query._documents,
      stats: query.getExtra(),
      query: queryString
    });
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

router.get('/geoDistanceBetween', function (req, res) {
    var queryString = `LET statueOfLiberty = GEO_POINT(-74.044500, 40.689306)
      FOR restaurant IN restaurants
        FILTER GEO_DISTANCE(statueOfLiberty, restaurant.location) <= 26000
        FILTER GEO_DISTANCE(statueOfLiberty, restaurant.location) >= 25000
      LIMIT 100
    RETURN restaurant.location`;
  try {
    var query = db._query(queryString);
    res.send({
      results: query._documents,
      stats: query.getExtra(),
      query: queryString
    });
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

router.get('/geoDistance', function (req, res) {
    var queryString = `LET statueOfLiberty = GEO_POINT(-74.044500, 40.689306)
        FOR restaurant IN restaurants
          FILTER GEO_DISTANCE(statueOfLiberty, restaurant.location) <= 30000
        LIMIT 100
      RETURN restaurant.location`;
  try {
    var query = db._query(queryString);
    res.send({
      results: query._documents,
      stats: query.getExtra(),
      query: queryString
    });
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
        FOR restaurant IN restaurants
          FILTER GEO_DISTANCE({type: "Point", coordinates: [-74.044500, 40.689306]}, restaurant.location) <= ${i} * 1000
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
.response(joi.object().required(), 'Returns execution times of n-distance runs.')
.summary('GEO_DISTANCE Benchmark.')
.description('Returns execution times of n-geo_distance between all neighborhoods and the statue of liberty.');
