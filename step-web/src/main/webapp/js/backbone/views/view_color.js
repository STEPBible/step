var ColorView = Backbone.View.extend({
	colorTemplate:
        '<link href="css/color_code_grammar.<%= jsVersion %>css" rel="stylesheet"/>' +
        '<link rel="stylesheet" href="css/spectrum.css"/>' +
        '<script src="js/color_code_config.<%= jsVersion %>js"></script>' +
        '<script src="libs/spectrum.js"></script>' +

		'<div id="ColorCode" class="passageContainer examplesContainer">' +
			'<div id="sideBarVerbClrs"></div>' +
			'<div id="sideBarHVerbClrs"></div>' +
		'</div>' +
        '<script>' +
        '$( document ).ready(function() {' +
            'initializeClrCodeSidebar();' +
        '});' +
        '</script>',
    events: {
        'click .closeColumn': 'onClickClose'
    },
    initialize: function () {
        this.render();
    },
    render: function () {

        var jsVersion = ($.getUrlVars().indexOf("debug") > -1) ? "" : step.state.getCurrentVersion() + ".min.";

        var colorTab = $(_.template(this.colorTemplate)({ jsVersion: jsVersion }));

        this.$el.append(colorTab);
    //    initializeClrCodeHtmlModalPage("sidebar");
    },
    onClickClose: function () {
        step.util.showOrHideTutorial(true);
    }
});
