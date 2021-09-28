
# `DinoWarriors`

Smart contract used for Alien Samurai Dino Warriors NFT's. Legal terms:
Only limited personal non-commercial use and resale rights in the NFT are granted and all copyright and other rights are reserved.
The terms and conditions of Alien Samurai Dino Warriors (https://dinowarriors.io) are applicable.



## Variables:
- [`mapping(uint256 => struct DinoWarriors.TokenInfo) tokenInfo`](#DinoWarriors-tokenInfo-mapping-uint256----struct-DinoWarriors-TokenInfo-)
- [`mapping(uint128 => mapping(address => uint256)) whitelist`](#DinoWarriors-whitelist-mapping-uint128----mapping-address----uint256--)
- [`mapping(bytes32 => struct DinoWarriors.Tier) tiers`](#DinoWarriors-tiers-mapping-bytes32----struct-DinoWarriors-Tier-)
- [`uint128 latestDropWave`](#DinoWarriors-latestDropWave-uint128)
- [`uint128 latestWhitelistWave`](#DinoWarriors-latestWhitelistWave-uint128)
- [`string legalTerms`](#DinoWarriors-legalTerms-string)
- [`address wallet`](#DinoWarriors-wallet-address)
- [`string contractURI`](#DinoWarriors-contractURI-string)



## Functions:
- [`constructor(string uri_, string contractURI_)`](#DinoWarriors-constructor-string-string-)
- [`setContractURI(string uri_)`](#DinoWarriors-setContractURI-string-)
- [`updateWallet(address wallet_)`](#DinoWarriors-updateWallet-address-)
- [`setLegalTerms(string legalTerms_)`](#DinoWarriors-setLegalTerms-string-)
- [`tokenInfoFromBytes32(bytes32 token)`](#DinoWarriors-tokenInfoFromBytes32-bytes32-)
- [`addTier(bytes32 name, uint256 price_, uint128 mintable_, uint128 dropWave_, bytes32 tokenToBurn_, uint256 maxMintPerTransaction_, bool whitelist_)`](#DinoWarriors-addTier-bytes32-uint256-uint128-uint128-bytes32-uint256-bool-)
- [`setTierMintability(bytes32 name, uint128 mintable_)`](#DinoWarriors-setTierMintability-bytes32-uint128-)
- [`setTierPrice(bytes32 name, uint256 price_)`](#DinoWarriors-setTierPrice-bytes32-uint256-)
- [`setTierMaxMintPerTransaction(bytes32 name, uint256 maxMintPerTransaction_)`](#DinoWarriors-setTierMaxMintPerTransaction-bytes32-uint256-)
- [`setTierWhitelist(bytes32 name, bool whitelist_)`](#DinoWarriors-setTierWhitelist-bytes32-bool-)
- [`addToken(bytes32 name, uint256 totalAmount_, bytes32 tier_, uint256 amountToPreMint)`](#DinoWarriors-addToken-bytes32-uint256-bytes32-uint256-)
- [`addTokensBatch(bytes32[] names, uint256[] totalAmounts_, bytes32[] tiers_, uint256[] amountsToPreMint_)`](#DinoWarriors-addTokensBatch-bytes32---uint256---bytes32---uint256---)
- [`increaseTokenAmount(bytes32 name, uint256 additionalTokenAmount)`](#DinoWarriors-increaseTokenAmount-bytes32-uint256-)
- [`_mint(bytes32 tokenToMint, uint256 amount, bytes32 tokenToUse)`](#DinoWarriors-_mint-bytes32-uint256-bytes32-)
- [`updateWhitelist(address[] to, bool newWhitelistWave, uint256[] maxAmounts)`](#DinoWarriors-updateWhitelist-address---bool-uint256---)
- [`disableWhitelist()`](#DinoWarriors-disableWhitelist--)


## Functions:
### Function `constructor(string uri_, string contractURI_)` (public) {#DinoWarriors-constructor-string-string-}



The constructor will call the constructer of the ERC1155 contract,
and hardcode:
- legal terms of the contract
- Initial tiers to start with
- Initial tokens to start with
- Which tokens are preminted by Envoy

#### Parameters:
- `uri_`: The URI to link metadata to the NFT's
### Function `setContractURI(string uri_)` (external) {#DinoWarriors-setContractURI-string-}




### Function `updateWallet(address wallet_)` (external) {#DinoWarriors-updateWallet-address-}

Function for the owner to update the wallet to which minting fees are sent.
By default, this will be the owner of the contract



#### Parameters:
- `wallet_`: the address to receive funds
### Function `setLegalTerms(string legalTerms_)` (external) {#DinoWarriors-setLegalTerms-string-}

Function for the owner to change the link to legal terms.



#### Parameters:
- `legalTerms_`: The link to the legal terms.
### Function `tokenInfoFromBytes32(bytes32 token) → uint256 id, uint256 mintedAmount, uint256 totalAmount, bytes32 tier` (public) {#DinoWarriors-tokenInfoFromBytes32-bytes32-}




### Function `addTier(bytes32 name, uint256 price_, uint128 mintable_, uint128 dropWave_, bytes32 tokenToBurn_, uint256 maxMintPerTransaction_, bool whitelist_)` (public) {#DinoWarriors-addTier-bytes32-uint256-uint128-uint128-bytes32-uint256-bool-}

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

- `maxMintPerTransaction_`: the maximum amount to mint per transaction

- `whitelist_`: wetter only minters on the whitelist can mint or not
### Function `setTierMintability(bytes32 name, uint128 mintable_)` (external) {#DinoWarriors-setTierMintability-bytes32-uint128-}

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
### Function `setTierMaxMintPerTransaction(bytes32 name, uint256 maxMintPerTransaction_)` (external) {#DinoWarriors-setTierMaxMintPerTransaction-bytes32-uint256-}

Change the max amount of tokens to mint in one transaction for this tier.



#### Parameters:
- `name`: The human readable key of the tier

- `maxMintPerTransaction_`: New max amount of tokens to mint in 1 transaction
### Function `setTierWhitelist(bytes32 name, bool whitelist_)` (external) {#DinoWarriors-setTierWhitelist-bytes32-bool-}

Change the max amount of tokens to mint in one transaction for this tier.



#### Parameters:
- `name`: The human readable key of the tier

- `whitelist_`: true if only persons in the whitelist are allowed to mint
### Function `addToken(bytes32 name, uint256 totalAmount_, bytes32 tier_, uint256 amountToPreMint)` (public) {#DinoWarriors-addToken-bytes32-uint256-bytes32-uint256-}

Function to add new tokens. Only the owner can run this function.
New Tokens should always have a new human readable name as key,
And they need to be in a tier of the latest wave available.



#### Parameters:
- `name`: human readable name of the token

- `totalAmount_`: the total amount of tokens available for this token

- `tier_`: the tier in which the NFT is released, containing the price, dropwave,...

- `amountToPreMint`: The amount of tokens to be preminted by the owner
### Function `addTokensBatch(bytes32[] names, uint256[] totalAmounts_, bytes32[] tiers_, uint256[] amountsToPreMint_)` (public) {#DinoWarriors-addTokensBatch-bytes32---uint256---bytes32---uint256---}

Add multiple tokens at once.



#### Parameters:
- `names`: Array containing the token names

- `totalAmounts_`: Array containing the total amount for each token. Should have the same length as names.

- `tiers_`: Array containing the tier for each token. Should have the same length as names.

- `amountsToPreMint_`: Array containing the amount of tokens to premint for each token.
  Should have the same length as names.
### Function `increaseTokenAmount(bytes32 name, uint256 additionalTokenAmount)` (external) {#DinoWarriors-increaseTokenAmount-bytes32-uint256-}

Add new tokens of an existing token. Only the owner can run this function.



#### Parameters:
- `name`: the name of the token to add

- `additionalTokenAmount`: the amount of tokens to add
### Function `_mint(bytes32 tokenToMint, uint256 amount, bytes32 tokenToUse)` (external) {#DinoWarriors-_mint-bytes32-uint256-bytes32-}

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
### Function `updateWhitelist(address[] to, bool newWhitelistWave, uint256[] maxAmounts)` (external) {#DinoWarriors-updateWhitelist-address---bool-uint256---}

Update the accounts in the whitelist for minting.



#### Parameters:
- `to`: a list of addresses to be whitelisted

- `newWhitelistWave`: if true, the old whitelisted address cannot mint anymore

- `maxAmounts`: the maximum amount of tokens to mint for this account
### Function `disableWhitelist()` (external) {#DinoWarriors-disableWhitelist--}





## Events

