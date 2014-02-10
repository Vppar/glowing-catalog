ddescribe('Service: TimerService', function () {

  var logger = console.log;

  var $log = {
      debug : logger,
      error : logger,
      warn : logger,
      fatal : logger
  };

  // load the service's module
  beforeEach(function () {
    module('tnt.catalog.timer.service');

    module(function ($provide) {
      $provide.value('$log', $log);
    });
  });

  beforeEach(inject(function(_TimerService_) {
    TimerService = _TimerService_;
  }));


  it('is accessible', function () {
    expect(TimerService).not.toBeUndefined();
  });

  it('is a function', function () {
    expect(typeof TimerService).toBe('object');
  });

});
