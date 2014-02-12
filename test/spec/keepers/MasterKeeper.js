'use strict';

ddescribe('Service: MasterKeeper', function() {

  // load the service's module
  beforeEach(module('tnt.catalog.keeper'));

  // instantiate service
  var MasterKeeper = null;
  beforeEach(inject(function(_MasterKeeper_) {
    MasterKeeper = _MasterKeeper_;
  }));

  it('should do something', function() {
    expect(!!MasterKeeper).toBe(true);
  });
  
  it('should initialize the necessary properties on creation');
  
  it('should mark the sensitive properties as read only');

});
