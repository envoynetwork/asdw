pragma solidity ^0.8.0;

import "openzeppelin-solidity/contracts/token/ERC1155/ERC1155.sol";
import "openzeppelin-solidity/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

/**
 * Only limited personal non-commercial use and resale rights in the NFT are granted and all copyright and other rights are reserved.
 * The terms and conditions of Alien Samurai Dino Warriors (https://dinowarriors.io) are applicable
 */
contract DinoWarriors is VRFConsumerBase, ERC1155, Ownable() {

    // Events if minting fails for an account
    event StringFailure(address indexed account, uint256 randomness, string stringFailure);
    event BytesFailure(address indexed account, uint256 randomness , bytes bytesFailure);

    // Tier price in wei
    uint256 public price;

    // Amount of possible tokens
    uint256 public maxTokenAmount;

    // Current tokenAmount
    uint256 public currentTokenAmount = 0;

    // A link to the legal terms of the smart contract
    string public legalTerms;

    // Metadata of the tokens
    struct MetaData {
        string character;
        string card_type;
        string max_amount;
    }
    
    // Keep track of tokens already minted
    mapping (uint256=>bool) public mintedTokens;

    // Random generator arguments
    bytes32 internal keyHash;
    uint256 internal fee;
    address public linkToken;
    address public vrfCoordinator;

    // Keep track of request ID's for minters
    mapping(bytes32 => address) public requestIdToAddress;

    constructor(uint256 price,
        uint256 maxTokenAmount_,
        string legalTerms_,
        string uri_,
        address vrfCoordinator_,
        address linkToken_,
        int256 fee_,
        bytes32 keyHash_)
        ERC1155(uri_)
        VRFConsumerBase(vrfCoordinator_, linkToken_) {
            maxTokenAmount = maxTokenAmount_;
            legalTerms = legalTerms_;
            fee = fee_;
            keyHash = keyHash_;
    }

    /**
     * @notice Function for the owner to change the link to legal terms.
     * @param legalTerms_ The link to the legal terms.
     */
    function setLegalTerms(string legalTerms_) onlyOwner{
        legalTerms = legalTerms_;
    }

    /**
     * @notice Function to fetch a random number at VRG
     * @notice and assign the request ID to an account.
     * @notice The request ID will be used in the fallback
     * @notice containing the random number returned and
     * @notice will be used to mint a new token.
     * @return bytes32 The request ID for VRG
     */
    function getRandomNumber() public returns (bytes32 requestId) {

        require(LINK.balanceOf(address(this)) >= fee,
            "Not enough LINK - fill contract with LINK");
        require(maxTokenAmount > currentTokenAmount,
            "All tokens are already minted");
        
        address account = _msgsender();

        bytes32 requestId = requestRandomness(keyHash, fee);
        requestIdToAddress[requestId] = _msgSender();

        // Already increment the token amount to avoid
        // new random requests when the last token is only
        // waiting on a random number to be minted.
        currentTokenAmount++; 
        return requestId;
    }

    /**
     * Callback function used by VRF Coordinator
     * @param bytes32 The request id of the initial request.
     * Will be used to fetch the original requester address
     * @param uint256 The random number to be filled in by Chainlink.
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        // Fetch the address of the requester
        address requestAddress = requestIdToAddress[requestId];
        
        // Try to mint, but do not revert.
        // If minting fails, notify users they should retry manually
        try _mint(requestAddress, randomness) {
        } catch Error(string memory _err) {
            emit StringFailure(account, randomness, _err);
        } catch (bytes memory _err) {
            emit BytesFailure(account, randomness,  _err);
        }

    }

    /**
     * Function to mint token after requesting a random number.
     * The token ID will be within the maximum range and not minted yet.
     * If `fulfillRandomness` fails, this function can be triggered manually.
     * @param address The account to mint a token for.
     * @param uint256 The raw random token id to mint
     */
    function _mint(
        address account,
        uint256 id
    ) private {

        require(maxTokenAmount > currentTokenAmount,
            "All tokens are already minted");
        
        // Keep random within range
        uint256 realRandomId = id % maxTokenAmount;
        
        // Select a token that is not minted yet and mark as minted
        uint256 newRandomID = realRandomId;
        uint256 i = 1;
        while(mintedTokens[newRandomID] == true) {
            newRandomID = uint256(keccak256(abi.encode(realRandomId, i))) % maxTokenAmount;
            i++;
        }
        
        ERC1155._mint(account, newRandomID, 1, "");

        mintedTokens[realRandomId] = true;
    }

    // Disable batch minting inherited from ERC1155
    function _mintBatch() public override {
        revert("This contract does not mint batches.");
    }

}