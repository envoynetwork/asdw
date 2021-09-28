const Web3 = require('web3')
const fs = require('fs');

const abi = require('../contracts/build/contracts/DinoWarriors.json')
const infuraKey = fs.readFileSync("../secrets/.infuraKey").toString().trim();
const privateKey = fs.readFileSync("../secrets/.secret").toString().trim();
// Indicating to which blockchain to connect
function connectWeb3(network){
    var webProvider
    var contractAddress
    if(network == 'development'){
        webProvider = "http://127.0.0.1:8545";
        contractAddress = ''
    } else if(network == 'rinkeby'){
        
        webProvider = "https://rinkeby.infura.io/v3/"+infuraKey;
        contractAddress = "0xac3fe33ab8ce9a0c26dbd8443d6943f987a9cfb2";
    }

    // Setup once contract is deployed
    const web3 = new Web3(webProvider);
    const account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;
    const contract = new web3.eth.Contract(abi.abi, contractAddress);

    return [web3, contract]
}

exports.connectWeb3 = connectWeb3;