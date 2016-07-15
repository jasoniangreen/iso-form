# iso-form

[![Build Status](https://travis-ci.org/jasoniangreen/iso-form.svg?branch=master)](https://travis-ci.org/jasoniangreen/iso-form)
[![npm version](https://badge.fury.io/js/iso-form.svg)](https://badge.fury.io/js/iso-form)
[![Code Climate](https://codeclimate.com/github/jasoniangreen/iso-form/badges/gpa.svg)](https://codeclimate.com/github/jasoniangreen/iso-form)
[![Test Coverage](https://codeclimate.com/github/jasoniangreen/iso-form/badges/coverage.svg)](https://codeclimate.com/github/jasoniangreen/iso-form/coverage)

An isomorphic, schema based form generator that can be used in the client, on the server, or even to pre-compile forms in the build phase. This is the core library that is used to register form types. Support will soon be added for pluggable "processors" that can be loaded to create types for different use cases and different frameworks.

###Example
```
var isoForm = new IsoForm();

// To use, register a type with a name and a template function
isoForm.addItemType('input', function (itemData) {
    return '<input id="'+itemData.id+'">';
});

// Or types can be registered with strings instead
isoForm.addGroupType('group', '<div>', '</div>');

var form = isoForm.build({
    type:'group',
    items: [
        { type: 'input', id: 'test' }
    ]
});

// form.isValidSchema == true;
// form.html == '<div><input id="test"></div>';

```

Warning: This is still very much a work in progress.
