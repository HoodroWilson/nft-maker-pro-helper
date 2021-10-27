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

/****************************************
 Format Metadata Value
 Returns the value after it's been through any one of the supported formats
 Supported formats: edition (format: $ of $$, result: 14 of 250, key: $ is NFT unique number, $$ is the total number of NFTs)
 ****************************************/
module.exports.formatMetadataValue = (formatName, format, current, total) => {
    if(formatName === "edition") {
        return _.replace(_.replace(format, "$$", total), "$", current);
    }

    return current;
};
