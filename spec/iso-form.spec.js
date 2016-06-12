'use strict';

var IsoForm = require('../lib/iso-form')
    , should = require('chai').should();

describe('IsoForm', function () {
    var isoForm;

    beforeEach(function() {
        isoForm = new IsoForm();
    });

    it('should create instance', function() {
        isoForm.should.be.instanceof(IsoForm);
    });
});
