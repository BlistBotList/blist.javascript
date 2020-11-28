const {get, post} = require("superagent"),
      express = require("express"),
      {name, version} = require("../package.json"),
      err = `[${name}, v${version}]:`

module.exports = class Blist {
    constructor(client, key){
        if(!client) throw new Error(`${err} You don't have a client in the new constructor.`);
        if(!client.user) throw new Error(`${err} The client you provided doesn't have a ".user" property`);
        if(!key || typeof key !== "string") throw new Error(`${err} You didn't provide an API key or the API key provided isn't a string.`);
        this.base = "https://blist.xyz";

        this.key = key;
        this.client = client;
        this.interval = null;
        this.server = null;
    };
    /**
     * @returns {string}
     */
    get version(){
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
    async hasVoted(ids){
        let res = await this.fetchVotes().catch(() => null);
        if(!res) return Array.isArray(ids) ? [] : false;
        let voters = (res.votes || []).map(c => c.userid);
        if(Array.isArray(ids)){
            if(voters.length === 0) return [];
            return voters.filter(c => ids.includes(c));
        }else{
            return voters.includes(ids);
        }
    };

    async fetchVotes(){
        return await this._get(`${this.base}/api/bot/${this.client.user.id}/votes`)
    };

    /**
     * @param {string} [id] - The user's ID 
     */
    async fetchUser(id){
        if(!id) throw new Error(`${err} You didn't provide a user ID`);
        return await this._get(`${this.base}/api/user/${id}`)
    }; 
    /**
     * @param {string} [id] - The bot's user ID 
     */
    async fetchBot(id){
        if(!id) throw new Error(`${err} You didn't provide a bot ID`);
        return await this._get(`${this.base}/api/bot/${id}/stats`)
    };


    async postStats(servers = null, shards = null){ 
        if(this.client.shard) shards = this.client.shard.fetchClientValues('guilds.size').size;

        return await post(`${this.base}/api/bot/${this.client.user.id}/stats`)
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
    startAutopost(minutes = 30){ // Post every 30 minutes, by default.
        if(this.interval) throw new Error(`${err} The auto posting is already running.`)
        if(isNaN(minutes)) throw new Error(`${err} You didn't provide a valid number of minutes, it has to be a number.`);
        this.interval = setInterval(() => this.postStats(), minutes * 60000);
        return this;
    };
    /**
     * @returns {boolean}
     */
    stopAutopost(){
        if(!this.interval) return false;
        clearInterval(this.interval);
        return true;
    };
    /**
     * @param {number} [port=8000]
     * @param {?string} [name="upvote"]
     */
    startWebhook(port = 8000, opt = {endpoint: "", emit: "botVote"}){
        const app = express();
        app
        .use(express.json())
        .use(express.urlencoded({extended: false}))
        .post(`/${opt.endpoint}`, (req, res) => {
            console.log(req.headers, this.key)
            if(req.headers["authorization"] !== this.key) return res.status(401).end();
            this.client.emit(opt.emit, req.body);
            return res.status(200).end();
        })
        this.server = app.listen(port, () => console.log(`${err} Webhook server started, listening on port: ${port}`));
        return this;
    };
    stopWebhook(){
        if(!this.server) throw new Error(`${err} The webhook server isn't running.`);
        this.server.close(err => {
            if(!err) return null;
            throw new Error(`${err} ${err}`)
        });
        this.server = null;
        return this;
    };

    // Helper Method 
    async _get(url){
        return await get(url).set("Authorization", this.key).then(r => r.body);
    }
}
