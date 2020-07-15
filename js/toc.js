( function( $ ) {

    'use strict';

/**
 * toc.js Table Of Contents
 */
$.toc = function(title) {
    this.title = title || '';
};

/**
 * Generate a table of contents.
 * @htmlSrc  plain html text.
 * @return   html which contains table of contents.
 */
$.toc.prototype.generateToc = function(htmlSrc) {
    var $htmlObj = $(`<div>${htmlSrc}</div>`);

    function extract_head_recursive(parentObj, heads) {
        if(0 === heads.length) {
            return;
        }

        var $h = $(heads.pop()),
            tagName = $h.prop("tagName"),
            levelStr = /^[hH](\d)/.exec(tagName)[1],
            level = parseInt(levelStr),
            parentLevel = parseInt(parentObj.level),
            brotherObj,
            obj;

        if(level > parentLevel) {
            obj = {text:$h.text(), level:level, id:parentObj.id+'.'+levelStr, father: parentObj, children:[]};
            parentObj.children.push(obj);
            extract_head_recursive(obj, heads);
        } else if(level === parentLevel) {
            obj = {text:$h.text(), level:level, id:parentObj.father.id+'.'+levelStr, father: parentObj.father, children:[]};
            parentObj.father.children.push(obj);
            extract_head_recursive(obj, heads);
        } else if(level < parentLevel) {
            brotherObj = parentObj;
            while(brotherObj.level !== level) {
                brotherObj = brotherObj.father;
            }
            obj = {text:$h.text(), level:level, id:brotherObj.father.id+'.'+levelStr, father: brotherObj.father, children:[]};
            brotherObj.father.children.push(obj);
            extract_head_recursive(obj, heads);
        }
    }

    function list(items) {
        if(items.length === 0) {
            return '';
        }

        var itemsOut = '',
            out = '<ul>&items;</ul>',
            n = 0;

        for(var i of items) {
            n++;
            var tocend = n == (items.length) ? 'class="tocend"' : '',
                em = (i.children.length > 0) ? '<em></em>' : '';
            itemsOut += `<li ${tocend}>${em}<a href="javascript:void(0);">${$.trim(i.text)}</a>
                        ${list(i.children)}</li>`;
        }

        return out.replace('&items;', itemsOut);
    }

    var root = {text:'Table Of Contents', level: '0', id:'anchor', father:null, children:[]},
        $hes = $htmlObj.find(':header'),
        hes = $hes.toArray().reverse(),
        tableOfContents = '';

    extract_head_recursive(root, hes);
    tableOfContents = list(root.children);

    return `<aside id="toc"><p id="toctitle">${this.title}</p>${tableOfContents}</aside>`;
};

/**
 * Bind click event of toc.
 */
$.toc.prototype.bindClick = function() {

    // bind click event on em element of toc.
    $('#toc em').on( 'click', function() {
        $(this).toggleClass('unfold');
        $(this).parent().children('ul').each( function() {
            $(this).toggleClass('unfold');
        } );
    } );

    // bind click event on a element of toc.
    $('#toc a').on( 'click', function() {
        var targetText = $(this).text(),
            currentText = '';
        $(':header').each( function() {
            // don't use the text of any subnode
            currentText = $(this).clone().children().remove().end().text().trim();
            if(currentText === targetText) {
                this.scrollIntoView(true);
                return false; // jump out loop
            }
            return true;
        } );
    } );
};

$.toc.prototype.scrollToAnchor = function(anchorText) {
    if(anchorText.slice(0, 1) === '#') {
        anchorText = anchorText.substring(1, anchorText.length);
    }

    $(':header').each( function() {
        // don't use the text of any subnode
        var currentText = $(this).clone().children().remove().end().text().trim();
        if (currentText === anchorText) {
            this.scrollIntoView(true);
            doBreak = false;
        }
        return true;
    } );
};

} ( jQuery ) );
