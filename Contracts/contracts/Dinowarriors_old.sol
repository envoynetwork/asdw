pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/token/ERC1155/ERC1155.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";

contract DinoWarriorsOld is ERC1155, Ownable() {

    // Token IDS
    uint256 public constant DIAMOND = 0;
    // Golden tier
    uint256 public constant ANIMATED_DINO = 1;
    uint256 public constant ANIMATED_SHARK = 2;
    uint256 public constant ANIMATED_MAMMAL_KING = 3;
    uint256 public constant ANIMATED_TREX_GLASSES = 4;
    uint256 public constant SILVER = 5;

    uint256[] public tierBoundaries;
    
    // Token info
    struct Metadata {
        uint256 price; // Price in wei
        bool random; // Should there be random generation of the number?
    }

    mapping(uint128 => mapping(uint128 => Metadata)) public tokenData;

    // A link to the legal terms of the smart contract
    string legalTerms = 'link_to_terms';

    constructor(string uri_, uint256[] tierBoundaries_) ERC1155(uri_){
        tierBoundaries = tierBoundaries_;
    }

    /**
     * @notice Function for the owner to change the link to legal terms.
     */
    function setLegalTerms(string legalTerms_) onlyOwner{
        legalTerms = legalTerms_;
    }

    function getTier(uint256 tier) view returns(uint256) {
        for(i=0;i++;i<tierBoundaries.length){
            if (tier < tierBoundaries[i]){
                return i;
            }
        }

        return 0;
    }

    function addTier(uint256 tier) public onlyOwner {
        require(tierBoundaries[tierBoundaries.length-1] < tier,
            "The new tier boundary should be greater than the current highest tier.");
        tierBoundaries.push(tier);
    }

    function _mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public override {
        ERC1155._mint(account, id, 1, )
    }

}