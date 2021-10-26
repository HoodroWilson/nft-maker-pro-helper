const _ = require("lodash");
const axios = require("axios");
const fs = require("fs");
const path = require('path');
require("dotenv").config({ path :__dirname + '/../.env' });

/****************************************
 Sleep
 Waits around for a certain number of milliseconds using a Promise (use async/await)
 ****************************************/
module.exports.sleep = (millis) => {
    return new Promise(resolve => setTimeout(resolve, millis));
};

/****************************************
 Format Metadata
 Takes an object of key/value pairs and specifically structures the metadata in the correct format for NFT-MAKER PRO
 ****************************************/
module.exports.formatMetadata = (data) => {
    let meta = [];
    _.forOwn(data, (value, key) => {
        meta.push({
            name: key,
            value: value
        });
    });
    return meta;
};

/****************************************
 Format Edition
 Returns a string based on a format, number and total to make the "edition" type metadata values (ex: 14 of 100)
 ****************************************/
module.exports.formatEdition = (format, number, total) => {
    return _.replace(format, "$$", total).replace("$", number);
};

/****************************************
 Get NFT-MAKER PRO API
 Returns an initialized axios instance to use to make API calls
 ****************************************/
module.exports.getNFTMAKERPROAPI = () => {
    return axios.create({ baseURL: "https://api.nft-maker.io/" });
};

/****************************************
 Get Config
 Returns the JSON object for the configuration based on the command line argument
 ****************************************/
module.exports.getConfig = (filename) => {
    return JSON.parse(fs.readFileSync('../configuration/' + path.basename(filename).split(".")[0] + "/" + process.argv.slice(2)[0] + '.json'));
};
