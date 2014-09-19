(function(window) {
    'use strict';

    window.DateUtils = {
        /**
        * Calculates the difference in days between two dates.
        * @param {string} otherDate Date to compare with another.
        * @param {string} today Actual date to compare to another.
        * @return {string} The difference in days between two dates
        */       
        getDiffOfDays : function(otherDate, today) {
            if(otherDate && today) {
                var day=1000*60*60*24;    
                var diff = otherDate - today;   
                return Math.round(diff/day);
            }
            return null;
        },

        /**
        * Calculate device date based on the drift persisted in the local storage.         
        * @return {string} The actual device date with adjustment
        */
        getDeviceDate : function() {
            var dateDrift = localStorage.getItem('dateDrift');
            if(dateDrift) {
               return new Date().getTime() - dateDrift;               
            }
            return null;
        }
    };
}(window));