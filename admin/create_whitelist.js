var fs = require('fs');const parseArgs = require('minimist')

const eventsString = fs.readFileSync("../data/events/mainnet/TransferSingle.json");
let events = JSON.parse(eventsString);

let counts = {}

let gold = ['39021344095274846885460869251563891779660389020697117223971270270446104215552',
            '30886780210403809139417277122150417081692834761976825676620461344883338117120',
            '38139666381406332497384129939119814272265299072318874051719486434877676453888',
            '37690859728860556683193424408270207247659401777397218211480503019880373551104',
            '38152096373603196579436431239368171453954702254958304129423885375546452869120',
            '38152096373603196579436431378709144493910667543689097976410732455764066041856',
            '34943467917383419806919378417743946028220184084949606124500626265524135788544',
            '30462667628009200682904470240721547006801735716832135818318333163438426030080']
let silver = ['30439692091961178321720659417837286216746152196417938391906605645277339582464']

for(i=0;i<events.length;i++){
    returnValue = events[i].returnValues

    // Golds get multiplier 1, silver multiplier 2. Others get 
    if(gold.includes(returnValue.id)){
        returnValue.value *= 2
    } else if(!silver.includes(returnValue.id)){
        returnValue.value *= 0
    }

    // Increase and decrease token counts
    if(counts.hasOwnProperty(returnValue.from)){
        counts[returnValue.from] -= returnValue.value
    } else {
        counts[returnValue.from] = -1*returnValue.value
    }
    if(counts.hasOwnProperty(returnValue.to)){
        counts[returnValue.to] += parseInt(returnValue.value)
    } else {
        counts[returnValue.to] = parseInt(returnValue.value)
    }
}
console.log("Total supply: ", counts['0x0000000000000000000000000000000000000000'])

counts = Object.fromEntries(Object.entries(counts).filter(([_, v]) => v > null));
let json = JSON.stringify(counts);
fs.writeFile('../data/1. 8BIT/production_whitelist.json', json, (err)=>{if(err){console.log(err)}})
console.log(counts)
console.log("Whitelist count: ", Object. keys(counts).length)