(function($) {
'use strict';

/**
 * toc.js Table Of Contents
 */

$.md.tableOfContents = function (htmlSrc) {
    let $htmlObj = $(`<div>${htmlSrc}</div>`);

    function catchup_head_recursive(parentObj, heads)
    {
        if(0 === heads.length)
        {
            return;
        }

        let $h = $(heads.pop());
        let tagName = $h.prop("tagName");
        let levelStr = /^[hH](\d)/.exec(tagName)[1];
        let level = parseInt(levelStr);
        let parentLevel = parseInt(parentObj.level);

        if(level > parentLevel)
        {
            let obj = {text:$h.text(), level:level, id:parentObj.id+'.'+levelStr, father: parentObj, children:[]};
            parentObj.children.push(obj);
            catchup_head_recursive(obj, heads);
            return;
        }

        if(level === parentLevel)
        {
            let obj = {text:$h.text(), level:level, id:parentObj.father.id+'.'+levelStr, father: parentObj.father, children:[]};
            parentObj.father.children.push(obj);
            catchup_head_recursive(obj, heads);
            return;
        }

        if(level < parentLevel)
        {
            let brotherObj = parentObj;
            while(brotherObj.level !== level)
            {
                brotherObj = brotherObj.father;
            }
            let obj = {text:$h.text(), level:level, id:brotherObj.father.id+'.'+levelStr, father: brotherObj.father, children:[]};
            brotherObj.father.children.push(obj);
            catchup_head_recursive(obj, heads);
            return;
        }
    }

    function list(items) {
        if(items.length === 0) {
            return '';
        }

        let itemsOut = '';
        let out = '<ul>items</ul>\n';

        for(let i of items) {
            itemsOut += `<li><a href="${ $.md.baseUrl}#!${ $.md.mainHref}#${i.text}">${i.text}</a>\n${list(i.children)}</li>\n`;        
        }

        return out.replace('items', itemsOut);
    }

    let root = {text:'Table Of Contents', level: '0', id:'anchor', father:null, children:[]};
    let $hes = $htmlObj.find('.title');
    let hes = $hes.toArray().reverse();
    catchup_head_recursive(root, hes);

    for(let h of $hes)
    {
        $(h).attr('id', $(h).text());
        $(h).addClass('anchor');
    }

    let tableOfContents = list(root.children);
    return `<aside class="toc">${tableOfContents}</aside>\n${$htmlObj.html()}`;
};

$.md.tableOfContents.scrollToInPageAnchor = function(anchorText) {
    if(!anchorText) return;
    if (anchorText.startsWith ('#'))
        anchorText = anchorText.substring (1, anchorText.length);
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

}(jQuery));
