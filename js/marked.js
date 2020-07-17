(function($) {

'use strict';

/**
 * marked.js translate markdown to html
 */

// plain text
var inline_text = {
    rule: /^[\s\S]+?(?=([<!\[_*`]| {2,}\n|~~|$))/,
    handle: function(self, cap) {
        return cap[0];
    }
};

// line break  
var inline_br = {
    rule: /^ {2,}\n(?!\s*$)/,
    handle: function(self, cap) {
      return `<br/>`;
    }
};

// ~~strikethrough~~
var inline_del = {
    rule: /^~~([\s\S]*?)~~/,
    handle: function(self, cap) {
      return `<del class="md">${cap[1]}</del>`;
    }
};

// **emphasis**
var inline_strong = {
    rule: /^\*\*([\s\S]*?)\*\*/,
    handle: function(self, cap) {
        return `<span class="md strong">${cap[1]}</span>`;
    }
};

// *italic*
var inline_italic = {
    rule: /^\*([\s\S]*?)\*/,
    handle: function(self, cap) {
        return `<span class="md italic">${cap[1]}</span>`;
    }
};

// `code`
var inline_code = {
    rule: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
    handle: function(self, cap) {
        var text = cap[2];
        text = text.replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;');
        return `<code class="md">${text}</code>`;
    }
};

// [include](include.md)
// [...](link)
var inline_link = {
    rule: /^\[([^\n]*?)\]\(([^\n]*?)\)/,
    handle: function(self, cap) {
        var href = cap[2],
            text = cap[1];
        if(text.trim() === "include" && $.md.util.hasMarkdownFileExtension(href))
            return `<a class="md" href="${self.currentPath + href}">${text}</a>`;
        else if(href.startsWith('www') || href.startsWith('http') || href.startsWith('/'))
            return `<a class="md" href="${href}">${text}</a>`;
        else if($.md.util.hasMarkdownFileExtension(href))
            return `<a class="md" href="${self.baseUrl + '#!' + self.currentPath + href}">${text}</a>`;
    }
};

/**
 * Inline Lexer
 * for example, the url is 'file:///home/gn/Workspace/Study/mywiki.html#!1-Development-Aux/Markdown/markdown.md'
 * @options.baseUrl      like 'file:///home/gn/Workspace/Study/mywiki.html'
 * @options.basePath     like 'file:///home/gn/Workspace/Study/'
 * @options.currentPath  like '1-Development-Aux/Markdown/'
 * @options.fileName     like 'markdown.md'
 */
$.md.InlineLexer = function(options) {
    this.tokenObjs = [];
    this.isInited = false;
    this.baseUrl = options.baseUrl && options.baseUrl || '';
    this.basePath = options.basePath && options.basePath || '';
    this.currentPath = options.currentPath && options.currentPath || '';
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
        self = this,
        handle = function (i, tokenObj) {
            cap = tokenObj.rule.exec(src);
            if(cap) {
                src = src.substring(cap[0].length);
                out += tokenObj.handle(self, cap);
                return false; // jump out current each loop
            }
        };

    while(src) {
        $.each(this.tokenObjs, handle);
    }

    return out;
};

//----------------------------------------------------------------------------------------------------------------------

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
    rule: /^ *(#{1,6}) *([^\n]+?) *(?:\n+|$)/,
    handle: function (self, cap) {
        var level = cap[1].length,
            text = cap[2];
        if($.trim(text).slice(-1) === '#' && !self.title) {
            self.title = $.trim(text.slice(0, -1));
            return '';
        }

        return `<h${level} class="md">${self.inlineLexer.compile(text)}</h${level}>\n`;
    }
};

// ``` type
// block_code
// ```
var block_code = {
    rule: /^ *(`{3,}|~{3,}) *(\S*?) *\n([\s\S]+?)\1 *(?:\n*|$)/,
    handle: function (self, cap) {
        var code = cap[3],
            language = cap[2];
        if(language) {
            language = 'language-' + language.trim().toLowerCase();
        } else {
            language = 'md-out';
        }
        
        code = code.replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;');
        return `<pre class="${language}"><code>${code}</code></pre>\n`;
    }
};

// line head
// ===
// ---
var block_lheading = {
    rule: /^([^\n]+)\n *(=|-){3,} *(?:\n+|$)/,
    handle: function (self, cap) {
        var text = cap[1];  
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
        var text = cap[0].replace(/^ *> ?/gm, '');
        return `<blockquote class="md">${self.inlineLexer.compile(text)}</blockquote>\n`;
    }
};

// ![width:23px;height:25em;align:center](image)
var block_image = {
    rule: /^ *!\[([^\[\]]*)\]\(([^\n]*)\)/,
    handle: function (self, cap) {
        var src = cap[2],
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
        
        if(src.startsWith('www') || src.startsWith('http') || src.startsWith('/')) {
            src = src;
        } else {
            src = self.basePath + self.currentPath + src;
        }
        return `<p ${align} class="md"><img class="md" src="${src}" alt="${atl}" ${width} ${height}></p>\n`;
    }
};

// tabletitle | column name | column name
// :--        | :--:        | --:
// cell       | cell        | cell
var block_table = {
    rule: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
    handle: function (self, cap) {
        var header = cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
            align = cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
            rows = cap[3].replace(/\n$/, '').split('\n');

        function get_aligns(align) {
            var aligns = [];
            for(var a of align) {
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

        var aligns = get_aligns(align);

        function assemble_thead(header, aligns) {
            var headHtml = '<thead><tr>';
            $(header).each(function (i, h){
                headHtml += `<th align="${aligns[i]}">${self.inlineLexer.compile(h)}</th>`;
            });
            headHtml += '</tr></thead>';
            return headHtml;
        }

        function assemble_tbody(rows, aligns) {
            var bodyHtml = '<tbody>';
            $(rows).each(function (i, row){
                bodyHtml += `<tr>`;
                var cells = row.split('|');
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
            var reg = /^( *)(\d+\.|[-+*]) +([\s\S]*?)\n(?= *(\d+\.|[-+*]) +|$)/,
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
                var tree = [];
                while(items.length) {
                    var i = items.pop();
                    var next = items[items.length - 1];
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

            var itemsOut = '';
            var out = '';
            var isOl = false;

            if(/^\d+\./.exec(items[0].prefix)) {
                isOl = true;
                out = '<ul class="md ollist">&items;</ul>\n'; //'<ol class="md">&items;</ol>\n';
            }
            else if (/^[-+*]/.exec(items[0].prefix))
                out = '<ul class="md">&items;</ul>\n';

            for(var i of items) {
                var order = isOl ? `<span class="md olli">${i.prefix}</span>` :'';
                itemsOut += `<li>${order}${self.inlineLexer.compile(i.text)}\n${list(i.children)}</li>\n`;        
            }

            return out.replace('&items;', itemsOut);
        }

        var items = pickup_items(cap[0]);
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
        var text = cap[0];
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

/**
 * Block Lexer
 * for example, the url is 'file:///home/gn/Workspace/Study/mywiki.html#!1-Development-Aux/Markdown/markdown.md'
 * @options.baseUrl      like file:///home/gn/Workspace/Study/mywiki.html
 * @options.basePath     like file:///home/gn/Workspace/Study/
 * @options.currentPath  like 1-Development-Aux/Markdown/
 * @options.fileName     like markdown.md
 */
$.md.BlockLexer = function(options) {
    this.inlineLexer = new $.md.InlineLexer(options);
    this.tokenObjs = [];
    this.isInited = false;
    this.script = '';
    this.style = '';
    this.title = '';
    this.baseUrl = options.baseUrl && options.baseUrl || '';
    this.basePath = options.basePath && options.basePath || '';
    this.currentPath = options.currentPath && options.currentPath || '';
    this.init();
};

/**
 * Register token object
 * @tokenObj { rule: regular, hanle: func(self, cap) }
 */ 
$.md.BlockLexer.prototype.register = function(tokenObj) {
    this.tokenObjs.push(tokenObj);
};

// BlockLexer init
$.md.BlockLexer.prototype.init = function() {
    if(this.isInited)
        return;
    this.register(block_space);
    this.register(block_heading);
    this.register(block_code);
    this.register(block_lheading);
    this.register(block_hr);
    this.register(block_blockquote);
    this.register(block_image);
    this.register(block_table);
    this.register(block_list);
    this.register(block_script);
    this.register(block_style);
    this.register(block_paragraph);
    this.isInited = true;
};

/**
 * BlockLexer compile
 * @src     markdown plain text
 * @return  html text
 */
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

//----------------------------------------------------------------------------------------------------------------------

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

$.md.marked = function(src, options) {
    var Lexer = new $.md.BlockLexer(options),
        uglyHtml = '';
    try {
        src = replace_char(src);
        uglyHtml = Lexer.compile(src);
        $.md.script = $.md.script || '';
        $.md.style = $.md.style || '';
        $.md.script += Lexer.script;
        $.md.style += Lexer.style;
        $.md.title = $.md.title || Lexer.title;
        return recover_char(uglyHtml);
    } catch (e) {
        return `<p>An error occured:</p><pre>${e.message}</pre>`;
    }
};

}(jQuery));
