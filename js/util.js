(function($) {

'use strict';

/**
 * util.js
 */

var publicMethods = {
    isAbsoluteUrl: function(url) {
        if(url === undefined)
            return false;
        return  (url.indexOf('://') === -1) ? false : true;
    },

    isAbsolutePath: function(path) {
        if(path === undefined)
            return false;
        return path.startsWith('/') ? true : false;
    },

    hasMarkdownFileExtension: function (str) {
        var markdownExtensions = [ '.md', '.markdown', '.mdown' ];
        var result = false;
        var value = str.toLowerCase().split('#')[0];
        $(markdownExtensions).each(function (i, ext) {
            if(value.toLowerCase().endsWith(ext)) {
                result = true;
            }
        });
        return result;
    },
};

$.md.util = $.extend ({}, $.md.util, publicMethods);

if(typeof String.prototype.startsWith !== 'function') {
    String.prototype.startsWith = function(str) {
        return this.slice(0, str.length) === str;
    };
}

if(typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(str) {
        return this.slice(this.length - str.length, this.length) === str;
    };
}

$.fn.extend ({
    toptext: function () {
        return this.clone().children().remove().end().text();
    }
});

$.md.util.getInpageAnchorText = function (text) {
    var subhash = text.replace(/ /g, '_');
    // TODO remove more unwanted characters like ?/,- etc.
    return subhash;

};

}(jQuery));
