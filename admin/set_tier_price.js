const parseArgs = require('minimist')
const argv = parseArgs(process.argv, {boolean: ['help', 'h']})

const connectWeb3 = require('./settings.js')

async function setTierPrice(network, tier, value){
    let values = connectWeb3.connectWeb3(network)
    let web3 = values[0]
    let contract = values[1]
    
    let tierAsBytes = '0x' + web3.utils.padRight(web3.utils.asciiToHex(tier).replace('0x', ''), 64)
    value = web3.utils.toWei(value.toString(), 'ether')
    transaction = await contract.methods.setTierPrice(tierAsBytes, value).send({from: web3.eth.defaultAccount, gas: 230000})
    console.log(transaction)

}

if(argv.help || argv.h){
    console.log(
        "\nFunction to make a token mintable..\n",
        "Options:\n",
        "--network: Name of the network to use, should be defined in settings.js\n",
        "--tier: Human readable technical name of the tier\n",
        "--value: The new price in Ether, not Wei!\n"
        
    )
}
else if(!argv.hasOwnProperty('network')){
    console.error('Provide a network with --network argument')
} else if(!argv.hasOwnProperty('tier')){
    console.error('Provide the name of the tier in ascii with the  --name argument')
} else if(!argv.hasOwnProperty('value')){
    console.error('Provide the value for `price` with the  --value argument. The price is in Ether, not in Wei!')
} else {
    setTierPrice(argv.network, argv.tier, argv.value)
}