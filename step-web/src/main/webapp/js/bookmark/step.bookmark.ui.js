$(document).ready(function() {
    $(".bookmarkPassageLink").button({
        icons : {
            primary : "ui-icon-bookmark"
        },
        text : false
    }).click(function() {
        $.shout("bookmark-addition-requested", {
            reference : step.state.passage.reference(step.passage.getPassageId(this))
        });
    });
});
