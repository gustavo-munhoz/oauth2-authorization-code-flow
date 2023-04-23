**_-------- HOW TO USE --------_**

First, install all dependencies:

`npm i axios dotenv express express-session`

Then, create a `.env` file that contains the following information:
```
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
SESSION_SECRET=your-session-secret
```
Finally, run the API (the default port is 3000):

`node api.js`

Now, access `http://localhost:3000` to view all features.