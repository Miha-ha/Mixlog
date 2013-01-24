var fs = require('fs'),
    yml = require('js-yaml');
exports.getConfig = function (source){
    var result = {};

    function helper(str, cfg){
        result.config = cfg;
        return '';
    }

    result.source = source.replace(/^---\n([\s\S]*)\n---$/gm, helper);

    return result;
};