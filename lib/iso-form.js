'use strict';

var Ajv = require('ajv'),
    Cache = require('./cache');

/**
 * IsoForm class
 * @param {Object}   An object with 
 *                   .init - a function called initially with the IsoForm instance passed to it.
 *                   .options? - not sure
 * @return {IsoForm} Returns an instance of IsoForm
 */
var IsoForm = module.exports = IsoForm;

function IsoForm(processor) {
    this.ajv = new Ajv({ passContext: true });
    this._registry = new Cache();
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

    if (processor)
        processor.init(this);
}


IsoForm.prototype.addItemType = addItemType;
IsoForm.prototype.addGroupType = addGroupType;
IsoForm.prototype.build = build;
IsoForm.prototype.compile = compile;


/**
 * Add a new item type. Type will be invoked when build function encounters and object with {type: name}. All other options will be passed to the execution function.
 * @param {String}          name     The name of the type.
 * @param {Function|String} template can be a string, a template function that returns a string, or any function (usually one that manipulates context to build up a structure, such as the Dom).
 */
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
        { type: 'object', schema: false, validate: processWrapper(template) }
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
        { type: 'object', schema: false, validate: processWrapper(template) }
    );
    this.ajv.addKeyword(
        closeName,
        { type: 'object', schema: false, validate: processWrapper(closeTemplate) }
    );
    this._registry.put(name, { template: template, closeTemplate: closeTemplate });
    this._isRegistryDirty = true;
}

function processWrapper(template) {
    return function _processWrapper(itemSchema, path, parentSchema, index) {
        var result = typeof template == 'function' 
                        ? template.call(this, itemSchema, path, parentSchema, index) 
                        : template;
        if (typeof result == 'string' && typeof this.html == 'string')
            this.html += result;
        return true;
    };
}

function compile() {
    this._buildFunc = this.ajv.compile(this.schema);
    this._isRegistryDirty = false;
    return this;
}

function build(formSchema, context) {
    context = context || { html: '' };
    if (!this._buildFunc || this._isRegistryDirty) this.compile();
    context.isValidSchema = this._buildFunc.call(context, formSchema);
    return context;
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
    };
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
