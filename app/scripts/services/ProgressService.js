(function(angular) {
    'use strict';

    angular
    .module('tnt.catalog.progress.service', [])
    .service('ProgressService', function () {

        var _instances = {};

        function ProgressWatcher(id, message) {
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
                this.emit('update');
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
                    this.off(type, this._handlersOnce[i]);
                }
            },


            on : function (type, handler) {
                this._handlers.push(handler);
            },

            once : function () {
                this.on.apply(this, arguments);
                this._handlersOnce.push(handler);
            },

            off : function (type, handler) {
                var idx = this._handlers.indexOf(handler);

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


        this.create = function (id, message) {
            if (_instances[id]) {
                console.warn('Overriding existing progress watcher:', id);
            }

            var instance = new ProgressWatcher(id, message);
            _instances[id] = instance;

            return instance;
        };


        this.get = function (id) {
            return _instances[id];
        };


        this.remove = function (id) {
            var instance = this.get(id);

            if (instance) {
                instance.del():
            }

            return instance;
        };


    });
})(angular);
