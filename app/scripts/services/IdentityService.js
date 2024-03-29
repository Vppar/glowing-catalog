(function(angular, uuid) {
    'use strict';

    angular
    .module('tnt.identity', ['tnt.catalog.sync.driver'])
    .service('IdentityService', function IdentityService() {

        // Device Id should be defined the first time the user connects to
        // Firebase. See the login process in SyncDriver.login().
        function getDeviceId() {
          if (!localStorage.deviceId) {
            throw('A device must have connected before being able to generate a UUID!');
          }

          return Number(localStorage.deviceId);
        }

        this.internalGetUUID = function (deviceId, op, id) {
            if (op > 0xff || id > 0xffff) {
                throw 'uuid seed data too big, op max is 255 and id max is 4095';
            }

            // split the counter bytes
            var high = id >> 8;
            var low = id & 0xff;

            // map our precious 6 bytes
            var seed = [
                deviceId, 0x00, op, 0x00, high, low
            ];

            // generate the uuid
            return uuid.v1({
                node : seed
            });
        };

        this.getUUID = function(op, id) {
            return this.internalGetUUID(getDeviceId(), op, id);
        };

        this.getUUIDData = function(uuid) {
            if (uuid.length !== 36) {
                throw 'This is not an uuid: ' + uuid;
            }

            var data = {};
            data.id = parseInt('0x'+uuid.substring(32, 36));
            data.deviceId = parseInt('0x'+uuid.substring(24, 26));
            data.typeId = parseInt('0x'+uuid.substring(28, 30));

            return data;
        };

        this.getDeviceId = function() {
            // FIXME: do we really need a copy here?
            return angular.copy(getDeviceId());
        };

        this.leftPad = function(n, p, c) {
            var pad_char = typeof c !== 'undefined' ? c : '0';
            var pad = new Array(1 + p).join(pad_char);
            return (pad + n).slice(-pad.length);
        };
    });
})(angular, window.uuid);
