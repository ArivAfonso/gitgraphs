import { Router } from 'express';
var router = Router();
import { graphql } from '@octokit/graphql';

function getProfile(key, name) {
    const { profile } = await graphql(
        `
            {
                repository(owner: "octokit", name: "graphql.js") {
                    issues(last: 100, states: CLOSED) {
                        nodes {
                            createdAt
                            comments(first: 1) {
                                nodes {
                                    createdAt
                                }
                            }
                        }
                    }
                    pullRequests(last: 100) {
                        nodes {
                            createdAt
                            comments(first: 1) {
                                nodes {
                                    createdAt
                                }
                            }
                        }
                    }
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
    var data = json.data.repository.issues.nodes;

    function convertMiliseconds(miliseconds, format) {
        var days, hours, minutes, seconds, total_hours, total_minutes, total_seconds;

        total_seconds = parseInt(Math.floor(miliseconds / 1000));
        total_minutes = parseInt(Math.floor(total_seconds / 60));
        total_hours = parseInt(Math.floor(total_minutes / 60));
        days = parseInt(Math.floor(total_hours / 24));

        seconds = parseInt(total_seconds % 60);
        minutes = parseInt(total_minutes % 60);
        hours = parseInt(total_hours % 24);

        switch (format) {
            case 's':
                return total_seconds;
            case 'm':
                return total_minutes;
            case 'h':
                return total_hours;
            case 'd':
                return days;
            default:
                return { d: days, h: hours, m: minutes, s: seconds };
        }
    }

    var responses = [];
    for (var i = 0; i < data.length; i++) {
        var created = data[i].createdAt;
        if (data[i].comments.nodes[0] == null) {
            continue;
        } else {
            var comment = data[i].comments.nodes[0].createdAt;
        }
        var difference = Math.abs(new Date(comment) - new Date(created));
        responses.push(difference);
    }

    const sum = responses.reduce((a, b) => a + b, 0);
    const avg = sum / responses.length || 0;

    if (convertMiliseconds(avg, 'd') >= 1) {
        return [{ number: convertMiliseconds(avg, 'd'), format: 'Days', data: [{ y: '67' }] }];
    } else if (convertMiliseconds(avg, 'h' >= 1)) {
        return [{ number: convertMiliseconds(avg, 'h'), format: 'Hours', data: [{ y: '80' }] }];
    } else if (convertMiliseconds(avg, 'm' >= 1)) {
        return [{ number: convertMiliseconds(avg, 'm'), format: 'Minutes', data: [{ y: '95' }] }];
    } else if (convertMiliseconds(avg, 'd' >= 60)) {
        var months = Math.round(convertMiliseconds(avg, 'd') / 30);
        return [{ number: months, format: 'Months', data: [{ y: '30' }] }];
    } else if (convertMiliseconds(avg, 'd' >= 730)) {
        var years = Math.round(convertMiliseconds(avg, 'd') / 365);
        return [{ number: years, format: 'Years', data: [{ y: '15' }] }];
    }
}
