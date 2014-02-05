(function(angular) {
  'use strict';

  angular.module('tnt.catalog.filters.uuidCode', ['tnt.identity']).filter('uuidCode', function(IdentityService) {
    return function(item) {
      if (!item.uuid) {
        return item;
      }

      function leftPad(n, p, c) {
        var pad_char = typeof c !== 'undefined' ? c : '0';
        var pad = new Array(1 + p).join(pad_char);
        return (pad + n).slice(-pad.length);
      }

      var data = IdentityService.getUUIDData(item.uuid);
      var year = String(new Date(item.created).getFullYear()).substring(2);

      return leftPad(data.id, 4) + '-' + leftPad(data.deviceId, 2) + '-' + year;
    };
  });
})(angular);