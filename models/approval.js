var bookshelf = require('../bookshelf')
bookshelf.plugin('registry')
var user = require('./user')
var article = require('./article')

var Approval = bookshelf.Model.extend({
  tableName:'approvals',
  article: function () {
    return this.belongsTo('article','id')
  },
  user:function () {
    return this.belongsTo('user','id')
  }
})

module.exports = bookshelf.model('Approval',Approval)