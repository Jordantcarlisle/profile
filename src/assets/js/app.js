$.extend(app, {

    _location: '',
    _loaders: [],

    bootstrap: function (loc) {
        console.log('app.bootstrap()');

        app._location = loc;
        app.processLoaders();

        $(document)
            .trigger('app.ui.load_last')
            .trigger('app.ui.load_done');
    },

    processLoaders: function () {
        console.log('app.processLoaders()');

        for (var key in app._loaders) {
            if (app._loaders.hasOwnProperty(key)) {
                app._loaders[key]();
            }
        }
    },

    getParameterByName: function (name) {

        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");

        var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
            results = regex.exec(location.search);

        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

});
