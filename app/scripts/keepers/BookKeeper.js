(function(angular){
  'use strict'

  angular.module('tnt.catalog.bookkeeping.entry', []).factory('BookEntry', function() {
    var BookEntry = function(uuid, created, debitAccount, creditAccount, document, entity, op, amount){
      this.uuid = uuid;
      this.created = created;
      this.debitAccount = debitAccount;
      this.creditAccount = creditAccount;
      this.document = document;
      this.entity = entity;
      this.op = op;
      this.amount = amount;
    };
  });
  
  angular.module('tnt.catalog.bookkeeping.entry', []).factory('Book', function() {
    var Book = function(name){
      this.name = name;
      this.balance = 0;
    };
  });


  angular.module('tnt.catalog.bookkeeping', ['tnt.catalog.journal.replayer']).service('BookKeeper', function(Replayer) {
    
    var books = {};
    
    this.handlers = {};
    
    /**
     *
     * @param {Object} event
     * @return {Promise}
     */
    ObjectUtils.ro(this.handlers, 'bookWriteV1', function(event) {
      
    });
    
    Replayer.registerHandlers(this.handlers);
    
    this.write = function(entry){
      
    };
    
    this.read = function(){
      return angular.copy(books);
    };
  });
  
  
})(angular);
