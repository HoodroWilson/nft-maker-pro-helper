const _ = require("lodash");

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
