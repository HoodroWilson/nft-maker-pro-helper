const _ = require("lodash");
const axios = require("axios");
const fs = require("fs");
const path = require('path');
const helper = require("../utilities/helper");
require("dotenv").config({ path :__dirname + '/../.env' });

// Setup API calls to NFT-MAKER PRO
const NFTMAKERPROAPI = axios.create({ baseURL: "https://api.nft-maker.io/" });

// Process the command line argument for the configuration to use
const config = JSON.parse(fs.readFileSync('../configuration/' + path.basename(__filename).split(".")[0] + "/" + process.argv.slice(2)[0] + '.json'));

// Wrap the execution in an async function so we can use await
const app = async () => {
    // Set up variables to track the progress/summarize of the execution
    let track = {
        processed: 0,
        uploaded: 0,
        error: 0
    };

    // Name the loop so we can break from it if we need to
    nftLoop:
        for(let nftNumber = 0; nftNumber < config.length; nftNumber++) {
            let NFT = config[nftNumber];

            // Don't attempt to create this NFT if it's disabled in the configuration file, if it's not set then try to create it
            if(NFT.config_enabled == null || NFT.config_enabled) {
                console.log("processing the NFTs for " + NFT.asset_name);
                for(let mintNumber = 1; mintNumber <= NFT.quantity; mintNumber++) {
                    // Setup the NFT's data
                    let assetName = NFT.asset_name + _.padStart(mintNumber + "", NFT.quantity.toString().length, "0");
                    let body = {
                        assetName: assetName,
                        previewImageNft: {
                            name: NFT.asset_name,
                            mimetype: NFT.config_nft_mime_type,
                            fileFromsUrl: NFT.config_nft_url
                        }
                    };

                    // Make the API call to upload the NFT's data
                    console.log("processing " + assetName);
                    let uploadNftUrl = "/UploadNft/" + process.env.NFT_MAKER_PRO_API_KEY + "/" + NFT.config_nft_maker_project_id;
                    let alreadyExists = false;
                    let uploadNftResponse = await NFTMAKERPROAPI.post(uploadNftUrl, body).catch(function (error) {
                        if(error.response && error.response.data && error.response.data.errorCode === 66) {
                            alreadyExists = true;
                        } else {
                            console.error("error with uploading " + assetName);
                            console.error(body);
                            console.error(body.previewImageNft.metadataPlaceholder);
                            if(error.response) {
                                console.error(error.response.data);
                                console.error(error.response.status);
                            }
                        }
                    });

                    // Interpret the response from the API call
                    if(uploadNftResponse != null && uploadNftResponse.status === 200) {
                        track.uploaded++;
                        track.processed++;
                        console.log("processed " + assetName + " - " + JSON.stringify(track));
                    } else if(alreadyExists) {
                        track.processed++;
                        console.log("processed " + assetName + " and it already exists - " + JSON.stringify(track));
                    } else {
                        console.error("error processing " + assetName);
                        if(uploadNftResponse != null) {
                            console.error(uploadNftResponse.data);
                            console.error(uploadNftResponse.status);
                        }

                        // Retry the same NFT when it loops again
                        mintNumber--;

                        track.error++;
                        if(track.error > 10) {
                            console.error("too many errors, stopping");
                            break nftLoop;
                        } else {
                            console.log("going to sleep and then trying again - "  + JSON.stringify(track));
                            await helper.sleep(15000);
                        }
                    }

                    await helper.sleep(200);
                }
            } else {
                console.log("skipping the NFTs for " + NFT.asset_name);
            }
        }

    console.log("finished - "  + JSON.stringify(track));
};

app();
