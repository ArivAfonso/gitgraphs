var express = require("express");
const { graphql } = require("@octokit/graphql");
const { createAppAuth } = require("@octokit/auth-app");
var router = express.Router();
const { countryJson } = require("./countries.json")
const _ = require("lodash");

function getStarLocations(key, name, owner){

  const { Octokit } = require("@octokit/core");
  const MyOctokit = Octokit.plugin(restEndpointMethods);
  const octokit = new MyOctokit({ auth: {key} });// ADD OUTH ID HERE
  
  const iterator = octokit.paginate.iterator(octokit.rest.stargazers.listForRepo, {
      owner: {owner},
      repo: {name},
      per_page: 100, //TODO: Pagination Limits
  });

  
  // iterate through each response
  var user_list = []
  for (var i = 0; i < iterator.length; i++) {
      var counter = iterator[i];
      user_list.push(counter.login);
  }

  var request = "query{"
  user_list.forEach(function (item, index) {
      var user_query = `
          user${index}: user(login: "${item}") {
              ...UserFragment
          }`
      request = request + user_query
  });

  var query = request + `
  }
  fragment UserFragment on User {
    location
  }`

  const { json } = await graphql(
      query,
      {
          headers: {
              authorization: key
          }
      }
  )

  //get country data into an array
  var countries = [];
  for (var i = 0; i < countryJson.length; i++) {
    var counter = countryJson.counters[i];
    countries.push(counter.name);
  }

  var locations = [];
  var user = [];
  for (var i = 0; i < json.data.loaction; i++) {
    var counter1 = jsonData.data[i];
    locations.push(counter1.user[i]);
  }

  var places = [];
  for (var i = 0; i < locations.length; i++) {
    var place = locations[i];
    var re = /\w+\s/g;
    var placesArray = place.match(re);
    for (var i = placesArray.length; i >= 0; i--){
        let possible_country = countryJson.find((el) => el.name === placesArray[i]);//Check if place is a country
        if (!possible_country){
          let possible_state = stateJson.find((el) => el.name === placesArray[i]);
          if (!possible_state){
            let possible_city = cityJson.find((el) => el.name === placesArray[i]);
            if (!possible_city){
              continue
            }
            else{
              places.push(possible_city)
            }
          }
          else {
            places.push(possible_state)
          }
        }// TODO: Import Json file 
      else{
        places.push(possible_country)
      }    
    }
  }
}

router.get("locations/:key/:name/:owner", function(req, res) {
    var api_key = req.params.key;
    var name = req.params.name
    var owner = req.params.owner
    res.send("API is working properly");
});


module.exports = router;