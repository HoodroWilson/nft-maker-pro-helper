# NFT-MAKER PRO Helper

_A collection of scripts which you configure with JSON files that help you interface with the NFT-MAKER PRO API to accomplish tasks in bulk without having to write any code_

---

[NFT-MAKER PRO](https://www.nft-maker.io/pro) is a toolset consisting of a [web app](https://pro.nft-maker.io/) and accompanying [API](https://api.nft-maker.io/swagger/index.html) that enables you to create, manage, and sell NFTs at scale on the Cardano blockchain.

For some projects, there are actions that must be done in bulk like managing thousands of NFTs. Doing this manually with the web app is time-consuming.

These scripts can solve any of these complexities (and more) that you may face when using the API for NFT-MAKER PRO at scale.

* Creating a large number of NFTs from a single image/file
* Creating a large number of NFTs from individually unique images/files
* Customizing the metadata for each individual NFT in bulk
* Deleting a large number of NFTs that are already created

Used to manage the NFTs for [Cardano Caricatures](https://www.cardanocaricatures.com/), [Cardano Waifus](https://www.cardanowaifus.com/), [Stik Friks](https://www.stikfriks.com/), and [Old Money](https://www.oldmoney.io/).

---

## Setting up the NFT-MAKER PRO Helper scripts

_Follow these steps before attempting to use any of the scripts_

1. Ensure you have [node](https://nodejs.org/en/download/) and [git](https://git-scm.com/downloads) installed
2. Download this repository using the command line (recommended) with `git clone` or directly from [GitHub](https://github.com/CardanoCaricatures/nft-maker-pro-helper)
3. Navigate to the root directory of the repository and run `npm install` to set up the libraries required
4. Create a new file named `.env` in the root directory and add your [API Key](https://docs.nft-maker.io/nft-maker-pro-api/managing-api-keys) from [NFT-MAKER PRO](https://pro.nft-maker.io/)
   * `NFT_MAKER_PRO_API_KEY=33a33345e32c46d33e5783ec4aa5c333`
5. Copy one of the `.json` examples from `/configuration` any of the scripts

---

## `uploadNFTs`

_Takes information such as metadata, formats, quantity, image/file URLs, and more then interfaces with NFT-MAKER PRO to create the number of NFTs configured_

### Overview

* This script takes a `.json` file that outlines what the NFT details are like what image/files to use and how many NFTs to create for each
* Each `.json` file must be an array and therefore it can contain one or many NFTs to upload at once
* If it encounters an error from NFT-MAKER PRO then it will wait 15 and try again
* If it encounters over 10 errors from NFT-MAKER PRO then it will stop the script
* It checks for duplicate assets from NFT-MAKER PRO so you can restart the script at any point without creating duplicates

### How to run

1. Upload your NFT files (png, jpg, gif, mp4, etc) to a publicly accessible URL (S3, Google Drive, Dropbox, etc)
2. Create your [NFT Project](https://docs.nft-maker.io/nft-maker-pro/creating-nfts) in the [NFT-MAKER PRO](https://pro.nft-maker.io/) Dashboard
3. Create a `.json` configuration file in the `/configuration/uploadNFTs` folder
4. Run using `node uploadNFTs.js NAME_OF_JSON_FILE_WITH_NO_EXTENSION`

### How to configure

Each `.json` file in the `/configuration/uploadNFTs` folder must be an array and therefore it can contain one or many NFTs to upload

Required configuration values:

* **asset_name**
  * min 3 characters, max 30 characters, no spaces or special characters
  * it will append the NFT number to the end so leave room for mint number to be associated with it
  * ex: if your `asset_name` is `LoganHoskinson` and you have the `quantity` set to `500` then your assets will be individually named from `LoganHoskinson001` to `LoganHoskinson500`
* **quantity**
  * how many NFTs to create
  * ex: `500`
* **nft_maker_project_id**
  * the NFT Project ID from NFT-MAKER PRO to create the NFTs under
  * get from the Dashboard under `NFT Projects` or from the API using `/ListProjects`
  * ex: `18000`
* **file**
  * a JSON object with the NFT image/file URL and the associated MIME type of the file
  * the image/file must be publicly accessible with the specified URL
  * the required keys are `url` and `mime_type` in the JSON object for `file`
  * if you have individually unique files for your NFTs then you can name them a certain way to have it dynamically set the URL for each NFT
  * the `$` is a reserved character in the `url` value, if it's found then it will be replaced with the number of the NFT (including the padding)
  * ex for `url`: `https://cardano-caricatures-nfts.s3.amazonaws.com/LoganHoskinson/LoganHoskinson.jpg`
  * ex for `url` with `$`: `https://old-money-nfts.s3.amazonaws.com/TheInflationTimesLXI/TheInflationTimesLXI$.jpg`
    * this would generate URLs like `https://old-money-nfts.s3.amazonaws.com/TheInflationTimesLXI/TheInflationTimesLXI001.jpg`
  * ex for `mime_type`: `image/png`, `image/gif`, `video/mp4`, `image/jpeg`

Optional configuration values:

* **metadata**
  * a JSON object with matching keys of the metadata placeholders configured in NFT-MAKER PRO and their matching values
  * there are dynamic formats you can use by also specifying the `metadata_format` 
  
* **metadata_format**
  * a JSON object with matching keys of the metadata placeholders configured in NFT-MAKER PRO and the name of the supported format
  * supported formats
    * `edition`
      * used to dynamically set the NFT's unique number and total number of NFTs in any possible way
      * the format is using `$` for the NFT's unique number and `$$` for the total number of NFTs that matches the `quantity`
      * ex: `$ of $$`, `$/$$`, `$`, `$ of $$ total`

* **subfiles**
  * an array with additional JSON objects with the NFT image/file URL and the associated MIME type of the file
  * the image/file must be publicly accessible with the specified URL
  * the required keys are `url` and `mime_type` in each JSON object in the `subfiles` array
  * the `$` is a reserved character in the `url` value, the same as it is used in `file`
  * ex for `url`: `https://cardano-caricatures-nfts.s3.amazonaws.com/LoganHoskinson/LoganHoskinson.jpg`
  * ex for `mime_type`: `image/png`, `image/gif`, `video/mp4`, `image/jpeg`

Optional helper configuration values:

* **enabled**
  * a boolean to decide to process this NFT or skip it, defaults to `true`
  * ex: `false`
* **dryRun**
  * a boolean to decide to disable any calls to NFT MAKER PRO API just test everything else by logging the data, defaults to `false`
  * ex: `true`
* **limitedQuantity**
  * the number of NFTs to create before stopping
  * created so you don't have to modify the total `quantity` when testing
  * ex: `2`
* **startingNumber**
  * a number to start the process with so it attempt to create every NFT possible
  * used when the script stops and you want to restart part of the way through
  * ex: `205`


Here are some example `.json` configuration files:

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

## `deleteNFTs.js`

_Takes information about which NFTs you want to delete from a specific NFT Project then interfaces with NFT-MAKER PRO to delete NFTs configured_

### Overview

* This script takes a `.json` file that outlines which NFTs to delete from an NFT Project either by the `id` or an `id_range`
* If you use `id` then look on the Dashboard or use the API to get each of the IDs of the NFTs to put in the configuration manually
* If you use `id_range` then it will likely attempt to delete an NFT that you do NOT own since everyone shares the same autoincrement ID for NFTs
* If it encounters someone else's NFT then it will log it and move on
* It will not be able to delete any NFT that NFT-MAKER doesn't allow such as minted or reserved NFTs
* It doesn't do any harm to attempt to delete any that have already been deleted so you can restart the script at any point

### How to run

1. Find out the `ids` or `id_range` from your [NFT Project](https://docs.nft-maker.io/nft-maker-pro/creating-nfts) in the [NFT-MAKER PRO](https://pro.nft-maker.io/) Dashboard or using the `GetNfts` API
2. Create a `.json` configuration file in the `/configuration/deleteNFTs` folder
3. Run using `node uploadNFTs.js NAME_OF_JSON_FILE_WITH_NO_EXTENSION`

### How to configure

Each `.json` file in the `/configuration/deleteNFTs` folder must be an object and therefore it can only delete NFTs under a single project at a time

Required configuration values:

* **nft_maker_project_id**
  * the NFT Project ID from NFT-MAKER PRO to create the NFTs under
  * get from the Dashboard under `NFT Projects` or from the API using `/ListProjects`
  * ex: `18000`

Optional configuration values:

* **id**
  * an array of Integer IDs to delete from an NFT project
  * get from the Dashboard under `NFT Projects` then click the `Manage NFT` icon or from the API using `/GetNfts`
  * ex: `[11111, 22222, 33333]`
* **id_range**
  * an object with a `max` and `min` key/value set with Integers of the IDs to delete from an NFT project
  * get from the Dashboard under `NFT Projects` then click the `Manage NFT` icon or from the API using `/GetNfts`
  * individually attempts to delete each NFT from the min to the max (inclusive)
  * ex: `{ "min": 22222, "max": 33333 }`
* **all**
  * a boolean to indicate to delete all of the NFTs in an NFT Project
  * ex: `true`

Here are some example `.json` configuration files:

```json
{
  "nft_maker_project_id": "10000",
  "ids": [11111, 22222, 33333]
}
```

```json
{
  "nft_maker_project_id": "10000",
  "id_range": {
    "min": 22222,
    "max": 33333
  }
}
```

```json
{
  "nft_maker_project_id": "10000",
  "all": true
}
```

---

## Release Notes

### 3.0.0
  * Added additional optional configuration options to `uploadNFTs.js`
    * Added `metadata` to set custom metadata placeholders values for each NFT
    * Added `metadata_format` to set dynamic custom metadata placeholders values for each NFT
    * Added `startingNumber` to set the number to start the process with instead of at 1
    * Added `limitedQuantity` to set the number of NFTs to upload before it stops
    * Added `dryRun` to disable any API calls to NFT MAKER PRO
  * Added the ability to include a `$` wildcard in the `url` of the `file` to dynamically generate URLs for projects with individually unique images/files
  * Created the initial version of `deleteNFTs.js` to delete NFTs in an NFT Project by `id`, `id_range`, and `all`
  * Organized the `README.md` to include a larger description, purpose, and use cases
  
### 2.0.0
  * Introduced breaking change in the JSON configuration on how we deal with files in order to introduce the subfiles concept
  * Organized the `README.md` to add more details on setup and configuration examples

### 1.0.0
  * Initialized the repo/codebase
  * Created the initial version of `uploadNFTs.js`
  * Created a basic `README.md`

---

## Future Scripts
* Create `filesToURLs.js` which accepts a directory and uploads the contents to a public location and returns the URLs to use with other scripts

## Future Improvements
* Setup `configuration` folder under `scripts` directory with examples, update README to point to example files instead of embedding in the page
* Update `uploadNFTs.js` to have a way to not include the NFT number appended to the asset name like LoganHoskinson001
* Log the execution time in minutes with the processed console logs for each script 
* Add validation to finding the `.json` configuration file instead of throwing exception
* Add validation to the `.json` configuration files required and optional fields
* Handle the errors with NFT-MAKER PRO auth, missing API key, missing config file
* Write process that allows you to write a custom function to process any of the metadata values easily that isn't in revision control

## Potential Enhancements
* Reconfigure to be an `npm` package so users just need to create `.json` files instead of needing to download the repository

---

Have questions or suggestions? Want to get paid to contribute? Reach out to [@AdaCaricatures](https://twitter.com/AdaCaricatures) or [justin@cardanocaricatures.com](mailto:justin@cardanocaricatures.com)
