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
        error: 0
    };

    let addresses = (config.addresses != null && _.size(config.addresses) > 0) ? config.addresses : [];
    console.log("processing " + _.size(addresses) + " addresses");

    for(let a = 0; a < _.size(addresses); a++) {
        let address = addresses[a];
        try {
            let mintURL = "/MintAndSendRandom/" + process.env.NFT_MAKER_PRO_API_KEY + "/" + config.nft_maker_project_id + "/1/" + address;
            console.log("processing " + address);
            let mintResponse = await NFTMAKERPROAPI.get(mintURL).catch(function(error) {
                if(error.response) {
                    console.error("error minting " + address);
                    console.error(error.response.data);
                    console.error(error.response.status);
                }
            });

            if(mintResponse != null && mintResponse.status === 200 || mintResponse.data != null) {
                console.log("minted " + address);
                //console.log(mintResponse.data);
                track.processed++;
            } else {
                track.error++;
            }
        } catch(e) {
            console.error("error during minting", e != null ? e : "unknown");
            track.error++;
        }

        await helper.sleep(200);
    }

    console.log("finished - "  + JSON.stringify(track));
};

app();
