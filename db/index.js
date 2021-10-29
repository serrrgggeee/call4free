/** 
 * Module responsible for communication directly with database.
 * @module Db */

const { Client } = require("pg");
const { configDB } = require("./config");
const log = require("ak-logger");
const client = new Client(configDB);
  
client.connect((err, client, done) => {
  // const duration = Date.now() - start;

});

module.exports = {
  /**
    * Function that renders a simple query string without parameters.
    * @function
    * @param {string} text - Query to be processed [example: "SELECT * FROM users;"]
    * @param {function} callback - Function that will be called after processing the query
    * @param {pg.Client} client - Database client already connected
  */
  query: (text, callback, client) => {
    // const start = Date.now();
  
    return client.query(text, (err, res) => {
      // const duration = Date.now() - start;
  
      // log.debug({text: text, duration: duration}, "Executed Simple Query");
      callback(err, res);
    });
  },

  /**
   * Function thant render query with parameters.
   * @function
   * @param {string} text - Query to be processed [example: "SELECT users WHERE email = 'gustavo@email.com';"]
   * @param {function} callback - Function that will be called after processing the query
   * @param {pg.Client} client - Database client already connected
   */
  queryParams: (text, params, client) => {
    // const start
    return client.query(text,  params);
  },

  /**
   * Function that returns a database client connected.
   * @function
   * @param {function} callback - Function that will be called after connecting to database client
   */
  getClient: (callback) => {
    // const start = Date.now();
  
    const client = new Client(configDB);
  
    client.connect((err, client, done) => {
      // const duration = Date.now() - start;
  
      // log.info({duration: duration}, "New Client Connected");
      callback(err, client, done);
    });
  },
  client
};
