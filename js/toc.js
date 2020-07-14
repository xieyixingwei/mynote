( function( $ ) {
'use strict';

/**
 * toc.js Table Of Contents
 */

$.toc = function() {

};

// Generate a table of contents
// @htmlSrc  plain html text
// @return   html which contains table of contents
$.toc.prototype.generateToc = function (htmlSrc) {
    var $htmlObj = $(`<div>${htmlSrc}</div>`);

    function catchup_head_recursive(parentObj, heads)
    {
        if(0 === heads.length)
        {
            return;
        }

        var $h = $(heads.pop()),
            tagName = $h.prop("tagName"),
            levelStr = /^[hH](\d)/.exec(tagName)[1],
            level = parseInt(levelStr),
            parentLevel = parseInt(parentObj.level),
            obj;

        if(level > parentLevel) {
            obj = {text:$h.text(), level:level, id:parentObj.id+'.'+levelStr, father: parentObj, children:[]};
            parentObj.children.push(obj);
            catchup_head_recursive(obj, heads);
            return;
        } else if(level === parentLevel) {
            obj = {text:$h.text(), level:level, id:parentObj.father.id+'.'+levelStr, father: parentObj.father, children:[]};
            parentObj.father.children.push(obj);
            catchup_head_recursive(obj, heads);
            return;
        } else if(level < parentLevel) {
            var brotherObj = parentObj;
            while(brotherObj.level !== level)
            {
                brotherObj = brotherObj.father;
            }
            obj = {text:$h.text(), level:level, id:brotherObj.father.id+'.'+levelStr, father: brotherObj.father, children:[]};
            brotherObj.father.children.push(obj);
            catchup_head_recursive(obj, heads);
            return;
        }
    }

    function list(items) {
        if(items.length === 0) {
            return '';
        }

        var itemsOut = '';
        var out = '<ul>items</ul>\n';
        var n = 0;

        for(var i of items) {
            n++;
            var tocend = n == (items.length) ? 'class="tocend"' : '';
            var em = (i.children.length > 0) ? '<em></em>' : '';
            itemsOut += `<li ${tocend}>${em}<a href="${ $.md.baseUrl}#!${ $.md.mainHref}#${i.text}">${i.text}</a>\n
                        ${list(i.children)}</li>\n`;
            
        }

        return out.replace('items', itemsOut);
    }

    var root = {text:'Table Of Contents', level: '0', id:'anchor', father:null, children:[]};
    var $hes = $htmlObj.find('.title');
    var hes = $hes.toArray().reverse();
    catchup_head_recursive(root, hes);

    for(var h of $hes)
    {
        $(h).attr('id', $(h).text());
        $(h).addClass('anchor');
    }

    var tableOfContents = list(root.children);
    return `<aside id="toc">${tableOfContents}</aside>\n${$htmlObj.html()}`;
};

// @anchorText  anchor in page
$.toc.prototype.scrollToInPageAnchor = function(anchorText) {
    if(!anchorText) return;
    if (anchorText.startsWith ('#'))
        anchorText = anchorText.substring(1, anchorText.length);
    // we match case insensitive
    var doBreak = false;
    $('.anchor').each (function () {
        if (doBreak) { return; }
        var $this = $(this);
        // don't use the text of any subnode
        var text = $this.toptext();
        //var match = $.md.util.getInpageAnchorText(text);
        if (anchorText === text) {
            this.scrollIntoView(true);
            doBreak = true;
        }
    });
};

// bind click event on em of toc
$.toc.prototype.bindClick = function() {
    $('#toc em').on( 'click', function() {
        $(this).toggleClass('unfold');
        $(this).parent().children('ul').each( function() {
            $(this).toggleClass('unfold');
        } );
    } );
};

} ( jQuery ) );
