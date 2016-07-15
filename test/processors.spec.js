'use strict';

var IsoForm = require('../lib/iso-form'),
    isoFormTestDom = require('./processors/test-dom'),
    should = require('chai').should();

describe('IsoForm processors', function () {
    it('should accept processor and bootstrap types', function () {
        var isoForm = new IsoForm(isoFormTestDom);
        var checkboxItem = isoForm._registry.get('checkbox');
        checkboxItem.should.have.property('template');
    });
});
