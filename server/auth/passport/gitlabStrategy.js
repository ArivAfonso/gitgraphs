import GitlabStrategy from "passport-gitlab2";
import passport from "passport";
import User from "../db/models/user"

passport.use(new GitlabStrategy({
    clientID: GITLAB_APP_ID,
    clientSecret: GITLAB_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/gitlab/callback"
},
function(token, tokenSecret, profile, done) {
    // testing
    console.log('===== gitlab PROFILE =======')
    console.log(profile)
    console.log('======== END ===========')
    // code
    const { id, name, photos } = profile
    User.findOne({ 'gitlab.gitlabId': id }, (err, userMatch) => {
        // handle errors here:
        if (err) {
            console.log('Error!! trying to find user with gitlabId')
            console.log(err)
            return done(null, false)
        }
        // if there is already someone with that gitlabId
        if (userMatch) {
            return done(null, userMatch)
        } else {
            // if no user in our db, create a new user with that gitlabId
            console.log('====== PRE SAVE =======')
            console.log(id)
            console.log(profile)
            console.log('====== post save ....')
            const newGitlabUser = new User({
                'gitlab.gitlabId': id,
                firstName: name.givenName,
                lastName: name.familyName,
                email: name.email
            })
            // save this user
            newGitlabUser.save((err, savedUser) => {
                if (err) {
                    console.log('Error!! saving the new gitlab user')
                    console.log(err)
                    return done(null, false)
                } else {
                    return done(null, savedUser)
                }
            })
        }
    }) 
}
),

module.exports = strategy)
