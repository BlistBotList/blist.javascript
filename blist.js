// Dependencies
const axios = require("axios")
const express = require("express")
const discord = require("discord.js")
const url = "https://blist.xyz"

let bodyParser = require('body-parser')

class Blist {
    constructor(client, apiKey) {
        if (!apiKey) {
            console.warn("Some functions might not be useable because you did not provide an API key");
        } else {
            this.apiKey = apiKey;
        };

        if (!client instanceof discord.Client) {
            return console.error("The client argument must be a discord.Client");
        } else {
            this.client = client;
            try {
                console.log(`Authenticated bot ${client.user.username}`);
            } catch (error) {
                return console.log("Could not authenticate client");
            };
        };

        this.autopost;
    };

    async fetchBot(id) {
        if (!id) {
            return console.log("ID is a required argument");
        };

        let data;
        await axios.get(`${url}/api/bot/${id}/stats/`).then((resp) => {
            data = resp["data"];
        }).catch((error) => {
            if (error.response.status == 404) {
                return console.error(`A bot with ID: ${id} could not be found on Blist`);
            } else {
                return console.error(`There was an issue while sending a request: ${error}`);
            };
        });

        return data;
    }

    async fetchUser(id) {
        if (!id) {
            return console.log("ID is a required argument");
        };

        let data;
        await axios.get(`${url}/api/user/${id}/`).then((resp) => {
            data = resp["data"];
        }).catch((error) => {
            if (error.response.status == 404) {
                return console.error(`A user with ID: ${id} could not be found on Blist`);
            } else {
                return console.error(`There was an issue while sending a request: ${error}`);
            };
        });

        return data;
    };

    async fetchVotes(id) {
        if (!this.apiKey) {
            return console.log("An API key is required to use this method");
        };

        let botId;
        if (id) {
            botId = id;
        } else {
            botId = this.client.user.id;
        };

        let data;
        await axios.get(`${url}/api/bot/${botId}/votes/`, { headers: { 'Authorization': `${this.apiKey}` } }).then((res) => {
            data = res["data"];
        }).catch((error) => {
            if (error.response.status == 403) {
                return console.error(`API key does not match bot API key.`);
            } else if (error.response.status == 404) {
                return console.error(`A bot with ID: ${id} could not be found on Blist`);
            } else {
                return console.error(`There was an issue while sending a request: ${error}`);
            };
        });

        return data;
    };

    async postStats() {
        if (!this.apiKey) {
            return console.log("An API key is required to use this method");
        };

        let shards;
        try {
            shards = this.client.shard.fetchClientValues('guilds.size').size;
        } catch (error) {
            shards = 0;
        };

        await axios.post(`${url}/api/bot/${this.client.user.id}/stats/`, { server_count: this.client.guilds.cache.size, shard_count: shards }, { headers: { 'Authorization': `${this.apiKey}` } }).then((res) => {
            return console.log("Succesfully posted stats");
        }).catch((error) => {
            if (error.response.status == 403) {
                return console.error(`API key does not match bot API key.`);
            } else if (error.response.status == 404) {
                return console.error(`A bot with ID: ${id} could not be found on Blist`);
            } else {
                return console.error(`There was an issue while sending a request: ${error}`);
            };
        });
    };

    async startAutopost(interval) {
        if (this.autopost) {
            return console.log("Autopost is already running")
        };

        let i;
        if (!interval) {
            i = 1000 * 60 * 15;
        } else {
            i = 1000 * 60 * interval;
        };

        this.autopost = setInterval(() => {
            this.postStats();
        }, i);
    };

    async stopAutopost() {
        try {
            clearInterval(this.autopost);
            return console.log("Autoposting of bot stats has stopped");
        } catch (error) {
            return console.log("Autoposting of bot stats was never initiated");
        };
    };

    startWebhook(p) {
        this.webhook = express();
        let port = p || 8000;
        this.webhook.use(bodyParser.json());
        this.webhook.use(bodyParser.urlencoded({ extended: false }));

        this.webhook.post('/', (req, res) => {
            this.client.emit("botVote", req.body);
            res.end();
        });

        this.forclose = this.webhook.listen(port, "0.0.0.0", function () {
            console.log(`Listening on port ${port}`);
        });
    };

    stopWebhook() {
        try {
            this.forclose.close();
            delete this.forclose;
            console.log("Closed webhook");
        } catch (error) {
            console.log("No webhook running");
        };
    };
};

module.exports = Blist
module.exports.default = Blist