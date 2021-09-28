const parseArgs = require('minimist')
const argv = parseArgs(process.argv, {boolean: ['value', 'help', 'h']})

const connectWeb3 = require('./settings.js')

async function setTierWhitelist(network, tier, value){
    let values = connectWeb3.connectWeb3(network)
    let web3 = values[0]
    let contract = values[1]
    
    let tierAsBytes = '0x' + web3.utils.padRight(web3.utils.asciiToHex(tier).replace('0x', ''), 64)
    let transaction = await contract.methods.setTierWhitelist(tierAsBytes, value).send({from: web3.eth.defaultAccount, gas: 230000})
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
} else if(!argv.hasOwnProperty('tier')){
    console.error('Provide the name of the tier in ascii with the  --name argument')
} else if(!argv.hasOwnProperty('value')){
    console.error('Provide the value for `whitelist` with the  --value argument. True means the whitelist is used')
} else {
    setTierWhitelist(argv.network, argv.tier, argv.value)
}