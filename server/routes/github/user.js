import { Router } from 'express';
var router = Router();
import { graphql } from '@octokit/graphql';
import _ from 'underscore';

async function getProfile(key, name) {
    const { profile } = await graphql(
        `
            query {
                user(login: "nat") {
                    followers(first: 5) {
                        totalCount
                        nodes {
                            avatarUrl
                            login
                        }
                    }
                    following(first: 5) {
                        totalCount
                        nodes {
                            avatarUrl
                            login
                        }
                    }
                    websiteUrl
                    bio
                    location
                    email
                }
            }
        `,
        {
            name: name,
            headers: {
                authorization: key
            }
        }
    );
    return profile;
}

router.get('profile/:key/:name/:owner', function (req, res) {
    var api_key = req.params.key;
    var username = req.params.name;
    var response = getProfile(api_key, username);
    res.send(response);
});

async function getCommitLanguages(key, name, repo, owner) {
    function getOccurrence(array, value) {
        return array.filter((v) => v === value).length;
    }

    const { json } = await require('GET /repos/{repo}/{owner}/commits?author={name}&per_page=10', {
        headers: {
            authorization: { key }
        },
        name: { name },
        repo: { repo },
        owner: { owner }
    });
    var languages_ext = []; // ['.py', '.java', '.c']
    for (var i = 0; i < json.length; i++) {
        var lists = json[i];
        var sha = lists.sha;
        const { commits } = await require('GET /repos/{repo}/{owner}/commits/{sha}', {
            headers: {
                authorization: { key }
            },
            sha: { sha },
            repo: { repo },
            owner: { owner }
        });
        for (var i = 0; i < commits.files.length; i++) {
            var files = commits.files[i].filename;
            var types = files.split('.').pop();
            var languages = '.' + types;
            languages_ext.push(languages);
        }
    }
    let url = 'https://raw.githubusercontent.com/IonicaBizau/github-colors/master/lib/colors.json';

    fetch(url)
        .then((res) => res.json())
        .then((jsn) => {
            arr = [];
            duplicate = [];
            const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0); // Counts the no of times '.py' is in the file
            for (let i = 0; i < languages_ext.length; i++) {
                const languages_ext_element = languages_ext[i];
                key = Object.keys(jsn);
                for (let i = 0; i < key.length; i++) {
                    const name = key[i];
                    x = jsn[name];
                    if (x['extensions'] != undefined) {
                        // x['extensions'] give the extension list for each name
                        if (x['extensions'].includes(languages_ext_element)) {
                            //Checks if the element in languages_ext is present in x['extensions']
                            if (duplicate.includes(languages_ext_element)) {
                                //If present in duplicate list, do nothing
                            } else {
                                color = x['color'];
                                if (countOccurrences(languages_ext, languages_ext_element) > 1) {
                                    duplicate.push(languages_ext_element);
                                    arr.push({
                                        name: name,
                                        color: color,
                                        number: countOccurrences(
                                            languages_ext,
                                            languages_ext_element
                                        )
                                    }); //If no occurences of elements in languages_ext greater than 1, adds the element to duplicate and adds the no to the arr list
                                } else {
                                    arr.push({ name: name, color: color, number: 1 }); //If no occurences of elements in languages_ext is 1
                                }
                            }
                        }
                    }
                }
            }
            return arr;
        })
        .catch((err) => {
            throw err;
        });
}

router.get('languages/:key/:name/:owner/:repo', function (req, res) {
    var api_key = req.params.key;
    var username = req.params.name;
    var repo_name = req.params.repo;
    var ownername = req.params.owner;
    var response = getCommitLanguages(api_key, username, repo_name, ownername);
    res.send(response);
});

async function getCommits(key, owner, repo) {
    const { allCommits } = await require('GET /repos/{repo}/{owner}/stats/contributors', {
        headers: {
            authorization: { key }
        },
        repo: { repo },
        owner: { owner }
    });
}

async function getSkills(key, repo, owner) {
    const { data } = await require('GET /repos/{repo}/{owner}/commits/{sha}', {
        headers: {
            authorization: { key }
        },
        sha: { sha },
        repo: { repo },
        owner: { owner }
    });
    var descriptions = [];
    for (var x = 0; x < data.length; x++) {
        descriptions.push(data[x].description);
    }

    const toTitleCase = (str) => {
        return String(str)
            .toLowerCase()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    var frameworks = require('./utils/frameworks');

    var skills = [];
    for (var i = 0; i < descriptions.length; i++) {
        var desc = toTitleCase(descriptions[i]);
        for (var p = 0; p < frameworks.length; p++) {
            var result = desc.includes(frameworks[p]);
            if (result) {
                skills.push({
                    name: frameworks[i],
                    url: `https://www.rawgithubusercontent.com/ariv797/logos/logos/${frameworks[i]}.svg`
                });
            } else {
                continue;
            }
        }
    }
    let skills = [...new Set(skills.filter((n) => n))];

    return skills;
}

router.get('skills/:key/:owner/:repo', function (req, res) {
    var api_key = req.params.key;
    var repo_name = req.params.repo;
    var ownername = req.params.owner;
    var response = getSkills(api_key, repo_name, ownername);
    res.send(response);
});

//is:issue commenter:plouc repo:plouc/nivo This is for gettting the comments
//is:issue author:plouc repo:plouc/nivo This is for getting issues
//is:pr author:plouc repo:plouc/nivo This is for getting PRs
//is:commit author:plouc repo:plouc/nivo This is for getting commits
//is:issue assignee:plouc repo:plouc/nivo This is for getting assigned issues

function getRadar(repo, owner, user) {
    function getCommitCount(repo, owner, user) {
        commit_url = `https://github.com/search?q=is:commit%20author:${user}%20repo:${owner}/${repo}`;

        urllib.request(commit_url, function (_, data, _) {
            let x = data.toString();
            let y1 = x.search(
                'class="d-flex flex-column flex-md-row flex-justify-between border-bottom color-border-muted pb-3 position-relative"'
            );

            let y2 = x.search('<small class="f4 text-normal no-wrap"');

            let y3 = x.slice(y1 + 130, y2);
            let y4 = y3.search(' issues');
            return parseInt(y3.slice(0, y4));
        });
    }

    function getIssueCount(repo, owner, user) {
        commit_url = `https://github.com/search?q=is:issue%20author:${user}%20repo:${owner}/${repo}`;

        urllib.request(commit_url, function (_, data, _) {
            let x = data.toString();
            let y1 = x.search(
                'class="d-flex flex-column flex-md-row flex-justify-between border-bottom color-border-muted pb-3 position-relative"'
            );

            let y2 = x.search('<small class="f4 text-normal no-wrap"');

            let y3 = x.slice(y1 + 130, y2);
            let y4 = y3.search(' issues');
            return parseInt(y3.slice(0, y4));
        });
    }

    function getPullRequestsCount(repo, owner, user) {
        commit_url = `https://github.com/search?q=is:pr%20author:${user}%20repo:${owner}/${repo}`;

        urllib.request(commit_url, function (_, data, _) {
            let x = data.toString();
            let y1 = x.search(
                'class="d-flex flex-column flex-md-row flex-justify-between border-bottom color-border-muted pb-3 position-relative"'
            );

            let y2 = x.search('<small class="f4 text-normal no-wrap"');

            let y3 = x.slice(y1 + 130, y2);
            let y4 = y3.search(' issues');
            return parseInt(y3.slice(0, y4));
        });
    }

    function getCommitCount(repo, owner, user) {
        commit_url = `https://github.com/search?q=is:commit%20author:${user}%20repo:${owner}/${repo}`;

        urllib.request(commit_url, function (_, data, _) {
            let x = data.toString();
            let y1 = x.search(
                'class="d-flex flex-column flex-md-row flex-justify-between border-bottom color-border-muted pb-3 position-relative"'
            );

            let y2 = x.search('<small class="f4 text-normal no-wrap"');

            let y3 = x.slice(y1 + 130, y2);
            let y4 = y3.search(' issues');
            return parseInt(y3.slice(0, y4)); // TOSO
        });
    }
}
