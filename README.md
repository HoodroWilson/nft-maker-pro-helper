# NFT-MAKER PRO Helper

_A collection of scripts that help you interface with the NFT-MAKER PRO API to accomplish tasks in bulk_

---

## Setting up the NFT-MAKER PRO Helper scripts

_Follow these steps before attempting to use any of the scripts_

1. Ensure you have [node](https://nodejs.org/en/download/) installed
2. Download this repository using the command line with `git clone` or by directly from [GitHub](https://github.com/CardanoCaricatures/nft-maker-pro-helper)
3. Navigate to the root directory of the repository and run `npm install` to set up the libraries required
4. Create a new file named `.env` in the root directory and add your [API Key](https://docs.nft-maker.io/nft-maker-pro-api/managing-api-keys) from [NFT-MAKER PRO](https://pro.nft-maker.io/)
   * `NFT_MAKER_PRO_API_KEY=33a33345e32c46d33e5783ec4aa5c333`

---

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

* **asset_name**
  * min 3 characters, max 30 characters, no spaces or special characters
  * it will append the NFT number to the end so leave room for mint number to be associated with it
  * ex: if your `asset_name` is `LoganHoskinson` & you have the `quantity` set to `500` then your assets will be individually named from `LoganHoskinson001` to `LoganHoskinson500`
* **quantity** - how many NFTs to create from this configuration
  * ex: `500`
* **nft_maker_project_id** - NFT Project ID from NFT-MAKER PRO
  * ex: `18000`
* **file** - JSON object with the NFT file URL that's publically accessible and the associated MIME type
  * the required keys are `url` and `mime_type` in the JSON object for `file`
  * ex: `https://cardano-caricatures-nfts.s3.amazonaws.com/LoganHoskinson/LoganHoskinson.jpg`
  * ex: `image/png`, `image/gif`, `video/mp4`, `image/jpeg`

Here are the optional configuration values and their description:

* **enabled** - a boolean to decide to process this NFT or skip it, defaults to `true` - ex: `false`
* **subfiles**  - JSON array with any additional files with a URL that's publically accessible and the associated MIME type for each
   * the required keys are `url` and `mime_type` in each JSON object in the `subfiles` array
   * ex: `https://cardano-caricatures-nfts.s3.amazonaws.com/LoganHoskinson/LoganHoskinson.jpg`
   * ex: `image/png`, `image/gif`, `video/mp4`, `image/jpeg`

Here are some example `.json` files:

```json
[
  {
    "asset_name": "LoganHoskinson",
    "quantity": 500,
    "nft_maker_project_id": "10000", 
    "file": {
        "url": "https://cardano-caricatures-nfts.s3.amazonaws.com/LoganHoskinson/LoganHoskinson.jpg",
        "mime_type": "image/jpeg"
     }
  }
]
```

```json
[
   {
      "asset_name": "LoganHoskinson",
      "enabled": true,
      "quantity": 500,
      "nft_maker_project_id": "10000",
      "file": {
         "url": "https://cardano-caricatures-nfts.s3.amazonaws.com/LoganHoskinson/LoganHoskinson.jpg",
         "mime_type": "image/gif"
      },
      "subfiles": [
         {
            "url": "https://cardano-caricatures-nfts.s3.amazonaws.com/LoganHoskinson/LoganHoskinson.mp4",
            "mime_type": "video/mp4"
         }
      ]
   }
]
```

---

## Future Scripts
* Create `deleteNFTs.js` which accepts a list of NFT ids or a range of numbers to use as ids to attempt to delete
* Create `fileToURL.js` which accepts a directory and uploads the contents to a public location and returns the URL to use with other scripts

## Future Improvements
* Update it to read the configuration files from anywhere on the filesystem by passing in the file location instead of just the name of the file, setup `configuration` folder under `scripts` directory with examples, update README to point to example's instead of embedding in the page
* Update `uploadNFTs.js` to accept custom metadata from JSON configuration for uploadNFTs.js
* Write process that allows you to specify special metadata key names to process the metadata values easily (ex: edition/version/etc being 1 of 10 or 1/10 with a $ / $$ format)
* Add validation to finding the `.json` configuration file instead of throwing exception
* Add validation to the `.json` configuration files required and optional fields
* Write process that allows you to write a custom function to process any of the metadata values easily that isn't in revision control

## Potential Enhancements
* Reconfigure to be an `npm` package so users just need to create `.json` files instead of needing to download the repository
