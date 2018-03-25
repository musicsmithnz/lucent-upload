const libstorj = require('../node_modules/storj/index.js');

const storj = new libstorj.Environment({
      bridgeUrl: 'https://api.storj.io',
      bridgeUser: 'musicsmithnz@gmail.com',
      bridgePass: '10.paint$STO.01',
      encryptionKey: 'abandon something genesis abandon abandon abandon abandon abandon abandon abandon abandon about',
      logLevel: 0
});

storj.getInfo(function(err, result) {
      if (err) {
              return console.error(err);
            }
      console.log('info:', result);

      storj.getBuckets(function(err, result) {
              if (err) {
                        return console.error(err);
                      }
              console.log('buckets:', result);
              storj.destroy();
            });
});
