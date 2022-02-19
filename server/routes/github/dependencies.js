var express = require('express');
var router = express.Router();
const { graphql } = require('@octokit/graphql');

function getDependencies(key, owner, repo) {
    const { data } = await graphql(
        `
            {
                repository(owner: $owner, name: $repo) {
                    dependencyGraphManifests {
                        edges {
                            node {
                                dependencies {
                                    nodes {
                                        packageName
                                        packageManager
                                        repository {
                                            name
                                            owner {
                                                login
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
            headers: {
                authorization: key
            }
        }
    );

    var edges = data.data.repository.dependencyGraphManifests.edges;

    var packages = [];
    for (var i = 0; i < edges.length; i++) {
        var nodes = edges[i].node.dependencies.nodes;
        for (var x = 0; x < nodes.length; x++) {
            //var repo = nodes[x].repository.name
            if (nodes[x].repository === null) {
            } else {
                var name = nodes[x].packageName;
                var owner = nodes[x].repository.owner.login;
                var repo = nodes[x].repository.name;
                var manager = nodes[x].packageManager;
            }
            packages.push({ name: name, owner: owner, repo: repo, manager: manager });
        }

        //var repo = edges[i].node.dependencies.nodes[i].repository.name;
        //var owner = edges[i].node.dependencies.nodes[i].repository.owner.login;
    }

    var all_packages = packages.filter(
        (value, index, self) => index === self.findIndex((t) => t.name === value.name)
    );

    var newArray = [];
    all_packages.forEach(function (item, index) {
        //var repo_query = `
        //repo${index}: repository(name: "${item.repo}", owner: "${item.owner}") {
        //...UserFragment
        //}`;
        //request = request + repo_query;
        const { dependencies } = graphql(
            `
                {
                    repository(owner: $owner, name: $name) {
                        dependencyGraphManifests {
                            edges {
                                node {
                                    dependencies {
                                        nodes {
                                            packageName
                                            packageManager
                                            repository {
                                                name
                                                owner {
                                                    login
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
                owner: item.owner,
                name: item.repo,
                headers: {
                    authorization: key
                }
            }
        );

        var dependency_edges = dependencies.data.repository.dependencyGraphManifests.edges;
        for (var i = 0; i < dependency_edges.length; i++) {
            var dependency_nodes = dependency_edges[i].node.dependencies.nodes;
            for (var x = 0; x < nodes.length; x++) {
                if (nodes[x].repository === null) {
                } else {
                    var dependency_name = dependency_nodes[x].packageName;
                    var dependency_owner = dependency_nodes[x].repository.owner.login;
                    var dependency_repo = dependency_nodes[x].repository.name;
                    var dependency_manager = dependency_nodes[x].packageManager;
                }
                var dependency = {
                    name: dependency_name,
                    owner: dependency_owner,
                    repo: dependency_repo,
                    manager: dependency_manager
                };
            }
            newArray.push({
                repo: item.repo,
                owner: item.owner,
                name: item.name,
                dependencies: [dependency]
            });
        }
    });

    // THIS IS HOW NEW_ARRAY LOOKS
    [
        {
            name: 'prettier',
            owner: 'prettier',
            packageManager: 'NPM',
            dependencies: [
                {
                    name: 'react',
                    owner: 'react',
                    packageManager: 'NPM'
                }
            ]
        }
    ];
}
