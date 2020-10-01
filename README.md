# blist.js

## Getting Started

This is the documentation for the Javascript wrapper for the Blist API. This documentation includes all information about installing and using the wrapper. This API requires your bot to be using [discord.js](https://discord.js.org/). 

## Installing

To install the API wrapper, follow these steps:
1. Open a command prompt in your bot's directory, or create a new directory and run `npm init`.
2. Run `npm i --save blist.js`. This will install the dependency and add it to your dependency list (or run `npm i blist.js`, though this is not recommended).
3. Blist.js should now be successfully installed.

## Creating a new instance

To create a new instance for the wrapper, we must first import the module. Once we imported the module, we can create a new instance. See the code example below.

```js
// Common JS import
const blist = require("blist.js");

// ES6 Import
import blist from "blist.js";

// Create a new blist instance
const client = new blist(bot, apikey)
```

## Listen for votes using a webhook
 
If you want to handle your bot votes, you can do so by creating a webhook. 

```js
// Create a new blist instance
const client = new blist(bot, apikey)
const bot = new discordjs.Client()

bot.on("ready" => {
  // Start a new webhook on port 4000, default port is 8000
  client.startWebhook(4000)
  
  // Stop your webhook
  client.stopWebhook()
})

// Detects when someone votes for your bot
bot.on("bot_vote", (vote) => {
    console.log(vote)
})

// Login your bot
bot.login(token)
```

## Fetch user and bot stats

To fetch information and statistics about a user or a bot, you can use the following functions.

```js
// Fetch bot stats
client.fetchBot(id).then((bot) => {
 console.log(bot)
})

// Fetch user stats
client.fetchUser(id).then((user) => {
 console.log(user)
})
```

## Fetch bot votes

To fetch the votes for your bot, this requires initializing a bot instance with an API key.

```js
// Fetch bot votes, id is not required if discord.js bot client is provided on client creation
client.fetchVotes(id).then((votes) => {
  console.log(votes)
})
```

## Post bot stats

Posting bot stats requires you to provide a discord.js client instance and an API key on client creation.

```js
// Post bot stats
client.postStats().then(() => {
  console.log("Posted stats succesfully!")
})
```

## Autoposting bot stats

Automatically post bot stats. Requires you to provide a discord.js client instance and an API key on client creation.

```js
// Start autoposting; the interval is in minutes
client.startAutopost(15).then(() => {
  console.log("Now posting stats")
})

client.stopAutopost().then(() => {
  console.log("Stopped autoposting stats")
})
```