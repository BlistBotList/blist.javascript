// Dependencies
const axios = require("axios")
const express = require("express")
const d = require("discord.js")
var bodyParser = require('body-parser')

//Vars
const url = "https://blist.xyz"

//CLient class
class Blist {

    //Construct
    constructor(client, key){
        if (!key) {
            console.log("Some functions might not be useable because you did not provide an API key.")
        } else {
            this.key = key
        }
        if (!client instanceof d.Client) {
            console.log("NONONO")
        } else {
            this.client = client
            try {
                console.log(`Authenticated bot ${client.user.username}`)
            } catch (error) {
                console.log("Could not authenticate client")
            }
        }
        this.autopost;
    }

    async fetchBot(id) {
        if (!id) {
            return console.log("Argument id is missing")
        }
        var o;
        await axios.get(`${url}/api/bot/${id}/stats/`).then((r) => {
            o = r["data"] 
        }).catch((e) => {
            if (e.response.status == 400) {
                console.error(`Could not find bot with ID: ${id}`)
            } else {
                return console.error(`Error while sending request: ${e}`)
            }
        })
        return o
    }
    async fetchUser(id) {
        if (!id) {
            return console.log("Argument id is missing")
        }
        var o;
        await  axios.get(`${url}/api/user/${id}/`).then((r) => {
            o = r["data"]
        }).catch((e) => {
            if (e.response.status == 400) {
                return console.error(`Could not find user with ID: ${id}`)
            } else {
                return console.error(`Error while sending request: ${e}`)
            }
        })
        return o; 
    }

    async fetchVotes() {
        var o;
        console.log(this.client.user.id)
        await axios.get(`${url}/api/bot/${this.client.user.id}/votes/`, {headers:{'Authorization':`${this.key}`}}).then((res) => {
            o = res["data"]
        }).catch((e) => {
            if (e.response.status == 403) {
                return console.error(`Client did not provide API key or API key is invalid.`)
            } else if (e.response.status == 404) {
                return console.error(`This bot is not on Blist.`)
            }else {
                return console.error(`Error while sending request: ${e.response.status}  `)
            }
        })

        return o
    }

    async postStats() {
        var shards;
        try {
            shards = this.client.shard.fetchClientValues('guilds.size').size
        } catch(e) {
            shards = 1
        }
        await axios.post(`${url}/api/bot/531057397272281089/stats/`, {server_count:this.client.guilds.cache.size,shard_count:shards}, {headers:{'Authorization':`${this.key}`}}).then((res) => {
            console.log("Posted stats succesfuly")
        }).catch((e) => {
            if (e.response.status == 403) {
                return console.error(`Client did not provide API key or API key is invalid.`)
            } else if (e.response.status == 404) {
                return console.error(`This bot is not on Blist.`)
            }else {
                return console.error(`Error while sending request: ${e.response.status}`)
            }
        })
    }

    async startAutopost(interval) {
        var i;
        if (!interval) {
            i = 1000 * 60 * 15
        } else {
            i = 1000 * 60 * interval
        }
        this.autopost = setInterval(() => {
           this.postStats() 
        }, i);
        console.log(`Autoposting bot stats every ${i / 60 / 1000} minutes.`)
    }

    async stopAutopost() {
        try {
            clearInterval(this.autopost)
            console.log("Stopped autoposting bot stats.")
        } catch (error) {
            console.log("Currently not autoposting.")
        }
    }

    startWebhook(p) {
        this.webhook = express()
        var port = p || 8000
        this.webhook.use(bodyParser.json())
        this.webhook.use(bodyParser.urlencoded({ extended: false }));

        this.webhook.post('/', (req, res) => {
            this.client.emit("bot_vote", req.body)
            res.end()
        })
        
        this.forclose = this.webhook.listen(port, "0.0.0.0", function(){
            console.log(`Listening on port ${port}`)
        })
        
    }
    
    stopWebhook(){
        try {
            this.forclose.close()
            delete this.forclose;
            console.log("Closed webhook")
        } catch (error) {
            console.log("No webhook running")
        }
    }
}

module.exports = Blist
module.exports.default = Blist