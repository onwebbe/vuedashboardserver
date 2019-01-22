var mongoose = require('mongoose'),
    DB_URL = 'mongodb://localhost:32768/vuedashboardtiles';
const logger = require('../../Logger');

/**
 * 连接
 */
mongoose.connect(DB_URL);

/**
  * 连接成功
  */
mongoose.connection.on('connected', function () {    
  logger.info('Mongoose connection open to ' + DB_URL);  
});    

/**
 * 连接异常
 */
mongoose.connection.on('error',function (err) {    
  logger.info('Mongoose connection error: ' + err);  
});    
 
/**
 * 连接断开
 */
mongoose.connection.on('disconnected', function () {    
  logger.info('Mongoose connection disconnected');  
});

module.exports = mongoose;