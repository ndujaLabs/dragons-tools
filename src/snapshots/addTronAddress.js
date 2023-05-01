const fs = require('fs');
const path = require('path');
const TronWeb = require('tronweb');

const fullNode = 'https://api.trongrid.io';
const solidityNode = 'https://api.trongrid.io';
const eventServer = 'https://api.trongrid.io';

// A RANDOM PRIVATE KEY. Do not use it anywhere else
const privateKey = 'aa1ee219d55a6edbee3876faa94140447e81b19fe92e8627dde917e448838977';

const tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);

// Read the JSON file
fs.readFile(path.resolve(__dirname, "../../result/tokenOwnersTRON.json"), 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Parse the JSON data
  let jsonData = JSON.parse(data);

  // Convert the addresses
  jsonData = jsonData.map(item => {
    const tronAddress = tronWeb.address.fromHex(item.owner);
    return {
      ...item,
      tronAddress: tronAddress
    };
  });

  // Write the result to a new JSON file
  fs.writeFile(path.resolve(__dirname, "../../result/tokenOwnersTRON.json"), JSON.stringify(jsonData, null, 2), 'utf8', err => {
    if (err) {
      console.error('Error writing file:', err);
    } else {
      console.log('Successfully wrote converted addresses to output.json');
    }
  });
});
