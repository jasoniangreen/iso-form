'use strict';

module.exports = { init: init };

function init(isoForm) {
    isoForm.addItemType('group', function (opts) {
        var newEl = document.createElement('div');
        this.current && this.current.appendChild(newEl);
        this.current = newEl;
        var classList = newEl.classList;
        if (opts.css) classList.add.apply(classList, opts.css.split(' '));
    }, function (opts) {
        this.current = this.current.parentNode;
    });

    isoForm.addItemType('text', processItem('p'));
    isoForm.addItemType('input', processItem('input', 'text'));
    isoForm.addItemType('checkbox', processItem('input', 'checkbox'));
}

function processItem(tag, type) {
    return function (data) {
        var newEl = document.createElement(tag);
        if (type) newEl.setAttribute('type', type);
        if (data.name) newEl.setAttribute('name', data.name);
        if (data.label) newEl.innerHTML = data.label;
        var classList = newEl.classList;
        if (data.css) classList.add.apply(classList, data.css.split(' '));
        if (data.listeners) 
            data.listeners.forEach(function (l) {
                newEl.addEventListener(l.event, l.subscriber);
            });
        this.current.appendChild(newEl);
        return true;
    }
}
