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

        whitelist_presale = [minterAddress1, minterAddress2];

        const dinowarriors = await DinoWarriors.deployed()

        const silver = web3.utils.asciiToHex('SILVER');
        const gold = web3.utils.asciiToHex('GOLD');        
        const diamond = web3.utils.asciiToHex('DIAMOND');
        const cards = web3.utils.asciiToHex('TRADING_CARDS');
        
        const silver_token = web3.utils.asciiToHex('CLASSIC');
        const gold_token = web3.utils.asciiToHex('VELOCIRAPTOR');
        const trading_card =  web3.utils.asciiToHex('REGULAR_T_REX'); 
        const no_token =  web3.utils.asciiToHex(''); 
        
        const price_silver = web3.utils.toWei("0.15","ether")
        const price_gold = web3.utils.toWei("0.35","ether")

        // Add tiers to the contract
        for(i=0; i < tierData.length; i++){
            let tier = tierData[i]
            // console.log("Adding tier:")
            // console.log(tier)
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

        await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](silver_token, 1, no_token, {from: minterAddress3}),
            "Token is not open for minting")
        await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](gold_token, 1, no_token, {from: minterAddress3}),
            "Token is not open for minting")
        await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](trading_card, 1, no_token, {from: minterAddress3}),
            "Token is not open for minting")
        await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](diamond, 1, no_token, {from: minterAddress3}),
            "Insufficient tokens left for this transaction")

        // Add presale whitelist
        await dinowarriors.updateWhitelist(whitelist_presale, false, [3, 3], {from: ownerAddress})
        await dinowarriors.setTierMintability(silver, 2 ,{from: ownerAddress});
        await dinowarriors.setTierMintability(gold, 2 ,{from: ownerAddress});
        assert.equal((await dinowarriors.tiers(silver)).mintable.toString(), "2",
            "Mintablility could not be adjusted");
        assert.equal((await dinowarriors.tiers(gold)).mintable.toString(), "2",
            "Mintablility could not be adjusted");

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
        await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](silver_token, 1, no_token, {from: minterAddress3}),
            "You are not whitelisted to mint this amount of tokens")
        await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](gold_token, 1, no_token, {from: minterAddress3}),
            "You are not whitelisted to mint this amount of tokens")
        await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](trading_card, 1, no_token, {from: minterAddress3}),
            "Token is not open for minting")
        await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](diamond, 1, no_token, {from: minterAddress3}),
            "Insufficient tokens left for this transaction")

        // Disable whitelist
        await dinowarriors.disableWhitelist({from: ownerAddress});

        // Verify presale cannot mint silver or gold anymore
        await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](silver_token, 1, no_token, {from: whitelist_presale[1], value: price_silver}),
            "You are not whitelisted to mint this amount of tokens")
        await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](gold_token, 1, no_token, {from: whitelist_presale[1], value: price_silver}),
            "You are not whitelisted to mint this amount of tokens")

        // Change minting limits
        await dinowarriors.setTierMaxMintPerTransaction(silver, 5)
        assert.equal((await dinowarriors.tiers(silver)).maxMintPerTransaction.toString(), "5",
            "Maximum transactions per limited were not updated correctly");

        // Make silver cards mintable for everyone by adjusting 'whitelist' property
        await dinowarriors.setTierWhitelist(silver, false)
        assert.equal((await dinowarriors.tiers(silver)).whitelist, false,
            "Whitelist could not be disabled for tier");

        // Verify everyone can mint silver token
        // Presale can still mint
        for(let i = 1; i < whitelist_presale.length; i++){
            await dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](silver_token, 1, no_token, {from: whitelist_presale[i], value: price_silver})
        }
        // Other minters can mint as well
        await dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](silver_token, 5, no_token, {from: minterAddress3, value: 5*price_silver})

        // Minting limit is 5 per transaction, minting more fails
        await truffleAssert.reverts( dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](silver_token, 6, no_token, {from: minterAddress3, value: 6*price_silver}),
            "You cannot mint this amount in one transaction for tokens in this tier.")

        // Check balances
        silver_token_int = (await dinowarriors.tokenInfoFromBytes32(silver_token)).id
        gold_token_int = (await dinowarriors.tokenInfoFromBytes32(gold_token)).id
        let balances = (await dinowarriors.balanceOfBatch(
            [
                minterAddress1,
                minterAddress1,
                minterAddress2,
                minterAddress3
            ],
            [
                silver_token_int,
                gold_token_int,
                silver_token_int,
                silver_token_int

            ]
        )).map((x) => {return x.toString()}).slice()
        assert.deepEqual(balances,
            ['4', '1', '1', '5'],
            "Token balances are not what they should be")

        // Make trading cards mintable, but only by tokenholders from wave 1
        await dinowarriors.setTierMintability(cards, 1 ,{from: ownerAddress});
        assert.equal((await dinowarriors.tiers(cards)).mintable.toString(), "1",
            "Mintablility could not be adjusted");

        // Verify only silver, gold and diamond tiers can mint trading cards
        await dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](trading_card, 1, gold_token, {from: minterAddress1})
        await dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](trading_card, 1, silver_token, {from: minterAddress2})
        await dinowarriors.methods['_mint(bytes32,uint256,bytes32)'](trading_card, 1, silver_token, {from: minterAddress3})

        trading_card_int = (await dinowarriors.tokenInfoFromBytes32(trading_card)).id
        let balances2 = (await dinowarriors.balanceOfBatch(
            [
                minterAddress1,
                minterAddress1,
                minterAddress1,
                minterAddress2,
                minterAddress2,
                minterAddress3,
                minterAddress3
            ],
            [
                silver_token_int,
                gold_token_int,
                trading_card_int,
                silver_token_int,
                trading_card_int,
                silver_token_int,
                trading_card_int
            ]
        )).map((x) => {return x.toString()}).slice()
        assert.deepEqual(balances2,
        ['4', '1', '1', '0', '1', '4', '1'],
        "Token balances are not what they should be")

    })
})