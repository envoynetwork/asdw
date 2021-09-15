
# `DinoWarriors`

Smart contract used for Alien Samurai Dino Warriors NFT's. Legal terms:
Only limited personal non-commercial use and resale rights in the NFT are granted and all copyright and other rights are reserved.
The terms and conditions of Alien Samurai Dino Warriors (https://dinowarriors.io) are applicable.



## Variables:
- [`mapping(bytes32 => struct DinoWarriors.TokenInfo) tokenInfo`](#DinoWarriors-tokenInfo-mapping-bytes32----struct-DinoWarriors-TokenInfo-)
- [`mapping(bytes32 => struct DinoWarriors.Tier) tiers`](#DinoWarriors-tiers-mapping-bytes32----struct-DinoWarriors-Tier-)
- [`uint256 latestDropWave`](#DinoWarriors-latestDropWave-uint256)
- [`uint256 currentTokenId`](#DinoWarriors-currentTokenId-uint256)
- [`string legalTerms`](#DinoWarriors-legalTerms-string)
- [`address wallet`](#DinoWarriors-wallet-address)

## Functions:
- [`constructor(string uri_)`](#DinoWarriors-constructor-string-)
- [`updateWallet(address wallet_)`](#DinoWarriors-updateWallet-address-)
- [`setLegalTerms(string legalTerms_)`](#DinoWarriors-setLegalTerms-string-)
- [`addTier(bytes32 name, uint256 price_, uint256 mintable_, uint256 dropWave_, bytes32 tokenToBurn_)`](#DinoWarriors-addTier-bytes32-uint256-uint256-uint256-bytes32-)
- [`setTierMintability(bytes32 name, uint256 mintable_)`](#DinoWarriors-setTierMintability-bytes32-uint256-)
- [`setTierPrice(bytes32 name, uint256 price_)`](#DinoWarriors-setTierPrice-bytes32-uint256-)
- [`addToken(bytes32 name, uint256 totalAmount_, bytes32 tier_)`](#DinoWarriors-addToken-bytes32-uint256-bytes32-)
- [`increaseTokenAmount(bytes32 name, uint256 additionalTokenAmount)`](#DinoWarriors-increaseTokenAmount-bytes32-uint256-)
- [`_mint(bytes32 tokenToMint, bytes32 tokenToUse)`](#DinoWarriors-_mint-bytes32-bytes32-)
- [`_mint(bytes32 tokenToMint)`](#DinoWarriors-_mint-bytes32-)

## Events:
- [`Minted(address account, bytes32 token, uint256 minted)`](#DinoWarriors-Minted-address-bytes32-uint256-)

## Functions:
### Function `constructor(string uri_)` (public) {#DinoWarriors-constructor-string-}



The constructor will call the constructer of the ERC1155 contract,
and hardcode:
- legal terms of the contract
- Initial tiers to start with
- Initial tokens to start with
- Which tokens are preminted by Envoy

#### Parameters:
- `uri_`: The URI to link metadata to the NFT's
### Function `updateWallet(address wallet_)` (external) {#DinoWarriors-updateWallet-address-}

Function for the owner to update the wallet to which minting fees are sent.
By default, this will be the owner of the contract



#### Parameters:
- `wallet_`: the address to receive funds
### Function `setLegalTerms(string legalTerms_)` (external) {#DinoWarriors-setLegalTerms-string-}

Function for the owner to change the link to legal terms.



#### Parameters:
- `legalTerms_`: The link to the legal terms.
### Function `addTier(bytes32 name, uint256 price_, uint256 mintable_, uint256 dropWave_, bytes32 tokenToBurn_)` (external) {#DinoWarriors-addTier-bytes32-uint256-uint256-uint256-bytes32-}

Functions to create new tiers, or to modify price and mintable of existing tier.
Only the owner can run this function.
Drop waves cannot be altered, and should always be higher than the latest drop wave.



#### Parameters:
- `name`: The human readable key of the tier

- `price_`: The price that is required for minting tokens of this tier

- `mintable_`: Wetter the tokens in this tier are already mintable (0 for no).
- 0: nobody can mint.
- x: everyone with a drop reward between wave 1 and wave x can mint.
     x can be increased over time to have stepwise priority for pre-sales
- Equal to latestDropWave + 1: everyone can mint 

- `dropWave_`: In which wave is this drop? For the ASDW cards, this will be 1.

- `tokenToBurn_`: If only current token owners are allowed to mint, they will need
to burn their token in the minting process if it is this token.
### Function `setTierMintability(bytes32 name, uint256 mintable_)` (external) {#DinoWarriors-setTierMintability-bytes32-uint256-}

Make a tier (un)mintable for (part of) the minters. Only the owner can run this function.



#### Parameters:
- `name`: The human readable key of the tier

- `mintable_`: Wetter the tokens in this tier are already mintable (0 for no).
- 0: nobody can mint.
- x: everyone with a drop reward between wave 1 and wave x can mint.
     x can be increased over time to have stepwise priority for pre-sales
- Equal to latestDropWave + 1: everyone can mint
### Function `setTierPrice(bytes32 name, uint256 price_)` (external) {#DinoWarriors-setTierPrice-bytes32-uint256-}

Change the price of an existing tier.



#### Parameters:
- `name`: The human readable key of the tier

- `price_`: New price in wei for the tier
### Function `addToken(bytes32 name, uint256 totalAmount_, bytes32 tier_)` (external) {#DinoWarriors-addToken-bytes32-uint256-bytes32-}

Function to add new tokens. Only the owner can run this function.
New Tokens should always have a new human readable name as key,
And they need to be in a tier of the latest wave available.



#### Parameters:
- `name`: human readable name of the token

- `totalAmount_`: the total amount of tokens available for this token

- `tier_`: the tier in which the NFT is released, containing the price, dropwave,...
### Function `increaseTokenAmount(bytes32 name, uint256 additionalTokenAmount)` (external) {#DinoWarriors-increaseTokenAmount-bytes32-uint256-}

Add new tokens of an existing token. Only the owner can run this function.



#### Parameters:
- `name`: the name of the token to add

- `additionalTokenAmount`: the amount of tokens to add
### Function `_mint(bytes32 tokenToMint, bytes32 tokenToUse)` (public) {#DinoWarriors-_mint-bytes32-bytes32-}

Function to mint tokens.
In order to mint tokens, following criteria must be met:
- There are still unminted tokens of tokenToMint
- The price in ETH sent should equal the price of the tier of tokenToMint.
- Depending on the 'mintability' field of the tier of the token,
  the minter needs to provide a second token to prove he is allowed to mint.
  Of course, the minter should have a positive balance for this token.



#### Parameters:
- `tokenToMint`: Human readable name of the token that will be minted

- `tokenToUse`: Token provided by the minter to prove he is allowed to mint.
The 'mintability' of the 'tier' of tokenToMint will define if the token allows minting or not.
The owner should own the token, and the token will possibly be burned in the process.
### Function `_mint(bytes32 tokenToMint)` (public) {#DinoWarriors-_mint-bytes32-}

Overloaded function to allow minting tokens without providing a secondary token.
This will only work if everyone is allowed to mint the token and is only for ease of use.



#### Parameters:
- `tokenToMint`: Human readable name of the token that will be minted

## Events

### Event `Minted(address account, bytes32 token, uint256 minted)` {#DinoWarriors-Minted-address-bytes32-uint256-}
No description
#### Parameters:
- `account`: The address that minted the token

- `token`: The human readable name of the token in bytes32

- `minted`: The amount of minted tokens of this type
