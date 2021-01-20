const { get, patch } = require("superagent"),
    express = require("express"),
    { name, version } = require("../package.json"),
    err = `[${name}, v${version}]:`;

module.exports = class Blist {
    constructor(client, key) {
        if (!client) throw new Error(`${err} You don't have a client in the new constructor.`);
        if (!key || typeof key !== "string") throw new Error(`${err} You didn't provide an API key or the API key provided isn't a string.`);
        this.base = "https://blist.xyz";

        this.key = key;
        this.client = client;
        this.interval = null;
        this.server = null;
    };
    /**
     * @returns {string}
     */
    get version() {
        return version;
    };
    /**
     * @description Check if someone has voted!, if you provide an array of ids then this will provide the array of ids that have voted in the last 24 hours.
     * @param {string|string[]} ids
     * @returns {Promise<Boolean|string[]>} 
     * @example 
     * 
     * // -- 1 user 
     * let voted = await blist.hasVoted("USER_ID");
     * console.log(voted) // Returns boolean;
     * 
     * // -- multiple users
     * let voted = await blist.hasVoted(["USER_ID", "USER_ID_2", "USER_ID_3"]);
     * console.log(voted); // Returns user ids of users that have voted in the last 24 hours.
    
     */
    async hasVoted(ids) {
        let res = await this.fetchVotes().catch(() => null);
        if (!res) return Array.isArray(ids) ? [] : false;
        let voters = (res.votes || []).map(c => c.userid);
        if (Array.isArray(ids)) {
            if (voters.length === 0) return [];
            return voters.filter(c => ids.includes(c));
        } else {
            return voters.includes(ids);
        }
    };
    /**
     * @typedef {Object} Reviews
     * @property {string} [feedback] - The feedback given by a user.
     * @property {boolean} [recommended] - If the user marked it as recommended.
     * @property {string} [time] - When the user left the review.
     */
    /**
     * @typedef {Object} ReviewResponse
     * @property {Reviews[]} [reviews] - The array of the reviews given.
     */
    /**
     * @returns {Promise<ReviewResponse>}
     */
    async fetchReviews() {
        if(!this.client.user) throw new Error(`${err} There is no client user attached to the "client" property.\nMake sure the client is connected before using this endpoint.`)
        return await this._get(`${this.base}/api/v2/bot/${this.client.user.id}/reviews`)
    }

    async fetchVotes() {
        if(!this.client.user) throw new Error(`${err} There is no client user attached to the "client" property.\nMake sure the client is connected before using this endpoint.`)
        return await this._get(`${this.base}/api/v2/bot/${this.client.user.id}/votes`)
    };

    /**
     * @param {string} [id] - The user's ID 
     */
    async fetchUser(id) {
        if (!id) throw new Error(`${err} You didn't provide a user ID`);
        return await this._get(`${this.base}/api/v2/user/${id}`)
    };
    /**
     * @param {string} [id] - The bot's user ID 
     */
    async fetchBot(id) {
        if (!id) throw new Error(`${err} You didn't provide a bot ID`);
        return await this._get(`${this.base}/api/v2/bot/${id}/`)
    };


    async postStats(servers = null, shards = null) {
        if (!this.client.user) throw new Error(`${err} There is no client user attached to the "client" property.\nMake sure the client is connected before using this endpoint.`)
        if (this.client.shard) shards = this.client.shard.fetchClientValues('guilds.size').size;

        return await patch(`${this.base}/api/v2/bot/${this.client.user.id}/stats`)
            .set("Authorization", this.key)
            .send({
                "server_count": servers ? servers : this.client.guilds.cache ? this.client.guilds.cache.size : this.client.guilds.size,
                "shard_count": shards ? shards : 1
            })
            .then(r => r.body)
            .catch((err) => err);
    };
    /**
     * @param {number} [minutes=30] - The number of minutes before posting the stats to the site again. 
     */
    async startAutopost(minutes = 30) { // Post every 30 minutes, by default.
        if (this.interval) throw new Error(`${err} The auto posting is already running.`)
        if (isNaN(minutes)) throw new Error(`${err} You didn't provide a valid number of minutes, it has to be a number.`);
        this.interval = setInterval(() => this.postStats(), minutes * 60000);
        return this;
    };
    /**
     * @returns {boolean}
     */
    async stopAutopost() {
        if (!this.interval) return false;
        clearInterval(this.interval);
        return true;
    };
    /**
    * @typedef {Object} WebhookOptions
    * @property {string} [endpoint=""]
    * @property {string} [emit="botVote"]
    */
    /**
     * @param {number} [port=8000]
     * @param {WebhookOptions} [opt]
     */
    startWebhook(port = 8000, opt = { endpoint: "", emit: "botVote" }) {
        console.log(`${err} [DEPRECATED]: startWebhook is no longer working, due to the removal of the voting webhook on blist.xyz`);
        const app = express();
        app
            .use(express.json())
            .use(express.urlencoded({ extended: false }))
            .post(`/${opt.endpoint}`, (req, res) => {
                console.log(req.headers, this.key)
                if (req.headers["authorization"] !== this.key) return res.status(401).end();
                this.client.emit(opt.emit, req.body);
                return res.status(200).end();
            })
        this.server = app.listen(port, () => console.log(`${err} Webhook server started, listening on port: ${port}`));
        return this;
    };
    stopWebhook() {
      console.log(`${err} [DEPRECATED]: stopWebhook is no longer working, due to the removal of the voting webhook on blist.xyz`);
        if (!this.server) throw new Error(`${err} The webhook server isn't running.`);
        this.server.close(err => {
            if (!err) return null;
            throw new Error(`${err} ${err}`)
        });
        this.server = null;
        return this;
    };

    // Helper Method 
    async _get(url) {
        return await get(url).set("Authorization", this.key).then(r => r.body);
    }
}
