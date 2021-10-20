var fs = require('fs');const parseArgs = require('minimist')
const argv = parseArgs(process.argv, {boolean: ['help', 'h'], default: {output_dir: '../data/events/', event:'allEvents'}})

const connectWeb3 = require('./settings.js')

async function collectEvents(network, output_dir, event){
    let values = connectWeb3.connectWeb3(network)
    let web3 = values[0]
    let contract = values[1]

    console.log("Collecting events for ", event)
    output_file = output_dir + network + '/' + event + '.json'    
    console.log("Writing to ", output_file)
    
    contract.getPastEvents(event, {fromBlock:0,
        toBlock: 'latest'}).then((res) => {
        let json = JSON.stringify(res);
        fs.writeFile(output_file, json, (err)=>{if(err){console.log(err)}});}
        )

}

if(argv.help || argv.h){
    console.log(
        "\nFunction add a list of tokens to the contract based on a JSON file.\n",
        "Options:\n",
        "--network: Name of the network to use, should be defined in settings.js\n",
        "--file: Location of a JSON file with a number of lists. The lists contain the token arguments:\n",
        " * name: Human readable name of the token\n",
        " * amounts: The amounts that will be available for each token.\n",
        " * tiers: The tier the token is in\n",
        " * amountsToPremint: How many tokens need to be minted by the contract owner?\n",
        
    )
}
else if(!argv.hasOwnProperty('network')){
    console.error('Provide a network with --network argument')

} else {
    collectEvents(argv.network, argv.output_dir, argv.event)
}