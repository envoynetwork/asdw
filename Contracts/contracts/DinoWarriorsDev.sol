//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/token/ERC1155/ERC1155.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

// In Remix, use:
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC1155/ERC1155.sol";
//import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol";

/**
 * Only limited personal non-commercial use and resale rights in the NFT are granted and all copyright and other rights are reserved.
 * The terms and conditions of Alien Samurai Dino Warriors (https://dinowarriors.io) are applicable.
 */
contract DinoWarriorsDev is ERC1155, Ownable() {

    // Events for minting and activating the event
    event Minted(address indexed account, bytes32 indexed token, uint minted);

    // Struct to keep info on all tokens
    struct TokenInfo {
        uint256 id;
        uint256 mintedAmount;
        uint256 totalAmount;
        bytes32 tier; // Info on aggregated tier level
    }

    // Map each token description to the technical information
    mapping(bytes32 => TokenInfo) public tokenInfo;

    struct Tier {
        uint256 price; // Price in Wei
        uint256 mintable; /*By who can the token be minted?
                            - 0: nobody can mint.
                            - x: everyone with a drop reward between wave 1 and wave x can mint.
                              x can be increased over time to have stepwise priority for pre-sales
                            - Equal to latestDropWave + 1: everyone can mint */
        uint256 dropWave; // In which drop was the tier released?
        bytes32 tokenToBurn; // If this token is used to claim minting rights, burn it
    }


    // Map each tier to it's information
    mapping(bytes32 => Tier) public tiers;

    // Keep track of latest drop
    uint256 public latestDropWave = 1;

    // Current token id
    uint256 currentTokenId;

    // A link to the legal terms of the smart contract
    string public legalTerms;

    // Address receiving the funds after minting with fees
    address public wallet;

    constructor(
        string memory uri_
        )
        ERC1155(uri_){
            wallet = _msgSender();

            legalTerms = "Only limited personal non-commercial use and resale rights in the NFT are granted and all copyright and other rights are reserved. The terms and conditions of Alien Samurai Dino Warriors (https://dinowarriors.io) are applicable.";
            /* Set Tiers */
            // S
            tiers['OG_CARD'] = Tier({price: 0.0000015 ether, mintable: 0, dropWave: 1, tokenToBurn: ''});
            tiers['SILVER'] = Tier({price: 0, mintable: 0, dropWave: 1, tokenToBurn: 'OG_CARD'});
            tiers['GOLD'] = Tier({price: 0.0000055 ether, mintable: 0, dropWave: 1, tokenToBurn: ''});
            tiers['DIAMOND'] = Tier({price: 0, mintable: 2, dropWave: 1, tokenToBurn: ''});

            // Token 0: OG_CARD
            tokenInfo['OG_CARD'] = TokenInfo({id: 0, mintedAmount: 0, totalAmount: 5000, tier: 'OG_CARD'});
            // Silver ASDW cards
            tokenInfo['REGULAR_T_REX'] = TokenInfo({id: 1, mintedAmount: 0, totalAmount: 200, tier: 'SILVER'});
            tokenInfo['REGULAR_TRICERATOPS'] = TokenInfo({id: 2, mintedAmount: 0, totalAmount: 200, tier: 'SILVER'});
            tokenInfo['REGULAR_DILOPHOSAURUS'] = TokenInfo({id: 3, mintedAmount: 0, totalAmount: 200, tier: 'SILVER'});
            tokenInfo['REGULAR_STEGOSAURUS'] = TokenInfo({id: 4, mintedAmount: 0, totalAmount: 200, tier: 'SILVER'});
            // tokenInfo['REGULAR_VELOCIRAPTOR'] = TokenInfo({id: 5, mintedAmount: 0, totalAmount: 200, tier: 'SILVER'});
            // tokenInfo['REGULAR_MAMMOTH'] = TokenInfo({id: 6, mintedAmount: 0, totalAmount: 300, tier: 'SILVER'});
            // tokenInfo['REGULAR_SABRETOOTH_TIGER'] = TokenInfo({id: 7, mintedAmount: 0, totalAmount: 300, tier: 'SILVER'});
            // tokenInfo['REGULAR_GORILLA'] = TokenInfo({id: 8, mintedAmount: 0, totalAmount: 300, tier: 'SILVER'});
            // tokenInfo['REGULAR_HIPPO'] = TokenInfo({id: 9, mintedAmount: 0, totalAmount: 300, tier: 'SILVER'});
            // tokenInfo['HOLOGRAPHIC_T_REX'] = TokenInfo({id: 10, mintedAmount: 0, totalAmount: 5, tier: 'SILVER'});
            // tokenInfo['HOLOGRAPHIC_TRICERATOPS'] = TokenInfo({id: 11, mintedAmount: 0, totalAmount: 5, tier: 'SILVER'});
            // tokenInfo['HOLOGRAPHIC_DILOPHOSAURUS'] = TokenInfo({id: 12, mintedAmount: 0, totalAmount: 5, tier: 'SILVER'});
            // tokenInfo['HOLOGRAPHIC_STEGOSAURUS'] = TokenInfo({id: 13, mintedAmount: 0, totalAmount: 5, tier: 'SILVER'});
            // tokenInfo['HOLOGRAPHIC_VELOCIRAPTOR'] = TokenInfo({id: 14, mintedAmount: 0, totalAmount: 5, tier: 'SILVER'});
            // tokenInfo['HOLOGRAPHIC_MAMMOTH'] = TokenInfo({id: 15, mintedAmount: 0, totalAmount: 12, tier: 'SILVER'});
            // tokenInfo['HOLOGRAPHIC_SABRETOOTH_TIGER'] = TokenInfo({id: 16, mintedAmount: 0, totalAmount: 12, tier: 'SILVER'});
            // tokenInfo['HOLOGRAPHIC_GORILLA'] = TokenInfo({id: 17, mintedAmount: 0, totalAmount: 12, tier: 'SILVER'});
            // tokenInfo['HOLOGRAPHIC_HIPPO'] = TokenInfo({id: 18, mintedAmount: 0, totalAmount: 12, tier: 'SILVER'});
            // tokenInfo['REVERSE_HOLO_T_REX_NAKED'] = TokenInfo({id: 19, mintedAmount: 0, totalAmount: 1, tier: 'SILVER'});
            // tokenInfo['REVERSE_HOLO_T_REX'] = TokenInfo({id: 20, mintedAmount: 0, totalAmount: 2, tier: 'SILVER'});
            // tokenInfo['REVERSE_HOLO_TRICERATOPS'] = TokenInfo({id: 21, mintedAmount: 0, totalAmount: 2, tier: 'SILVER'});
            // tokenInfo['REVERSE_HOLO_DILOPHOSAURUS'] = TokenInfo({id: 22, mintedAmount: 0, totalAmount: 2, tier: 'SILVER'});
            // tokenInfo['REVERSE_HOLO_STEGOSAURUS'] = TokenInfo({id: 23, mintedAmount: 0, totalAmount: 2, tier: 'SILVER'});
            // tokenInfo['REVERSE_HOLO_VELOCIRAPTOR'] = TokenInfo({id: 24, mintedAmount: 0, totalAmount: 2, tier: 'SILVER'});
            // tokenInfo['REVERSE_HOLO_MAMMOTH'] = TokenInfo({id: 25, mintedAmount: 0, totalAmount: 4, tier: 'SILVER'});
            // tokenInfo['REVERSE_HOLO_SABRETOOTH_TIGER'] = TokenInfo({id: 26, mintedAmount: 0, totalAmount: 4, tier: 'SILVER'});
            // tokenInfo['REVERSE_HOLO_GORILLA'] = TokenInfo({id: 27, mintedAmount: 0, totalAmount: 4, tier: 'SILVER'});
            // tokenInfo['REVERSE_HOLO_HIPPO'] = TokenInfo({id: 28, mintedAmount: 0, totalAmount: 4, tier: 'SILVER'});
            // tokenInfo['ROSE_GOLD_T_REX_NAKED'] = TokenInfo({id: 29, mintedAmount: 0, totalAmount: 2, tier: 'SILVER'});
            // tokenInfo['ROSE_GOLD_T_REX'] = TokenInfo({id: 30, mintedAmount: 0, totalAmount: 5, tier: 'SILVER'});
            // tokenInfo['ROSE_GOLD_TRICERATOPS'] = TokenInfo({id: 31, mintedAmount: 0, totalAmount: 5, tier: 'SILVER'});
            // tokenInfo['ROSE_GOLD_DILOPHOSAURUS'] = TokenInfo({id: 32, mintedAmount: 0, totalAmount: 5, tier: 'SILVER'});
            // tokenInfo['ROSE_GOLD_STEGOSAURUS'] = TokenInfo({id: 33, mintedAmount: 0, totalAmount: 5, tier: 'SILVER'});
            // tokenInfo['ROSE_GOLD_VELOCIRAPTOR'] = TokenInfo({id: 34, mintedAmount: 0, totalAmount: 5, tier: 'SILVER'});
            // tokenInfo['ROSE_GOLD_MAMMOTH'] = TokenInfo({id: 35, mintedAmount: 0, totalAmount: 10, tier: 'SILVER'});
            // tokenInfo['ROSE_GOLD_SABRETOOTH_TIGER'] = TokenInfo({id: 36, mintedAmount: 0, totalAmount: 10, tier: 'SILVER'});
            // tokenInfo['ROSE_GOLD_GORILLA'] = TokenInfo({id: 37, mintedAmount: 0, totalAmount: 10, tier: 'SILVER'});
            // tokenInfo['ROSE_GOLD_HIPPO'] = TokenInfo({id: 38, mintedAmount: 0, totalAmount: 10, tier: 'SILVER'});
            // tokenInfo['GOLD_T_REX_NAKED'] = TokenInfo({id: 39, mintedAmount: 0, totalAmount: 3, tier: 'SILVER'});
            // tokenInfo['GOLD_T_REX'] = TokenInfo({id: 40, mintedAmount: 0, totalAmount: 10, tier: 'SILVER'});
            // tokenInfo['GOLD_TRICERATOPS'] = TokenInfo({id: 41, mintedAmount: 0, totalAmount: 10, tier: 'SILVER'});
            // tokenInfo['GOLD_DILOPHOSAURUS'] = TokenInfo({id: 42, mintedAmount: 0, totalAmount: 10, tier: 'SILVER'});
            // tokenInfo['GOLD_STEGOSAURUS'] = TokenInfo({id: 43, mintedAmount: 0, totalAmount: 10, tier: 'SILVER'});
            // tokenInfo['GOLD_VELOCIRAPTOR'] = TokenInfo({id: 44, mintedAmount: 0, totalAmount: 10, tier: 'SILVER'});
            // tokenInfo['GOLD_MAMMOTH'] = TokenInfo({id: 45, mintedAmount: 0, totalAmount: 20, tier: 'SILVER'});
            // tokenInfo['GOLD_SABRETOOTH_TIGER'] = TokenInfo({id: 46, mintedAmount: 0, totalAmount: 20, tier: 'SILVER'});
            // tokenInfo['GOLD_GORILLA'] = TokenInfo({id: 47, mintedAmount: 0, totalAmount: 20, tier: 'SILVER'});
            // tokenInfo['GOLD_HIPPO'] = TokenInfo({id: 48, mintedAmount: 0, totalAmount: 20, tier: 'SILVER'});
            // tokenInfo['SILVER_T_REX_NAKED'] = TokenInfo({id: 49, mintedAmount: 0, totalAmount: 4, tier: 'SILVER'});
            // tokenInfo['SILVER_T_REX'] = TokenInfo({id: 50, mintedAmount: 0, totalAmount: 15, tier: 'SILVER'});
            // tokenInfo['SILVER_TRICERATOPS'] = TokenInfo({id: 51, mintedAmount: 0, totalAmount: 15, tier: 'SILVER'});
            // tokenInfo['SILVER_DILOPHOSAURUS'] = TokenInfo({id: 52, mintedAmount: 0, totalAmount: 15, tier: 'SILVER'});
            // tokenInfo['SILVER_STEGOSAURUS'] = TokenInfo({id: 53, mintedAmount: 0, totalAmount: 15, tier: 'SILVER'});
            // tokenInfo['SILVER_VELOCIRAPTOR'] = TokenInfo({id: 54, mintedAmount: 0, totalAmount: 15, tier: 'SILVER'});
            // tokenInfo['SILVER_MAMMOTH'] = TokenInfo({id: 55, mintedAmount: 0, totalAmount: 25, tier: 'SILVER'});
            // tokenInfo['SILVER_SABRETOOTH_TIGER'] = TokenInfo({id: 56, mintedAmount: 0, totalAmount: 25, tier: 'SILVER'});
            // tokenInfo['SILVER_GORILLA'] = TokenInfo({id: 57, mintedAmount: 0, totalAmount: 25, tier: 'SILVER'});
            // tokenInfo['SILVER_HIPPO'] = TokenInfo({id: 58, mintedAmount: 0, totalAmount: 25, tier: 'SILVER'});
            // tokenInfo['BRONZE_T_REX_NAKED'] = TokenInfo({id: 59, mintedAmount: 0, totalAmount: 10, tier: 'SILVER'});
            // tokenInfo['BRONZE_T_REX'] = TokenInfo({id: 60, mintedAmount: 0, totalAmount: 50, tier: 'SILVER'});
            // tokenInfo['BRONZE_TRICERATOPS'] = TokenInfo({id: 61, mintedAmount: 0, totalAmount: 50, tier: 'SILVER'});
            // tokenInfo['BRONZE_DILOPHOSAURUS'] = TokenInfo({id: 62, mintedAmount: 0, totalAmount: 50, tier: 'SILVER'});
            // tokenInfo['BRONZE_STEGOSAURUS'] = TokenInfo({id: 63, mintedAmount: 0, totalAmount: 50, tier: 'SILVER'});
            // tokenInfo['BRONZE_VELOCIRAPTOR'] = TokenInfo({id: 64, mintedAmount: 0, totalAmount: 50, tier: 'SILVER'});
            // tokenInfo['BRONZE_MAMMOTH'] = TokenInfo({id: 65, mintedAmount: 0, totalAmount: 100, tier: 'SILVER'});
            // tokenInfo['BRONZE_SABRETOOTH_TIGER'] = TokenInfo({id: 66, mintedAmount: 0, totalAmount: 100, tier: 'SILVER'});
            // tokenInfo['BRONZE_GORILLA'] = TokenInfo({id: 67, mintedAmount: 0, totalAmount: 100, tier: 'SILVER'});
            // tokenInfo['BRONZE_HIPPO'] = TokenInfo({id: 68, mintedAmount: 0, totalAmount: 100, tier: 'SILVER'});
            // tokenInfo['RAINBOW_T_REX_NAKED'] = TokenInfo({id: 69, mintedAmount: 0, totalAmount: 1, tier: 'SILVER'});
            // tokenInfo['RAINBOW_T_REX'] = TokenInfo({id: 70, mintedAmount: 0, totalAmount: 2, tier: 'SILVER'});
            // tokenInfo['RAINBOW_TRICERATOPS'] = TokenInfo({id: 71, mintedAmount: 0, totalAmount: 2, tier: 'SILVER'});
            // tokenInfo['RAINBOW_DILOPHOSAURUS'] = TokenInfo({id: 72, mintedAmount: 0, totalAmount: 2, tier: 'SILVER'});
            // tokenInfo['RAINBOW_STEGOSAURUS'] = TokenInfo({id: 73, mintedAmount: 0, totalAmount: 2, tier: 'SILVER'});
            // tokenInfo['RAINBOW_VELOCIRAPTOR'] = TokenInfo({id: 74, mintedAmount: 0, totalAmount: 2, tier: 'SILVER'});
            // tokenInfo['RAINBOW_MAMMOTH'] = TokenInfo({id: 75, mintedAmount: 0, totalAmount: 5, tier: 'SILVER'});
            // tokenInfo['RAINBOW_SABRETOOTH_TIGER'] = TokenInfo({id: 76, mintedAmount: 0, totalAmount: 5, tier: 'SILVER'});
            // tokenInfo['RAINBOW_GORILLA'] = TokenInfo({id: 77, mintedAmount: 0, totalAmount: 5, tier: 'SILVER'});
            // tokenInfo['RAINBOW_HIPPO'] = TokenInfo({id: 78, mintedAmount: 0, totalAmount: 5, tier: 'SILVER'});
            // tokenInfo['8_BIT_T_REX'] = TokenInfo({id: 79, mintedAmount: 0, totalAmount: 150, tier: 'SILVER'});
            // tokenInfo['8_BIT_TRICERATOPS'] = TokenInfo({id: 80, mintedAmount: 0, totalAmount: 150, tier: 'SILVER'});
            // tokenInfo['8_BIT_DILOPHOSAURUS'] = TokenInfo({id: 81, mintedAmount: 0, totalAmount: 150, tier: 'SILVER'});
            // tokenInfo['8_BIT_STEGOSAURUS'] = TokenInfo({id: 82, mintedAmount: 0, totalAmount: 150, tier: 'SILVER'});
            // tokenInfo['8_BIT_VELOCIRAPTOR'] = TokenInfo({id: 83, mintedAmount: 0, totalAmount: 150, tier: 'SILVER'});
            // tokenInfo['8_BIT_MAMMOTH'] = TokenInfo({id: 84, mintedAmount: 0, totalAmount: 195, tier: 'SILVER'});
            // tokenInfo['8_BIT_SABRETOOTH_TIGER'] = TokenInfo({id: 85, mintedAmount: 0, totalAmount: 195, tier: 'SILVER'});
            // tokenInfo['8_BIT_GORILLA'] = TokenInfo({id: 86, mintedAmount: 0, totalAmount: 195, tier: 'SILVER'});
            // tokenInfo['8_BIT_HIPPO'] = TokenInfo({id: 87, mintedAmount: 0, totalAmount: 195, tier: 'SILVER'});
            // tokenInfo['8_BIT_SELECT_PLAYER_1'] = TokenInfo({id: 88, mintedAmount: 0, totalAmount: 20, tier: 'SILVER'});
            // tokenInfo['8_BIT_SELECT_PLAYER_2'] = TokenInfo({id: 89, mintedAmount: 0, totalAmount: 20, tier: 'SILVER'});
            // tokenInfo['8_BIT_SELECT_PLAYER_3'] = TokenInfo({id: 90, mintedAmount: 0, totalAmount: 20, tier: 'SILVER'});
            // tokenInfo['8_BIT_SELECT_PLAYER_4'] = TokenInfo({id: 91, mintedAmount: 0, totalAmount: 20, tier: 'SILVER'});
            // tokenInfo['8_BIT_SELECT_PLAYER_5'] = TokenInfo({id: 92, mintedAmount: 0, totalAmount: 20, tier: 'SILVER'});
            // Gold ASDW cards
            tokenInfo['VELOCIRAPTOR'] = TokenInfo({id: 93, mintedAmount: 0, totalAmount: 100, tier: 'GOLD'});
            tokenInfo['DILOPHOSAURUS'] = TokenInfo({id: 94, mintedAmount: 0, totalAmount: 100, tier: 'GOLD'});
            tokenInfo['TRICERATOPS'] = TokenInfo({id: 95, mintedAmount: 0, totalAmount: 100, tier: 'GOLD'});
            tokenInfo['STEGOSAURUS'] = TokenInfo({id: 96, mintedAmount: 0, totalAmount: 100, tier: 'GOLD'});
            tokenInfo['TYRANNOSAUR'] = TokenInfo({id: 97, mintedAmount: 0, totalAmount: 100, tier: 'GOLD'});
            tokenInfo['TYRANNOSAUR_WITH_LASER_EYES'] = TokenInfo({id: 98, mintedAmount: 0, totalAmount: 40, tier: 'GOLD'});
            tokenInfo['MAMMAL_KING'] = TokenInfo({id: 99, mintedAmount: 0, totalAmount: 35, tier: 'GOLD'});
            tokenInfo['CYBERSHARK'] = TokenInfo({id: 100, mintedAmount: 0, totalAmount: 25, tier: 'GOLD'});
            // Diamond ASDW cards
            tokenInfo['DIAMOND'] = TokenInfo({id: 101, mintedAmount: 0, totalAmount: 1, tier: 'DIAMOND'});
            currentTokenId = 102;
            // Diamond minted by Envoy for direct auction
            _mint('DIAMOND', '');
    }

  //
  // ******************* OWNERSHIP *******************
  //

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

    // Functions to manage tiers
    
    /**
     * Functions to create new tiers, or to modify price and mintable of existing tier.
     * Drop waves cannot be altered, and should always be higher than the latest drop wave.
     */

    function addTier(
        bytes32 name,
        uint256 price_,
        uint256 mintable_,
        uint256 dropWave_,
        bytes32 tokenToBurn_) external onlyOwner{
        
        require(dropWave_ >= latestDropWave,
            "You cannot go back in time");

        require(tiers[name].dropWave == 0,
            "Tier already exists");
        

        tiers[name] = Tier({price: price_,
                            mintable: mintable_,
                            dropWave: dropWave_,
                            tokenToBurn: tokenToBurn_});

        if (dropWave_ > latestDropWave) {
            latestDropWave++;
        }
    }

    function setTierMintability(
        bytes32 name,
        uint256 mintable_) external onlyOwner{
            tiers[name].mintable = mintable_;
    }

    function setTierPrice(
        bytes32 name,
        uint256 price_) external onlyOwner{
            tiers[name].price = price_;
    }


    /**
     * Function to add new tokens.
     * New Tokens should always
     */
    function addToken(bytes32 name,
        uint256 totalAmount_,
        bytes32 tier_) external onlyOwner{
        
        require(tokenInfo[name].totalAmount == 0,
            "Token already exists");

        // Implicit test if tier exists
        require(tiers[tier_].dropWave >= latestDropWave,
            "You cannot add tokens for previous waves");

        tokenInfo[name] = TokenInfo({id: currentTokenId,
                                    mintedAmount: 0,
                                    totalAmount: totalAmount_,
                                    tier: tier_
                                    });
        
        currentTokenId++;
    }

    /**
     * Add new tokens of an existing token
     * @param name the name of the token to add
     * @param additionalTokenAmount the amount of tokens to add
     */
    function increaseTokenAmount(bytes32 name,
        uint256 additionalTokenAmount) external onlyOwner{
        tokenInfo[name].totalAmount += additionalTokenAmount;
    }

    /**
     * Function to mint tokens.
     * In order to mint tokens, following criteria must be met:
     *   - You must provide a token
     */
    function _mint(bytes32 tokenToMint, bytes32 tokenToUse) public payable {

        address account = _msgSender();
        TokenInfo storage tokenToMintObject = tokenInfo[tokenToMint];


        require(tokenToMintObject.totalAmount > tokenToMintObject.mintedAmount,
            "All tokens are already minted for this ID!");
        
        Tier storage tierToMint = tiers[tokenToMintObject.tier];

        // Check if everyone is allowed to mint.
        // If not, check if the token provided gives the right to mint,
        // and burn it if this is required.
        if(tierToMint.mintable <= latestDropWave){

            TokenInfo storage tokenToUseObject = tokenInfo[tokenToUse];
            Tier storage tierToUse = tiers[tokenToUseObject.tier];
            require(ERC1155.balanceOf(account, tokenToUseObject.id) > 0,
                "You have no balance of the access token provided.");

            // Check if the token provided gives minting access
            require((tierToMint.mintable != 0) &&
                    ((tierToMint.mintable >= tierToUse.dropWave) || tierToMint.mintable == latestDropWave),
                    "You are not allowed to mint this token at this point in time.");
            
            // Check if the token needs to be burned before being able to mint
            if(tierToMint.tokenToBurn == tokenToUse){
                ERC1155._burn(account, tokenToUseObject.id, 1);
            }
        }

        if(tierToMint.price > 0){
            uint256 weiAmount = msg.value;
            require(weiAmount == tierToMint.price, "Invalid ETH paid");
            // Send ETH to wallet
            payable(wallet).transfer(weiAmount);
        }


        ERC1155._mint(account, tokenToMintObject.id, 1, "");

        tokenToMintObject.mintedAmount++;
        emit Minted(account, tokenToMint, tokenToMintObject.mintedAmount);

    }

    function _mint(bytes32 tokenToMint) public payable {
        _mint(tokenToMint, '');
    }
    // Disable minting inherited from ERC1155
    function _mint (
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data) internal override pure {
        revert("This function should be called with 2 bytes32 parameters");
    }

    function _mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data) internal override pure {
        revert("This contract does not mint batches.");
    }

}