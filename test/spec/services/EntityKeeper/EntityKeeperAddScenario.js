'use strict';

describe('Service: EntityKeeper', function() {

    // load the service's module
    beforeEach(function() {
        module('tnt.catalog.entity');
        module('tnt.catalog.entity.keeper');
        module('tnt.catalog.entity.entity');
    });

    // instantiate service
    var EntityKeeper = undefined;
    var Entity = undefined;
    beforeEach(inject(function(_EntityKeeper_, _Entity_) {
        EntityKeeper = _EntityKeeper_;
        Entity = _Entity_;
    }));
    
    /**
     * <pre>
     * @spec EntityKeeper.add#1
     * Given a valid values
     * when and create is triggered
     * then a enitity must be created
     * an the entry must be registered
     * </pre>
     */
    it('should add', function() {
        runs(function(){
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
            
            EntityKeeper.create(ev);
        });
        
        waitsFor(function(){
            return EntityKeeper.list().length;
        }, 'JournalKeeper is taking too long', 300);
        
        runs(function(){
            expect(EntityKeeper.list().length).toBe(1);
        });

    });
    
    /**
     * <pre>
     * @spec EntityKeeper.add#1
     * Given a invalid values
     * when and create is triggered
     * then a enitity must not be created
     * an the entry must be registered
     * </pre>
     */
    it('should not add', function() {
        var ev = {
            id : 1,
            name : 'cassiano',
            emails : [
                {
                    address : 'cassiano.tesseroli@gvt.com.br'
                }, {
                    address : 'c4ssio@gmail.com'
                }
            ],
            birthDate : '16/09/1981',
            phones : [
                {
                    ddd : 41,
                    phone : 96491686
                }, {
                    ddd : 41,
                    phone : 30875341
                }
            ],
            cep : '8157170',
            document : '1234567890',
            addresses : [
                {
                    street : 'rua',
                    number : 555
                }, {
                    street : 'rua',
                    number : 556
                }
            ],
            remarks : 'bad client'
        };
        var createCall = function(){EntityKeeper.create(ev);}
        
        expect(createCall).toThrow('Wront instance to EntityKeeper');

    });
});
