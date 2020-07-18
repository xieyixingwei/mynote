(function( $ ) {
    'use strict';

/**
 * Return a deffered, which will check the status of condition() on ms interval
 * @condition  if condition() return true, this deffered will resolve and the loop will be stopped.
 * @ms         the unit is ms.
 */
$.DeferredInterval = $.DeferredInterval || function(condition, ms) {
    return $.Deferred( function( dfd ) {
        var inter = setInterval( function() {
            if(condition()) {
                clearInterval(inter);
                dfd.resolve();
            }
        }, ms );
    } );
};

$.IncludeFile = function() {
    this.count = 0;
    this.src = '';
};

$.IncludeFile.prototype.isdone = function() {
    if(this.count === 0) {
        // recover $ in src.
        this.src = this.src.replace(/&dollar;/g, '$');
        return true;
    }
    return false;
};

/**
 * load external file
 * @path current path
 * @src  plan text of current file
 */
$.IncludeFile.prototype.process = function(path, src) {
    var self = this;

    function loadIncludeFile(isInclude, path, src) {
        var rule = /\[([^\n]*?)\]\(([^\n]*?)\)/g,
            cap;

        if(path.trim() === './') {
            path = '';
        }

        // string.replace() regards $ as a special character.
        src = src.replace(/\$/g, '&dollar;');

        function loadFile(path, includeStr, file) {
            var pos = file.lastIndexOf('/'),
                currentPath = pos !== -1 ? file.slice(0, pos + 1) : '';

            if(currentPath.trim() === './') {
                currentPath = '';
            }

            self.count++;

            $.ajax( {
                url: path + file,
                dataType: 'text'
            } ).done( function( data ) {
                var externalSrc = rule.exec(data) ? loadIncludeFile(true, path + currentPath, data) : data;
                // string.replace() regards $ as a special character.
                externalSrc = externalSrc.replace(/\$/g, '&dollar;');
                self.src = self.src.replace(includeStr, externalSrc);
            } ).fail( function() {
                console.log('Could not Load ' + file);
            } ).always( function() {
                self.count--;
            } );
        }

        while(true) {
            cap = rule.exec(src);
            if(cap === null) {
                break;
            }

            if(cap[1].trim() === 'include') {
                loadFile(path, cap[0], cap[2]);
            }
            else if(isInclude && (!cap[2].startsWith('www')) && (!cap[2].startsWith('http')) && (!cap[2].startsWith('/'))) {
                var pos = cap[2].lastIndexOf('/'),
                    currentPath = pos !== -1 ? cap[2].slice(0, pos + 1).trim() : '',
                    file = pos !== -1 ? cap[2].slice(pos + 1).trim() : '';
                if(currentPath === './') {
                    currentPath = '';
                }
                src = src.replace(cap[0], `[${cap[1]}](${path}${currentPath}${file})`);
            }
        }
        return src;
    }

    self.src = loadIncludeFile(false, path, src);
};

} ( jQuery ) );
