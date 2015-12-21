app.ui = {

    setupStickyHeader: function () {
        console.log('app.ui.setupStickyHeader()');

        if ($(window).scrollTop() > 70){
            $('body').addClass("sticky");
        }
        else{
            $('body').removeClass("sticky");
        }
    },

    setupTrackingClicks: function () {
        console.log('app.ui.setupTrackingClicks()');

        $('a[data-track="true"]').on('click', function () {

            var btn = $(this);

            ga('send', 'event', btn.attr('data-track-category'), 'click', btn.attr('data-track-label'), { nonInteraction: true });
        });
    }

};

app._loaders.push(function () {
    console.log('app._loaders << app.ui');

    app.ui.setupStickyHeader();
    app.ui.setupTrackingClicks();

    $(window).resize(function () {
        // do stuff on resize
    }).resize();

    $(window).scroll(app.ui.setupStickyHeader);
});
