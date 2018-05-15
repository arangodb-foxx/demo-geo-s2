# demo-geo-s2
A minimalistic Foxx geo example using leaflet.js
This example will work with ArangoDB 3.4 and
![Alt text](/images/geo-screenshot.png?raw=true "Data via Foxx shown via leaflet.js")

# Preparations

First install the foxx service. Create two document collections called `restaurants` and `neighborhoods`.
Then import the needed datasets from `data` folder.

```
./arangoimp restaurants.json --collection restaurants
./arangoimp neighborhoods.json --collection neighborhoods
```

Afterwards make sure to create the two geo indices:
```
db.restaurants.ensureIndex({ type: "geo", fields: [ "location" ], geoJson:true })
db.neighborhoods.ensureIndex({ type: "geo", fields: [ "geometry" ], geoJson:true })
```

# Usage

Buttons:

* Random restaurant: Draw and point to a random restaurant
* Random neighborhood: Draw and point to a random neighborhood

Click on a drawn neighborhood to also draw all included restaurants.
