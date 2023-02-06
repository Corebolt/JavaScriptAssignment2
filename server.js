const { response, request } = require('express');
const express = require('express');
const app = express();
const queries = require("./mysql/queries");

app.set('view engine', 'ejs');
app.listen(3000);

app.get('/', function(request, response) {
      
  response.render('index', {title: 'Airbnb Search App'});
});

app.get('/states',(request, response)=> { // used for passing data from states table

  queries.querySQL("SELECT name, id FROM states ORDER BY name")
  .then(states => {       
    response.json(states);
  });
});

app.get('/cities',(request, response)=> { //used for passing data from cities table

  queries.querySQL("SELECT * FROM cities WHERE state_id = '" + request.query.states + "'")
  .then(states => {       
    response.json(states);
  });
});

app.get('/airbnb', (request, response) => {

  queries.findListingId(
    {
      placeId: request.query.place
    }).then(result => {
  response.render('airbnb', { title:'AirBnb', listing: result })});
});

app.get('/airbnb/find-one', (request, response) => {

  
  let state = "";
  let city = "";

  queries.findListing(
    { 
      number_rooms: request.query.bedrooms,
      amenities: request.query.amenities,
      max_guest: request.query.max_guest,
      price_by_night: request.query.price_by_night

    }).then(result => {
      if(result.length > 0)
      {
        queries.amenitiesList({amenities: result[0].id})
        .then(amenities => { 
          response.render("listing", { listing: result[0], amenities:amenities, city:city, state:state});
        })
      }
      else
      response.render("error")});
});

app.get ("/airbnb/find-many", async (request, response) => { 

  queries.findListings(
  {
    stateId: request.query.StateName,
    cityId: request.query.CityName,
    number_rooms: request.query.bedrooms

  }).then(result => {
    if(result.length > 0)
      response.render("listings",{listing: result});  
    else
      response.render("error")});
});

app.get ("/selectedListing", (request, response)=> { //selecting a single listing from the many-listings page

  queries.passedId(
  { 
    id: request.query.id,
  }).then(result => {
    if(result.length > 0)
    queries.amenitiesList({amenities: result[0].id})
    .then(amenities => { 
      if(amenities.length > 0)
      response.render("listing", { listing: result[0], amenities:amenities,
                      city: request.query.city, state: request.query.state});
    })
    else
    response.render("error")});
});
