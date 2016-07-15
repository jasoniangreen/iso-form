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

    it('should throw when attempting to overwrite type', function () {
        should.throw(function () {
            isoForm.addItemType('test', 'SHOULD FAIL');
        });
    });

    it('should create build function', function () {
        var form = isoForm.build({ type:'test' });
        form.isValidSchema.should.equal(true);
        form.html.should.equal('TEST');
    });

    it('should recompile build function when new type added', function () {
        var form = isoForm.build({ type:'test' });
        isoForm.addItemType('test2', 'TEST2');
        var form2 = isoForm.build({ type:'test2' });
        form2.isValidSchema.should.equal(true);
        form2.html.should.equal('TEST2');
    });

    it('should fail validation when unknown type used', function () {
        var form = isoForm.build({ type:'notatype' });
        form.isValidSchema.should.equal(false);
    });

    it('should support strings and template functions', function () {
        isoForm.addItemType('stringtest', 'A STRING TEMPLATE');
        var form = isoForm.build({ type:'stringtest' });
        form.isValidSchema.should.equal(true);
        form.html.should.equal('A STRING TEMPLATE');
    });

    it('should support starting with an array', function () {
        var form = isoForm.build([{ type:'test' }, { type:'test' }]);
        form.isValidSchema.should.equal(true);
        form.html.should.equal('TESTTEST');
    });

    it('should support group type', function () {
        isoForm.addGroupType('group', groupTemplate, closeGroupTemplate);
        var form = isoForm.build({
            type:'group',
            items: [
                { type: 'test' }
            ]
        });
        form.isValidSchema.should.equal(true);
        form.html.should.equal('GROUP START TEST GROUP END');
    });

    it('should be able to pass options to build function', function () {
        isoForm.addGroupType('group', groupTemplate, closeGroupTemplate);
        isoForm.addItemType('testoptions', templateWithOptions);
        var form = isoForm.build({
            type:'group',
            items: [
                { type: 'testoptions', id: 'woo' }
            ]
        });
        form.isValidSchema.should.equal(true);
        form.html.should.equal('GROUP START TESTwoo GROUP END');
    });

    it('should allow a context in build function', function () {
        var context = { current: {} };
        isoForm.addItemType('testcontext', function (options) {
            this.current.customProperty = true;
        });

        var form = isoForm.build({
            type: 'testcontext', id: 'woo'
        }, context);
        form.isValidSchema.should.equal(true);
        context.current.customProperty.should.equal(true);
    });

    function getFormItemType(n) {
        return isoForm.schema.anyOf[n].allOf;
    }

    function templateWithOptions(options) {
        return 'TEST' + options.id;
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
