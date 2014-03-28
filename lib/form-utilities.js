// module dependencies
var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();

exports.stringifyObject = function(obj, rename) {
    var out = '';
    for (var index in rename) {
        if (obj[index] !== undefined) {
            out += '&' + rename[index] + '=' + encodeURIComponent(obj[index]);
        } else {
            out += '&' + rename[index] + '=';
        }
    }
    return out;
};

exports.stringifyObjectArray = function(obj, rename, max) {
    var out = '';
    for (var arrayIndex in obj) {
        for (var subindex in rename) {
            if (obj[arrayIndex][subindex] !== undefined) {
                out += '&' + rename[subindex];
                if (arrayIndex > 0) out += '_' + arrayIndex;
                out += '=' + encodeURIComponent(obj[arrayIndex][subindex]);
            }
            else {
                out += '&' + rename[subindex];
                if (arrayIndex > 0) out += '_' + arrayIndex;
                out += '=';
            }
        }
    }

    for(var i = obj.length; i < max; i++){
        for (var subindex2 in rename) {
            out += '&' + rename[subindex2];
            if (i > 0) out += '_' + i;
            out += '=';
        }
    }

    return out;
};

/**
 * Gets all input type fields from and html form and returns them in the obj parameter.
 * @param data - The cheerio data object to parse through.
 * @param obj - The data object to save the values to.
 */
exports.getInputs = function(data, obj) {
    if (data.$('select').length > 0) {
        var selects = data.$('select');
        for (var index = 0; index < selects.length; index++) {
            if (selects[index].children.length > 0) {
                for (var childrenIndex = 0; childrenIndex < selects[index].children.length; childrenIndex++) {
                    if (selects[index].children[childrenIndex].name == 'option') {
                        if (selects[index].children[childrenIndex].attribs.selected === '') {
                            obj[selects[index].attribs.name] = entities.decode(selects[index].children[childrenIndex].children[0].data.replace(/(\r\n|\n|\r)/gm, ''));
                        }
                    }
                }
            }
        }
    }

    //todo comment
    if (data.$('input').length > 0) {
        var inputs = data.$('input');

        for (var i = 0; i < inputs.length; i++) {

            if (inputs[i].attribs.type == 'radio') {

                if (inputs[i].attribs.checked === '') {
                    obj[inputs[i].attribs.name] = entities.decode(inputs[i].attribs.value);
                }
            }

            else if (inputs[i].attribs.type == 'checkbox') {

                if (obj[inputs[i].attribs.name]  && inputs[i].attribs.name.substring(0, 10) != 'Attachment') {
                    if(inputs[i].attribs.checked === ''){
                        obj[inputs[i].attribs.name] += ',';
                        obj[inputs[i].attribs.name] += entities.decode(inputs[i].attribs.value);
                    }
                } else {
                    if (inputs[i].attribs.checked === '') {
                        obj[inputs[i].attribs.name] = entities.decode(inputs[i].attribs.value);
                    }
                }

            } else {
                obj[inputs[i].attribs.name] = entities.decode(inputs[i].attribs.value);
            }
        }
    }
    if (data.$('textarea').length > 0) {
        var textareas = data.$('textarea');
        for (var j = 0; j < textareas.length; j++) {
            if (textareas[j].children.length > 0) {
                obj[textareas[j].attribs.name] = entities.decode(textareas[j].children[0].data);
            }
        }
    }
};


/**
 *
 */
exports.trimAndDecode = function(htmlText) {
    return entities.decode(htmlText.trim());
};