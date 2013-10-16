'use strict';

describe('Filter: obInject', function () {

  // load the filter's module
  beforeEach(module('glowingCatalogApp'));

  // initialize a new instance of the filter before each test
  var obInject;
  beforeEach(inject(function ($filter) {
    obInject = $filter('obInject');
  }));

  xit('should return the input prefixed with "obInject filter:"', function () {
    var text = 'angularjs';
    expect(obInject(text)).toBe('obInject filter: ' + text);
  });

});
