'use strict';

describe('Service: ConsultantKeeper', function() {

    var jKeeper = {};
    var IdentityService ={};
    var fakeUUID = {};
    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.consultant');
        module('tnt.catalog.journal');
        module('tnt.catalog.journal.entity');
        module('tnt.catalog.journal.replayer');
    });

    beforeEach(function() {
        jKeeper.compose = jasmine.createSpy('JournalKeeper.compose');
        fakeUUID= '123456-4646231231-6465';
        IdentityService.getUUID = jasmine.createSpy('IdentityService.getUUID').andReturn(fakeUUID);
        module(function($provide) {
            $provide.value('JournalKeeper', jKeeper);
            $provide.value('IdentityService', IdentityService);
        });
    });

    // instantiate service
    var ConsultantKeeper = undefined;
    var Consultant = undefined;
    var JournalEntry = undefined;
    beforeEach(inject(function(_ConsultantKeeper_, _Consultant_, _JournalEntry_) {
        ConsultantKeeper = _ConsultantKeeper_;
        Consultant = _Consultant_;
        JournalEntry =_JournalEntry_;
    }));
    
    
    it('should handle an update consultant event', function() {
        // given
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
        var name = 'cassiano';
        var mkCode = 'mk-007';
        var cep = 81110010;
        var address = {street: 'rua', number: 555};
        var cpf = '8157170';
        var bank = '001';
        var agency = 12345;
        var account = 321;
        var email = 'teste@tunts.com';
        
        var validConsultant = new Consultant(uuid, name, mkCode, cep, address, cpf, bank,  agency, account, email);

        // when
        expect(function() {
            ConsultantKeeper.handlers['consultantUpdateV1'](validConsultant);}).toThrow('User not found.');

    });
    
    
    /**
     * <pre>
     * @spec ConsultantKeeper.update#1
     * Given a valid values
     * when and create is triggered
     * then a journal entry must be created
     * an the entry must be registered
     * </pre>
     */
    
    it('should update', function() {

        var fakeNow = 1386179100000;
        spyOn(Date.prototype, 'getTime').andReturn(fakeNow);
        
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
        var name = 'cassiano';
        var mkCode = 'mk-007';
        var cep = 81110010;
        var address = {street: 'rua', number: 555};
        var cpf = '8157170';
        var bank = '001';
        var agency = 12345;
        var account = 321;
        var email = 'teste@tunts.com';
        
        var ev = new Consultant(uuid, name, mkCode, cep, address, cpf, bank,  agency, account, email);
        var stp = fakeNow;
        var entry = new JournalEntry(null, stp, 'consultantUpdate', 1, ev); 
        
        expect(function() {
            ConsultantKeeper.update(ev);}).not.toThrow();
        expect(jKeeper.compose).toHaveBeenCalledWith(entry);
    });
    
    /**
     * <pre>
     * @spec ConsultantKeeper.update#2
     * Given a invalid document
     * when and update is triggered
     * then an error must be raised
     * </pre> 
     */
    it('should throw error', function() {
        
        ConsultantKeeper.update = jasmine.createSpy('consultantKeeper.update').andCallFake(function() {
            throw 'User not found.';
        });
        
        var uuid = 'cc02b600-5d0b-11e3-96c3-010001000001';
        var name = 'cassiano';
        var mkCode = 'mk-007';
        var cep = 81110010;
        var address = {street: 'rua', number: 555};
        var cpf = '8157170';
        var bank = '001';
        var agency = 12345;
        var account = 321;
        var email = 'teste@tunts.com';

        expect(function() {
            ConsultantKeeper.update(uuid, name, mkCode, cep, address, cpf, bank,  agency, account, email);}).toThrow('User not found.');
    });

});
