const parseArgs = require('minimist')
const argv = parseArgs(process.argv, {boolean: ['help', 'h'], default: {'file': '../data/tiers.json', 'new': false}})

const connectWeb3 = require('./settings.js')

async function addTiers(network, file){
    let values = connectWeb3.connectWeb3(network)
    let web3 = values[0]
    let contract = values[1]
    let data = require(file)

    for(i=0; i < data.length; i++){
        let tier = data[i]
        console.log("Adding tier:")
        console.log(tier)
        let transaction = await contract.methods.addTier(web3.utils.asciiToHex(tier.name),
                                   web3.utils.toWei(tier.price.toString(),"ether"),
                                   tier.mintable,
                                   tier.dropWave,
                                   web3.utils.asciiToHex(tier.tokenToBurn),
                                   tier.mintPerTransaction,
                                   tier.whitelist).send({from: web3.eth.defaultAccount, gas: 130000})
        console.log(tier.name, '0x' + web3.utils.padRight(web3.utils.asciiToHex(tier.name).replace('0x', ''), 64))
        console.log(transaction)
    }
}

if(argv.help || argv.h){
    console.log(
        "\nFunction to add tiers based on a JSON file.\n",
        "Options:\n",
        "--network: Name of the network to use, should be defined in settings.js\n",
        "--file: Location of a JSON file with a list of mappings. The mappings contain the token arguments:\n",
        " * name\n",
        " * price\n",
        " * mintable\n",
        " * dropWave\n",
        " * tokenToBurn\n",
        " * mintPerTransaction\n",
        " * whitelist\n",
    )
}
else if(!argv.hasOwnProperty('network')){
    console.error('Provide a network with --network argument')
} else if(!argv.hasOwnProperty('file')){
    console.error('Provide a json file with the --file argument')
} else {
    addTiers(argv.network, argv.file)
}