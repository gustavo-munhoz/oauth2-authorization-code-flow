const express = require('express')
const session = require('express-session')
const axios = require('axios')
const dotenv = require('dotenv')

// configure environment variable access
dotenv.config()

// configure express and port
const app = express()
const port = process.env.PORT || 3000

// configure session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// route to access to redirect to facebook login page
app.get('/auth/facebook', (req, res) => {
    const authorizationUrl = "https://www.facebook.com/v16.0/dialog/oauth";
    const state = Math.random().toString(36).substring(2);

    const queryParams = [
        `client_id=${process.env.FACEBOOK_APP_ID}`,
        `redirect_uri=http://localhost:${port}/auth/facebook/callback`,
        'response_type=code',
        'scope=email,public_profile',
        `state=${state}`
    ]

    res.redirect(`${authorizationUrl}?${queryParams.join('&')}`);
});

// route to change Authorization Code with Access Token
// code + id + secret used to get access token, which is stored in express-session req.session
app.get('/auth/facebook/callback', async (req, res) => {
    const accessTokenUrl = 'https://graph.facebook.com/v16.0/oauth/access_token';
    const queryParams = [
        `client_id=${process.env.FACEBOOK_APP_ID}`,
        `client_secret=${process.env.FACEBOOK_APP_SECRET}`,
        `redirect_uri=http://localhost:${port}/auth/facebook/callback`,
        `code=${req.query.code}`
    ];

    try {
        const response = await axios.get(`${accessTokenUrl}?${queryParams.join('&')}`);
        const accessToken = response.data.access_token;
        req.session.access_token = accessToken;
        res.send(`Obtained access token: ${accessToken}.`);
    } catch (error) {
        res.status(500).send('Error while obtaining access token.');
    }
});

// route to get profile information: name, email and picture sent as JSON in response
app.get('/profile', async (req, res) => {
    if (req.session && req.session.access_token) {
        try {
            const response = await axios.get(
            `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${req.session.access_token}`);
            const userProfile = response.data;
            res.json(userProfile);
        } catch (error) {
            res.status(500).send('Error getting profile data.');
        }
    } else {
        res.status(401).send('User is not authenticated.');
    }
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});