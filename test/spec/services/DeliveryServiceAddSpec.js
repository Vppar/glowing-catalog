xdescribe('Service: DeliveryServiceAddSpec', function() {

    var log = {};
    var storageStub = {};

    // load the service's module
    beforeEach(function() {

        // log mock
        log.error = jasmine.createSpy('$log.error');
        
        storageStub.insert = jasmine.createSpy().andCallFake(function(name,entity){
            var result = undefined;
            if(entity === dStub){
                entity.id = 1;
                result = dStub.id;
            }
            return result;
        });
        
        module('tnt.catalog.service.delivery');
        module(function($provide) {
            $provide.value('StorageService', storageStub);
            $provide.value('$log', log);
        });
    });

    beforeEach(inject(function(_DeliveryService_) {
        DeliveryService = _DeliveryService_;
    }));

    /**
     * <pre>
     * Given a valid delivery object
     * When add is triggered
     * Then a new delivery must be added to the storage
     * and the id of the delivery added must be returned
     * </pre>
     */
    it('should add a delivery to the storage', function() {
        // given
        var delivery = {
                datetime: [
                    1383238800000
                ],
                statusId: 2,
                orderId: 1,
                products: [{
                    productId: 13,
                    qty: 3
                }]
        };

        // when
        var result = DeliveryService.add(delivery);

        // then
        expect(DeliveryService.isValid).toHaveBeenCallWith(delivery);
        expect(storageStub.insert).toHaveBeenCallWith('deliveries',delivery);
        expect(result).toEqual(1); //1 defined on the mock add

    });

    /**
     * <pre>
     * Given an invalid delivery object
     * Then must be logged: 'DeliveryService.add: -Invalid delivery object'
     * and false must be returned
     * </pre>
     */
    it('shouldn\'t add a delivery to the storage', function() {
        // given
        var delivery = {
                datetime: [
                    1383238800000
                ]
        };
        
        // when
        var result = DeliveryService.add(delivery);

        // then
        expect(DeliveryService.isValid).toHaveBeenCallWith(delivery);
        expect(storageStub.insert).not.toHaveBeenCall();
        expect(log.error).toHAveBeenCallWith('DeliveryService.add: -Invalid delivery object');
        expect(result).toBeUndefined();
    });

});