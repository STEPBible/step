window.step = window.step || {};
step.lexiconFeedback = {
	init: function(strong, ref, bibleVersion) {
		$(".sendFeedback").click(function (ev) {
            ev.preventDefault();
            if(!step.lexiconFeedback.validate()) {
                return;
            }
            
            require(["html2canvas"], function () {
                var formData = [];
				var feedbackForm = $("#lexFeedbackModal").find("form");
                var email = feedbackForm.find("#lexfeedbackEmail").val();

                //store email locally
                step.settings.save({ userFeedbackEmail: email }, {silent: true});

                formData.push({ key: "type", value: feedbackForm.find("#lexfeedbackType").val()});
                formData.push({ key: "email", value: email});
                formData.push({ key: "description", value: feedbackForm.find("#lexfeedbackDescription").val()});
                formData.push({ key: "summary", value: feedbackForm.find("#lexfeedbackSummary").val()});
                formData.push({ key: "url", value: document.URL});
                formData.push({ key: "bibleref", value: bibleVersion + "," + ref + "," + strong })
				$("#lexFeedbackModal").hide();
				$("#lexFeedbackModal").remove();
                $('body').removeClass('modal-open');
                $('.modal-backdrop').remove();
                step.util.raiseInfo(__s.feedback_please_wait, "warning", null, 25);
                html2canvas(document.body, {
                    onrendered: function (canvas) {
                        step.util.raiseInfo(__s.feedback_sending, "warning", null, 75);
                        step.util.postCanvasToURL(SUPPORT_CREATE, "screenshot-part", "file", canvas, "image/png", formData, function(success) {
                            if(success) {
                                step.util.raiseInfo(__s.feedback_success);
                            } else {
                                step.util.raiseError(__s.feedback_failure);
                            }
                        });
                    }
                });
            });
        });
	},
    validate: function() {
        var success = true;
        //we check and add error classes if need be
		var feedbackForm = $("#lexFeedbackModal").find("form");
        feedbackForm.find("input, select, textarea").each(function(i, item) {
           var el = $(this);
           if(step.util.isBlank(el.val()) || (el.attr("id") == 'feedbackEmail' && el.val().indexOf('@') == -1)) {
               el.closest(".form-group").addClass("has-error");
               success = false;
           } else {
               el.closest(".form-group").removeClass("has-error");
           }
        });
        return success;
    }

};