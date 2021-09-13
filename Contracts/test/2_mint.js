const truffleAssert = require('truffle-assertions');
const DinoWarriors = artifacts.require("DinoWarriors");

contract("Test minting logic of different tiers", function(accounts) {
    
    
    it("Test minting for everyone", async () => {
        // Global test constants
        const ownerAddress = accounts[0];
        const minterAddress1 = accounts[1];
        const minterAddress2 = accounts[2];
        const minterAddress3 = accounts[3];
        const minterAddress4 = accounts[4];
        const minterAddresses = [minterAddress1, minterAddress2, minterAddress3, minterAddress4]
    
        const dinowarriors = await DinoWarriors.deployed()
        
        // Add a test tier and token to the contract
        const testToken = web3.utils.fromAscii('TEST_TOKEN');
        const tokenPrice = 10;
        const tokenAmount = 3;
        const dropWave = 1;
        await dinowarriors.addTier(testToken, tokenPrice, 0, dropWave, web3.utils.fromAscii(''), {from: ownerAddress});
        await dinowarriors.addToken(testToken, tokenAmount, testToken, {from: ownerAddress});
        
        // Change tier price to have enough funds for minting all tokens
        await dinowarriors.setTierPrice(testToken, 10,{from: ownerAddress});
        assert.equal((await dinowarriors.tiers.call(testToken)).price, 10,
            "The price was not adjusted correctly")

        // Mining should not be possible yet
        await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32)'](testToken, {from: minterAddress1}),
            "You have no balance of the access token provided.")

        // Make the token mintable
        await dinowarriors.setTierMintability(testToken, 2 ,{from: ownerAddress});

        // Without paying the tokenPrice, minting fails
        await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32)'](testToken, {from: minterAddress1}),
            "Invalid ETH paid")

        // Mint all tokens
        let ownerBalance = web3.utils.toBN(await web3.eth.getBalance(ownerAddress))
        for(let i=0; i<tokenAmount; i++){
            await dinowarriors.methods['_mint(bytes32)'](testToken, {from: minterAddresses[i], value: tokenPrice})
            // Check if minter received tokens
            assert.equal(await dinowarriors.balanceOf(minterAddresses[i], (await dinowarriors.tokenInfo.call(testToken)).id), 1,
                "Tokens not on minter balance")
        }


        // Check if all funds were received by the owner
        let calculatedOwnerBalance = ownerBalance.add(web3.utils.toBN(tokenPrice*tokenAmount)).toString()
        let newOwnerBalance = web3.utils.toBN(await web3.eth.getBalance(ownerAddress)).toString()
        assert.equal(calculatedOwnerBalance, newOwnerBalance,
            "Owner did not receive all funds")

        // All tokens are minted, no minting is possible anymore
        await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32)'](testToken, {from: minterAddress4, value: tokenPrice}),
            "All tokens are already minted for this ID!")

  })


  it("Test minting with priority", async () => {
    // Global test constants
    const ownerAddress = accounts[0];
    const minterAddress1 = accounts[1];
    const minterAddress2 = accounts[2];
    const minterAddress3 = accounts[3];
    const minterAddress4 = accounts[4];
    const minterAddresses = [minterAddress1, minterAddress2, minterAddress3, minterAddress4]

    const dinowarriors = await DinoWarriors.deployed()
    
    // Add a test tier and token to the contract
    const testToken1 = web3.utils.fromAscii('TEST_TOKEN_1');
    const testToken2 = web3.utils.fromAscii('TEST_TOKEN_2');
    const testToken3 = web3.utils.fromAscii('TEST_TOKEN_3');
    const tokenPrice = 10;
    const tokenAmount = 3;
    const dropWave = 1;
    // Token 1 is mintable for everyone 
    await dinowarriors.addTier(testToken1, tokenPrice, 2, dropWave, web3.utils.fromAscii(''), {from: ownerAddress});
    await dinowarriors.addToken(testToken1, tokenAmount, testToken1, {from: ownerAddress});
    // Token 2 is mintable for tokenholders of wave1 (e.g. token1)
    await dinowarriors.addTier(testToken2, tokenPrice, 1, dropWave, web3.utils.fromAscii(''), {from: ownerAddress});
    await dinowarriors.addToken(testToken2, tokenAmount, testToken2, {from: ownerAddress});
    // Token 3 is mintable for tokenholders of wave1 (e.g. token1), but requires burning of the token
    await dinowarriors.addTier(testToken3, tokenPrice, 1, dropWave, testToken1, {from: ownerAddress});
    await dinowarriors.addToken(testToken3, tokenAmount, testToken3, {from: ownerAddress});
    
    // Mining of token1 should work, token2 and token3 should not be possible yet
    await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,bytes32)'](testToken2, testToken1, {from: minterAddress1, value: tokenPrice}),
        "You have no balance of the access token provided.")
    await truffleAssert.reverts(dinowarriors.methods['_mint(bytes32,bytes32)'](testToken3, testToken1, {from: minterAddress1, value: tokenPrice}),
        "You have no balance of the access token provided.")
    
    await dinowarriors.methods['_mint(bytes32)'](testToken1, {from: minterAddress1, value: tokenPrice})
    assert.equal(await dinowarriors.balanceOf(minterAddress1, (await dinowarriors.tokenInfo.call(testToken1)).id), 1,
        "Tokens have the wrong balance")
    assert.equal(await dinowarriors.balanceOf(minterAddress1, (await dinowarriors.tokenInfo.call(testToken2)).id), 0,
        "Tokens have the wrong balance")
    assert.equal(await dinowarriors.balanceOf(minterAddress1, (await dinowarriors.tokenInfo.call(testToken3)).id), 0,
        "Tokens have the wrong balance")

    // After minting token1, token2 should be mintable
    await dinowarriors.methods['_mint(bytes32,bytes32)'](testToken2, testToken1, {from: minterAddress1, value: tokenPrice})
    assert.equal(await dinowarriors.balanceOf(minterAddress1, (await dinowarriors.tokenInfo.call(testToken1)).id), 1,
        "Tokens have the wrong balance")
    assert.equal(await dinowarriors.balanceOf(minterAddress1, (await dinowarriors.tokenInfo.call(testToken2)).id), 1,
        "Tokens have the wrong balance")
    assert.equal(await dinowarriors.balanceOf(minterAddress1, (await dinowarriors.tokenInfo.call(testToken3)).id), 0,
        "Tokens have the wrong balance")


    // After minting token1, token3 should be mintable when burning token1
    await dinowarriors.methods['_mint(bytes32,bytes32)'](testToken3, testToken1, {from: minterAddress1, value: tokenPrice})
    assert.equal(await dinowarriors.balanceOf(minterAddress1, (await dinowarriors.tokenInfo.call(testToken1)).id), 0,
        "Tokens have the wrong balance")
    assert.equal(await dinowarriors.balanceOf(minterAddress1, (await dinowarriors.tokenInfo.call(testToken2)).id), 1,
        "Tokens have the wrong balance")
    assert.equal(await dinowarriors.balanceOf(minterAddress1, (await dinowarriors.tokenInfo.call(testToken3)).id), 1,
        "Tokens have the wrong balance")

    })

})