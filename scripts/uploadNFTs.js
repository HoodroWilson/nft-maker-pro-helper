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
                for(let mintNumber = 1; mintNumber <= NFT.quantity; mintNumber++) {
                    // Setup the NFT's data
                    let assetName = NFT.asset_name + _.padStart(mintNumber + "", NFT.quantity.toString().length, "0");
                    let body = {
                        assetName: assetName,
                        previewImageNft: {
                            name: NFT.asset_name,
                            mimetype: NFT.file.mime_type,
                            fileFromsUrl: NFT.file.url
                        }
                    };

                    // Setup any subfiles
                    if(NFT.subfiles != null) {
                        body.subfiles = [];
                        for(let subfileNumber = 0; subfileNumber < NFT.subfiles.length; subfileNumber++) {
                            let subfile = NFT.subfiles[subfileNumber];
                            body.subfiles.push({
                                name: NFT.asset_name,
                                mimetype: subfile.mime_type,
                                fileFromsUrl: subfile.url,
                            });
                        }
                    }

                    // Make the API call to upload the NFT's data
                    console.log("processing " + assetName);
                    let uploadNftUrl = "/UploadNft/" + process.env.NFT_MAKER_PRO_API_KEY + "/" + NFT.nft_maker_project_id;
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
