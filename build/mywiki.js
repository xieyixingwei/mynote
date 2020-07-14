/* jshint esversion: 6 */
(function($) {
'use strict';

/**
 * init.js
 */

// hide the whole page so we dont see the DOM flickering
// will be shown upon page load complete or error
$('html').addClass('md-hidden-load');

// register our $.md object
$.md = function (method) {
    if($.md.publicMethods[method]) {
        return $.md.publicMethods[method].apply(this,
            Array.prototype.slice.call(arguments, 1)
        );
    } else {
        console.log('Method ' + method + ' does not exist on jquery.md');
    }
};

// default config
$.md.config = {
    title:  null,
    useSideMenu: true,
    lineBreaks: 'gfm',
    additionalFooterText: '',
    anchorCharacter: '&para;',
    tocAnchor: '[ &uarr; ]'
};


$.md.gimmicks = [];
$.md.stages = [];

// the location of the main markdown file we display
$.md.mainHref = '';

// the in-page anchor that is specified after the !
$.md.inPageAnchor = '';

}(jQuery));

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

( function( $ ) {

'use strict';

/**
 * Return a Deferred object which will be resolved after timeout ms.
 * @timeout the unit is ms.
 */
$.DeferredWait = function (timeout) {
    return $.Deferred( function( dfd ) {
        // wait for ms to call dfd.resolve()
        setTimeout( dfd.resolve, timeout );
    } );
};

/**
 * Return a countable Deferred object which will be resolved when the number of countDown() calls reaches count.
 * @count the number of countDown() calls.
 * @min the bottom value of count which default is 0.
 */
$.DeferredCount = function ( count, min ) {
    min = min || 0;
    var dfd = $.Deferred();
    dfd.count = count;

    if ( dfd.count <= min ) {
        dfd.resolve();
    }

    dfd.countDown = function () {
        dfd.count--;
        if ( dfd.count <= min ) {
            dfd.resolve();
        }
    };

    dfd.countUp = function () {
        dfd.count++;
    };
    return dfd;
};

//----------------------------------------------------------------------------------------------------------------------

/**
 * Define Stage object, it is a extend Defferred object.
 * 
 * @name <string> this stage's name.
 * @time <number> the unit is ms, specify this timeout of current stage.
 * 
 * Public fucntions:
 *     reset()
 *     subscribe(fn)
 *     unsubscribe(fn)
 *     run()
 * 
 * @fn is function which must invok the done() when it end. for example:
 *      function fn( done ) {
 *            $.ajax( {
 *               url: 'index.md',
 *               dataType: 'text'
 *           } ).done( function( data ) {
 *               done();
 *           } );
 *      }
 */
$.Stage = function( name, timeout) {

    // Define a defer object
    var self = $.extend($.Deferred(), {});

    self.done( function() {
        console.log('stage ' + self.name + ' completed successfully.');
    } );

    self.fail(function() {
        console.log('stage ' + self.name + ' completed with errors!');
    } );

    self.name = name;
    self.timeout = timeout || 3000;
    self.funcs = [];
    self.started = false;

    self.reset = function () {
        self.complete = $.Deferred();
        self.outstanding = [];
    };

    self.reset();

    // Register a function to the current stage.
    // @fn fn is function which must invok the done() when it end. for example
    self.subscribe = function ( fn ) {
        if (self.started) {
            console.log('Subscribing to stage which already started!');
            return;
        }
        self.funcs.push(fn);
        return this;
    };

    // Unregister a function from the current stage.
    self.unsubscribe = function ( fn ) {
        self.funcs.remove(fn);
        return this;
    };

    // Execute the fn
    self._executeFn = function ( fn ) {
        var d = $.Deferred();
        self.outstanding.push(d);

        // Display an error if our done() callback is not called
        $.DeferredWait(self.timeout).done( function() {
            if ( d.state() !== 'resolved' ) {
                console.log('Timeout reached for done callback in stage: ' + self.name +
                    '. Did you forget a done() call in a .subscribe() ?');
                console.log('stage ' + name + ' failed running subscribed function: ' + fn );
            }
            // d.resolve();
        } );

        var done = function done() {
            d.resolve();
        };

        fn( done );
    };

    // It will cyclically excute the functions subscribed in this stage.
    self.run = function() {
        self.started = true;

        $(self.funcs).each( function ( i, fn ) {
            self._executeFn(fn);
        } );

        // If no funcs are in our queue, we resolve immediately
        if (self.outstanding.length === 0) {
            self.resolve();
        }

        // We resolve when all our registered funcs have completed
        $.when.apply( $, self.outstanding
            ).done( function() {
            self.resolve();
        } ).fail(function() {
            self.resolve();
        } );
    };

    return self;
}; // $.Stage end

//----------------------------------------------------------------------------------------------------------------------

/**
 * Define a States object to manage muti stages.
 * Public functions:
 *     register(stageNameList)
 *     stage(stageName)
 *     reset()
 *     run()
 */
$.Stages = function( stageNameList ) {
    this.stages = [];
    this.register(stageNameList);
};

// Register a stage
// @stageNameList list<string> stage name
$.Stages.prototype.register = function( stageNameList ) {
    var self = this;
    $(stageNameList).each( function( i, e ) {
        var s = $.Stage(e);
        var end = self.stages.slice(-1);
        if(end.length > 0) {
            end[0].done( function() {
                s.run();
            } );
        }
        self.stages.push(s);
    } );
};

// return a stage by stageName
// @stageName <string>
$.Stages.prototype.stage = function( stageName ) {
    var stages = $.grep(this.stages, function( e, i ) {
        return e.name === stageName;
    } );

    if ( stages.length === 0 ) {
        console.log('A stage by name ' + stageName + '  does not exist');
        return undefined;
    } else if ( stages.length > 1 ) {
        console.log('There are muti same name ' + stageName + '  stages exist');
    }

    return stages[0];
};

// Reset current stages, this will clear the func of stage, but only keep the stage.
$.Stages.prototype.reset = function() {
    var self = this;
    var oldStages = self.stages;
    self.stages = [];
    $(oldStages).each( function( i, e ) {
        self.stages.push($.Stage(e.name));
    });
};

// Run stages registered and return a Differed object.
$.Stages.prototype.run = function() {
    var self = this;
    var dfd = $.Deferred();

    self.stages.slice(-1)[0].done( function() {
        dfd.resolve();
    } );

    // Run the first stage.
    self.stages[0].run();
    return dfd;
};
// $.Stages end

} ( jQuery ) );

(function($) {

'use strict';

/**
 * marked.js translate markdown to html
 */

// plain text
var inline_text = {
    rule: /^[\s\S]+?(?=([<!\[_*`]| {2,}\n|~~|$))/,
    handle: function (cap) {
        return cap[0];
    }
};

// line break  
var inline_br = {
    rule: /^ {2,}\n(?!\s*$)/,
    handle: function (cap) {
      return `<br/>`;
    }
};

// ~~strikethrough~~
var inline_del = {
    rule: /^~~([\s\S]*?)~~/,
    handle: function (cap) {
      return `<del class="md">${cap[1]}</del>`;
    }
};

// **emphasis**
var inline_strong = {
    rule: /^\*\*([\s\S]*?)\*\*/,
    handle: function (cap) {
        return `<span class="md strong">${cap[1]}</span>`;
    }
};

// *italic*
var inline_italic = {
    rule: /^\*([\s\S]*?)\*/,
    handle: function (cap) {
        return `<span class="md italic">${cap[1]}</span>`;
    }
};

// `code`
var inline_code = {
    rule: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
    handle: function (cap) {
        let text = cap[2];
        text = text.replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;');
        return `<code class="md">${text}</code>`;
    }
};

// [include](include.md)
// [...](link)
var inline_link = {
    rule: /^\[([^\n]*?)\]\(([^\n]*?)\)/,
    handle: function (cap) {
        var href = cap[2],
            text = cap[1];
        if(text.trim() === "include" && $.md.util.hasMarkdownFileExtension(href))
            return `<a class="md" href="${$.md.href + href}">${text}</a>`;
        else if($.md.util.hasMarkdownFileExtension(href))
            return `<a class="md" href="${$.md.baseUrl + '#!' + $.md.href + href}">${text}</a>`;
        else if(href.startsWith('www') || href.startsWith('http'))
            return `<a class="md" href="${href}">${text}</a>`;
        else if(href.startsWith('/'))
            return `<a class="md" href="${href}">${text}</a>`;
        else
            return `<a class="md" href="${$.md.basePath + $.md.href + href}">${text}</a>`;
    }
};

// Inline Lexer
$.md.InlineLexer = function() {
    this.tokenObjs = [];
    this.isInited = false;
    this.init();
};

// Register token object
// @tokenObj { rule: regular, hanle: func }
$.md.InlineLexer.prototype.register = function(tokenObj) {
    this.tokenObjs.push(tokenObj);
};

// InlineLexer init
$.md.InlineLexer.prototype.init = function() {
    if(this.isInited)
        return;
    this.register(inline_del);
    this.register(inline_strong);
    this.register(inline_italic);
    this.register(inline_code);
    this.register(inline_link);
    this.register(inline_br);
    this.register(inline_text);
    this.isInited = true;
};

// InlineLexer compile
// @src     markdown plain text
// @return  html text
$.md.InlineLexer.prototype.compile = function(src) {
    var cap,
        out = '',
        handle = function (i, tokenObj) {
            cap = tokenObj.rule.exec(src);
            if(cap) {
                src = src.substring(cap[0].length);
                out += tokenObj.handle(cap);
                return false; // jump out current each loop
            }
        };

    while(src) {
        $.each(this.tokenObjs, handle);
    }

    return out;
};

function replace(regex, opt) {
    regex = regex.source;
    opt = opt || '';
    return function self(name, val) {
        if(!name)
            return new RegExp(regex, opt);
        val = val.source || val;
        val = val.replace(/(^|[^\[])\^/g, '$1');
        regex = regex.replace(name, val);
        return self;
    };
}

// blank line
var block_space = {
    rule: /^\n+/,
    handle: function (self, cap) {
        if(cap[0].length > 0) {
            return '';
        }
    }
};

// # head level 1
// ...
// ###### head level 6
var block_heading = {
    rule: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
    handle: function (self, cap) {
        let level = cap[1].length,
            text = cap[2];
        return `<h${level} class="md title">${self.inlineLexer.compile(text)}</h${level}>\n`;
    }
};

// line head
// ===
var block_lheading = {
    rule: /^([^\n]+)\n *(=|-){3,} *(?:\n+|$)/,
    handle: function (self, cap) {
        let text = cap[1];  
        return `<p class="md lheading" >${self.inlineLexer.compile(text)}</p>\n`;
    }
};

// ---
// ***
// ___
var block_hr = {
    rule: /^ *[-*_]{3,} *(?:\n+|$)/,
    handle: function (self, cap) {
        return '<hr class="md" />\n';
    }
};

// > blockquote
var block_blockquote = {
    rule: /^( *>[^\n]+(\n[^\n]+)*\n)+(?:\n|$)/,
    handle: function (self, cap) {
        let text = cap[0].replace(/^ *> ?/gm, '');
        return `<blockquote class="md">${self.inlineLexer.compile(text)}</blockquote>\n`;
    }
};

// ![width:23px;height:25em;align:center](image)
var block_image = {
    rule: /^ *!\[([^\[\]]*)\]\(([^\n]*)\)/,
    handle: function (self, cap) {
        let src = cap[2],
            atl = cap[1],
            width = '',
            height = '',
            align = '';
        cap = /width:(\d+(px|em|(?=.*)))/.exec(atl);
        if(cap) {
            width = `width="${cap[1].trim()}"`;
        }

        cap = /height:(\d+(px|em|(?=.*)))/.exec(atl);
        if(cap) {
            height = `height="${cap[1].trim()}"`;
        }

        cap = /align:(center|left|right)/.exec(atl);
        if(cap) {
            align=`style="text-align:${cap[1]};"`;
        }
        else {
            align=`style="text-align:center;"`;
        }

        return `<p ${align} class="md"><img class="md" src="${$.md.href + src}" alt="${atl}" ${width} ${height}></p>\n`;
    }
};

// ``` type
// block_code
// ```
var block_code = {
    rule: /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n*|$)/,
    handle: function (self, cap) {
        let code = cap[3];
        code = code.replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;');
        return `<pre class="md">${code}</pre>\n`;
    }
};

// tabletitle | column name | column name
// :--        | :--:        | --:
// cell       | cell        | cell
var block_table = {
    rule: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
    handle: function (self, cap) {
        let header = cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
            align = cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
            rows = cap[3].replace(/\n$/, '').split('\n');

        function get_aligns(align) {
            let aligns = [];
            for(let a of align) {
                if(/^ *-+: *$/.test(a))
                    aligns.push('right');
                else if (/^ *:-+: *$/.test(a))
                    aligns.push('center');
                else if (/^ *:-+ *$/.test(a))
                    aligns.push('left');
                else
                    aligns.push('left'); // default align at left
            }
            return aligns;
        }

        let aligns = get_aligns(align);

        function assemble_thead(header, aligns) {
            let headHtml = '<thead><tr>';
            $(header).each(function (i, h){
                headHtml += `<th align="${aligns[i]}">${self.inlineLexer.compile(h)}</th>`;
            });
            headHtml += '</tr></thead>';
            return headHtml;
        }

        function assemble_tbody(rows, aligns) {
            let bodyHtml = '<tbody>';
            $(rows).each(function (i, row){
                bodyHtml += `<tr>`;
                let cells = row.split('|');
                $(cells).each(function (i, c){
                    bodyHtml += `<td align="${aligns[i]}">${self.inlineLexer.compile(c)}</td>`;
                });
                bodyHtml += '</tr>';
            });
            bodyHtml += '</tbody>';
            return bodyHtml;
        }
        return `<table class="md">${assemble_thead(header, aligns)}${assemble_tbody(rows, aligns)}</table>`;
    }
};

// - ul
//   1. ol
//   2. ol
// - ul
// - ul
var block_list = {
    rule: /^(?: *(?:\d+\.|[-+*]) +[^\n]+(?:\n[^\n]+)*?\n)+(?:\n|$)/,
    handle: function (self, cap) {
        function pickup_items(src) {
            let reg = /^( *)(\d+\.|[-+*]) +([\s\S]*?)\n(?= *(\d+\.|[-+*]) +|$)/,
                items = [],
                cap;
            while(src) {
                cap = reg.exec(src);
                if(cap) {
                    items.push({indent: cap[1].length,
                                prefix: cap[2],
                                text: cap[3].trim()});
                    src = src.substring(cap[0].length);
                }
            }

            items.reverse();

            function tree_items(items) {
                let tree = [];
                while(items.length) {
                    let i = items.pop();
                    let next = items[items.length - 1];
                    if(next && (i.indent == next.indent)) {
                        i.children = [];
                        tree.push(i);
                    }
                    else if(next && (i.indent < next.indent)) {
                        i.children = tree_items(items);
                        tree.push(i);
                    }
                    else if(next && (i.indent > next.indent)) {
                        i.children = [];
                        tree.push(i);
                        return tree;
                    }
                    else
                    {
                        i.children = [];
                        tree.push(i);
                    }
                }
                return tree;
            }

            return tree_items(items);
        }

        function list(items) {
            if(items.length === 0) {
                return '';
            }

            let itemsOut = '';
            let out = '';
            let isOl = false;

            if(/^\d+\./.exec(items[0].prefix)) {
                isOl = true;
                out = '<ul class="md ollist">&items;</ul>\n'; //'<ol class="md">&items;</ol>\n';
            }
            else if (/^[-+*]/.exec(items[0].prefix))
                out = '<ul class="md">&items;</ul>\n';

            for(let i of items) {
                var order = isOl ? `<span class="md olli">${i.prefix}</span>` :'';
                itemsOut += `<li>${order}${self.inlineLexer.compile(i.text)}\n${list(i.children)}</li>\n`;        
            }

            return out.replace('&items;', itemsOut);
        }

        let items = pickup_items(cap[0]);
        return list(items);
    }
};

// script
var block_script = {
    rule: /^ *<script.*>([\s\S]*?)<\/script>/,
    handle: function (self, cap) {
        self.script += cap[1];
        return '';
    }
};

// style css 
var block_style = {
    rule: /^ *<style.*>([\s\S]*?)<\/style>/,
    handle: function (self, cap) {
        self.style += cap[1];
        return '';
    }
};

// paragraph
var block_paragraph = {
    rule: /^((?:[^\n]+\n?(?!heading|lheading|hr|blockquote|image|code|script|style))+)(?:\n+|$)/,
    handle: function (self, cap) {
        let text = cap[0];
        return `<p class="md">${self.inlineLexer.compile(text)}</p>\n`;
    }
};

block_paragraph.rule = replace(block_paragraph.rule)
('heading', block_heading.rule)
('lheading', block_lheading.rule)
('hr', block_hr.rule)
('blockquote', block_blockquote.rule)
('image', block_image.rule)
('code', block_code.rule)
('script', block_script.rule)
('style', block_style.rule)
();

// Block Lexer
$.md.BlockLexer = function() {
    this.inlineLexer = new $.md.InlineLexer();
    this.tokenObjs = [];
    this.isInited = false;
    this.script = '';
    this.style = '';
    this.title = 'mywiki';
    this.init();
};

// Register token object
// @tokenObj { rule: regular, hanle: func(self, cap) }
$.md.BlockLexer.prototype.register = function(tokenObj) {
    this.tokenObjs.push(tokenObj);
};

// BlockLexer init
$.md.BlockLexer.prototype.init = function() {
    if(this.isInited)
        return;
    this.register(block_space);
    this.register(block_heading);
    this.register(block_lheading);
    this.register(block_hr);
    this.register(block_blockquote);
    this.register(block_image);
    this.register(block_table);
    this.register(block_list);
    this.register(block_code);
    this.register(block_script);
    this.register(block_style);
    this.register(block_paragraph);
    this.isInited = true;
};

// BlockLexer compile
// @src     markdown plain text
// @return  html text
$.md.BlockLexer.prototype.compile = function(src) {
    src = src.replace(/\r\n|\r/g, '\n')
             .replace(/\t/g, '    ')
             .replace(/\u00a0/g, ' ')  // unicode的不间断空格\u00A0,主要用在office中,让一个单词在结尾处不会换行显示,快捷键ctrl+shift+space
             .replace(/\u2424/g, '\n') // Javascript Escape
             .replace(/^ +$/gm, '');
    var cap,
        uglyHtml = '',
        self = this,
        handle = function (i, tokenObj) {
            cap = tokenObj.rule.exec(src);
            if(cap) {
                src = src.substring(cap[0].length);
                uglyHtml += tokenObj.handle(self, cap);
                return false; // jump out current each loop
        }
    };

    while(src) {
        $.each(self.tokenObjs, handle);
    }

    return uglyHtml;
};

function replace_char(src) {
    return src.replace(/\\\|/g, '&brvbar;')
              .replace(/\\`/g, '&fyh;')
              .replace(/\\</g, '&lt;')
              .replace(/\\>/g, '&gt;');
}

function recover_char(src) {
    return src.replace(/&brvbar;/g, '|')
              .replace(/&fyh;/g, '`');
}

$.md.marked = function(src) {
    var Lexer = new $.md.BlockLexer(),
        uglyHtml = '';
    try {
        src = replace_char(src);
        uglyHtml = Lexer.compile(src);
        $.md.script = $.md.script || '';
        $.md.style = $.md.style || '';
        $.md.script += Lexer.script;
        $.md.style += Lexer.style;
        return recover_char(uglyHtml);
    } catch (e) {
        return `<p>An error occured:</p><pre>${e.message}</pre>`;
    }
};

}(jQuery));

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

(function($) {

'use strict';

/**
 * main.js
 */

var publicMethods = {};
$.md.publicMethods = $.extend ({}, $.md.publicMethods, publicMethods);

$.md.stages = new $.Stages(['init', 'loadmarkdown', 'transform', 'show']);

$.md.stages.stage('init').subscribe( function( done ) {
    $('#md-all').empty();
    var skel = `<div id="md-body">
                    <div id="md-title"></div>
                    <div id="md-menu"></div>
                    <div id="md-content"></div>
                </div>`;
    $('#md-all').prepend($(skel));
    done();
} ).subscribe( function( done ) {
    $.ajax( {
        url: './config.json',
        dataType: 'text'
    } ).done( function( data ) {
        try {
            var data_json = JSON.parse(data);
            $.md.config = $.extend($.md.config, data_json);
            console.log('Found a valid config.json file, using configuration');
        } catch(err) {
            console.log('config.json was not JSON parsable: ' + err);
        }
    } ).fail( function( err, textStatus ) {
        console.log('unable to retrieve config.json: ' + textStatus);
    } ).always( function() {
        done();
    } );
} );

$.md.stages.stage('loadmarkdown').subscribe( function( done ) {
    console.time('load ' + $.md.mainHref);
    $.ajax( {
        url: $.md.mainHref,
        dataType: 'text'
    } ).done( function( data ) {
        console.timeEnd('load ' + $.md.mainHref);
        $.md.mdText = data;
        console.log('Get ' + $.md.mainHref);
    } ).fail( function() {
        console.log('Could not get ' + $.md.mainHref);
    } ).always( function() {
        done();
    } );
} );

$.md.stages.stage('transform').subscribe( function( done ) {

    console.time('mardked '+$.md.mainHref);
    $.md.htmlText = $.md.marked($.md.mdText);
    console.timeEnd('mardked '+$.md.mainHref);

    // Handle up to 3 nests
    loadExternalIncludes().always( function() {
        loadExternalIncludes().always( function() {
            loadExternalIncludes().always( function() {
                done();
            } );
        } );
    } );
} );

$.md.stages.stage('show').subscribe( function( done ) {
    console.time('toc time');
    var toc = new $.toc();
    $.md.htmlText = toc.generateToc($.md.htmlText);
    console.timeEnd('toc time');
    $('#md-content').html($.md.htmlText);
    $('body').append(`<script type="text/javascript">${$.md.script}<\/script>`);
    $('style').append(`${$.md.style}`);
    $('html').removeClass('md-hidden-load');
    toc.bindClick();
    toc.scrollToInPageAnchor($.md.inPageAnchor);
    done();
});

// load [include](/foo/bar.md) external links
function loadExternalIncludes() {
    var $mdHtml = $(`<div>${$.md.htmlText}</div>`);

    function findExternalIncludes ($html) {
        return $html.find('a').filter (function () {
            var href = $(this).attr('href');
            var text = $(this).toptext();
            var isMarkdown = $.md.util.hasMarkdownFileExtension(href);
            var isInclude = text === 'include';
            return isInclude && isMarkdown;
        });
    }

    var includeLinks = findExternalIncludes ($mdHtml);
    var dfd = $.DeferredCount(includeLinks.length);

    includeLinks.each( function( i, e ) {
        var $el = $(e);
        var href = $el.attr('href');
        var text = $el.toptext();
        console.time('load ' + href);
        $.ajax( {
            url: href,
            dataType: 'text'
        } ).done( function( data ) {
            console.timeEnd('load ' + href);
            console.time('marked ' + href);
            var $html = $($.md.marked(data));
            console.timeEnd('marked ' + href);
            $html.insertAfter($el);
            $el.remove();
            $.md.htmlText = $mdHtml.html();
        } ).always( function() {
            dfd.countDown();
        } );
    });

    return dfd;
}

function extractHashData() {
    // first char is the # or #!
    var href;
    if (window.location.hash.startsWith('#!')) {
        href = window.location.hash.substring(2);
    } else {
        href = window.location.hash.substring(1);
    }
    href = decodeURIComponent(href);
    // extract possible in-page anchor
    let ex_pos = href.indexOf('#');
    if (ex_pos !== -1) {
        $.md.inPageAnchor = href.substring(ex_pos + 1);
        $.md.mainHref = href.substring(0, ex_pos);
    } else {
        $.md.inPageAnchor = '';
        $.md.mainHref = href;
    }

    ex_pos = $.md.mainHref.lastIndexOf('/');
    if(ex_pos === -1)
        $.md.href = '';
    else
        $.md.href = $.md.mainHref.substring(0, ex_pos + 1);

    let len = window.location.href.indexOf('#!');
    $.md.baseUrl = window.location.href.substring(0, len);
    len = $.md.baseUrl.lastIndexOf('/');
    $.md.basePath = $.md.baseUrl.substring(0, len + 1);
    console.log('href: ' + $.md.href);
    console.log('base url: ' + $.md.baseUrl);
    console.log('main page: ' + $.md.mainHref);
}

function appendDefaultFilenameToHash () {
    var newHashString = '';
    var currentHashString = window.location.hash || '';
    if (currentHashString === '' ||
        currentHashString === '#'||
        currentHashString === '#!')
    {
        newHashString = '#!index.md';
    }
    else if (currentHashString.startsWith ('#!') &&
                currentHashString.endsWith('/')
            ) {
        newHashString = currentHashString + 'index.md';
    }
    if (newHashString)
        window.location.hash = newHashString;
}

$(document).ready(function () {
    console.time('all time');
    appendDefaultFilenameToHash();
    extractHashData();

    $(window).bind('hashchange', function () {
        window.location.reload(false);
    });

    $.md.stages.run().done( function() {
        console.log('all done');
        console.timeEnd('all time');
    } );
} );

} ( jQuery ) );
