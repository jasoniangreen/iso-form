'use strict';

var IsoForm = require('../lib/iso-form'),
    should = require('chai').should();

var EXPECTED_ITEM_TYPE = [
    { "type": "object", "properties": {"type":{"enum":["test"]}},"required":["type"] },
    { "processTest": true }
];

describe('IsoForm', function () {
    var isoForm;

    beforeEach(function () {
        isoForm = new IsoForm();
        isoForm.addItemType('test', templateFunc);
    });

    it('should create instance', function () {
        isoForm.should.be.instanceof(IsoForm);
    });

    it('should register new form item type', function () {
        var itemType = getFormItemType(0);
        itemType.should.deep.equal(EXPECTED_ITEM_TYPE);
        var cachedItem = isoForm._registry.get('test');
        cachedItem.should.have.property('template');
        cachedItem.template.should.be.a('function');
    });

    it('should create build function', function () {
        isoForm.build({ type:'test' });
        isoForm.html.should.equal('TEST');
        isoForm.validSchema.should.equal(true);
    });

    it('should support starting with an array', function () {
        isoForm.build([{ type:'test' }, { type:'test' }]);
        isoForm.html.should.equal('TESTTEST');
        isoForm.validSchema.should.equal(true);
    });

    it('should support group type', function () {
        isoForm.addGroupType('group', groupTemplate, closeGroupTemplate);
        isoForm.build({
            type:'group',
            items: [
                { type: 'test' }
            ]
        });
        isoForm.validSchema.should.equal(true);
        isoForm.html.should.equal('GROUP START TEST GROUP END');
    });

    function getFormItemType(n) {
        return isoForm.schema.anyOf[n].allOf;
    }

    function templateFunc(data) {
        return 'TEST';
    }

    function groupTemplate(data) {
        return 'GROUP START ';
    }

    function closeGroupTemplate(data) {
        return ' GROUP END';
    }
});
