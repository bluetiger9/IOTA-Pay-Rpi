var argv = require('minimist')(process.argv.slice(2));
var exec = require('child_process').exec;

const iotaLibrary = require('@iota/core')

const iota = iotaLibrary.composeAPI({
  provider: 'https://nodes.devnet.thetangle.org:443'
})

const address =
  '9WFZOAHLRXNFYGBBXMLFCZPNCHDKXKRDTSH9LF9KJTIPDMTXUMUCHKVNMNJKCHOLWJYGDD9ZVMXGM9MD9'

let prevBalance = -1

let checkBalance = function() {
  iota
    .getBalances([iotaAddress], 100)
    .then(({ balances }) => {
      let balance = balances[0]
      console.log("Balance: " + balance)
      if (prevBalance > 0 && prevBalance < balance) {
	let newTokens = balance - prevBalance
	if (newTokens > 0) {
	  newTokensCB(newTokens)
        }
      }
      prevBalance = balance
    })
    .catch(err => {
      console.error(err)
    })

  schedule()
}

let newTokensCB = function(newTokens) {
  console.log("Got " + newTokens + " IOTA tokens")
  
  const onMillis = 1000.0 * newTokens / priceSeconds;
  console.log("  \- ON time: " + (onMillis / 1000.0) + "s");
  setTimeout(() => {
    console.log(" \- OFF");
  }, onMillis)     
}

let runCommand = function(command) {
  console.log("Executing command: " + command)
  exec(command, function callback(error, stdout, stderr){
    console.log(" -\exit code" + error)
    console.log(" -\stdout: " + stdout)
    console.log(" -\stderr: " + stderr)
  });
}

let schedule = function() {
  setTimeout(checkBalance, 1000);
}

const iotaQr = require("@tangle-frost/iota-qr-data")
const iotaRender = require("@tangle-frost/iota-qr-render")
const fs = require("fs")

iotaRender.initRender()

let generateQRCode = function(address) {
   iotaQr.AddressQR.renderRaw(address, "png", 3, 3).then(result => {
     fs.writeFile("out.png", result)
     runCommand("python3 ../LIBtft144/example-tft144.py")
   })
}

// - - -
const iotaAddress = argv["iotaAddress"]
const priceSeconds = argv["priceSeconds"]

console.log("Price (/secs): " + priceSeconds + " IOTA");

generateQRCode(iotaAddress);


schedule()
