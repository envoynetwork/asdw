const DinoWarriors = artifacts.require("DinoWarriors");

module.exports = function (deployer, network) {
    deployer.deploy(DinoWarriors,
        'https://dinowarriors.io/\{id\}.json');
};
