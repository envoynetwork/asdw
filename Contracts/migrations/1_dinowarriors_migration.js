const DinoWarriors = artifacts.require("DinoWarriors");

var tokenData = require('../../data/cards.json')
var tierData = require('../../data/tiers.json')
var whitelist = require('../../data/presale_whitelist.json')

module.exports = async function (deployer, network) {
    
    // Deploy the contract
    await deployer.deploy(DinoWarriors, 'https://nft.dinowarriors.io/metadata/\{id\}.json', 'https://nft.dinowarriors.io/metadata/contract.json');
    if (network.includes('FullFlow')){
        console.log("Deploying the full flow")
        const dinowarriors = await DinoWarriors.deployed()

        // Add tiers to the contract
        for(i=0; i < tierData.length; i++){
            let tier = tierData[i]
            console.log("Adding tier:")
            console.log(tier)
            await dinowarriors.addTier(web3.utils.asciiToHex(tier.name),
                                       web3.utils.toWei(tier.price.toString(),"ether"),
                                       tier.mintable,
                                       tier.dropWave,
                                       web3.utils.asciiToHex(tier.tokenToBurn),
                                       tier.mintPerTransaction,
                                       tier.whitelist)
        }

        // Add tokens to the contract
        let names = tokenData.names.map((x) => {return web3.utils.asciiToHex(x)}).slice();
        let amounts = tokenData.amounts.slice();
        let tiers = tokenData.tiers.map((x) => {return web3.utils.asciiToHex(x)}).slice();
        let amountsToPremint = tokenData.amountsToPremint.slice();
        console.log("Adding " + names.length + " tokens")

        await dinowarriors.addTokensBatch(names,
            amounts,
            tiers,
            amountsToPremint);
        
        // Get mapping from bytes32 string to uint. Apply on local env
        // for(i=0; i<names.length; i++){
        //     console.log(tokenData.names[i], (await dinowarriors.tokenInfoFromBytes32(names[i])).id.toString())
        // }
        // Add whitelisted accounts for presale
        console.log("Adding a whitelist for minting of length " + whitelist.amounts.length)
        let whitelist_addresses = whitelist.addresses.slice();
        let whitelist_amounts = whitelist.amounts.slice();
        await dinowarriors.updateWhitelist(whitelist_addresses, false, whitelist_amounts);
    }

};
    