'use strict';

ddescribe('Service: BookKeeper', function () {

  // load the service's module
  beforeEach(function(){
    module('tnt.catalog.bookkeeping');
    module('tnt.catalog.keeper');
  });

  // instantiate service
  var BookKeeper;
  beforeEach(inject(function (_BookKeeper_) {
    BookKeeper = _BookKeeper_;
  }));

  it('should do something', function () {
    expect(!!BookKeeper).toBe(true);
  });
  
  it('should automatically create a new book', function(){
    // create event {}
    
    // read
    
    // the list now has the requested books
  });
  
  it('should debit a newly created book', function(){
    
  });
  
  it('should credit a newly created book', function(){
    
  });
  
  it('should debit a previously existing book', function(){
    
  });
  
  it('should credit a previously existing book', function(){
    
  });
  
  it('should properly create the entry', function(){
    // make sure the enrty makes it to the journal
  });

});
