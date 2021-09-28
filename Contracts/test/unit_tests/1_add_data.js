const truffleAssert = require('truffle-assertions');
const DinoWarriors = artifacts.require("DinoWarriors");

contract("Test adding tiers and tokens", function(accounts) {
    
    
    it("Test adding tiers and tokens", async () => {
        // Global test constants
        const ownerAddress = accounts[0];
        const minterAddress = accounts[1];

        const dinowarriors = await DinoWarriors.deployed()
        
        // Test tier and token to the contract
        const testToken1 = web3.utils.asciiToHex('TEST_TOKEN_1');
        const testToken2 = web3.utils.asciiToHex('TEST_TOKEN_2');
        const testToken3 = web3.utils.asciiToHex('TEST_TOKEN_3');
        const no_token =  web3.utils.asciiToHex(''); 

        const tokenPrice = 10;
        const tokenAmount = 3;
        const dropWave1 = 1;
        const dropWave2 = 2;

        // Adding a token and tier should only be possible for the owner
        await truffleAssert.reverts(dinowarriors.addTier(testToken1, tokenPrice, 2, dropWave1, no_token, 1, false, {from: minterAddress}),
            "caller is not the owner");
        await truffleAssert.reverts(dinowarriors.addToken(testToken1, tokenAmount, testToken1, 0, {from: minterAddress}),
            "caller is not the owner");

        await dinowarriors.addTier(testToken1, tokenPrice, 2, dropWave1, no_token, 1, false, {from: ownerAddress});
        assert.equal((await dinowarriors.tiers.call(testToken1)).price, tokenPrice,
            'Price was not set correctly')   
        assert.equal((await dinowarriors.tiers.call(testToken1)).dropWave, dropWave1,
            'Drop wave was not set correctly')
        await dinowarriors.addToken(testToken1, tokenAmount, testToken1, 0, {from: ownerAddress});
        assert.equal(web3.utils.hexToAscii((await dinowarriors.tokenInfoFromBytes32.call(testToken1)).tier).replace(/\0/g, ''), web3.utils.hexToAscii(testToken1),
            'Tier was not set correctly')
        assert.equal(await dinowarriors.latestDropWave(), dropWave1, "Latest drop wave not correct")
        // Adding existing tiers or tokens should fail
        await truffleAssert.reverts(dinowarriors.addTier(testToken1, tokenPrice, 2, dropWave1, no_token, 1, false, {from: ownerAddress}),
            "Tier already exists")
        await truffleAssert.reverts(dinowarriors.addToken(testToken1, tokenAmount, testToken1, 0,  {from: ownerAddress}),
            "Token already exists")

        // Add a tier for a new drop wave
        await dinowarriors.addTier(testToken2, tokenPrice, 1, dropWave2, no_token, 1, false, {from: ownerAddress});
        assert.equal(await dinowarriors.latestDropWave(), dropWave2, "Latest drop wave not correct")

        // Tokens cannot be created for waves in the past
        await truffleAssert.reverts(dinowarriors.addToken(testToken2, tokenAmount, testToken1, 0, {from: ownerAddress}),
            "You cannot add tokens for previous waves")
        // Tiers cannot be added with dropwave in the past (dropwave1)
        await truffleAssert.reverts(dinowarriors.addTier(testToken3, tokenPrice, 2, dropWave1, no_token, 1, false, {from: ownerAddress}),
            "You cannot go back in time")

        // Change tier values
        await dinowarriors.setTierMintability(testToken1, 7, {from: ownerAddress})
        await dinowarriors.setTierPrice(testToken1, 8, {from: ownerAddress})
        assert.equal((await dinowarriors.tiers.call(testToken1)).mintable, 7,
            'Mintability was not adjusted')
        assert.equal((await dinowarriors.tiers.call(testToken1)).price, 8,
            'Price was not adjusted')

        // Increase token amount
        await dinowarriors.increaseTokenAmount(testToken1, 2, {from: ownerAddress})
        assert.equal((await dinowarriors.tokenInfoFromBytes32.call(testToken1)).totalAmount, tokenAmount+2,
            'Tokens were not added')
  })
})