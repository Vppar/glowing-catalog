describe('Service: EntityServiceAddSpec', function() {

    var EntityService = {};
    var EntityKeeper = {};

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.entity.service');
        module('tnt.catalog.entity');
        module('tnt.catalog.entity.keeper');
    });
    
    beforeEach(function() {
        EntityKeeper.read = jasmine.createSpy('EntityKeeper.read');
        module(function($provide) {
            $provide.value('EntityKeeper', EntityKeeper);
        });
    });
    
    beforeEach(inject(function(_EntityKeeper_, _Entity_, _JournalEntry_, _EntityService_) {
        Entity = _Entity_; 
        EntityService = _EntityService_;
    }));
    
    /**
     * <pre>
     * @spec EntityService.read#1
     * Given a valid uuid of entity
     * when read is triggered
     * then the keeper must be call
     * </pre>
     */
    it('must call entityKeeper', function() {
        // given
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000002';
        // when
        EntityService.read(uuid);
        // then
        expect(EntityKeeper.read).toHaveBeenCalledWith(uuid);
        expect(EntityService.read).not.toThrow();
    });

});
