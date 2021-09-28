# Alien Samurai Dino Warriors

This repository contains the code for the Envoy Alien Samurai Dino Warriors NFT drops. Technical information on the smart contract interface can be found in the `docs/` folder.

## Contracts

This folder contains the smart contract code. The code keeps track of NFT information at two levels of granularity:

1. **Tier** level
2. **Token** level

Both tiers and tokens are stored in a mapping from a human readable name (in bytes32) to a struct. The struct datastructures are described below.

There is also a `whitelist` mapping. This whitelist works in different waves. The inner map will keep track of how many transactions an address is allowed to do (mapping from `address` to `uint256`). The outer mapping will map the whitelist wave to the inner map. When whitelisting is enabled for a tier, only addresses with remaining transactions for the latest wave will be allowed to mint.

### Tier level

Information stored at tier level are the price, the drop wave, if the token is mintable and if tokens need to be burned to mint the token.
The **price** is the price in Wei that should be paid to mint tokens in this tier.
The **drop wave** is a number that increases with each drop (e.g. for all original silver, gold and diamond tiers, this will be 1. Future drops will receive drop wave 2, and so on). This attribute is chronologically ascending, so later waves will have higher numbers.

Wether the token is **mintable** depends on an integer with following logic:

- 0: nobody can mint.
- any uint x: everyone owning a drop reward from wave 1 to wave x can mint. This gives priority to people who invested in the project earlier on. x can be increased over time to have stepwise priority for pre-sales, rewarding early joiners.
- Equal to highest drop wave so far + 1: everyone can mint

This way, the contract owner can decide when tokens are mintable by who.

Some tiers require a **token to be burned** before minting is possible. For example, the original silver tier tokens can be minted for free by token owners who:

- Already own a gold or diamond tier ASDW NFT
- Own a classic silver FT, serving as 'access ticket' to the minting process. If a silver tier NFT is minted with this token, it will be burned.

The **maximum amount of tokens in one mintingtransaction**, limiting the amount of tokens someone can mint at once. This avoids someone minting all tokens in one transaction, and allows a more fair distribution of tokens.

Using a **whitelist** or not. Sometimes, only whitelisted addresses are allowed to mint for a tier. If this value is set to `true`, only addresses with remaining transactions in the whitelist mapping will be allowed to mint tokens of this tier.

### Tokens

Tokens are based on the ERC1155 standard with additional properties. The properties are stored in a mapping with the **id** of the underlying ERC1155 contract as key. This id is the uint256 version of the human readable bytes32 technical name of the token (if the token is called *DINO_1*, the id will be the result of `uint256('DINO_1')`). The **current** and **total** token amounts are stored in the struct to make sure only a limited amount of tokens can be minted. Finally, the **tier** reference is added to access all the tier information described in the previous paragraph.

### Minting new tokens

If you want to mint a token, you can use the _mint function with 3 arguments:

- First one is always the name of the token to mint
- Second, the amount of tokens to mint
- Third, the already owned token that gives the minter the right to mint. This is only applicable if the `mintable` field of the tier is greater than 0, and lesser than the latest dropwave+1

Depending on the tier configuration, the last argument might be needed. Sometimes everyone can mint (e.g. classic silvers), sometimes only owners of drops in a certain wave are allowed to mint (e.g. silver trading cards). In the last case, a second token should be provided to proove minting is allowed. Of course, the minter should own tokens of the provided secondairy token.
Some tiers require a fee to be paid. This fee is described in the tier struct and should be send with the transaction. It will automatically be transfered to a wallet defined  by the contract owner.

Tokens can only be minted until the total supply is reached, afterwards the transaction will revert.

The limit of tokens to mint in one transaction is set in the tier. The transaction will revert if you try to mint more.

In some situations like presale, a whitelist is applied. This whitelist allow a list of addresses to make a certain amount of minting transactions. Minters not on the latest version of the list will not be allowed to mint.

Summary of the requirements to mint:

- The token should exist
- The token did not yet reach the total supply
- If the tier uses a whitelist, the minter should have transactions left in the latest whitelist version
- The tier has mintability > 0, and if the mintability <= latest drop wave, you need to provide a valid token that allows minting which you own

## Networks

### Rinkeby

**Contract address**: 0xac3fe33ab8ce9a0c26dbd8443d6943f987a9cfb2
**Contract owner**:  0x6b4934c85B8cb94A6a7aC4496a2eEc9184fFac59
**Transaction hash**: 0x083a1263c1a8a357aa37aab27347b62e7455d342aad5d5694c84ef4bd52d277f
