(function($) {

'use strict';

/**
 * main.js
 */

function initStages() {
    $.md.stages = [
        $.Stage('init'),

        // loads config, initial markdown and navigation
        $.Stage('load'),

        // will transform the markdown to html
        $.Stage('transform'),
    ];

    $.md.stage = function(name) {
        var m = $.grep($.md.stages, function(e, i) {
            return e.name === name;
        });
        if(m.length === 0) {
            console.log('A stage by name ' + name + '  does not exist');
        }else {
            return m[0];
        }
    };
}

initStages();

function resetStages() {
    var old_stages = $.md.stages;
    $.md.stages = [];
    $(old_stages).each(function(i, e) {
        $.md.stages.push($.Stage(e.name));
    });
}

var publicMethods = {};
$.md.publicMethods = $.extend ({}, $.md.publicMethods, publicMethods);

function transformMarkdown (markdown) {
    // get sample markdown
    var uglyHtml = $.md.marked(markdown);
    uglyHtml = $.md.tableOfContents(uglyHtml);
    return uglyHtml;
}

function registerFetchConfig() {
    $.md.stage('init').subscribe(function(done) {
        $.ajax({url: './config.json', dataType: 'text'}).done(function(data) {
            try {
                var data_json = JSON.parse(data);
                $.md.config = $.extend($.md.config, data_json);
                console.log('Found a valid config.json file, using configuration');
            } catch(err) {
                console.log('config.json was not JSON parsable: ' + err);
            }
            done();
        }).fail(function(err, textStatus) {
            console.log('unable to retrieve config.json: ' + textStatus);
            done();
        });
    });
}

function registerFetchMarkdown() {
    var md = '';
    $.md.stage('init').subscribe(function(done) {
        $.ajax({
            url: $.md.mainHref,
            dataType: 'text'
        }).done(function(data) {
            md = data;
            console.log('Get ' + $.md.mainHref);
            done();
        }).fail(function() {
            console.log('Could not get ' + $.md.mainHref);
            done();
        });
    });

    $.md.stage('transform').subscribe(function(done) {
        var uglyHtml = transformMarkdown(md);
        $('#md-content').html(uglyHtml);
        $('html').removeClass('md-hidden-load');
        $.md.tableOfContents.scrollToInPageAnchor($.md.inPageAnchor);
        //md = '';
        //var dfd = $.Deferred();
        //loadExternalIncludes(dfd);
        //dfd.always(function () {
        done();
        //});
    });
}

function registerClearContent() {
    $.md.stage('init').subscribe(function(done) {
        $('#md-all').empty();
        var skel = `<div id="md-body">
                        <div id="md-title"></div>
                        <div id="md-menu"></div>
                        <div id="md-content"></div>
                    </div>`;
        $('#md-all').prepend($(skel));
        done();
    });
}

function loadContent(href) {
    registerFetchMarkdown();
    registerClearContent();

    runStages();
}

function runStages() {
    // wire the stages up
    $.md.stage('init').done(function() {
        $.md.stage('load').run();
    });

    $.md.stage('load').done(function() {
        $.md.stage('transform').run();
    });

    // trigger the whole process by runing the init stage
    $.md.stage('init').run();
    return;
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
    registerFetchConfig();
    appendDefaultFilenameToHash();
    extractHashData();

    $(window).bind('hashchange', function () {
        window.location.reload(false);
    });

    loadContent($.md.mainHref);
});

}(jQuery));
