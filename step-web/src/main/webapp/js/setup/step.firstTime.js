
if (!step) {
    step = {};
}

step.firstTime = {
    complete: false,

    init: function () {
        var self = this;

        self.addProgressItem(__s.starting_installation);
        self.delayProgressUpdate();

        $.get(SETUP_INSTALL_FIRST_TIME, function (data) {
            //do nothing here
        });
    },

    delayProgressUpdate: function () {
        //now start a timer thread that updates the page regularly.
        setTimeout(function () {
            step.firstTime.updateProgress();
        }, 1000);
    },

    updateProgress: function () {
        var self = this;
        if (!step.firstTime.complete) {
            $.get(SETUP_GET_PROGRESS, function (data) {
                if(!data) {
                    return;
                }

                if (!data.explanation || data.explanation.length == 0) {
                    //add '.' to last entry
                    var lastEntry = $("#progressStatus li:last span");
                    lastEntry.html(lastEntry.html() + ".");

                    //check if complete
                    step.firstTime.checkComplete();
                } else {
                    $("#progressBar").width(data.progress + "%");
                    $("#progressLabel").html(sprintf(__s.progress_info, data.progress));
                    self.addProgressItem(data.explanation[data.explanation.length -1]);
                }
            });
            step.firstTime.delayProgressUpdate();
        }
    },

    addProgressItem: function (text) {
        $("#progressLog").html("<b style='color: #33339F'>" + new Date().toLocaleTimeString() + "</b> <span>" + text + "</span></li>");
    },

    checkComplete: function (text) {
        //checks whether the process is finished
        $.get(SETUP_IS_COMPLETE, function (data) {
            if (data) {
                step.firstTime.complete = true;

                //now redirect to setup page where a user can choose which bible to install
                window.location.href = "../../setup.jsp";
            }
        });
    }
}

$(document).ready(function () {
    step.firstTime.init();
});

