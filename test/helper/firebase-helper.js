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

        spyOn(this, 'child').andCallThrough();
        spyOn(this, 'on').andCallThrough();
        spyOn(this, 'once').andCallThrough();
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
        for (var idx in handlers) {
            var handler = handlers[idx];
            // If handler is null, skip it...
            handler && handler(snapshot);
        }
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
    pub.Firebase = Firebase;
    pub.FirebaseSimpleLogin = FirebaseSimpleLogin;

    return pub;
})();

