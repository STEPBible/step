var ExamplesView = Backbone.View.extend({
    events: {
        'click .closeColumn': 'onClickClose',
        'click .accordion-heading': 'onClickHeading'
    },
    initialize: function () {
        this.render();
    },
    render: function () {
        this.$el.load("jsps/examples.jsp", null, _.bind(this.initAccordions, this));
    },
    initAccordions: function () {
        var count = this.$el.find(".accordion-row").length;
        var i;
        var hasStoredState = false;

        for (i = 0; i < count; i++) {
            if (localStorage.getItem("stepBible-displayQuickTryoutAccordion" + i) === "true") {
                hasStoredState = true;
                this.toggleAccordion(i);
            }
        }

        if (!hasStoredState) {
            this.toggleAccordion(0);
        }
    },
    toggleAccordion: function (index) {
        var query = ".accordion-row[data-row=" + index + "]";
        var $accordionRow = this.$el.find(query);
        var $accordionBody = $accordionRow.find(".accordion-body");
        var storageKey = "stepBible-displayQuickTryoutAccordion" + index;

        if ($accordionBody.is(":visible")) {
            $accordionRow.find(".accordion-body").slideUp(600);
            $accordionRow.find(".plusminus").text("+");
            localStorage.setItem(storageKey, "false");
        }
        else {
            $accordionRow.find(".accordion-body").slideDown(600);
            $accordionRow.find(".plusminus").text("-");
            localStorage.setItem(storageKey, "true");
        }
    },
    onClickHeading: function (event) {
        var $target = $(event.target);
        var $accordionRow = $target.parent();
        var index = $accordionRow.attr("data-row");
        this.toggleAccordion(index);
    },
    onClickClose: function () {
        step.util.showOrHideTutorial(true);
    }
});
