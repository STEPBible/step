$(document).ready(function() {
    $(".previousChapter").button({
        icons : {
            primary : "ui-icon-arrowreturnthick-1-w"
        },
        text : false
    }).click(function() {
        step.passage.navigation.chapter.previous(step.passage.getPassageId(this));
    });

    $(".nextChapter").button({
        icons : {
            primary : "ui-icon-arrowreturnthick-1-w"
        },
        text : false
    }).click(function() {
        step.passage.navigation.chapter.next(step.passage.getPassageId(this));
    });

    $(".continuousPassage").button({
        icons : {
            primary : "ui-icon-script"
        },
        text : false
    }).click(function() {
        step.passage.navigation.handleContinuousScrolling(step.passage.getPassageId(this), $(this).is(":checked"));
    }).hear("passage-changed", function(button, data) {
        if (step.state.passage.multiRange(step.passage.getPassageId(this))) {
            // disable button
            $(button).attr("disabled", "disabled");
            $(button).continuousPassage.attr("title", "Continous passage scrolling is only available when one scripture reference is entered.");
        } else {
            $(button).removeAttr("disabled");
            $(button).attr("title", "Click here to enable continuous scrolling");
        }
    });

});
