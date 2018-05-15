'use strict';

const db = require('@arangodb').db;
const neighborhoods = 'neighborhoods';
const restaurants = 'restaurants';

if (!db._collection(neighborhoods)) {
  db._createDocumentCollection(neighborhoods);
}

if (!db._collection(restaurants)) {
  db._createDocumentCollection(restaurants);
}
