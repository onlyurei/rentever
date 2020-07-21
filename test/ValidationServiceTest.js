var expect = require('chai').expect;
var service = require('../api/services/ValidationService.js');

describe('ValidationService', function(){
    describe('#validate', function(){
        it('should return false for non-existing required argument', function(){
            var req = { query : {}};
            var rules = [
                { field: 'listingId', checks: ['required'] }
            ];
            var result = service.validate(req, rules);
            expect(result.success).to.equal(false);
            expect(result.messages.length).to.equal(1);
        });
        it('should return true for existing required argument', function(){
            var req = { query : {
                listingId: 1
            }};
            var rules = [
                { field: 'listingId', checks: ['required'] }
            ];
            var result = service.validate(req, rules);
            expect(result.success).to.equal(true);
        });
        it('should return false for non-valid ymd date format', function(){
            var req = { query : {
                dateFrom: '12-12-2014'
            }};
            var rules = [
                { field: 'dateFrom', checks: ['ymd-date'] }
            ];
            var result = service.validate(req, rules);
            expect(result.success).to.equal(false);
            expect(result.messages.length).to.equal(1);
        });
        it('should return true for valid ymd date format', function(){
            var req = { query : {
                dateFrom: '2014-12-12'
            }};
            var rules = [
                { field: 'dateFrom', checks: ['ymd-date'] }
            ];
            var result = service.validate(req, rules);
            expect(result.success).to.equal(true);
        });
        it('should return false for non-valid calendar date', function(){
            var req = { query : {
                dateFrom: '2014-13-12'
            }};
            var rules = [
                { field: 'dateFrom', checks: ['ymd-date'] }
            ];
            var result = service.validate(req, rules);
            expect(result.success).to.equal(false);
            expect(result.messages.length).to.equal(1);
        });
        it('should return true for valid calendar date', function(){
            var req = { query : {
                dateFrom: '2014-12-20'
            }};
            var rules = [
                { field: 'dateFrom', checks: ['ymd-date'] }
            ];
            var result = service.validate(req, rules);
            expect(result.success).to.equal(true);
        });

        it('should return false for non-valid datetime format', function(){
            var req = { query : {
                dateFrom: '2014-12-12 2:2:2'
            }};
            var rules = [
                { field: 'dateFrom', checks: ['ymd-datetime'] }
            ];
            var result = service.validate(req, rules);
            expect(result.success).to.equal(false);
            expect(result.messages.length).to.equal(1);
        });
        it('should return true for valid datetime format', function(){
            var req = { query : {
                dateFrom: '2014-12-12 12:12:12'
            }};
            var rules = [
                { field: 'dateFrom', checks: ['ymd-datetime'] }
            ];
            var result = service.validate(req, rules);
            expect(result.success).to.equal(true);
        });
        it('should return false for non-valid calendar datetime', function(){
            var req = { query : {
                dateFrom: '2014-13-12 25:61:79'
            }};
            var rules = [
                { field: 'dateFrom', checks: ['ymd-datetime'] }
            ];
            var result = service.validate(req, rules);
            expect(result.success).to.equal(false);
            expect(result.messages.length).to.equal(1);
        });
        it('should return true for valid calendar datetime', function(){
            var req = { query : {
                dateFrom: '2014-12-20 01:01:01'
            }};
            var rules = [
                { field: 'dateFrom', checks: ['ymd-datetime'] }
            ];
            var result = service.validate(req, rules);
            expect(result.success).to.equal(true);
        });
    });
});