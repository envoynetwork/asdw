const parseArgs = require('minimist')
const argv = parseArgs(process.argv, {boolean: ['help', 'h'], default: {'value': false}})

const connectWeb3 = require('./settings.js')

async function setTierMintability(network, tier, value){
    let values = connectWeb3.connectWeb3(network)
    let web3 = values[0]
    let contract = values[1]
    
    let tierAsBytes = '0x' + web3.utils.padRight(web3.utils.asciiToHex(tier).replace('0x', ''), 64)
    console.log(tierAsBytes)
    let transaction = await contract.methods.setTierMintability(tierAsBytes, value).send({from: web3.eth.defaultAccount, gas: 230000})
    console.log(transaction)

}

if(argv.help || argv.h){
    console.log(
        "\nFunction to make tokens mintable.\n",
        "Options:\n",
        "--network: Name of the network to use, should be defined in settings.js\n",
        "--tier: Human readable technical name of the tier\n",
        "--value: Integer defining who can mint:\n",
        " - 0: nobody can mint.\n",
        " - x: everyone with a drop reward between wave 1 and wave x can mint.\n",
        "      x can be increased over time to have stepwise priority for pre-sales\n",
        " - Equal to latestDropWave + 1: everyone can mint\n"
    )
}
else if(!argv.hasOwnProperty('network')){
    console.error('Provide a network with --network argument')
} else if(!argv.hasOwnProperty('tier')){
    console.error('Provide the name of the tier in ascii with the  --tier argument')
} else if(!argv.hasOwnProperty('value')){
    console.error('Provide the value for `mintable` with the  --value argument. 0 means noone can mint. See the documentation for more options')
} else {
    setTierMintability(argv.network, argv.tier, argv.value)
}