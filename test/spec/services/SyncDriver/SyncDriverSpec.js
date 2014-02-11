describe('Service: SyncDriver', function () {

  var logger = angular.noop;

  var $log = {
      debug : logger,
      error : logger,
      warn : logger,
      fatal : logger
  };


  var SyncDriver = null;


  beforeEach(function () {
      spyOn($log, 'debug').andCallThrough();
      spyOn($log, 'error').andCallThrough();
      spyOn($log, 'warn').andCallThrough();
      spyOn($log, 'fatal').andCallThrough();
  });


  // load the service's module
  beforeEach(function () {
    module('tnt.catalog.sync.driver');

    module(function ($provide) {
      $provide.value('$log', $log);
    });
  });


  beforeEach(inject(function(_SyncDriver_) {
    SyncDriver = _SyncDriver_;
  }));



  it('is accessible', function () {
    expect(SyncDriver).not.toBeUndefined();
  });


  it('is a function', function () {
    expect(typeof SyncDriver).toBe('object');
  });



  // FIXME: implement missing tests (TBD)
  describe('SyncDriver.sync()', function () {
      it('is accessible', function () {
        expect(SyncDriver.sync).toBeDefined();
      });

      it('is a function', function () {
        expect(typeof SyncDriver.sync).toBe('function');
      });
  }); // SyncDriver.sync()
});
