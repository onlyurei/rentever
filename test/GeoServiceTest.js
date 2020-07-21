var expect = require('chai').expect;
var service = require('../api/services/GeoService.js');

describe('GeoService', function(){
    describe('#getDistanceFromLatLon', function(){
        it('should get distance correctly', function(){
            var result = service.getDistanceFromLatLon(41.888059, -87.632127, 41.961814, -87.704920, false);
            expect(result.toFixed(3)).to.equal('6.322');
        });
    });
});
