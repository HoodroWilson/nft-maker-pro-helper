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
        deleted: 0,
        error: 0
    };

    let nftIDs = [];
    if(config.ids != null && _.size(config.ids) > 0) {
        nftIDs = config.ids;
    } else if(config.id_range != null && _.isInteger(config.id_range.min) &&  _.isInteger(config.id_range.max)) {
        for(let j = config.id_range.min; j <= config.id_range.max; j++) {
            nftIDs.push(j);
        }
    } else if(config.all) {
        // Make the API call to get the NFT IDs
        let perPage = 50;
        let getNFTsURL = "/GetNfts/" + process.env.NFT_MAKER_PRO_API_KEY + "/" + config.nft_maker_project_id + "/free/" + perPage + "/";
        let hasNFTsLeft = true;
        let nftPage = 1;
        while(hasNFTsLeft) {
            let newNFTIDs = [];

            let getNFTsResponse = await NFTMAKERPROAPI.get(getNFTsURL + nftPage).catch(function(error) {
                console.error("error exception");
                console.error(error.response.status + " - " + error.response.statusText);
            });

            if(getNFTsResponse != null && getNFTsResponse.status === 200) {
                newNFTIDs = _.map(getNFTsResponse.data, 'id');
                nftIDs = _.concat(nftIDs, newNFTIDs);
            }

            if(_.size(newNFTIDs) > 0) {
                nftPage++;
            } else {
                hasNFTsLeft = false;
            }
            newNFTIDs = [];
        }
    }

    console.log("processing " + _.size(nftIDs) + " NFTs");

    for(let i = 0; i < nftIDs.length; i++) {
        let nftID = nftIDs[i];
        console.log("processing " + nftID);

        // Make the API call to delete the NFT
        let nftDetailsURL = "/DeleteNft/" + process.env.NFT_MAKER_PRO_API_KEY + "/" + config.nft_maker_project_id + "/" + nftID;
        let nftDetailsResponse = await NFTMAKERPROAPI.get(nftDetailsURL).catch(function(error) {
            console.error("error exception");
            console.error(error.response.status + " - " + error.response.statusText);
            track.error++;
        });

        // Check response for error
        if(nftDetailsResponse != null && nftDetailsResponse.status !== 200) {
            console.error("error non 200");
            console.error(nftDetailsResponse.status);
            track.error++;
        }

        // Check response for success
        if(nftDetailsResponse != null && nftDetailsResponse.status === 200) {
            console.log("processed " + nftID);
            track.deleted++;
        }

        track.processed++;
        await helper.sleep(200);
    }

    console.log("finished - "  + JSON.stringify(track));
};

app();
