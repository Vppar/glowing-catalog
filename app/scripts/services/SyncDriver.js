(function(angular) {

  angular.module('tnt.catalog.sync.driver', [
    'tnt.catalog.sync.firebase'
  ]).service(
    'SyncDriver',
    [
      '$rootScope',
      '$log',
      '$q',
      'Firebase',
      'FirebaseSimpleLogin',
      function SyncDriver($rootScope, $log, $q, Firebase, FirebaseSimpleLogin) {

        var baseRef = new Firebase('voppwishlist.firebaseio.com');
        var userRef = null;
        var journalRef = null;
        var syncingFlagRef = null;

        var connected = false;

        var firebaseSyncStartTime = null;
        var firebaseSyncStartTime2 = null;


        $rootScope.$on('SyncStop', function () {
          if (syncingFlagRef) {
            syncingFlagRef.remove();
          }
        });

        this.isFirebaseBusy = function () {
          return !!firebaseSyncStartTime && firebaseSyncStartTime !== firebaseSyncStartTime2;
        };

        // Uses Firebase's connected ref...
        this.isConnected = function () {
          return connected;
        };
        
        //FIXME to check if the user is connected 
        // use 'SyncDriver.isConnected'
        this.hasLoggedIn = function () {
          return !!journalRef;
        };


        this.lock = function (successCb, failureCb) {
          $log.debug('Trying to lock the user journal for synchronizing this device');
          syncingFlagRef.transaction(function (currentValue) {
            // Ooops! Another device got our slot! Abort synchronization!
            if (!currentValue) {
              return Firebase.ServerValue.TIMESTAMP;
            }
          }, function (err, committed, snapshot) {
            if (err) {
              failureCb(err);
            } else {
              if (committed) {
                firebaseSyncStartTime2 = snapshot.val();
                $log.debug('Firebase user journal locked!');
                successCb(snapshot.val());
              } else {
                failureCb('Firebase already being synced!');
              }
            }
          });
        };

        // TODO implement rememberMe
        //
        // FIXME Firebase authentication expects a single callback to handle
        // all authentication state changes. Right now we create two
        // instances of FirebaseSimpleLogin() to use 2 different
        // callbacks (one for login, another for logout). This is bothering
        // me and I hope to fix this later to use a single callback.
        this.login = function(username, password, rememberMe) {
          var deferred = $q.defer();

          new FirebaseSimpleLogin(baseRef, function(err, user) {
            if (err) {
              $log.debug('Firebase authentication error (login cb)', err);
              deferred.reject(err);
            } else if (user) {
              userRef = baseRef.child('users').child(username.replace(/\.+/g, '_'));
              journalRef = userRef.child('journal');
              syncingFlagRef = userRef.child('syncing');

              syncingFlagRef.onDisconnect().remove();

              syncingFlagRef.on('value', function (snapshot) {
                var syncing = snapshot.val();
                firebaseSyncStartTime  = syncing || null;

                syncing ?
                  $rootScope.$broadcast('FirebaseBusy', syncing) :
                  $rootScope.$broadcast('FirebaseIdle');
              });

              connected = true;
              // Broadcast the event once everything is ready
              $rootScope.$broadcast('FirebaseConnected');

              $log.debug('Logged in to Firebase as ' + username);
              deferred.resolve(user);
            }else{
                connected = false;
                $rootScope.$broadcast('FirebaseDisconnected');
            }
          }).login('password', {
            email : username,
            password : password
          });
          
          deferred.promise.then(function( ) {
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
            journalRef.startAt(SyncService.getLastSyncedSequence() + 1).on(
              'child_added',
              function(snapshot) {
                var entry = snapshot.val();
                $rootScope.$broadcast('EntryReceived', entry);
                //SyncService.insert(entry);
              });
          };


        this.save = function(entry) {
          var deferred = $q.defer();

          if (journalRef) {
            journalRef.child(entry.sequence).transaction(function(currentValue) {
              if (currentValue === null) {
                entry.synced = new Date().getTime();

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
                var message = 'Duplicate entry sequence!';
                deferred.reject(message);
              }
            });
          }

          return deferred.promise;
        };

      }
    ]);
}(angular));
