(function(angular, uuid) {
  'use strict';

  angular.module('tnt.identity', []).service('IdentityService', function IdentityService() {

    // TODO find a unique id for the device
    var deviceId = 1;

    this.getUUID = function(op, id) {

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

    this.getUUIDData = function(uuid) {
      
      if(uuid.length !== 36){
        throw 'This is not an uuid: ' + uuid;
      }
      
      var data = {};
      data.id = parseInt(uuid.substring(32, 36), 10);
      data.deviceId = parseInt(uuid.substring(24, 26), 10);
      data.typeId = parseInt(uuid.substring(28, 30), 10);

      return data;
    };

    this.getDeviceId = function() {
      return angular.copy(deviceId);
    };
  });
})(angular, window.uuid);
