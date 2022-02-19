var express = require("express");
var router = express.Router();
const { graphql } = require("@octokit/graphql");

function getPullRequests(key, repo, owner){
    const { allPullRequests } = await graphql(
        `
        query{
            repository(name: $repo, owner: $owner) {
              pullRequests{totalCount}
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
    return allPullRequests
}

router.get("all/:key/:repo/:owner", function(req, res) {
    var api_key = req.params.key;
    var user_repo = req.params.repo
    var user_owner = req.params.owner
    var response = getPullRequests(api_key, user_repo, user_owner)
    var list = response.data.repository.pullRequests.totalCount
    res.send(list);
});

function getPullRequestHealth(key, repo, owner){
  const { json } = await graphql(
    `
    query{
      repository(owner:$owner, name:$repo){
        pullRequests(first:100){
          nodes{
            createdAt
            closedAt
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
  var times = [];
  for (var i = 0; i < json.data.repository.pullRequests.nodes.length; i++) {
    var nodes = json[i];
    var s = new Date(nodes.createdAt).getTime() - new Date(nodes.closedAt).getTime();
    times.push(s);
  }

  console.log(m); 
  return getPullRequestHealth
}

module.exports = router;