ddescribe('Service: TimerService', function () {

  var logger = angular.noop;

  var $log = {
      debug : logger,
      error : logger,
      warn : logger,
      fatal : logger
  };


  beforeEach(function () {
      spyOn($log, 'debug').andCallThrough();
      spyOn($log, 'error').andCallThrough();
      spyOn($log, 'warn').andCallThrough();
      spyOn($log, 'fatal').andCallThrough();
  });


  // load the service's module
  beforeEach(function () {
    module('tnt.catalog.timer.service');

    module(function ($provide) {
      $provide.value('$log', $log);
    });
  });


  beforeEach(inject(function(_TimerService_) {
    TimerService = _TimerService_;
    TimerService.clearTimers();
  }));

  it('should not create Timer', function(){
      expect(function() {
    	  TimerService.startTimer(undefined , 'test');
      }).toThrow();	  
  });

  it('is accessible', function () {
    expect(TimerService).not.toBeUndefined();
  });

  it('is a function', function () {
    expect(typeof TimerService).toBe('object');
  });



  // FIXME: write tests for the Timer class. I'm not doing
  // it right now because this would take too much time and
  // its main functionality is tested by the service's tests
  // below.
  describe('TimerService.Timer', function () {});


  describe('TimerService.timers', function () {
    it('is accessible', function () {
      expect(TimerService.timers).not.toBeUndefined();
    });

    it('is an object', function () {
      expect(typeof TimerService.timers).toBe('object');
    });
  }); // TimerService.timers


  describe('TimerService.startTimer()', function () {
    it('is accessible', function () {
      expect(TimerService.startTimer).not.toBeUndefined();
    });

    it('is a function', function () {
      expect(typeof TimerService.startTimer).toBe('function');
    });

    it('returns a Timer object', function () {
      var timer = TimerService.startTimer('FOO');
      expect(timer instanceof TimerService.Timer).toBe(true);
    });

    it('logs a message if starting multiple timers with the same id', function () {
      TimerService.startTimer('FOO');
      expect($log.debug).not.toHaveBeenCalled();
      TimerService.startTimer('FOO');
      expect($log.debug).toHaveBeenCalledWith('A timer with this id (FOO) is already running.');
    });

    it('does not stop the running timer when id is already in use', function () {
      var timer = TimerService.startTimer('FOO');
      expect($log.debug).not.toHaveBeenCalled();
      TimerService.startTimer('FOO');
      expect($log.debug).toHaveBeenCalledWith('A timer with this id (FOO) is already running.');
      expect(!!timer.stopped).toBe(false);
    });
    
    it('Timer already runnning', function () {
    	var t1 = TimerService.startTimer('t1');
    	t1.start();
        expect($log.debug).toHaveBeenCalledWith('Timer already runnning!', 't1');
    });

    it('Getting elapsed time for a running timer', function () {
    	var t1 = TimerService.startTimer('t1');
    	t1.getElapsedTime();
        expect($log.debug).toHaveBeenCalledWith('Getting elapsed time for a running timer (t1).');
    });
  }); // TimerService.startTimer()


  describe('TimerService.stopTimer()', function () {

    it('Timer already stopped', function () {
    	var t1 = TimerService.startTimer('t1');
    	t1.stop();
    	t1.stop();
        expect($log.debug).toHaveBeenCalledWith('Timer already stopped!', 't1');
    });

    it('has already been stopped', function () {
    	var timer1 = TimerService.startTimer('t1');
    	timer1.stopped = true;
    	TimerService.stopTimer('t1');
        expect($log.debug).toHaveBeenCalledWith('The desired timer has already been stopped:','t1');
    });

	it('is accessible', function () {
      expect(TimerService.stopTimer).not.toBeUndefined();
    });

    it('is a function', function () {
      expect(typeof TimerService.stopTimer).toBe('function');
    });

    it('stops the timer with the given id', function () {
      var timer = TimerService.startTimer('FOO');
      expect(!!timer.started).toBe(true);
      expect(!!timer.stopped).toBe(false);

      TimerService.stopTimer('FOO');
      expect(!!timer.stopped).toBe(true);
    });

    it('does not stop other timers', function () {
      var timer1 = TimerService.startTimer('TIMER1');
      var timer2 = TimerService.startTimer('TIMER2');

      expect(!!timer1.started).toBe(true);
      expect(!!timer2.started).toBe(true);

      expect(!!timer1.stopped).toBe(false);
      expect(!!timer2.stopped).toBe(false);

      TimerService.stopTimer('TIMER1');
      expect(!!timer1.stopped).toBe(true);
      expect(!!timer2.stopped).toBe(false);
    });

    it('logs a message if timer does not exist', function () {
      expect($log.debug).not.toHaveBeenCalled();
      TimerService.stopTimer('UNEXISTENT_TIMER');
      expect($log.debug).toHaveBeenCalledWith(
        'Unable to find a timer with the given id (UNEXISTENT_TIMER). ' +
        'It has probably already been stopped.'
      );
    });

    it('logs a message with data when timer is stopped', function () {
      var originalGetTime = Date.prototype.getTime;

      spyOn(Date.prototype, 'getTime');
      
      expect($log.debug).not.toHaveBeenCalled();
      Date.prototype.getTime.andReturn(10);
      var timer = TimerService.startTimer('FOO');

      Date.prototype.getTime.andReturn(20);
      TimerService.stopTimer('FOO');

      // Reset back to original method
      Date.prototype.getTime = originalGetTime;

      expect($log.debug).toHaveBeenCalledWith('Timer FOO runned for 10ms.');
    });


    it('logs a fatal if process took more than 100ms', function () {
      var originalGetTime = Date.prototype.getTime;

      spyOn(Date.prototype, 'getTime');
      
      expect($log.debug).not.toHaveBeenCalled();
      Date.prototype.getTime.andReturn(10);
      var timer = TimerService.startTimer('FOO');

      Date.prototype.getTime.andReturn(110);
      TimerService.stopTimer('FOO');

      // Reset back to original method
      Date.prototype.getTime = originalGetTime;

      expect($log.debug).not.toHaveBeenCalled();
      expect($log.fatal).toHaveBeenCalledWith('Timer FOO runned for 100ms.');
    });

    it('removes timer from timers list', function () {
      TimerService.startTimer('FOO');
      expect(TimerService.timers['FOO']).not.toBeUndefined();
      TimerService.stopTimer('FOO');
      expect(TimerService.timers['FOO']).toBeUndefined();
    });
  }); // TimerService.stopTimer()


  describe('TimerService.clearTimers()', function () {
    it('is accessible', function () {
      expect(TimerService.clearTimers).not.toBeUndefined();
    });

    it('is a function', function () {
      expect(typeof TimerService.clearTimers).toBe('function');
    });

    it('stops running timers', function () {
      var timer = TimerService.startTimer('FOO');
      TimerService.clearTimers();
      expect(!!timer.stopped).toBe(true);
    });

    it('removes all timers from timers list', function () {
      TimerService.startTimer('FOO');
      expect(TimerService.timers['FOO']).not.toBeUndefined();
      TimerService.clearTimers();
      expect(TimerService.timers['FOO']).toBeUndefined();
    });
  }); // TimerService.clearTimers()

  it('Timer runned for elapsedTime', function () {
  	var t1 = TimerService.startTimer('t1');
  	var status = t1.getStatus();
    expect( status.indexOf("Timer t1 runned for") ).toEqual(0);
  });
  
  
});
