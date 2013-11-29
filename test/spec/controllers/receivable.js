'use strict';

describe('Controller: ReceivableCtrl', function () {

  // load the controller's module
  beforeEach(module('glowingCatalogApp'));

  var ReceivableCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ReceivableCtrl = $controller('ReceivableCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
