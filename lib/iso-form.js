'use strict';

var Ajv = require('ajv'),
    Cache = require('./cache');

var IsoForm = module.exports = function IsoForm() {
    this.ajv = new Ajv({ passContext: true });
    this._registry = new Cache;
    this.html = '';
    this.schema = {
        'anyOf': [
            {
                'type': 'array',
                'items': { '$ref': '#' }
            }
        ]
    };
    this.schemaItemsArray = this.schema.anyOf;
}

IsoForm.prototype.addItemType = addItemType;
IsoForm.prototype.addGroupType = addGroupType;
IsoForm.prototype.build = build;
IsoForm.prototype.compile = compile;

function addItemType(name, template) {
    if (this._registry.get(name))
        throw new Error('IsoForm.addItemType: type already exists');

    var processName = 'process' + capitalizeFirstLetter(name);
    var processKeyword = {};
    processKeyword[processName] = true;
    this.schemaItemsArray.unshift({
        'allOf': [
            objWithType(name),
            processKeyword
        ]
    });
    this.ajv.addKeyword(
        processName,
        { type: 'object', schema: false, validate: processWrapper(template, processName) }
    );
    this._registry.put(name, { template: template });
    this._isRegistryDirty = true;
}

function addGroupType(name, template, closeTemplate) {
    if (this._registry.get(name))
        throw new Error('IsoForm.addItemType: type already exists');

    var processName = 'process' + capitalizeFirstLetter(name);
    var closeName = 'close' + capitalizeFirstLetter(name);
    var processKeyword = {};
    var closeKeyword = {};
    processKeyword[processName] = true;
    closeKeyword[closeName] = true;
    this.schemaItemsArray.unshift({
        "allOf": [
            objWithType(name),
            processKeyword,
            {
                'properties': {
                    'items': {
                        'type': 'array',
                        'items': { '$ref': '#' }
                    }
                }
            },
            closeKeyword
        ]
    });
    this.ajv.addKeyword(
        processName,
        { type: 'object', schema: false, validate: processWrapper(template, processName) }
    );
    this.ajv.addKeyword(
        closeName,
        { type: 'object', schema: false, validate: processWrapper(closeTemplate, closeName) }
    );
    this._registry.put(name, { template: template, closeTemplate: closeTemplate });
    this._isRegistryDirty = true;
}

function processWrapper(template, name) {
    return function _processWrapper(itemSchema, path, parentSchema, index) {
        this.html += typeof template == 'function' ? template(itemSchema) : template;
        return true;
    };
}

function compile() {
    this._buildFunc = this.ajv.compile(this.schema);
    this._isRegistryDirty = false;
    return this;
}

function build(formSchema) {
    var form = { html: '' };
    if (!this._buildFunc || this._isRegistryDirty) this.compile();
    form.isValidSchema = this._buildFunc.call(form, formSchema);
    return form;
}

function objWithType(type) {
    return {
        'type': 'object',
        'properties': {
            'type': {
                'enum': [ type ]
            }
        },
        'required': ['type']
    }
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
