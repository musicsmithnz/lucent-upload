'use strict'

var ipfsAPI = require('ipfs-api');
var ipfs = ipfsAPI({
    host: '128.199.220.242', 
    //host: 'localhost', 
    port: '5002', 
    protocol: 'http'
});

    ipfs.files.add({
        path: 'something.txt',
        content: Buffer.from('raymonds new fileoeuaeuaue')
    }, (err, filesAdded) => {
        if (err) {
            console.log('error found: ')
            console.log(err)
        }
        console.log('\nAdded file:', filesAdded[0].path, filesAdded[0].hash)
        var fileMultihash = filesAdded[0].hash
    })
