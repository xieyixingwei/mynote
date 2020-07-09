(function($) {

'use strict';

/**
 * marked.js markdown translation 
 */

function escape(html, encode) {
    return html;
    /*
    return html.replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&#39;');
    */
}

var inline_text = {
    rule: /^[\s\S]+?(?=([<!\[_*`]| {2,}\n|~~|$))/,
    handle: function (cap) {
        return escape(cap[0]);
    }
};

var inline_br = {
    rule: /^ {2,}\n(?!\s*$)/,
    handle: function (cap) {
      return `<br/>`;
    }
};

var inline_del = {
    rule: /^~~([\s\S]*?)~~/,
    handle: function (cap) {
      return `<del class="md">${cap[1]}</del>`;
    }
};

var inline_strong = {
    rule: /^\*\*([\s\S]*?)\*\*/,
    handle: function (cap) {
        return `<span class="md strong">${cap[1]}</span>`;
    }
};

var inline_italic = {
    rule: /^\*([\s\S]*?)\*/,
    handle: function (cap) {
        return `<span class="md italic">${cap[1]}</span>`;
    }
};

var inline_code = {
    rule: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
    handle: function (cap) {
        let text = cap[2];
        text = text.replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;');
        return `<code class="md">${text}</code>`;
    }
};

var inline_link = {
    rule: /^\[([^\n]*?)\]\(([^\n]*?)\)/,
    handle: function (cap) {
        let href = cap[2],
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

/**
 * Inline Lexer & Compiler
 */
  
$.md.InlineLexer = function InlineLexer(options) {
    this.tokenObjs = [];
    this.is_inited = false;
    this.init();
};

/**
 * Register token object
 * tokenObj { rule: regular, hanle: func }
 */
$.md.InlineLexer.prototype.register = function(tokenObj) {
    this.tokenObjs.push(tokenObj);
};

/**
 * InlineLexer init
 */
$.md.InlineLexer.prototype.init = function() {
    if(this.is_inited)
        return;
    this.register(inline_del);
    this.register(inline_strong);
    this.register(inline_italic);
    this.register(inline_code);
    this.register(inline_link);
    this.register(inline_br);
    this.register(inline_text);
    this.is_inited = true;
};

/**
 * Lexing/Compiling
 */
$.md.InlineLexer.prototype.lex = function(src) {
    let cap,
        i = 0,
        out = '';

    let handle = function (i, tokenObj) {
        cap = tokenObj.rule.exec(src);
        if(cap) {
            src = src.substring(cap[0].length);
            out += tokenObj.handle(cap);
            return false; // jump out current each loop
        }
    };

    while(src) {
        $.each(this.tokenObjs, handle);
        if(i++ > 1000)
            return out;
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

var block_space = {
    rule: /^\n+/,
    handle: function (cap, inline) {
        if(cap[0].length > 0) {
            return '';
        }
    }
};

var block_heading = {
    rule: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
    handle: function (cap, inline) {
        let level = cap[1].length,
            text = cap[2];
        return `<h${level} class="md title">${inline.lex(text)}</h${level}>\n`;
    }
};

var block_lheading = {
    rule: /^([^\n]+)\n *(=|-){3,} *(?:\n+|$)/,
    handle: function (cap, inline) {
        let text = cap[1];  
        return `<p class="md lheading" >${inline.lex(text)}</p>\n`;
    }
};

var block_hr = {
    rule: /^ *[-*_]{3,} *(?:\n+|$)/,
    handle: function (cap, inline) {
        return '<hr class="md" />\n';
    }
};

var block_blockquote = {
    rule: /^( *>[^\n]+(\n[^\n]+)*\n)+(?:\n|$)/,
    handle: function (cap, inline) {
        let text = cap[0].replace(/^ *> ?/gm, '');
        return `<blockquote class="md">${inline.lex(text)}</blockquote>\n`;
    }
};

var block_image = {
    rule: /^ *!\[([^\[\]]*)\]\(([^\n]*)\)/,
    handle: function (cap, inline) {
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

var block_code = {
    rule: /^ *(`{3,}|~{3,}) *(\S+)? *\n([\s\S]+?)\s*\1 *(?:\n*|$)/,
    handle: function (cap, inline) {
        let code = cap[3];
        code = code.replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;');
        return `<pre class="md">${code}</pre>\n`;
    }
};

var block_paragraph = {
    rule: /^((?:[^\n]+\n?(?!heading|lheading|hr|blockquote|image|code))+)(?:\n+|$)/,
    handle: function (cap, inline) {
        let text = cap[0];
        return `<p class="md">${inline.lex(text)}</p>\n`;
    }
};

block_paragraph.rule = replace(block_paragraph.rule)
('heading', block_heading.rule)
('lheading', block_lheading.rule)
('hr', block_hr.rule)
('blockquote', block_blockquote.rule)
('image', block_image.rule)
('code', block_code.rule)
();

var block_table = {
    rule: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
    handle: function (cap, inline) {
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
                headHtml += `<th align="${aligns[i]}">${inline.lex(h)}</th>`;
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
                    bodyHtml += `<td align="${aligns[i]}">${inline.lex(c)}</td>`;
                });
                bodyHtml += '</tr>';
            });
            bodyHtml += '</tbody>';
            return bodyHtml;
        }
        return `<table class="md">${assemble_thead(header, aligns)}${assemble_tbody(rows, aligns)}</table>`;
    }
};

var block_list = {
    rule: /^(?: *(?:\d+\.|[-+*]) +[^\n]+(?:\n[^\n]+)*?\n)+(?:\n|$)/,
    handle: function (cap, inline) {
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
                itemsOut += `<li>${order}${inline.lex(i.text)}\n${list(i.children)}</li>\n`;        
            }

            return out.replace('&items;', itemsOut);
        }

        let items = pickup_items(cap[0]);
        return list(items);
    }
};

/**
 * Block Lexer
 */
$.md.BlockLexer = function (options) {
    this.inline = new $.md.InlineLexer(options);
    this.tokenObjs = [];
    this.is_inited = false;
    this.init();
};

/**
 * Register token object
 * tokenObj { rule: regular, hanle: func }
 */
$.md.BlockLexer.prototype.register = function(tokenObj) {
    this.tokenObjs.push(tokenObj);
};

/**
 * BlockLexer init
 */
$.md.BlockLexer.prototype.init = function() {
    if(this.is_inited)
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
    this.register(block_paragraph);
    this.is_inited = true;
};

/**
 * Static Lex Method
 */
$.md.BlockLexer.lex = function(src, options) {
  var lexer = new $.md.BlockLexer(options);
  return lexer.lex(src);
};

/**
 * Preprocessing
 */
$.md.BlockLexer.prototype.lex = function(src) {
    src = src.replace(/\r\n|\r/g, '\n')
             .replace(/\t/g, '    ')
             .replace(/\u00a0/g, ' ')  /* unicode的不间断空格\u00A0,主要用在office中,让一个单词在结尾处不会换行显示,快捷键ctrl+shift+space */
             .replace(/\u2424/g, '\n') /* Javascript Escape */
             .replace(/^ +$/gm, '');
    var cap,
        i = 0,
        uglyHtml = '',
        inline = this.inline;

    let handle = function (i, tokenObj) {
        cap = tokenObj.rule.exec(src);
        if(cap) {
            src = src.substring(cap[0].length);
            uglyHtml += tokenObj.handle(cap, inline);
            return false; // jump out current each loop
        }
    };

    while(src) {
        $.each(this.tokenObjs, handle);

        if(i++ > 1000)
            return uglyHtml;
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

$.md.marked = function (src, opt) {
    try {
        src = replace_char(src);
        let html = $.md.BlockLexer.lex(src, opt);
        return recover_char(html);
    } catch (e) {
        e.message += '\nPlease report this to https://github.com/chjj/marked.';
        return '<p>An error occured:</p><pre>' + escape(e.message + '', true) + '</pre>';
    }
};

}(jQuery));
