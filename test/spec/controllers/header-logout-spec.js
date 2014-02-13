describe('Controller:HeaderCtrl - header-logout-spec', function() {
    
    beforeEach(inject(function($controller, $rootScope) {
        location.path = jasmine.createSpy('$location.path');

        //  mock
        scope = $rootScope.$new();
        
        $controller('HeaderCtrl', {
            $scope : scope,
            $location : location,
        });
    }));
});
