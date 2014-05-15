'use strict';

describe('date-range', function () {

  it('does not change final date when initial date is set to an earlier date');
  it('does not change initial date when final date is set to a later date');
  it('changes final date to same value as initial date when a later initial date is selected');
  it('changes initial date to same value as final date when an earlier final date is selected');
  it('limits value by the "min" attribute');
  it('limits value by the "max" attribute');
  it('sets the values in the object passed to the "ng-model" attribute');
  it('initializes with values in the object passed to the "ng-model"');

  it('renders two date input fields');

  // TODO: check if this behavior is expected in this directive or if it
  // will be implemented in another one, or in a future task
  it('disables initial date field when its value is set to "-1"');
  it('disables final date field when its value is set to "-1"');
});
