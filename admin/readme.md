# ASDW admin CLI scripts

## Table of contents
- [ASDW admin CLI scripts](#asdw-admin-cli-scripts)
  - [Table of contents](#table-of-contents)
  - [Overview](#overview)
  - [Scripts](#scripts)
    - [General](#general)
    - [add_tiers.js](#add_tiersjs)
      - [Arguments](#arguments)
      - [Configuration file](#configuration-file)
      - [Example](#example)
    - [add_tokens.js](#add_tokensjs)
      - [Arguments](#arguments-1)
      - [Configuration file](#configuration-file-1)
      - [Example](#example-1)
    - [set_tier_mintability.js](#set_tier_mintabilityjs)
      - [Arguments](#arguments-2)
      - [Example](#example-2)
    - [set_tier_price.js](#set_tier_pricejs)
      - [Arguments](#arguments-3)
      - [Example](#example-3)
    - [set_tier_whitelist.js](#set_tier_whitelistjs)
      - [Arguments](#arguments-4)
      - [Example](#example-4)
    - [update_whitelist.js](#update_whitelistjs)
      - [Arguments](#arguments-5)
      - [Configuration file](#configuration-file-2)
      - [Example](#example-5)

## Overview

This folder contains functions for the owner to interact with the smart contract. The scripts are written in node JS, following things are required before being able to use the admin console:

- Setting the infura and private key in `../secrets`. The settings file can be adjusted to use different keys dependent on the selected network.
- Setting the network settings in `settings.js` to define the different networks you can connect to. Development, Rinkeby and main are some of the options.
- Making sure you load the correct ABI from your smart contract. This can be loaded directly from the `../contracts/build` directory.

The scripts are:

- `set_tier_price`: Setting the price of a tier
- `set_tier_mintability`: Making a tier mintable
- `set_tier_whitelist`: Enable/disable whitelisting for a tier
- `update_whitelist`: Update a whitelist based on a JSON file.
- `add_tiers`: Add tiers based on a JSON file
- `add_tokens`: Add tokens based on JSON file

To get information about one of the scripts, run `node $script --help`. This will give instructions on how to use the script, and which command line arguments you should provide.

## Scripts

### General

All functions take the `--network` argument to define which blockchain to use. Current options are:

- development
- rinkeby
- mainnet

Development refers to a local blockchain (e.g. Ganache) and does not require funds on a real network.

### add_tiers.js

Function to add tiers based on a JSON file. Tiers contain information for multiple tokens. The tiers will be added in multiple transactions.

#### Arguments

| Arguments&nbsp; | Description |
|-|-|
| `--network` | Name of the network to use, should be defined in settings.js |
| `--file` | Location of a JSON file with a list of mappings. Each mappings contain the tier arguments. Defaults to `../data/tiers.json`. More info on the file can be found below

#### Configuration file

The tiers will be added 1 by 1, for this reason the JSON file is structured as a list of mappings containing the info for one tier. Each of the mappings should have following properties:

- **name**: Human readable name of the tier. Will be transformed to bytes32 in the script.
- **price**: The price that needs to be paid when minting tokens in this tier. *Should be in Ether, not Wei!*
- **mintable**: A number defining who can mint. 0 means nobody can mint. For information on other numbers, check the smart contract documentation.
- **dropWave**: The dropwave of the tier
- **tokenToBurn**: Human readable name of a token that should be burned if it is provided for minting. For information on the burning, check the smart contract documentation.
- **mintPerTransaction**: Maximum amount of tokens that can be minted in one transaction for tokens in this tier.
- **whitelist**: Boolean, if set to true, only people on the latest whitelist can mint.

#### Example

To add the `TRADING_CARDS` tier to the test contract on Rinkeby, run

```sh
node add_tiers.js --network rinkeby --file $file
```

with `$file` the location to following JSON:

``` json
[
    {
        "name": "TRADING_CARDS",
        "price": 0,
        "mintable": 0,
        "dropWave": 1,
        "tokenToBurn": "CLASSIC",
        "mintPerTransaction": 1,
        "whitelist": false
    },
]
```

### add_tokens.js

Function to add tokens based on a JSON file. The tokens will be added in one batch transaction.

#### Arguments

| Arguments&nbsp; | Description |
|-|-|
| `--network` | Name of the network to use, should be defined in settings.js |
| `--file` | Location of a JSON file with multiple lists. Each lists contains info on the token arguments. Defaults to `../data/cards.json` More info on the file can be found below.

#### Configuration file

The tokens will be added in one transaction, for this reason the JSON file is structured as multiple lists that will be used as input for the bulk function. The information for the `i`<sup>th</sup> token should be located on index `i` in each list. There should be lists for following properties:

- **names**: Human readable names of the tokens. Will be transformed to bytes32 in the script.
- **amounts**: The amounts that will be available for each token.
- **tiers**: The human readable tier the token is in. Will be transformed to bytes32 in the script. The tier should be created before adding tokens to it, which can be done with the `add_tiers.js` scipt.
- **amountsToPremint**: How many tokens need to be minted by the contract owner? Can be any number between 0 and the total amount for this token.

#### Example

To add the `COMMUNITY`, `CLASSIC` and `REGULAR_T_REX` NFT's to the test contract on Rinkeby, run

```sh
node add_tokens.js --network rinkeby --file $file
```

with `$file` the location to following JSON:

``` json
{
    "names":
        [   
            "COMMUNITY",
            "CLASSIC",
            "REGULAR_T_REX",
        ],
    "amounts":
        [   
            250,
            5000,
            200,
        ],
    "tiers":
        [   
            "COMMUNITY",
            "SILVER",
            "TRADING_CARDS",
        ],
    "amountsToPremint":
        [
            250,
            0,
            0,
        ],
}
```

### set_tier_mintability.js

Function to allow or disallow users to mint.

#### Arguments

| Arguments&nbsp; | Description |
|-|-|
| `--network` | Name of the network to use, should be defined in settings.js |
| `--tier` | Human readable technical name of the tier. Will be transformed to bytes32 in the script. |
| `--value` | Unisigned integer `x` defining who can mint. 0 means nobody can mint. Any number for which `0 < x <= latestDropWave` means all owners of tokens from a tier `y` with `y<=x` are allowed to mint. This allows to give owners of NFT's from previous waves priority for minting NFT's in later drop waves. `x` can be increased over time to have stepwise priority for minting. When `x > latestDropWave` everyone can mint.

#### Example

To make the `TRADING_CARDS` tier in the test contract on Rinkeby mintable by owners of NFT's from wave 1, run

```sh
node set_tier_mintability.js --network rinkeby --tier TRADING_CARDS --value 1
```

If you want to allow everyone to mint, lookup the value of `latestDropWave` in the smart contract, and assume it is 2 in this case. To allow everyone to mint, run:

```sh
node set_tier_mintability.js --network rinkeby --tier TRADING_CARDS --value 3
```

### set_tier_price.js

Function to set the price for a tier in Ether (**not in Wei!**).

#### Arguments

| Arguments&nbsp; | Description |
|-|-|
| `--network` | Name of the network to use, should be defined in settings.js |
| `--tier` | Human readable technical name of the tier. Will be transformed to bytes32 in the script. |
| `--value` | The new price in Ether, not Wei! |

#### Example

To change the price to mint the `SILVER` tier in the test contract on Rinkeby to 0.1 ether instead of the initial 0.15, run:

```sh
node set_tier_price.js --network rinkeby --tier SILVER --value 0.1
```

### set_tier_whitelist.js

Function to set the value for `whitelist` of a tier. True means the whitelist is used, false means no check is done on the whitelist when minting tokens in this tier.

#### Arguments

| Arguments&nbsp; | Description |
|-|-|
| `--network` | Name of the network to use, should be defined in settings.js |
| `--tier` | Human readable technical name of the tier. Will be transformed to bytes32 in the script.
| `--value` | True means the whitelist is used, false not

#### Example

Assume only whitelisted addresses are allowed to mint the `SILVER` tier in the test contract on Rinkeby. To allow all addresses to mint, run:

```sh
node set_tier_whitelist.js --network rinkeby --tier SILVER --value true
```

### update_whitelist.js

Function add a whitelist for minting to the contract from a json file. If tiers are whitelisted, only addresses on this whitelist will be able to mint when tiers are configured to use a whitelist. This can be adjusted with the `set_tier_whitelist.js` script.

#### Arguments

| Arguments&nbsp; | Description |
|-|-|
| `--network` | Name of the network to use, should be defined in settings.js |
| `--new` | If true, a new whitelist will be made and previous whitelisted accounts cannot mint anymore. Defaults to false to update the current whitelist. |
| `--file` | The location to a JSON file containing 2 mappings: one for addresses and one for amounts. Defaults to `../data/presale_whitelist.json` |


#### Configuration file

The whitelisted addresses will be added in one transaction, for this reason the JSON file is structured as multiple lists that will be used as input for the bulk function. The amount of transactions allowed for the `i`<sup>th</sup> address should be located on index `i` in each list. There should be lists for following properties:

- **addresses**: a list with addresses to add to whitelist. These addresses will be allowed to mint tiers that require whitelisting.
- **amounts**: the amount of transaction the address is whitelisted for. Each time a whitelisted address mints, this will decrease the remaining transactions by 1.

#### Example

To add the Envoy dev address to the current whitelist on the test contract, run

```sh
node update_whitelist.js --network rinkeby --new false --file $file
```

with `$file` the location to following JSON:

``` json
{
    "addresses": [
        "0x6b4934c85B8cb94A6a7aC4496a2eEc9184fFac59"
        ],
    "amounts":[
        3
    ],
},
```

To create a new whitelist and disable the current one, run the command with `--new` set to `true`.