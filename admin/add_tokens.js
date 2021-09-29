const parseArgs = require('minimist')
const argv = parseArgs(process.argv, {boolean: ['help', 'h'], default: {'file': '../data/cards.json'}})

const connectWeb3 = require('./settings.js')

async function addTokens(network, file){
    let values = connectWeb3.connectWeb3(network)
    let web3 = values[0]
    let contract = values[1]
    let tokenData = require(file)

    let names = tokenData.names.map((x) => {return web3.utils.asciiToHex(x)}).slice();
    let amounts = tokenData.amounts.slice();
    let tiers = tokenData.tiers.map((x) => {return web3.utils.asciiToHex(x)}).slice();
    let amountsToPremint = tokenData.amountsToPremint.slice();
    console.log("Adding " + names.length + " tokens")

    let transaction = await contract.methods.addTokensBatch(names,
        amounts,
        tiers,
        amountsToPremint).send({from: web3.eth.defaultAccount, gas: 680000});
        console.log(transaction)
}

if(argv.help || argv.h){
    console.log(
        "\nFunction to set the value for `whitelist`. True means the whitelist is used.\n",
        "Options:\n",
        "--network: Name of the network to use, should be defined in settings.js\n",
        "--tier: Human readable technical name of the tier\n",
        "--value: True means the whitelist is used, false not\n"
        
    )
}
else if(!argv.hasOwnProperty('network')){
    console.error('Provide a network with --network argument')
} else if(!argv.hasOwnProperty('file')){
    console.error('Provide a json file with the --file argument')
} else {
    addTokens(argv.network, argv.file)
}