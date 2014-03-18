describe('Service: ConsultantServiceAddSpec', function() {

    var ConsultantService = {};
    var ConsultantKeeper = {};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.consultant.service');
        module('tnt.catalog.consultant');
        module('tnt.catalog.consultant.keeper');
    });
    
    beforeEach(function() {
        ConsultantKeeper.read = jasmine.createSpy('ConsultantKeeper.read');
        module(function($provide) {
            $provide.value('ConsultantKeeper', ConsultantKeeper);
        });
    });
    
    beforeEach(inject(function(_ConsultantKeeper_, _Consultant_, _JournalEntry_, _ConsultantService_) {
        Consultant = _Consultant_; 
        ConsultantService = _ConsultantService_;
    }));
    
    /**
     * <pre>
     * @spec ConsultantService.read#1
     * Given a valid uuid of consultant
     * when read is triggered
     * then the keeper must be call
     * </pre>
     */
    it('must call consultantKeeper', function() {
        // given
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000002';
        // when
        ConsultantService.read(uuid);
        // then
        expect(ConsultantKeeper.read).toHaveBeenCalledWith(uuid);
        expect(ConsultantService.read).not.toThrow();
    });

});
