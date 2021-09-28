//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/token/ERC1155/ERC1155.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";

// In Remix, use:
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC1155/ERC1155.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

/**
 * Smart contract used for Alien Samurai Dino Warriors NFT's. Legal terms:
 * Only limited personal non-commercial use and resale rights in the NFT are granted and all copyright and other rights are reserved.
 * The terms and conditions of Alien Samurai Dino Warriors (https://dinowarriors.io) are applicable.
 */
contract DinoWarriors is ERC1155, Ownable() {

    using SafeMath for uint128;
    using SafeMath for uint256;

    // Struct to keep info on all tokens
    struct TokenInfo {
        uint256 mintedAmount;
        uint256 totalAmount;
        bytes32 tier; // Info on aggregated tier level
    }

    // Map each token description to the technical information
    mapping(uint256 => TokenInfo) public tokenInfo;

    // Inner mapping: from address to allowed amount of mint transactions.
    // Outer mapping: current presale list to inner mapping
    mapping(uint128 => mapping(address => uint256)) public whitelist;

    struct Tier {
        uint256 price; // Price in Wei
        uint128 mintable; /*By who can the token be minted?
                            - 0: nobody can mint.
                            - x: everyone with a drop reward between wave 1 and wave x can mint.
                              x can be increased over time to have stepwise priority for pre-sales
                            - Equal to latestDropWave + 1: everyone can mint */
        uint128 dropWave; // In which drop was the tier released?
        uint256 tokenToBurn; // If this token is used to claim minting rights, burn it
        uint256 maxMintPerTransaction; // Maximum amount of tokens to mint in 1 transaction
        bool whitelist; // If true, only token owners listed in the whitelist mapping are allowed to mint
    }


    // Map each tier to it's information
    /** @dev Mapping with tier information */
    mapping(bytes32 => Tier) public tiers;

    // Keep track of latest drop
    uint128 public latestDropWave = 1;

    // Keep track of current whitelist
    uint128 public latestWhitelistWave = 1;

    // A link to the legal terms of the smart contract
    string public legalTerms;

    // Address receiving the funds after minting with fees
    address public wallet;

    // Contract uri for OpenSea
    string contractURI;
    /**
     * @dev The constructor will call the constructer of the ERC1155 contract,
     * and hardcode:
     * - legal terms of the contract
     * - Initial tiers to start with
     *- Initial tokens to start with
     * - Which tokens are preminted by Envoy
     * @param uri_ The URI to link metadata to the NFT's
     */
    constructor(
        string memory uri_,
        string memory contractURI_
        )
        ERC1155(uri_){
            wallet = _msgSender();
            legalTerms = "Only limited personal non-commercial use and resale rights in the NFT are granted and all copyright and other rights are reserved. The terms and conditions of Alien Samurai Dino Warriors (https://dinowarriors.io) are applicable.";
            contractURI = contractURI_;
    }

  //
  // ******************* OWNERSHIP *******************
  //


    function setContractURI(string calldata uri_) external onlyOwner {
        contractURI = uri_;
    }

    /**
     * Function for the owner to update the wallet to which minting fees are sent.
     * By default, this will be the owner of the contract
     * @param wallet_ the address to receive funds
     */
    function updateWallet(address wallet_) external onlyOwner {
        wallet = wallet_; 
    }

    /**
     * @notice Function for the owner to change the link to legal terms.
     * @param legalTerms_ The link to the legal terms.
     */
    function setLegalTerms(string memory legalTerms_) external onlyOwner{
        legalTerms = legalTerms_;
    }

    function tokenInfoFromBytes32(bytes32 token) public view returns (uint256 id, uint256 mintedAmount, uint256 totalAmount, bytes32 tier){
        id = uint256(token);
        mintedAmount = tokenInfo[id].mintedAmount;
        totalAmount = tokenInfo[id].totalAmount;
        tier = tokenInfo[id].tier;
    }
    // Functions to manage tiers
    
    /**
     * Functions to create new tiers, or to modify price and mintable of existing tier.
     * Only the owner can run this function.
     * Drop waves cannot be altered, and should always be higher than the latest drop wave.
     * @param name The human readable key of the tier
     * @param price_ The price that is required for minting tokens of this tier
     * @param mintable_ Wetter the tokens in this tier are already mintable (0 for no).
     * - 0: nobody can mint.
     * - x: everyone with a drop reward between wave 1 and wave x can mint.
     *      x can be increased over time to have stepwise priority for pre-sales
     * - Equal to latestDropWave + 1: everyone can mint 
     * @param dropWave_ In which wave is this drop? For the ASDW cards, this will be 1.
     * @param tokenToBurn_ If only current token owners are allowed to mint, they will need
     * to burn their token in the minting process if it is this token.
     * @param maxMintPerTransaction_ the maximum amount to mint per transaction
     * @param whitelist_ wetter only minters on the whitelist can mint or not
     */
    function addTier(
        bytes32 name,
        uint256 price_,
        uint128 mintable_,
        uint128 dropWave_,
        bytes32 tokenToBurn_,
        uint256 maxMintPerTransaction_,
        bool whitelist_) public onlyOwner{
        
        require(dropWave_ >= latestDropWave,
            "You cannot go back in time");

        require(tiers[name].dropWave == 0,
            "Tier already exists");
        

        tiers[name] = Tier({price: price_,
                            mintable: mintable_,
                            dropWave: dropWave_,
                            tokenToBurn: uint256(tokenToBurn_),
                            maxMintPerTransaction: maxMintPerTransaction_,
                            whitelist: whitelist_});

        if (dropWave_ > latestDropWave) {
            latestDropWave++;
        }
    }

    // /**
    //  * Function to add multiple tiers in 1 transaction
    //  * @dev disabled because contract got to big
    //  * @param names The names of the tiers to add
    //  * @param prices_ The price for each token
    //  * @param mintable_ Which tiers can already be minted?
    //  * @param dropWaves_ The different drop waves
    //  * @param tokensToBurn_ Which tokens should be burned when provided in the minting process?
    //  * @param maxMintPerTransaction_ the maximum amount to mint per transaction
    //  * @param whitelist_ wetter only minters on the whitelist can mint or not
    //  */
    // function addTiersBatch(
    //     bytes32[] memory names,
    //     uint256[] memory prices_,
    //     uint128[] memory mintable_,
    //     uint128[] memory dropWaves_,
    //     bytes32[] memory tokensToBurn_,
    //     uint256[] memory maxMintPerTransaction_,
    //     bool[] memory whitelist_) external onlyOwner{
        
    //     for(uint256 i = 0; i<names.length; i++){
    //         this.addTier(names[i], prices_[i], mintable_[i], dropWaves_[i], tokensToBurn_[i], maxMintPerTransaction_[i], whitelist_[i]);
    //     }    
    // }
    /**
     * Make a tier (un)mintable for (part of) the minters. Only the owner can run this function.
     * @param name The human readable key of the tier
     * @param mintable_ Wetter the tokens in this tier are already mintable (0 for no).
     * - 0: nobody can mint.
     * - x: everyone with a drop reward between wave 1 and wave x can mint.
     *      x can be increased over time to have stepwise priority for pre-sales
     * - Equal to latestDropWave + 1: everyone can mint 
     */
    function setTierMintability(
        bytes32 name,
        uint128 mintable_) external onlyOwner{
            tiers[name].mintable = mintable_;
    }

    /**
     * Change the price of an existing tier.
     * @param name The human readable key of the tier
     * @param price_ New price in wei for the tier
     */
    function setTierPrice(
        bytes32 name,
        uint256 price_) external onlyOwner{
            tiers[name].price = price_;
    }

    /**
     * Change the max amount of tokens to mint in one transaction for this tier.
     * @param name The human readable key of the tier
     * @param maxMintPerTransaction_ New max amount of tokens to mint in 1 transaction
     */
    function setTierMaxMintPerTransaction(
        bytes32 name,
        uint256 maxMintPerTransaction_) external onlyOwner{
            tiers[name].maxMintPerTransaction = maxMintPerTransaction_;
    }


    /**
     * Change the max amount of tokens to mint in one transaction for this tier.
     * @param name The human readable key of the tier
     * @param whitelist_ true if only persons in the whitelist are allowed to mint
     */
    function setTierWhitelist(
        bytes32 name,
        bool whitelist_) external onlyOwner{
            tiers[name].whitelist = whitelist_;
    }
    /**
     * Function to add new tokens. Only the owner can run this function.
     * New Tokens should always have a new human readable name as key,
     * And they need to be in a tier of the latest wave available.
     * @param name human readable name of the token
     * @param totalAmount_ the total amount of tokens available for this token
     * @param tier_ the tier in which the NFT is released, containing the price, dropwave,...
     * @param amountToPreMint The amount of tokens to be preminted by the owner
     */
    function addToken(bytes32 name,
        uint256 totalAmount_,
        bytes32 tier_,
        uint256 amountToPreMint) public onlyOwner{
        
        uint256 nameAsInt = uint256(name);
        require(tokenInfo[nameAsInt].totalAmount == 0,
             "Token already exists");

        // Implicit test if tier exists
        require(tiers[tier_].dropWave >= latestDropWave,
            "You cannot add tokens for previous waves");

        require(amountToPreMint <= totalAmount_,
            "You cannot mint more tokens than the total supply");

        tokenInfo[nameAsInt] = TokenInfo({
                                    mintedAmount: amountToPreMint,
                                    totalAmount: totalAmount_,
                                    tier: tier_
                                    });

        if(amountToPreMint != 0){
            ERC1155._mint(_msgSender(), nameAsInt, amountToPreMint, "");
        }
    }

    /**
     * Overload function when no tokens need to be preminted
     */
    // function addToken(bytes32 name,
    //     uint256 totalAmount_,
    //     bytes32 tier_) public onlyOwner{
    //     this.addToken(name, totalAmount_, tier_, 0);
    // }

    /**
     * Add multiple tokens at once.
     * @param names Array containing the token names
     * @param totalAmounts_ Array containing the total amount for each token. Should have the same length as names.
     * @param tiers_ Array containing the tier for each token. Should have the same length as names.
     * @param amountsToPreMint_ Array containing the amount of tokens to premint for each token.
     *   Should have the same length as names.
     */
    function addTokensBatch(bytes32[] memory names,
        uint256[] memory totalAmounts_,
        bytes32[] memory tiers_,
        uint256[] memory amountsToPreMint_) public onlyOwner{
            require(names.length == totalAmounts_.length
                && names.length == tiers_.length
                && names.length == amountsToPreMint_.length,
                "Lengths of input should be equal");

            for(uint256 i = 0; i<names.length; i++){
                addToken(names[i], totalAmounts_[i], tiers_[i], amountsToPreMint_[i]);
            }
        }
    /**
     * Add new tokens of an existing token. Only the owner can run this function.
     * @param name the name of the token to add
     * @param additionalTokenAmount the amount of tokens to add
     */
    function increaseTokenAmount(bytes32 name,
        uint256 additionalTokenAmount) external onlyOwner{
        tokenInfo[uint256(name)].totalAmount += additionalTokenAmount;
    }

    /**
     * Function to mint tokens.
     * In order to mint tokens, following criteria must be met:
     * - There are still unminted tokens of tokenToMint
     * - The price in ETH sent should equal the price of the tier of tokenToMint.
     * - Depending on the 'mintability' field of the tier of the token,
     *   the minter needs to provide a second token to prove he is allowed to mint.
     *   Of course, the minter should have a positive balance for this token.
     * @param tokenToMint Human readable name of the token that will be minted
     * @param tokenToUse Token provided by the minter to prove he is allowed to mint.
     * The 'mintability' of the 'tier' of tokenToMint will define if the token allows minting or not.
     * The owner should own the token, and the token will possibly be burned in the process.
     */
    function _mint(bytes32 tokenToMint, uint256 amount, bytes32 tokenToUse) external payable {
        uint256 tokenToMintAsInt = uint256(tokenToMint);
        uint256 tokenToUseAsInt = uint256(tokenToUse);

        address account = _msgSender();
        TokenInfo storage tokenToMintObject = tokenInfo[tokenToMintAsInt];

        require(tokenToMintObject.totalAmount > 0,
            "The token to mint does not exists");

        require(tokenToMintObject.totalAmount >= tokenToMintObject.mintedAmount + amount,
            "Insufficient tokens left for this transaction");
        
        Tier memory tierToMint = tiers[tokenToMintObject.tier];

        require(tierToMint.mintable > 0,
            "Token is not open for minting");
             
        require(tierToMint.maxMintPerTransaction >= amount,
            "You cannot mint this amount in one transaction for tokens in this tier");

        if(tierToMint.whitelist == true) {
            require(this.whitelist(latestWhitelistWave, _msgSender()) > 0,
                "You are not whitelisted to mint this amount of tokens");
            whitelist[latestWhitelistWave][account]--;
        }

        // Check if everyone is allowed to mint.
        // If not, check if the token provided gives the right to mint,
        // and burn it if this is required.
        if(tierToMint.mintable <= latestDropWave){

            TokenInfo memory tokenToUseObject = tokenInfo[tokenToUseAsInt];
            Tier memory tierToUse = tiers[tokenToUseObject.tier];


            require(tokenToUseObject.totalAmount > 0,
                "The token provided to prove you can mint does not exists");

            // Check if the token provided gives minting access
            require(tierToMint.mintable >= tierToUse.dropWave,
                    "You are not allowed to mint this token at this point in time.");
            
            // Check if the owner actually owns the token used to claim minting
            require(ERC1155.balanceOf(account, tokenToUseAsInt) >= amount ,
                "You have no balance of the access token provided.");

            // Check if the token needs to be burned before being able to mint
            if(tierToMint.tokenToBurn == tokenToUseAsInt){
                ERC1155._burn(account, tokenToUseAsInt, amount);
            }
        }

        uint256 weiAmount = msg.value;
        require(weiAmount == tierToMint.price * amount, "Invalid ETH paid");
        // Send ETH to wallet
        payable(wallet).transfer(weiAmount);
        

        ERC1155._mint(account, tokenToMintAsInt, amount, "");

        tokenToMintObject.mintedAmount+=amount;

    }

    /*
     * Overloaded function to allow minting tokens without providing a secondary token.
     * This will only work if everyone is allowed to mint the token and is only for ease of use.
     * @param tokenToMint Human readable name of the token that will be minted
     */
    // function _mint(bytes32 tokenToMint, uint256 amount) external payable {
    //     this._mint(tokenToMint, amount,'');
    // }

    /**
     * Update the accounts in the whitelist for minting.
     * @param to a list of addresses to be whitelisted
     * @param newWhitelistWave if true, the old whitelisted address cannot mint anymore
     * @param maxAmounts the maximum amount of tokens to mint for this account
     */
    function updateWhitelist(
        address[] memory to,
        bool newWhitelistWave,
        uint256[] memory maxAmounts
    ) external onlyOwner {
     
        require(to.length == maxAmounts.length,
            "Lengths of input arrays should be equal");   
        if(newWhitelistWave == true) {
            latestWhitelistWave++;
        }

        for(uint256 i = 0; i < to.length; i++){
            whitelist[latestWhitelistWave][to[i]] = maxAmounts[i];
        }
    }

    /**
     * Function to increase the latest whitelist wave, so no one is in the latest wave anymore.
     */

    function disableWhitelist() external onlyOwner {
        latestWhitelistWave++;
    }

}