'use strict';

describe('Controller: DeliveryCtrl', function () {

  // load the controller's module
  beforeEach(module('glowingCatalogApp'));

  var DeliveryCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DeliveryCtrl = $controller('DeliveryCtrl', {
      $scope: scope
    });
  }));

  xit('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
