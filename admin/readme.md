# Admin CLI functions

This folder contains functions for the owner to interact with the smart contract. The scripts are written in node JS, following things are required:

- Setting the infura and private key in `../secrets`
- Setting the contract and network settings in `settings.js`

Some of the functions are:

- Setting the price of a tier
- Making a tier mintable
- Enable/disable whitelisting for a tier
- Update a whitelist
- TODO: add tiers
- TODO: add tokens

To get information about one of the scripts, run `node $script --help`. This will give instructions on how to use the script, and which command line arguments you should provide.