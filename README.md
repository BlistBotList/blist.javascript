# blist.js

## Getting Started

This is the documentation for the javascript wrapper for the Blist API. This documentation includes all information about installing and using the wrapper. This API requires your bot to be using [discord.js](https://discord.js.org/). 

## Installing

To install the API wrapper follow these steps:
1. Open a command prompt in your bot's directory, or create a new directory and run `npm init`
2. Run `npm i --save blist.js`. This will install the dependency and add it to your dependency list. (Or run `npm i blist.js`, not recommended)
3. Blist.js should now be succesfuly installed.

## Creating a new instance

To create a new instance for the wrapper, we must first import the module.
Once we imported our module, we can create a new instance by doing this

```js
// Common JS import
const blist = require("blist.js");

// ES6 Import
import blist from "blist.js";

//Create a new blist instance
const client = new blist(bot, apikey)
```

## Listen for votes using a webhook
 
If you want to handle your bot votes, you can do so by starting a webhook. 

```js
//Create a new blist instance
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

//Login your bot
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

Fetch the votes for your bot, this requires an instance started with a bot instance and API key
