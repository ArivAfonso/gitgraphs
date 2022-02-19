var express = require("express");
var router = express.Router();
const { graphql } = require("@octokit/graphql");
const res = require("express/lib/response");


function getCommitDates(key, repo, owner){
    const { allCommitDates } = await graphql(
        `
        query{
            repository(name: $repo, owner: $owner) {
              ref(qualifiedName: "master") {
                target {
                  ... on Commit {
                    history(first: 100) {
                      edges {
                        node {
                          committedDate
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        {
          owner: owner,
          repo: repo,
          headers: {
            authorization: key,
          },
        },
        
        
    );
    return allCommitDates
}

router.get("dates/:key/:repo/:owner", function(req, res) {
    var api_key = req.params.key;
    var user_repo = req.params.repo
    var user_owner = req.params.owner
    var response = getCommitDates(api_key, user_repo, user_owner)
    var list = response.data.repository.ref.target.histoty.edge
    res.send(response);
});

function allUserCommits(key, repo, owner){
  var json = require("./response.json");// The response from url Eg. https://api.github.com/repos/ruby/ruby/commits

  var m = [];
  for (var i = 0; i < json.length; i++) {
    var counter = json[i];
    var s = counter.author.login;
    m.push(s);
  }
  console.log(m); 
}

router.get("alluser/:key/:repo/:owner", function(req, res){
  var api_key = req.params.key;
  var user_repo = req.params.repo
  var user_owner = req.params.owner 
  var response = allUserCommits(api_key, user_repo, user_owner)
  res.send(response)
});

function getChanges(key, repo, owner){
  var today = new Date();
  var previousweek = new Date(today.getFullYear(), today.getMonth(), today.getDate()-42);// 42/7 is 6 weeks. Increase and Decrease
  const { json } = await graphql(
    `
    {
      search(query: "$owner/$repo", type: REPOSITORY, last: 1) {
        nodes {
          ... on Repository {
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 100, since: "$six_weeks") {
                    nodes {
                      ... on Commit {
                        additions
                        deletions
                        committedDate
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    `,
    {
      owner: owner,
      repo: repo,
      six_weeks: previousweek,
      headers: {
        authorization: key,
      },
    },
    
  );

  if (json.data.search.nodes[1].defaultBranchRef.target.history.pageInfo.hasNextPage === true){
    
  }

  Date.prototype.getWeek = function() {
    var onejan = new Date(this.getFullYear(),0,1);
    var today = new Date(this.getFullYear(),this.getMonth(),this.getDate());
    var dayOfYear = ((today - onejan + 86400000)/86400000);
    return Math.ceil(dayOfYear/7)
  };

  try {
    var actual_json = json.search.nodes[0].defaultBranchRef.target.history.nodes
    for (var i = 0; i < actual_json.length; i++) {
      var counter = actual_json[i];
      var response_week = new Date(actual_json.commitedDate).getWeek()
  
      if (response_week === new Date(today.getFullYear(), today.getMonth(), today.getDate()-7).getWeek()){
        var first_week = new Date(today.getFullYear(), today.getMonth(), today.getDate()-7).getWeek()
        first_week_additions = first_week_additions + counter.additions
        first_week_deletions = first_week_deletions + counter.deletions
      }
      else if (response_week === new Date(today.getFullYear(), today.getMonth(), today.getDate()-14).getWeek()){
        var second_week = new Date(today.getFullYear(), today.getMonth(), today.getDate()-14).getWeek()
        second_week_additions = second_week_additions + counter.additions
        second_week_deletions = second_week_deletions + counter.deletions
      }
      else if (response_week === new Date(today.getFullYear(), today.getMonth(), today.getDate()-21).getWeek()){
        var third_week = new Date(today.getFullYear(), today.getMonth(), today.getDate()-21).getWeek()
        third_week_additions = third_week_additions + counter.additions
        third_week_deletions = third_week_deletions + counter.deletions
      }
      else if (response_week === new Date(today.getFullYear(), today.getMonth(), today.getDate()-28).getWeek()){
        var fourth_week = new Date(today.getFullYear(), today.getMonth(), today.getDate()-28).getWeek()
        fourth_week_additions = fourth_week_additions + counter.additions
        fourth_week_deletions = fourth_week_deletions + counter.deletions
      }
      else if (response_week === new Date(today.getFullYear(), today.getMonth(), today.getDate()-35).getWeek()){
        var fifth_week = new Date(today.getFullYear(), today.getMonth(), today.getDate()-35).getWeek()
        fifth_week_additions = fifth_week_additions + counter.additions
        fifth_week_deletions = fifth_week_deletions + counter.deletions
      }
      else if (response_week === new Date(today.getFullYear(), today.getMonth(), today.getDate()-42).getWeek()){
        var sixth_week = new Date(today.getFullYear(), today.getMonth(), today.getDate()-42).getWeek()
        sixth_week_additions = sixth_week_additions + counter.additions
        sixth_week_deletions = sixth_week_deletions + counter.deletions
      }
      else{
        // Commit is older than 6 weeks
        continue
      }
    }
    var data = `{
              "Additions": ${first_week_additions.toLocaleString("en-US")},
              "Deletions": ${first_week_deletions.toLocaleString("en-US")},
              "Week": ${first_week}
             },
             {
              "Additions": ${second_week_additions.toLocaleString("en-US")},
              "Deletions": ${second_week_deletions.toLocaleString("en-US")},
              "Week": ${second_week}
             },
             {
              "Additions": ${third_week_additions.toLocaleString("en-US")},
              "Deletions": ${third_week_deletions.toLocaleString("en-US")},
              "Week": ${third_week}
             },
             {
              "Additions": ${fourth_week_additions.toLocaleString("en-US")},
              "Deletions": ${fourth_week_deletions.toLocaleString("en-US")},
              "Week": ${fourth_week}
             },
             {
              "Additions": ${fifth_week_additions.toLocaleString("en-US")},
              "Deletions": ${fifth_week_deletions.toLocaleString("en-US")},
              "Week": ${fifth_week}
             },
             {
              "Additions": ${sixth_week_additions.toLocaleString("en-US")},
              "Deletions": ${sixth_week_deletions.toLocaleString("en-US")},
              "Week": ${sixth_week}
             }`
    return data
  }
  catch (e) {
    return res.status(204)
  }
}

router.get("changes/:key/:repo/:owner", function(req, res){
  var api_key = req.params.key;
  var user_repo = req.params.repo
  var user_owner = req.params.owner 
  var response = getChanges(api_key, user_repo, user_owner)
  res.send(response)
})
module.exports = router;