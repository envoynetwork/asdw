# Alien Samurai Dino Warriors

This repository contains the code for the Envoy Alien Samurai Dino Warriors NFT drops.

## Contracts

This folder contains the smart contract code. The code keeps track of NFT information at two levels of granularity:

1. Tier level
2. Token level

Both tiers and tokens are stored in a mapping from a human readable name (in bytes32) to a struct. The struct datastructures are described below.

### Tier level

Information stored at tier level are the price, the drop wave, if the token is mintable and if tokens need to be burned to mint the token.
The **price** is the price in Wei that should be paid to mint tokens in this tier.
The **drop wave** is a number that increases with each drop (e.g. for all original silver, gold and diamond tiers, this will be 1. Future drops will receive drop wave 2, and so on). This attribute is chronologically ascending, so later waves will have higher numbers.

Wether the token is **mintable** depends on an integer with following logic:

- 0: nobody can mint.
- any uint x: everyone owning a drop reward from wave 1 to wave x can mint. This gives priority to people who invested in the project earlier on. x can be increased over time to have stepwise priority for pre-sales, rewarding early joiners.
- Equal to highest drop wave so far + 1: everyone can mint

This way, the contract owner can decide when tokens are mintable by who.

Finally, some tiers require a **token to be burned** before minting is possible. For example, the original silver tier tokens can be minted for free by token owners who:

- Already own a gold or diamond tier ASDW NFT
- Own a OG card FT, serving as 'access ticket' to the minting process. If a silver tier NFT is minted with this token, it will be burned.

### Tokens

Tokens are based on the ERC1155 standard with additional properties. The first one is the **id** of the underlying ERC1155 contract, which will be an increasing number for each now token. The **current** and **total** token amounts are stored to make sure only a limited amount of tokens can be minted. Finally, the **tier** reference is added to access all the tier information described in the previous paragraph.

### Minting new tokens

If you want to mint a token, you can use the _mint function with 1 or 2 arguments:

- First one is always the name of the token to mint
- Second, optional argument is the already owned token that gives the minter the right to mint.

Depending on the tier configuration, the second argument might be needed. Sometimes everyone can mint (e.g. OG cards), sometimes only owners of drops in a certain wave are allowed to mint (e.g. initial silver tier). In the last case, a second token should be provided to proove minting is allowed. Of course, the minter should own tokens of the provided secondairy token.
Some tiers require a fee to be paid. This fee is described in the tier struct and should be send with the transaction. It will automatically be transfered to a wallet defined  by the contract owner.
