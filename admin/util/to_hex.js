web3 = require('web3')

var stringsToConvert =             ["ALEX_8BIT",
"GORILLA_8BIT",
"HERCULES_8BIT",
"HIPPO_8BIT",
"KING_8BIT",
"LEO_8BIT", 
"MAMMOTH_8BIT",
"ODDY_8BIT",
"OLLY_8BIT"
]
var hex
var uint
for(i=0; i < stringsToConvert.length; i++){
    hex = '0x' + web3.utils.padRight(web3.utils.asciiToHex(stringsToConvert[i]).replace('0x', ''), 64)
    uint = web3.utils.hexToNumberString(hex)
    console.log('string', stringsToConvert[i])
    console.log('bytes32', hex)
    console.log('uint256', uint)
}