'use strict';

describe('Controller: CatalogCtrl', function () {

  // load the controller's module
  beforeEach(module('glowingCatalogApp'));

  var CatalogCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CatalogCtrl = $controller('CatalogCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
