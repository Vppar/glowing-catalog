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
            this.current = null;
            this.relative = 0;
            _instances[id] = this;

            this._listeners = {};
        }


        ProgressWatcher.prototype = {
            _setRelativeValue : function () {
                this.relative = (this.current / this.total) * 100;
                this.emit('update', this);
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

            setTotal : function (total) {
                this.total = total;
                this._updateRelative();
            },

            setCurrent : function (val) {
                this.current = val;
                this._updateRelative();
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
         * @param {string} message
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
         * Gets an existing progress watcher.
         * @param {string} id
         * @return {(ProgressWatcher|undefined)}
         */
        this.get = function (id) {
            return _instances[id];
        };


        /**
         * Deletes the progress watcher with the given id.
         * @param {string} id
         * @return {(ProgressWatcher|undefined)}
         */
        this.remove = function (id) {
            var instance = this.get(id);

            if (instance) {
                instance.del():
            }

            return instance;
        };


    });
})(angular);
