# blist.js

## Getting Started

This is the documentation for the JavaScript wrapper for the Blist API. This documentation includes all information about installing and using the wrapper. This API requires your bot to be using [discord.js](https://discord.js.org) and a `Discord.Client()` instance.

## Installing

To install the API wrapper, follow these simple steps:
1. Open a command prompt in your bot's directory, or create a new directory and run `npm init`.
2. Run `npm i blist.javascript`. This will install the dependency and add it to your dependency list.
3. blist.js should now be successfully installed.

## Creating a new instance

To create a new instance for the wrapper, we must first import the module. Once we imported the module, we can create a new instance. See the code example below. An API key is optional, but is required for multiple functions.

```js
// Import the blist.js package
const blist = require("blist.javascript");

// Create a new blist instance
const client = new blist(bot, apiKey);
```

## Listen for votes using a webhook
 
If you want to handle your bot votes, you can do so by creating a webhook. 

```js
// Create a new blist instance
const client = new blist(bot, apiKey);
const bot = new discordjs.Client();

bot.on("ready" => {
  // Start a new webhook on port 4000, default port is 8000
  client.startWebhook(4000);
  // Optional 
  // client.startWebhook(PORT, {emit: "NAME", endpoint: "NAME"})
  // bot.on("emit_name")
  // http://URL:PORT/ENDPOINT_NAME
  
  // Stop your webhook
  client.stopWebhook();
});

// Detects when someone votes for your bot
bot.on("botVote", (vote) => console.log(vote));

// Login your bot
bot.login(token);
```

## Fetch user and bot stats

To fetch information and statistics about a user or a bot, you can use the following functions.

```js
// Fetch bot stats
client.fetchBot(id).then((bot) => console.log(bot));

// Fetch user stats
client.fetchUser(id).then((user) => console.log(user));
```

## Fetch bot votes

To fetch the votes for your bot, this requires initializing a bot instance with an API key.

```js
// Fetch bot votes, id is not required if discord.js bot client is provided on client creation
client.fetchVotes().then((votes) => console.log(votes));
```
## Fetch bot reviews

Fetch the `Discord.Client()`'s bot reviews!

```js
// Returns: {reviews: [Review_Objects]}
client.fetchReviews().then((reviews) => console.log(reviews));
```


## Check user(s) votes
To check if certain user(s) have voted, use this method!
```js
// 1 user
client.hasVoted("USER_ID").then(v => console.log(v))
// Returns boolean

// multiple users
client.hasVoted(["USER_ID", "USER_ID", "USER_ID", "..ETC"]).then(ids => console.log(ids));
// Returns an array of user ids that have voted.
```

## Post bot stats

Posting bot stats requires you to provide an API key on client creation.

```js
// Post bot stats, default
client.postStats().then(() => console.log("Posted stats succesfully!"));

// Provide the server_count and shards_count yourself. 
client.postStats(server_count, shards_count).then(() => console.log(`Posted stats successfully!`));
```


## Autoposting bot stats

Automatically post bot stats. Requires you to provide an API key on client creation.

```js
// Start autoposting; the interval is in minutes
client.startAutopost(30).then(() => console.log("Now posting stats"));

client.stopAutopost().then(() => console.log("Stopped autoposting stats"));
```
