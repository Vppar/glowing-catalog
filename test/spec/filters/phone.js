'use strict';

describe('Filter: phone', function () {

  // load the filter's module
  beforeEach(module('glowingCatalogApp'));

  // initialize a new instance of the filter before each test
  var phone;
  beforeEach(inject(function ($filter) {
    phone = $filter('phone');
  }));

  xit('should return the input prefixed with "phone filter:"', function () {
    var text = 'angularjs';
    expect(phone(text)).toBe('phone filter: ' + text);
  });

});
