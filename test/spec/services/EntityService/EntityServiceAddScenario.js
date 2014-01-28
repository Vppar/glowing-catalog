'use strict';

describe('Service: EntityService', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.entity');
        module('tnt.catalog.entity.service');
        module('tnt.catalog.entity.entity');
    });

    // instantiate service
    var EntityService = undefined;
    var Entity = undefined;
    var timeout = undefined;
    
    beforeEach(inject(function(_EntityService_, _Entity_, $timeout) {
        EntityService = _EntityService_;
        Entity = _Entity_;
        timeout = $timeout;
    }));
    
    /**
     * <pre>
     * @spec EntityService.create
     * Given a valid values
     * when and create is triggered
     * then a enitity must be created
     * an the entry must be registered
     * </pre>
     */
  /*  it('should create', function() {
        //given
        var id = 1;
        var name = 'cassiano';
        var emails = [{address: 'cassiano.tesseroli@gvt.com.br'},{address: 'c4ssio@gmail.com'}];
        var birthDate = '16/09/1981';
        var phones = [{ddd: 41, phone: 96491686},{ddd: 41, phone: 30875341}];
        var cep = '8157170';
        var document = '1234567890';
        var addresses = [{street: 'rua', number: 555}, {street: 'rua', number: 556}];
        var remarks = 'bad client';
        
        var ev = new Entity(id, name, emails, birthDate, phones, cep, document, addresses,  remarks);
        
        //when
        runs(function(){
            EntityService.create(ev);
        });
        
        waitsFor(function(){
            timeout.flush();
            return EntityService.list().length > 0;
        }, 'JournalKeeper is taking too long', 300);
        
        //then
        runs(function(){
            expect(EntityService.list()[0].name).toBe('cassiano');
            expect(EntityService.list().length).toBe(1);
        });

    });*/
    
 
});
