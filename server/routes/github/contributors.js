var express = require("express");
var router = express.Router();
var { graphql } = require("@octokit/graphql")

// THIS IS A LIST OF ALL CONTRIBUTORS

function listContributors(key, name, owner){

    const { Octokit } = require("@octokit/core");
    const MyOctokit = Octokit.plugin(restEndpointMethods);
    const octokit = new MyOctokit({ auth: {key} });// ADD OUTH ID HERE
    
    const iterator = octokit.paginate.iterator(octokit.rest.contributors.listForRepo, {
        owner: {owner},
        repo: {name},
        per_page: 100,
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
      login
      name
      location
      avatarUrl
    }`

    const { json } = await graphql(
        query,
        {
            headers: {
                authorization: key
            }
        }
    )
}