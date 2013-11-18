xdescribe('Service: DialogServiceSpec', function() {

    // load the service's module
    beforeEach(module('glowingCatalogApp'));

    // instantiate service
    var DialogService = null;
    beforeEach(inject(function(DialogService) {
        DialogService = _DialogService_;
    }));

    xit('should do something', function() {
        expect(!!DialogService).toBe(true);
    });
    
    xit('should open a dialog', function(){
        DialogService
    });
    
    

});
