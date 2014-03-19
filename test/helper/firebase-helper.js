/**
 * Helps to test calls to Firebase's JS client and test if children are being
 * accessed and listeners are being placed on the right references. Also
 * allows to easily trigger these listeners and check their results.
 *
 * This helper implements mocks for both {@code Firebase} and
 * {@code FirebaseSimpleLogin} constructors, although FirebaseSimpleLogin
 * still needs some work on it.
 *
 * See {@code FirebaseHelper.Firebase}
 * See {@code FirebaseHelper.FirebaseSimpleLogin}
 * See {@code FirebaseHelper.getRef}
 */
var FirebaseHelper = (function () {
    'use strict';

    var pub = {};
    var refs = {};


    function _setRefName(ref, name, prefix) {
        var result = '';

        if (prefix) {
            result += prefix + '.';
        }

        result += name;

        ref._name = result;
    }


    function _getFirebaseRef(name, prefix) {
        var ref = new Firebase();
        _setRefName(ref, name, prefix);
        addRef(ref);
        return ref;
    }


    /**
     * Adds the reference to the "references storage".
     * @param {Object} ref Reference being stored.
     */
    function addRef(ref) {
        refs[ref._name] = ref;
    }


    /**
     * Gets a reference by its path. The path for a reference is a
     * dot-separator list of names from the reference's most distant parent
     * down to the reference itself.
     *
     * Everytime {@code .child()} is called, we add a reference to the child
     * ref in our "reference storage". This method allows you to retrieve
     * this references from within the test cases, making sure everything is
     * were it is supposed to be. E.g.:
     *
     * In our code:
     *
     *    var baseRef = new Firebase('someFirebaseUri');
     *    baseRef.child('foo').on('value', function () {...});
     *
     * In the test you may check that {@code on()} was called on the
     * {@code 'foo'} child by using:
     *
     *    var fooRef = FirebaseHelper.getRef('someFirebaseUri.foo');
     *    expect(fooRef.on).toHaveBeenCalled();
     *
     * If you need to check that a reference to 'foo' has EVER been accessed,
     * you may use:
     *
     *    expect(fooRef).toBeDefined();
     *
     * Similarlly, you may check that a child was never accessed with:
     *
     *    var barRef = FirebaseHelper.getRef('someFirebaseUri.foo.bar');
     *    expect(barRef).toBeUndefined();
     *
     * @param {string} name The name for the wanted reference.
     */
    function getRef(name) {
        return refs[name];
    }



    /**
     * Mocks {@code Firebase} functionality.
     *
     * @param {string} uri In real code this will be the uri to a Firebase
     *    server/account/whatever. During tests, you may use any string here,
     *    such as 'base', which will make it MUCH easier to access refs
     *    later, as this will be used as a prefix for all references returned
     *    by calls to {@code child()}.
     */
    function Firebase(uri) {
        this._name = uri;
        this._handlers = [];
        this._transactionCalls = [];

        spyOn(this, 'child').andCallThrough();
        spyOn(this, 'on').andCallThrough();
        spyOn(this, 'once').andCallThrough();
        spyOn(this, 'transaction').andCallThrough();
    };


    Firebase.prototype = {
        child : function (name) {
            // Make the calls to child() chainable
            return _getFirebaseRef(name, this._name);
        },

        on : function (event, callback) {
            var handlers = this._getHandlers(event);
            handlers.push(callback);
        },


        once : function (event, callback) {
            var handlers = this._getHandlers(event);
            var index = handlers.length;

            handlers.push(function (snapshot) {
                callback(snapshot);
                // We MUST NOT change the handlers length.
                handlers.splice(index, 1, null);
            });
        },

        transaction : function (updateFn, callback, applyLocally) {
            this._transactionCalls.push(arguments);
        },

        _getHandlers : function (event) {
            var handlers = this._handlers[event];

            if (!handlers) {
                handlers = [];
                this._handlers[event] = handlers;
            }

            return handlers;
        }
    };


    /**
     * Mocks {@code FirebaseSimpleLogin} functionality.
     *
     * TODO Document this.
     */
    var FirebaseSimpleLogin = function () {};

    FirebaseSimpleLogin.prototype = {
        changePassword : function () {},
        login : function () {}
    };
    

    /**
     * Triggers all handlers for the given event on the given Firebase
     * reference object.
     *
     * @param {Object} ref Firebase reference you want to call this
     */
    function trigger(ref, event, snapshotValue) {
        if (typeof ref === 'string') {
            ref = getRef(ref);
        }

        if (!ref) { return; }

        var handlers = ref._getHandlers(event);
        var snapshot = getSnapshot(snapshotValue);

        // FIXME make this code run asynchronously (not sure yet if this
        // is the right place to do it, nor that this is really needed).
        for (var idx in handlers) {
            var handler = handlers[idx];
            // If handler is null, skip it...
            handler && handler(snapshot);
        }
    }


    /**
     * Executes a transaction on the given reference object. The update
     * function given to the transaction will be executed with
     * {@code currentValue}. The transaction will then be called with the
     * proper params.
     *
     * If you wish to simulate transaction error handling, you may pass
     * an error as {@code err}, and it will be passed back to the transaction
     * callback.
     *
     * If your code runs multiple transactions on the same reference
     * (why!?), you may choose which transaction to run using the
     * {@code index} parameter (defaults to 0).
     *
     * To make it easier to test, this function sets some properties
     * to {@code ref.transaction()}, containing some internal values defined
     * during the transaction:
     *
     *    expect(ref.transaction.result).toBe('foo');
     *    expect(ref.transaction.committed).toBe(true);
     *    expect(ref.transaction.snapshot.val()).toBe('foo');
     *
     * Beware that only the values from the last call to {@code transaction}
     * will be available this way.
     *
     * @param {Object} ref Firebase reference object.
     * @param {*} currentValue Value passed to the update function.
     * @param {string|Error?} err Error that should be passed to the callback.
     * @param {number?} index Transaction call index. This will be used only
     *    in case you have multiple transaction calls for the same reference.
     */
    function runTransaction(ref, currentValue, err, index) {
        index = index || 0;
        err = err || null;

        var args = ref._transactionCalls[index];

        if (!args) {
            console.log('No transaction to run for this ref:', ref);
            return;
        }

        var updateFn = args[0];
        var callback = args[1];
        var applyLocally = args[2];

        var result = updateFn(currentValue);
        var committed = result !== undefined;
        var snapshot = getSnapshot(committed ? result : currentValue);
        
        // Make the results accessible from tests
        ref.transaction.committed = committed;
        ref.transaction.result = result;
        ref.transaction.snapshot = snapshot;

        setTimeout(function () {
            callback(err, committed, snapshot);
        }, 0);
    }


    /**
     * Helper that returns an object that acts like a snapshot returned from
     * Firebase.
     * @param {*} value The value you expect {@code snapshot.val()} to return
     * @return {Object} A snapshot-like object.
     */
    function getSnapshot(val) {
        return {
            val : function () {
                return val;
            }
        }
    }


    /**
     * Resets {@code FirebaseHelper}. This clears all stored Firebase
     * references.
     *
     * It's wise to call it inside a beforeEach() block.
     */
    function reset() {
        refs = pub.refs = {};
    }



    pub.refs = refs;
    pub.addRef = addRef;
    pub.getRef = getRef;
    pub.getSnapshot = getSnapshot;
    pub.reset = reset;
    pub.trigger = trigger;
    pub.runTransaction = runTransaction;
    pub.Firebase = Firebase;
    pub.FirebaseSimpleLogin = FirebaseSimpleLogin;

    return pub;
})();

