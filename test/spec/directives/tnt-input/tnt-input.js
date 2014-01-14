'use strict';

describe('Directive: tntInput', function () {

  // load the directive's module
  beforeEach(function(){
	  module('tnt.catalog.keyboard.input');
  });

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  xit('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<div tnt-input="lala"></div>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('');
  })); 
  
});
