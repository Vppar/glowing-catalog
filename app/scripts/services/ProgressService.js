(function(angular) {
    'use strict';

    angular
    .module('tnt.catalog.progress.service', [])
    .service('ProgressService', function () {

        /**
         * Holds a reference to all ProgressWatcher instances.
         * @type {object.<ProgressWatcher>}
         */
        var _instances = {};


        /**
         * Defines an object that keeps track of the progress of an operation.
         * 
         * @param {string} id An identifier for the operation. Should be
         *  unique.
         * @param {string} message A message that describes the operation.
         *  This is usefull for letting the user know what is happening.
         *
         * @constructor
         */
        function ProgressWatcher(id, message) {
            if (_instances[id]) {
                throw('Duplicate progress watcher: ' + id);
            }

            this.id = id;
            this.message = message;
            this.total = null;
            this.current = 0;
            this.relative = 0;
            this.relativeStep = null;
            _instances[id] = this;

            this._handlers = {};
            this._handlersOnce = {};
        }


        ProgressWatcher.prototype = {
            _calculateRelativeValue : function () {
                if (!this.total || !this.current) {
                  this.relative = 0;
                  return;
                }

                var relative = Math.round((this.current / this.total) * 100) / 100;

                if (relative > 1) {
                    // TODO: should we log a warning if it goes over 100%?
                    relative = 1;
                }

                // Update the relative value only when it goes over a multiple
                // of the step value. Set relativeStep to null or false to
                // update it continuously.
                //
                // Setting a relativeStep usually makes progress bars update
                // more smoothly.
                if (
                    !this.relativeStep ||
                    (relative === 1 && this.relative !== 1) ||
                    (relative >= this.relative + this.relativeStep)
                ) {
                    this.relative = relative;
                    console.log('::::::::::::', this.id, this.relative);
                    this.emit('update', this);
                }
            },

            emit : function (type) {
                var args = Array.prototype.slice(arguments, 1);
                var handlers = this._handlers[type];
                var i, len, handler;

                // Stores the listeners set to be executed only once for
                // removal.
                var removeList = [];

                var event = {
                    target : this,
                    type : type
                };

                // Insert the event object as the first element in the
                // args array.
                args.splice(0, 0, event);

                for (i = 0, len = this._handlers.length; i < len; i += 1) {
                    handler = handlers[i];
                    handler.apply(this, args);
                }

                for (i = 0, len = this._handlersOnce.length; i < len; i += 1) {
                    this.removeListener(type, this._handlersOnce[i]);
                }
            },


            on : function (type, handler) {
                var handlers = this._handlers[type];
                var idx;

                if (!handlers) {
                    handlers = this._handlers[type] = [];
                    idx = -1;
                } else {
                    idx = handlers.indexOf(handler);
                }

                if (!~idx) {
                    handlers.push(handler);
                }
            },

            once : function () {
                this.on.apply(this, arguments);

                var handlers = this._handlersOnce[type];
                var idx;

                if (!handlers) {
                    handlers = this._handlersOnce[type] = [];
                    idx = -1;
                } else {
                    idx = handlers.indexOf(handler);
                }

                if (!~idx) {
                    handlers.push(handler);
                }
            },

            removeListener : function (type, handler) {
                var idx = this._handlers.indexOf(handler);
                var idxO = this._handlersOnce.indexOf(handler);

                if (~idxO) {
                    this._handlersOnce.splice(idxO, 1);
                }

                if (~idx) {
                    return this._handlers.splice(idx, 1)[0];
                }
            },

            setStep : function (step) {
                if (step > 1) {
                    step = step / 100;
                }

                this.relativeStep = step;
            },

            setTotal : function (total) {
                this.total = total;
                this._calculateRelativeValue();
            },

            setCurrent : function (val, message) {
                if (message || message === null) {
                  this.setMessage(message);
                }

                this.current = val;
                this._calculateRelativeValue();
            },

            increment : function (amount) {
                amount = amount || 1;
                this.setCurrent(this.current + amount);
            },

            setMessage : function (message) {
                this.message = message;
                this.emit('setmessage', message);
            },

            del : function () {
                delete _instances[this.id];
                this.emit('delete');
            }
        };


        /**
         * Creates a new progress watcher with the given id and message.
         * @param {string} id
         * @param {string} message A message that discribes the watcher's
         *  initial state.
         * @return {ProgressWatcher}
         */
        this.create = function (id, message) {
            if (_instances[id]) {
                console.warn('Overriding existing progress watcher:', id);
            }

            var instance = new ProgressWatcher(id, message);
            _instances[id] = instance;

            return instance;
        };


        /**
         * Gets or creates a new progress watcher.
         * @param {string} id
         * @param {string=} message A message that discribes the watcher's
         *  initial state. Will be used only if the watcher does not exist.
         * @return {(ProgressWatcher|undefined)}
         */
        this.get = function (id, message) {
            var instance = _instances[id];
            return instance || this.create(id, message);
        };


        /**
         * Deletes the progress watcher with the given id.
         * @param {string} id
         * @return {(ProgressWatcher|undefined)}
         */
        this.remove = function (id) {
            var instance = this.get(id);

            if (instance) {
                instance.del();
            }

            return instance;
        };


    });
})(angular);
