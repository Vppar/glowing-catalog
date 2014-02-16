(function(angular) {

  angular.module('tnt.catalog.sync.driver', [
    'tnt.catalog.sync.firebase'
  ]).service(
    'SyncDriver',
    [
      '$log',
      '$q',
      'Firebase',
      'FirebaseSimpleLogin',
      function SyncDriver($log, $q, Firebase, FirebaseSimpleLogin) {

        var baseRef = new Firebase('voppwishlist.firebaseio.com');
        var userJournalRef = null;



        // TODO implement rememberMe
        //
        // FIXME Firebase authentication expects a single callback to handle
        // all authentication state changes. Right now we create two
        // instances of FirebaseSimpleLogin() to use 2 different
        // callbacks (one for login, another for logout). This is bothering
        // me and I hope to fix this later to use a single callback.
        this.login = function(user, pass, rememberMe) {

          var deferred = $q.defer();

          new FirebaseSimpleLogin(baseRef, function(err, user) {
            if (err) {
              $log.debug('Firebase authentication error (login cb)', err);
              deferred.reject(err);
            } else if (user) {
              $log.debug('Logged in to Firebase as ' + user);
              deferred.resolve(user);
            }
          }).login('password', {
            email : user,
            password : pass
          });

          deferred.promise.then(function( ) {
            userJournalRef = baseRef.child('users').child(user.replace('.', '_')).child('journal');
          });

          return deferred.promise;
        };


        this.logout = function( ) {
          var deferred = $q.defer();

          new FirebaseSimpleLogin(baseRef, function(err, user) {
            if (err) {
              $log.debug('Firebase authentication error (logout cb)', err);
              deferred.reject(err);
            } else if (!user) {
              $log.debug('Logged out from Firebase!');
              deferred.resolve('Logout successfull');
            }
          }).logout();

          return deferred.promise;
        };


        this.registerSyncService =
          function(SyncService) {
            userJournalRef.startAt(SyncService.getLastSyncedSequence() + 1).on(
              'child_added',
              function(snapshot) {
                var entry = snapshot.val();
                $log.debug('Firebase child_added cb', entry);
                SyncService.insert(entry);
              });
          };


        this.save = function(entry) {
          var deferred = $q.defer();

          userJournalRef.child(entry.sequence).transaction(function(currentValue) {
            if (currentValue === null) {
              return {
                '.value' : entry,
                '.priority' : entry.sequence
              };
            }
          }, function(error, committed, snapshot) {
            if (committed) {
              // Entry stored
              deferred.resolve();
            } else if (error) {
              // Failed to store entry
              deferred.reject(error);
            } else {
              // Entry already exists
              var message = 'Entry ' + entry.sequence + ' already saved!';
              deferred.reject(message);
            }
          });

          return deferred.promise;
        };

      }
    ]);
}(angular));
