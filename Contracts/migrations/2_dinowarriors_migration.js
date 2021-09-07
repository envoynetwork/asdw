const DinoWarriors = artifacts.require("DinoWarriors");
const DinoWarriorsNonRandom = artifacts.require("DinoWarriorsNonRandom");

module.exports = function (deployer, network) {
  if(network === 'development'){
    deployer.deploy(DinoWarriorsNonRandom, //Local testing with fake random numbers, as chainlink cannot be used
      15, //To save test ether, a very low price is set
      5000,
      `Only limited personal non-commercial use and resale rights in the NFT are granted and all copyright and other rights are reserved.
      The terms and conditions of Alien Samurai Dino Warriors (https://dinowarriors.io) are applicable`,
      'https://dinowarriors.io',
      '0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B', //Not used on local network
      '0x01BE23585060835E02B77ef475b0Cc51aA1e0709', //Not used on local network
      0.1 * 10 ** 18, //Not used on local network
      '0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311');  //Not used on local network
  }
  else if(network === 'rinkeby') {
    deployer.deploy(DinoWarriors,
      15, //To save test ether, a very low price is set
      5000,
      `Only limited personal non-commercial use and resale rights in the NFT are granted and all copyright and other rights are reserved.
      The terms and conditions of Alien Samurai Dino Warriors (https://dinowarriors.io) are applicable`,
      'https://dinowarriors.io',
      // See https://docs.chain.link/docs/vrf-contracts/
      '0xb3dCcb4Cf7a26f6cf6B120Cf5A73875B7BBc655B',
      '0x01BE23585060835E02B77ef475b0Cc51aA1e0709',
      0.1 * 10 ** 18,
      '0x2ed0feb3e7fd2022120aa84fab1945545a9f2ffc9076fd6156fa96eaff4c1311');
  }
  else if(network === 'mainnet'){
    deployer.deploy(DinoWarriors,
      0.15 * 10 ** 18,
      5000,
      `Only limited personal non-commercial use and resale rights in the NFT are granted and all copyright and other rights are reserved.
      The terms and conditions of Alien Samurai Dino Warriors (https://dinowarriors.io) are applicable`,
      'https://dinowarriors.io',
      // See https://docs.chain.link/docs/vrf-contracts/
      '0xf0d54349aDdcf704F77AE15b96510dEA15cb7952',
      '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      2 * 10 ** 18, // Price can be discussed with chainlink
      '0xAA77729D3466CA35AE8D28B3BBAC7CC36A5031EFDC430821C02BC31A238AF445');
  }
};
