const truffleAssert = require('truffle-assertions');
const DinoWarriors = artifacts.require("DinoWarriors");

var tokenData = require('../../../data/cards.json')
var tierData = require('../../../data/tiers.json')

contract("Integration presale and public sale flow", function(accounts) {
    
    
    it("Integration test", async () => {
        // Define the contract information
        const ownerAddress = accounts[0];
        const minterAddress1 = accounts[1];
        const minterAddress2 = accounts[2];
        const minterAddress3 = accounts[3];
        const minterAddress4 = accounts[4];
        const minterAddress5 = accounts[5];

        whitelist_presale = [minterAddress1, minterAddress2];
        whitelist_public_sale = [minterAddress3, minterAddress4];

        const dinowarriors = await DinoWarriors.deployed()

        const silver = web3.utils.asciiToHex('SILVER');
        const gold = web3.utils.asciiToHex('GOLD');        
        const diamond = web3.utils.asciiToHex('DIAMOND');
        const cards = web3.utils.asciiToHex('TRADING_CARDS');
        
        const silver_token = web3.utils.asciiToHex('CLASSIC');
        const gold_token = web3.utils.asciiToHex('VELOCIRAPTOR');
        const trading_card =  web3.utils.asciiToHex('REGULAR_T_REX'); 
        const no_token =  web3.utils.asciiToHex(''); 
        
        const dropWave1 = 1;
        const dropWave2 = 2;
        
        const price_silver = web3.utils.toWei("0.15","ether")
        const price_gold = web3.utils.toWei("0.35","ether")

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
                                        tier.whitelist,
                                        {from: ownerAddress})
        }

        // Add tokens to the contract
        let names = tokenData.names.map((x) => {return web3.utils.asciiToHex(x)}).slice()
        let amounts = tokenData.amounts.slice()
        let tiers = tokenData.tiers.map((x) => {return web3.utils.asciiToHex(x)}).slice()
        let amountsToPremint = tokenData.amountsToPremint.slice()
        await dinowarriors.addTokensBatch(names,
            amounts,
            tiers,
            amountsToPremint,
            {from: ownerAddress})

        // Verify that diamond is already minted
        assert.equal((await dinowarriors.tokenInfoFromBytes32.call(diamond)).mintedAmount, 1,
            'Diamond was not minted')
        assert.equal(await dinowarriors.balanceOf(ownerAddress, (await dinowarriors.tokenInfoFromBytes32.call(diamond)).id), 1,
            "Owner does not own diamond token")

        // Verify noone can mint any token
        for(let i = 1; i < whitelist_presale.length; i++){
            await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](silver_token, 1, no_token, {from: whitelist_presale[i]}),
                "Token is not open for minting")
            await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](gold_token, 1, no_token, {from: whitelist_presale[i]}),
                "Token is not open for minting")
            await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](trading_card, 1, no_token, {from: whitelist_presale[i]}),
                "Token is not open for minting")
            await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](diamond, 1, no_token, {from: whitelist_presale[i]}),
                "Insufficient tokens left for this transaction")
        }
        for(let i = 1; i < whitelist_public_sale.length; i++){
            await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](silver_token, 1, no_token, {from: whitelist_public_sale[i]}),
                "Token is not open for minting")
            await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](gold_token, 1, no_token, {from: whitelist_public_sale[i]}),
                "Token is not open for minting")
            await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](trading_card, 1, no_token, {from: whitelist_public_sale[i]}),
                "Token is not open for minting")
            await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](diamond, 1, no_token, {from: whitelist_public_sale[i]}),
                "Insufficient tokens left for this transaction")
        }

        // Add presale whitelist
        await dinowarriors.updateWhitelist(whitelist_presale, false, [3, 3], {from: ownerAddress})
        await dinowarriors.setTierMintability(silver, 2 ,{from: ownerAddress});
        await dinowarriors.setTierMintability(gold, 2 ,{from: ownerAddress});

        // Make silver and gold mintable

        // If the price is not paid, not tokens can be minted by whitelisters
        await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](silver_token, 1, no_token, {from: whitelist_presale[0]}),
            "Invalid ETH paid")
        // If the amount exceeds the max tokens to mint per transaction, the minting fails
        await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](silver_token, 4, no_token, {from: whitelist_presale[0]}),
            "You cannot mint this amount in one transaction for tokens in this tier")

        // Minters on the whitelist should be able to mint silver and gold, but only 3 transactions
        //
        await dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](silver_token, 1, no_token, {from: whitelist_presale[0], value: price_silver})
        await dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](silver_token, 3, no_token, {from: whitelist_presale[0], value: 3*price_silver})
        await dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](gold_token, 1, no_token, {from: whitelist_presale[0], value: price_gold})

        // You cannot mint more than 3 silver tokens at once
        await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](silver_token, 4, no_token, {from: whitelist_presale[0], value: 4*price_silver}),
            "You cannot mint this amount in one transaction for tokens in this tier")
        // You cannot mint more than 1 gold token at once
        await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](gold_token, 2, no_token, {from: whitelist_presale[0], value: 2*price_gold}),
            "You cannot mint this amount in one transaction for tokens in this tier")
        // After 3 transactions, minting fails
        await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](silver_token, 1, no_token, {from: whitelist_presale[0], value: price_silver}),
            "You are not whitelisted to mint this amount of tokens")

        // Check trading cards and diamond still cannot be minted
        await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](trading_card, 1, no_token, {from: whitelist_presale[0]}),
            "Token is not open for minting")
        await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](diamond, 1, no_token, {from: whitelist_presale[0]}),
            "Insufficient tokens left for this transaction")

        // Other addresses not whitelisted still cannot mint anything
        await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](silver_token, 1, no_token, {from: whitelist_public_sale[0]}),
            "You are not whitelisted to mint this amount of tokens")
        await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](gold_token, 1, no_token, {from: whitelist_public_sale[0]}),
            "You are not whitelisted to mint this amount of tokens")
        await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](trading_card, 1, no_token, {from: whitelist_public_sale[0]}),
            "Token is not open for minting")
        await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](diamond, 1, no_token, {from: whitelist_public_sale[0]}),
            "Insufficient tokens left for this transaction")

        // Disable whitelist

        // Verify presale cannot mint anymore

        // Change minting limits

        // Make silver cards mintable by adjusting 'mintable' and 'whitelist' properties

        // Verify everyone can mint

        // Make trading cards mintable

        // Verify only silver, gold and diamond tiers can mint trading cards

    })
})