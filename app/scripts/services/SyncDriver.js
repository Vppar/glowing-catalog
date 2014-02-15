(function(angular) {

  angular.module('tnt.catalog.sync.driver', [
    'tnt.catalog.sync.firebase'
  ]).service(
    'SyncDriver',
    [
      '$q',
      'Firebase',
      'FirebaseSimpleLogin',
      function SyncDriver($q, Firebase, FirebaseSimpleLogin) {

        var service = null;
        var baseRef = new Firebase('voppwishlist.firebaseio.com');
        var userJournalRef = null;



        this.nukeStoredData = function(securityHash) {
          if (securityHash !== "I'm TOTALLY aware that this should only be used in tests!") {
            throw('You shall not nuke the stored data! Check your security hash!');
          }

          var deferred = $q.defer();

          userJournalRef.remove(function (err) {
            if (err) {
              $log.debug('Failed to clear data!', err);
              deferred.reject(err);
            } else {
              $log.debug('Data cleared!');
              deferred.resolve();
            }
          });

          return deferred.promise;
        };


        // TODO implement rememberMe
        this.login = function(user, pass, rememberMe) {

          var deferred = $q.defer();

          new FirebaseSimpleLogin(baseRef, function(error, user) {
            if (error) {
              deferred.reject(error);
            } else if (user) {
              deferred.resolve(user);
            } else {
              deferred.reject('whaaat?!');
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

          new FirebaseSimpleLogin(baseRef, function(error, user) {
            if (error) {
              deferred.reject(error);
            } else if (user) {
              deferred.reject(user);
            } else {
              deferred.resolve('Logout successfull');
            }
          }).logout();

          return deferred.promise;
        };

        this.registerSync =
          function(syncService, lastSyncedEntrySequence) {
            service = syncService;

            userJournalRef.child('journal').startAt(lastSyncedEntrySequence + 1).on(
              'child_added',
              function(snapshot) {
                var messageInfo = snapshot.val();
                console.log('child_added', messageInfo);
                service.insert(messageInfo);
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
