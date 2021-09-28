
# `DinoWarriorsDev`

Only limited personal non-commercial use and resale rights in the NFT are granted and all copyright and other rights are reserved.
The terms and conditions of Alien Samurai Dino Warriors (https://dinowarriors.io) are applicable.



## Variables:
- [`mapping(bytes32 => struct DinoWarriorsDev.TokenInfo) tokenInfo`](#DinoWarriorsDev-tokenInfo-mapping-bytes32----struct-DinoWarriorsDev-TokenInfo-)
- [`mapping(bytes32 => struct DinoWarriorsDev.Tier) tiers`](#DinoWarriorsDev-tiers-mapping-bytes32----struct-DinoWarriorsDev-Tier-)
- [`uint256 latestDropWave`](#DinoWarriorsDev-latestDropWave-uint256)
- [`uint256 currentTokenId`](#DinoWarriorsDev-currentTokenId-uint256)
- [`string legalTerms`](#DinoWarriorsDev-legalTerms-string)
- [`address wallet`](#DinoWarriorsDev-wallet-address)



## Functions:
- [`constructor(string uri_)`](#DinoWarriorsDev-constructor-string-)
- [`updateWallet(address wallet_)`](#DinoWarriorsDev-updateWallet-address-)
- [`setLegalTerms(string legalTerms_)`](#DinoWarriorsDev-setLegalTerms-string-)
- [`addTier(bytes32 name, uint256 price_, uint256 mintable_, uint256 dropWave_, bytes32 tokenToBurn_)`](#DinoWarriorsDev-addTier-bytes32-uint256-uint256-uint256-bytes32-)
- [`setTierMintability(bytes32 name, uint256 mintable_)`](#DinoWarriorsDev-setTierMintability-bytes32-uint256-)
- [`setTierPrice(bytes32 name, uint256 price_)`](#DinoWarriorsDev-setTierPrice-bytes32-uint256-)
- [`addToken(bytes32 name, uint256 totalAmount_, bytes32 tier_)`](#DinoWarriorsDev-addToken-bytes32-uint256-bytes32-)
- [`increaseTokenAmount(bytes32 name, uint256 additionalTokenAmount)`](#DinoWarriorsDev-increaseTokenAmount-bytes32-uint256-)
- [`_mint(bytes32 tokenToMint, bytes32 tokenToUse)`](#DinoWarriorsDev-_mint-bytes32-bytes32-)
- [`_mint(bytes32 tokenToMint)`](#DinoWarriorsDev-_mint-bytes32-)

## Events:
- [`Minted(address account, bytes32 token, uint256 minted)`](#DinoWarriorsDev-Minted-address-bytes32-uint256-)

## Functions:
### Function `constructor(string uri_)` (public) {#DinoWarriorsDev-constructor-string-}




### Function `updateWallet(address wallet_)` (external) {#DinoWarriorsDev-updateWallet-address-}




### Function `setLegalTerms(string legalTerms_)` (external) {#DinoWarriorsDev-setLegalTerms-string-}

Function for the owner to change the link to legal terms.



#### Parameters:
- `legalTerms_`: The link to the legal terms.
### Function `addTier(bytes32 name, uint256 price_, uint256 mintable_, uint256 dropWave_, bytes32 tokenToBurn_)` (external) {#DinoWarriorsDev-addTier-bytes32-uint256-uint256-uint256-bytes32-}

Functions to create new tiers, or to modify price and mintable of existing tier.
Drop waves cannot be altered, and should always be higher than the latest drop wave.


### Function `setTierMintability(bytes32 name, uint256 mintable_)` (external) {#DinoWarriorsDev-setTierMintability-bytes32-uint256-}




### Function `setTierPrice(bytes32 name, uint256 price_)` (external) {#DinoWarriorsDev-setTierPrice-bytes32-uint256-}




### Function `addToken(bytes32 name, uint256 totalAmount_, bytes32 tier_)` (external) {#DinoWarriorsDev-addToken-bytes32-uint256-bytes32-}

Function to add new tokens.
New Tokens should always


### Function `increaseTokenAmount(bytes32 name, uint256 additionalTokenAmount)` (external) {#DinoWarriorsDev-increaseTokenAmount-bytes32-uint256-}

Add new tokens of an existing token



#### Parameters:
- `name`: the name of the token to add

- `additionalTokenAmount`: the amount of tokens to add
### Function `_mint(bytes32 tokenToMint, bytes32 tokenToUse)` (public) {#DinoWarriorsDev-_mint-bytes32-bytes32-}

Function to mint tokens.
In order to mint tokens, following criteria must be met:
  - You must provide a token


### Function `_mint(bytes32 tokenToMint)` (public) {#DinoWarriorsDev-_mint-bytes32-}





## Events

### Event `Minted(address account, bytes32 token, uint256 minted)` {#DinoWarriorsDev-Minted-address-bytes32-uint256-}
No description
