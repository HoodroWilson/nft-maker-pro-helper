# NFT-MAKER PRO Helper

_A collection of scripts that help you interface with the NFT-MAKER PRO API to accomplish tasks in bulk_

## Setting up the NFT-MAKER PRO Helper scripts

_Follow these steps before attempting to use any of the scripts_

1. Ensure you have [node](https://nodejs.org/en/download/) installed
2. Download this repository using the command line with `git clone` or by directly from [GitHub](https://github.com/CardanoCaricatures/nft-maker-pro-helper)
3. Navigate to the root directory of the repository and run `npm install` to set up the libraries required
4. Create a new file named `.env` in the root directory and add your [API Key](https://docs.nft-maker.io/nft-maker-pro-api/managing-api-keys) from [NFT-MAKER PRO](https://pro.nft-maker.io/)
   * `NFT_MAKER_PRO_API_KEY=33a33345e32c46d33e5783ec4aa5c333`

## `uploadNFTs`

_Do you have a large number of images/files & need to create the NFTs under a new/existing NFT Project?_

### Overview

This script takes a `.json` file that outlines what the NFT details are like what image/files to use and how many NFTs to create for each

* If it encounters an error from NFT-MAKER PRO then it will wait 15 and try again
* If it encounters over 10 errors from NFT-MAKER PRO then it will stop the script
* It checks for duplicate assets from NFT-MAKER PRO so you can restart the script at any point without creating duplicates

### How to run

1. Upload your NFT files (png, jpg, gif, mp4, etc) to a publicly accessible URL (S3, Google Drive, Dropbox, etc)
2. Create your [NFT Project](https://docs.nft-maker.io/nft-maker-pro/creating-nfts) in the [NFT-MAKER PRO](https://pro.nft-maker.io/) Dashboard
3. Create a new `.json` file in the `/configuration/uploadNFTs` folder with one or many NFTs to process
4. Run the script using `node uploadNFTs.js NAME_OF_JSON_FILE_WITH_NO_EXTENSION`

### How to configure

_Each `.json` file in the `/configuration/uploadNFTs` folder must be an array and therefore it can contain one or many NFTs to upload_

Here are required configuration values and their description:

* **asset_name** - min 3 characters, max 30 characters, no spaces or special characters - leave room for mint number to be associated with it - ex: `LoganHoskinson`
* **quantity** - how many NFTs to create from this configuration - ex: `100`
* **config_nft_maker_project_id** - NFT Project ID from NFT-MAKER PRO - ex: `18000`
* **config_nft_url** - url of the main NFT file - ex: `https://cardano-caricatures-nfts.s3.amazonaws.com/LoganHoskinson/LoganHoskinson.jpg`
* **config_nft_mime_type** - mime type of the main NFT file - ex: `image/png`, `image/gif`, `video/mp4`, `image/jpeg`

Here are the optional configuration values and their description:

* **other_metadata** - any other metadata that matches the "placeholder" keys you set up for the NFT Project
* **config_enabled** - a boolean to decide to process this NFT or skip it, defaults to true - ex: `false`

Here is an example `.json` file:

```json
[
  {
    "asset_name": "LoganHoskinson",
    "quantity": 500,
    "config_nft_maker_project_id": "10000",
    "config_nft_url": "https://cardano-caricatures-nfts.s3.amazonaws.com/LoganHoskinson/LoganHoskinson.jpg",
    "config_nft_mime_type": "image/jpeg"
  }
]
```

---

## TODO list
* Update the delete to accept a JSON of ids with a configuration name
* Update the delete to accept a range of ids (start and end) with a configuration name
* Write process that allows you to specify special metadata key names to process the metadata values easily (ex: edition/version/etc being 1 of 10 or 1/10 with a $ / $$ format)
* Fix the metadataPlaceholder to be more flexible and read from config (ex: not hardcoding metadata keys in uploadNFTs.js)
* Support the subfiles process for NFTs (ex: gif and mp4)
---
* Add validation to finding the `.json` configuration file instead of throwing exception
* Add validation to the `.json` configuration files required and optional fields
* Write process that allows you to write a custom function to process any of the metadata values easily that isn't in revision control
---
* Create an `uploadFileToURL.js` script so you can take a local file and upload it to a public location that provides you with a URL to use in other scripts
