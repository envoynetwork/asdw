const DinoWarriors = artifacts.require("DinoWarriors");
const DinoWarriorsDev = artifacts.require("DinoWarriorsDev");

module.exports = function (deployer, network) {
    if(network == 'rinkeby'){
        deployer.deploy(DinoWarriorsDev,
            'https://dinowarriors.io/\{id\}.json');
            
    } else {
        deployer.deploy(DinoWarriors,
            'https://dinowarriors.io/\{id\}.json');
    }
    
};
