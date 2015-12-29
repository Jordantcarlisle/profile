window.app = window.app || {};

(function(app, $, _, window, document) {

    'use strict';

    $.extend(app, {

        _location: '',
        _loaders: [],

        bootstrap: function(loc) {
            console.log('app.bootstrap()');

            app._location = loc;
            app.processLoaders();

            $(document)
                .trigger('app.ui.load_last')
                .trigger('app.ui.load_done');
        },

        processLoaders: function() {
            console.log('app.processLoaders()');

            for (var key in app._loaders) {
                if (app._loaders.hasOwnProperty(key)) {
                    app._loaders[key]();
                }
            }
        },

        getParameterByName: function(name) {

            name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");

            var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);

            return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
        }

    });

    app.ui = {

        setupStickyHeader: function() {
            console.log('app.ui.setupStickyHeader()');

            if ($(window).scrollTop() > 70) {
                $('body').addClass("sticky");
            } else {
                $('body').removeClass("sticky");
            }
        },

        setupTrackingClicks: function() {
            console.log('app.ui.setupTrackingClicks()');

            $('a[data-track="true"]').on('click', function() {

                var btn = $(this);

                ga('send', 'event', btn.attr('data-track-category'), 'click', btn.attr('data-track-label'), {
                    nonInteraction: true
                });
            });
        }

    };

    app._loaders.push(function() {
        console.log('app._loaders << app.ui');

        app.ui.setupStickyHeader();
        app.ui.setupTrackingClicks();

        $(window).resize(function() {
            // do stuff on resize
        }).resize();

        $(window).scroll(app.ui.setupStickyHeader);
    });


}(app, jQuery, _, window, document));