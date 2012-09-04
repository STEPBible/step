
$(document).ready(function() {
    var namespace = "quick";
    step.state.trackState([
                           ".searchQuerySyntax"
                           ], namespace);

   

    $(".searchQuerySyntax").keypress(function(event) {
        if (event.which == 13 ) {
            step.search.quick.search(step.passage.getPassageId(this));
            event.preventDefault();
        }
    });
});

$(step.search.ui).hear("subject-search-state-has-changed", function(s, data) {
//    step.search.subject.search(data.passageId);
});
