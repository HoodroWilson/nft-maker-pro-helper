const _ = require("lodash");
const helper = require("../utilities/helper");

// Setup API calls to NFT-MAKER PRO
const NFTMAKERPROAPI = helper.getNFTMAKERPROAPI();

// Process the command line argument for the configuration to use
const config = helper.getConfig(__filename);

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
            if(NFT.enabled == null || NFT.enabled) {
                console.log("processing the NFTs for " + NFT.asset_name);
                let startingNumber = (NFT.startingNumber != null) ? NFT.startingNumber : 1;
                for(let mintNumber = startingNumber; mintNumber <= NFT.quantity; mintNumber++) {
                    // Setup the NFT's data
                    let padding = _.padStart(mintNumber + "", NFT.quantity.toString().length, "0");
                    let assetName = NFT.asset_name + padding;
                    let body = {
                        assetName: assetName,
                        previewImageNft: {
                            name: NFT.asset_name,
                            mimetype: NFT.file.mime_type,
                            fileFromsUrl: _.replace(NFT.file.url, "$", padding)
                        }
                    };

                    // Setup any custom metadata
                    if(NFT.metadata != null) {
                        let customMetadata = _.cloneDeep(NFT.metadata);
                        if(NFT.metadata_format != null) {
                            _.forOwn(NFT.metadata_format, function(value, key) {
                                customMetadata[key] = helper.formatMetadataValue(value, NFT.metadata[key].toString(), mintNumber, NFT.quantity);
                            });
                        }
                        body.previewImageNft.metadataPlaceholder = helper.formatMetadata(customMetadata);
                    }

                    // Setup any subfiles
                    if(NFT.subfiles != null) {
                        body.subfiles = [];
                        for(let subfileNumber = 0; subfileNumber < NFT.subfiles.length; subfileNumber++) {
                            let subfile = NFT.subfiles[subfileNumber];
                            let subfileData = {
                                name: NFT.asset_name,
                                mimetype: subfile.mime_type,
                                fileFromsUrl: _.replace(subfile.url, "$", padding)
                            };
                            if(body.previewImageNft.metadataPlaceholder != null) {
                                subfileData.metadataPlaceholder = body.previewImageNft.metadataPlaceholder;
                            }
                            body.subfiles.push(subfileData);
                        }
                    }

                    // Make the API call to upload the NFT's data
                    console.log("processing " + assetName);
                    let uploadNftUrl = "/UploadNft/" + process.env.NFT_MAKER_PRO_API_KEY + "/" + NFT.nft_maker_project_id;
                    let alreadyExists = false;
                    let uploadNftResponse = null;

                    if(NFT.dryRun) {
                        // If it's a dry run then fake a success response and log the body
                        uploadNftResponse = {
                            status: 200
                        };
                        let bodyCopy = body;
                        console.log(bodyCopy.previewImageNft.metadataPlaceholder);
                        delete bodyCopy.previewImageNft.metadataPlaceholder;
                        console.log(bodyCopy.previewImageNft);
                        delete bodyCopy.previewImageNft;
                        console.log(bodyCopy);
                    } else {
                        uploadNftResponse = await NFTMAKERPROAPI.post(uploadNftUrl, body).catch(function(error) {
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
                    }

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

                    if(NFT.limitedQuantity != null && track.processed >= NFT.limitedQuantity) {
                        console.log("intentionally stopping early after " + NFT.limitedQuantity);
                        break;
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
