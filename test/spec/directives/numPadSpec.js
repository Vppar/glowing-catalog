describe('Directive: numPad', function() {

    // load the directive's module
    beforeEach(module('tnt.catalog.directive.numpad'));

    var element, scope;

    beforeEach(inject(function($rootScope) {
        scope = $rootScope.$new();
    }));

    it('should make hidden element visible', inject(function($compile) {
        element = angular.element('<num-pad></num-pad>');
        element = $compile(element)(scope);
        expect(element.text()).toBe('this is the numPad directive');
    }));
});
