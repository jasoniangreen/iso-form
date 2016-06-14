# iso-form
An isometric, schema based form generator that can be used in the client, on the server, or even to pre-compile forms in the build phase. This is the core library that is used to register form types. Support will soon be added for pluggable "processors" that can be loaded to create types for different use cases and different frameworks.

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
