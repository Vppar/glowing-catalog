(function(angular) {

    angular
        .module('tnt.catalog.timer.service', [])
        .service('TimerService', function TimerService($log) {

            // Processes taking longer than x milliseconds should be logged
            // as a fatal error.
            var FATAL_THRESHOLD = 100; // milliseconds

            // Stores running timers
            var timers = {};


            /**
             * Returns current timestamp.
             * @return {Number}
             */
            function getNow() {
              return new Date().getTime();
            }


            /**
             * Defines a timer object.
             * @param {string} id Timer's id.
             * @param {string} description Description of the process being
             *  timed. This will be used in the log messages.
             * @see {@code Timer.getStatus()}.
             * @constructor
             */
            function Timer(id, description) {
                if (!id || typeof id !== 'string') {
                    throw 'Invalid timer id';
                }

                this.id = id;
                this.description = description;
                this.started = null;
                this.stopped = null;
            }


            Timer.prototype = {
                /** Starts the timer. */
                start : function () {
                    if (this.started) {
                        $log.debug('Timer already runnning!', this.id);
                        return;
                    }

                    this.started = getNow();
                },

                /** Stops the timer. */
                stop : function () {
                    if (this.stopped) {
                        $log.debug('Timer already stopped!', this.id);
                        return;
                    }

                    if (!this.started) {
                        $log.debug('Cannot stop a timer that has not been started!', this.id);
                        return;
                    }

                    this.stopped = getNow();
                },

                /**
                 * Gets the elapsed time since the timer started.
                 * @return {number} If the timer has not been started, returns 0.
                 *  If started and stopped, returns the difference between
                 *  both timestamps. If still running, returns the time in
                 *  milliseconds since the timer started.
                 */
                getElapsedTime : function () {
                    if (this.started && this.stopped) {
                        return this.stopped - this.started;
                    }

                    if (this.started) {
                        $log.debug('Getting elapsed time for a running timer (' + id + ').');
                        return getNow() - this.started;
                    }

                    return 0;
                },

                /**
                 * Gets a message resuming the timer current status.
                 * @return {string}
                 */
                getStatus : function () {
                    var elapsedTime = this.getElapsedTime();
                    var description = this.description;
                    var id = this.id;

                    if (this.started && this.stopped) {
                        return description ?
                            'Took ' + elapsedTime + 'ms to ' + description + ' (' + id + ').' :
                            'Timer ' + id + ' runned for ' + elapsedTime + 'ms.';
                    }

                    if (this.started) {
                        return description ?
                          'Took ' + elapsedTime + 'ms to ' + description + ' (' + id + '). Still running.' :
                          'Timer ' + id + ' runned for ' + elapsedTime + 'ms and is still running.';
                    }

                    return 'Timer ' + id + ' has not been started yet.'
                }
            };
            

            // Expose the Timer class for testing
            this.Timer = Timer;

            // Expose the timers object
            this.timers = timers;

            /**
             * Creates and starts a timer. If a timer with the given id
             * already exists, it won't do anything.
             *
             * @param {string} id The timer's id.
             * @param {string} description The timer's description.
             * @see {@code Timer} above.
             * @return {Timer} The created timer or the existing timer for the
             *  given id.
             */
            this.startTimer = function (id, description) {
                var timer;

                timer = timers[id];

                if (timer) {
                    $log.debug('A timer with this id (' + id + ') is already running.');
                    return;
                } else {
                  timer = new Timer(id, description);
                  timer.start();

                  // Store timer in timers list
                  timers[id] = timer;
                }

                return timer;
            };


            /**
             * Stops the timer with the given id. If no timer is found,
             * it will do nothing. If timer is already stopped, it will be
             * removed from the list.
             * @param {string} id The id of the timer to be stopped.
             * @return {Timer} The stopped timer.
             */
            this.stopTimer = function (id) {
                var timer = timers[id];

                if (!timer) {
                    $log.debug(
                      'Unable to find a timer with the given id (' + id + '). ' +
                      'It has probably already been stopped.'
                    );

                    return;
                }

                if (timer.stopped) {
                    $log.debug('The desired timer has already been stopped:', id);
                    delete timers[id];
                    return;
                }

                timer.stop();

                var elapsedTime = timer.getElapsedTime();
                var logger = elapsedTime >= FATAL_THRESHOLD ? $log.fatal : $log.debug;

                logger(timer.getStatus());
                delete timers[id];

                return timer;
            };


            /**
             * Clears the list of running timers. If a timer is running when
             * this method is called, it will be stopped.
             */
            this.clearTimers = function () {
                for (var id in timers) {
                    var timer = timers[id];
                    if (timer.started && !timer.stopped) {
                        timer.stop();
                    }

                    delete timers[id];
                }
            };
        });
}(angular));
