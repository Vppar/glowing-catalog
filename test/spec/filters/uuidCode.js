'use strict';

describe('Filter: uuidCode', function() {

  beforeEach(module('tnt.catalog.filters.uuidCode'));

  var uuidCode = null;
  beforeEach(inject(function($filter) {
    uuidCode = $filter('uuidCode');
  }));

  it('should make an object with standard uuid into an human friendly code', function() {

    var item = {
      uuid : 'cc02b600-5d0b-11e3-96c3-010001000001',
      created : new Date('2014-02-02').getTime()
    };

    expect(uuidCode(item)).toBe('0001-01-14');
  });

});
