module.exports = {
    client: 'mysql',
    // connection: {
    //   filename: process.env.TESTING ? "./tests/e2e/db/matterwiki.sqlite" : "./db/matterwiki.sqlite"
    // },
  connection: {
      host:"q7cxv1zwcdlw7699.chr7pe7iynqr.eu-west-1.rds.amazonaws.com",
    user: 'k6y6n1ptj0yn6jeg',
    password: 'dzzp7sqof9dt0jxj',
    database: 'rh3gfa27u8r0gs9y'
  },
    useNullAsDefault: true
  }

/*
The development object is the connection object for the development database.
We need to create more for different environments (production, testing, staging).
This environment is being used in the db.js file in the root directory. Check there.
*/
