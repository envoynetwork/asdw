const parseArgs = require('minimist')
const argv = parseArgs(process.argv, {boolean: ['new', 'help', 'h'], default: {'file': '../data/presale_whitelist.json', 'new': false}})

const fs = require('fs');

const connectWeb3 = require('./settings.js')

async function updateWhitelist(network, file, newWave){
    let values = connectWeb3.connectWeb3(network)
    let web3 = values[0]
    let contract = values[1]
    
    let data = require(file)
    let transaction = await contract.methods.updateWhitelist(data.addresses, newWave, data.amounts).send({from: web3.eth.defaultAccount, gas: 2300000})
    console.log(transaction)
}

if(argv.help || argv.h){
    console.log(
        "\nFunction add a whitelist from a json file.\n",
        "Options:\n",
        "--network: Name of the network to use, should be defined in settings.js\n",
        "--new: If true, a new whitelist will be made and previous whitelisted accounts cannot mint anymore. Defaults to false\n",
        "--file: A JSON file containing 2 mappings: \n",
        " - addresses: a list with addresses to whitelist \n",
        " - amounts: the amount of transaction the address is whitelisted for\n",
        "Defaults to ../data/presale_whitelist.json\n"        
    )
}
else if(!argv.hasOwnProperty('network')){
    console.error('Provide a network with --network argument')
} else if(!argv.hasOwnProperty('file')){
    console.error('Provide a json file with the --file argument')
} else if(!argv.hasOwnProperty('new')){
    console.error('Is a new whitelist needed? Setting --new to true means a new list')
} else {
    updateWhitelist(argv.network, argv.file, argv.new)
}