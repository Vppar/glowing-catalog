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

    function addRef(ref) {
        refs[ref._name] = ref;
    }

    function getRef(name) {
        return refs[name];
    }



    function Firebase(uri) {
        this._name = uri;

        spyOn(this, 'child').andCallThrough();
        spyOn(this, 'on').andCallThrough();
        spyOn(this, 'once').andCallThrough();
    };


    Firebase.prototype = {
        child : function (name) {
            // Make the calls to child() chainable
            return _getFirebaseRef(name, this._name);
        },

        on : function () {},

        once : function () {}
    };


    var FirebaseSimpleLogin = function () {};

    FirebaseSimpleLogin.prototype = {
        changePassword : function () {},
        login : function () {}
    };
    

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


    function reset() {
        refs = pub.refs = {};
    }


    pub.refs = refs;
    pub.addRef = addRef;
    pub.getRef = getRef;
    pub.getSnapshot = getSnapshot;
    pub.reset = reset;
    pub.Firebase = Firebase;
    pub.FirebaseSimpleLogin = FirebaseSimpleLogin;

    return pub;
})();

