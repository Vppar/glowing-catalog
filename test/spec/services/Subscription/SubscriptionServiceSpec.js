describe('Service: SubscriptionServiceSpec', function() {

	var SubscriptionKeeper = {};

    beforeEach(function() {
        module('tnt.catalog.subscription.service');
        module(function($provide) {
            $provide.value('SubscriptionKeeper', SubscriptionKeeper);
        });
    });
    beforeEach(inject(function(_Subscription_, _SubscriptionService_) {
    	Subscription = _Subscription_;
        SubscriptionService = _SubscriptionService_;
    }));
	
	it('should add a subscription', function() {
		SubscriptionKeeper.add = jasmine.createSpy('SubscriptionKeeper.add');
		SubscriptionService.isValid = jasmine.createSpy('SubscriptionService.isValid').andReturn([]);
		
        var subscription = new Subscription(null, 'GLOSS', new Date().getTime(), {}, 'PAYMENT_TYPE_CC'); 
        
        var result = SubscriptionService.add(subscription);

        expect(SubscriptionKeeper.add).toHaveBeenCalledWith(subscription);
        expect(result).toBe(undefined);
	});

	it('should not add a subscription', function() {
		SubscriptionKeeper.add = jasmine.createSpy('SubscriptionKeeper.add').andCallFake(function() {
			throw 'my exception';
		});
		SubscriptionService.isValid = jasmine.createSpy('SubscriptionService.isValid').andReturn([]);
		
        var subscription = new Subscription(null, 'GLOSS', new Date().getTime(), {}, 'PAYMENT_TYPE_CC'); 
        
        var createCall = function() {
        	SubscriptionService.add(subscription);
        };

        expect(createCall).toThrow();
	});
	
	it('should list all subscriptions', function() {
		SubscriptionKeeper.list = jasmine.createSpy('SubscriptionKeeper.list').andReturn([
				new Subscription(null, 'GLOSS', new Date().getTime(), {}, 'PAYMENT_TYPE_CC'),
				new Subscription(null, 'BLUSH', new Date().getTime(), {}, 'PAYMENT_TYPE_CC')
		]);
        
        var result = SubscriptionService.list();;
        expect(result.length).toBe(2);
	});

	it('should get last subscription', function() {
		SubscriptionKeeper.list = jasmine.createSpy('SubscriptionKeeper.list').andReturn([
				new Subscription('1', 'GLOSS', 1404738500791, {}, 'PAYMENT_TYPE_BILLET'),
				new Subscription('3', 'BLUSH', 1404738500793, {}, 'PAYMENT_TYPE_BILLET'),
				new Subscription('2', 'BLUSH', 1404738500792, {}, 'PAYMENT_TYPE_BILLET'),
				
		]);
        
        var result = SubscriptionService.getLastSubscription();
        expect(result.uuid).toBe('3');
	});

	it('should not get last subscription', function() {
		SubscriptionKeeper.list = jasmine.createSpy('SubscriptionKeeper.list').andReturn([]);
        
        var result = SubscriptionService.getLastSubscription();
        expect(result).toBe(undefined);
	});

});
