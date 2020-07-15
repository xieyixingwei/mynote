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
    $.ajax( {
        url: $.md.mainPage,
        dataType: 'text'
    } ).done( function( data ) {
        $.md.mdText = data;
    } ).fail( function() {
        console.log('Could not get ' + $.md.mainPage);
    } ).always( function() {
        done();
    } );
} );

$.md.stages.stage('transform').subscribe( function( done ) {
    $.md.options = {
        baseUrl: $.md.baseUrl,
        basePath: $.md.basePath,
        currentPath: $.md.currentPath
    };

    $.md.htmlText = $.md.marked($.md.mdText, $.md.options);

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
    var toc = new $.toc($.md.title);
    $.md.tocHtml = toc.generateToc($.md.htmlText);
    console.timeEnd('toc time');
    $('#md-content').html($.md.tocHtml + $.md.htmlText);
    $('body').append(`<script type="text/javascript">${$.md.script}<\/script>`);
    $('style').append(`${$.md.style}`);
    $('html').removeClass('md-hidden-load');
    toc.bindClick();
    toc.scrollToAnchor($.md.inPageAnchor);
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

    var includeLinks = findExternalIncludes ($mdHtml),
        dfd = $.DeferredCount(includeLinks.length);

    includeLinks.each( function( i, e ) {
        var $el = $(e),
            href = $el.attr('href'),
            text = $el.toptext();
        $.ajax( {
            url: href,
            dataType: 'text'
        } ).done( function( data ) {
            var $html = $($.md.marked(data, $.md.options));
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
    var href = window.location.href,
        hash = window.location.hash,
        pos = -1;

    pos = href.indexOf('#!');
    $.md.baseUrl = href.substring(0, pos);

    pos = $.md.baseUrl.lastIndexOf('/');
    $.md.basePath = $.md.baseUrl.substring(0, pos + 1);

    // first char is the # or #!
    hash = hash.startsWith('#!') ? hash.substring(2) : hash.substring(1);
    hash = decodeURIComponent(hash);

    // extract possible in-page anchor
    pos = hash.indexOf('#');
    $.md.anchor = (pos !== -1) ? hash.substring(pos + 1) : '';
    $.md.mainPage = (pos !== -1) ? hash.substring(0, pos) : hash;

    pos = $.md.mainPage.lastIndexOf('/');
    $.md.currentPath = (pos !== -1) ? $.md.mainPage.substring(0, pos + 1) : '';

    console.log('window.location.href: ' + window.location.href);
    console.log('window.location.hash: ' + window.location.hash);
    console.log('baseUrl: ' + $.md.baseUrl);
    console.log('basePath: ' + $.md.basePath);
    console.log('currentPath: ' + $.md.currentPath);
    console.log('mainPage: ' + $.md.mainPage);
    console.log('anchor: ' + $.md.anchor);
}

function appendDefaultFilenameToHash() {
    var newHash = '',
        hash = window.location.hash || '';
    if(hash === '' || hash === '#' || hash === '#!') {
        newHash = '#!index.md';
    } else if(hash.startsWith ('#!') && hash.endsWith('/')) {
        newHash += 'index.md';
    }

    // redefine the default new hash
    if(newHash) {
        window.location.hash = newHash;
    }
}

$(document).ready( function () {
    console.time('all time');
    appendDefaultFilenameToHash();
    extractHashData();

    $(window).bind('hashchange', function() {
        window.location.reload(false);
    } );

    $.md.stages.run().done( function() {
        console.log('all done');
        console.timeEnd('all time');
    } );
} );

} ( jQuery ) );
