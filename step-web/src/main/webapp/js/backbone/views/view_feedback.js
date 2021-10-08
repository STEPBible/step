/**************************************************************************************************
 * Copyright (c) 2013, Directors of the Tyndale STEP Project                                      *
 * All rights reserved.                                                                           *
 *                                                                                                *
 * Redistribution and use in source and binary forms, with or without                             *
 * modification, are permitted provided that the following conditions                             *
 * are met:                                                                                       *
 *                                                                                                *
 * Redistributions of source code must retain the above copyright                                 *
 * notice, this list of conditions and the following disclaimer.                                  *
 * Redistributions in binary form must reproduce the above copyright                              *
 * notice, this list of conditions and the following disclaimer in                                *
 * the documentation and/or other materials provided with the                                     *
 * distribution.                                                                                  *
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)                        *
 * nor the names of its contributors may be used to endorse or promote                            *
 * products derived from this software without specific prior written                             *
 * permission.                                                                                    *
 *                                                                                                *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS                            *
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT                              *
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS                              *
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE                                 *
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,                           *
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,                           *
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;                               *
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER                               *
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT                             *
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING                                 *
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF                                 *
 * THE POSSIBILITY OF SUCH DAMAGE.                                                                *
 **************************************************************************************************/

var FeedbackView = Backbone.View.extend({
    el: function () {
        return $("body")
    },
    template: '<div class="modal" id="raiseSupport" tabindex="-1" role="dialog" aria-labelledby="raiseSupportLabel" aria-hidden="true">' +
        '<div class="modal-dialog">' +
        '<div class="modal-content stepModalFgBg">' +
        '<div class="modal-header">' +
		step.util.modalCloseBtn("raiseSupport") +
        '<h4 class="modal-title" id="raiseSupportLabel"><%= __s.help_feedback %></h4>' +
        '</div>' + //end header
        '<div class="modal-body">' +
        '<form role="form">' +
        '<div class="form-group">' +
        '<label for="feedbackEmail"><%= __s.register_email %><span class="mandatory">*</span></label>' +
        '<input type="email" class="form-control" style="color:var(--clrText);background:var(--clrBackground)" value="<%= email %>" id="feedbackEmail" maxlength="200" placeholder="email@email.com">' +
        '</div>' +
        '<div class="form-group">' +
        '<label for="feedbackSummary"><%= __s.feedback_summary %><span class="mandatory">*</span></label> ' +
        '<input type="text" class="form-control" style="color:var(--clrText);background:var(--clrBackground)" id="feedbackSummary" maxlength="150" placeholder="<%= __s.feedback_summary %>">' +
        '</div>' +
        '<div class="form-group">' +
        '<label for="feedbackType"><%= __s.register_type %></label>' +
        '<select type="text" style="color:var(--clrText);background:var(--clrBackground)" class="form-control" id="feedbackType">' +
        '<option value="Bug"><%= __s.feedback_type_bug %></option>' +
        '<option value="Improvement"><%= __s.feedback_type_improvement %></option>' +
        '<option value="New Feature"><%= __s.feedback_new_feature %></option>' +
        '<option value="Error found"><%= __s.feedback_error_found %></option>' +
        '<option value="Need help"><%= __s.feedback_need_help %></option>' +
        '<option value="Like to volunteer"><%= __s.feedback_volunteer %></option>' +
        '<option value="Just saying Hi"><%= __s.feedback_just_say_hi %></option>' +
        '</select>' +
        '</div>' +
        '<div class="form-group">' +
        '<label for="feedbackDescription"><%= __s.feedback_description %><span class="mandatory">*</span></label> ' +
        '<textarea class="form-control" style="color:var(--clrText);background:var(--clrBackground)" placeholder="<%= __s.feedback_description %>" id="feedbackDescription" />' +
        '</div>' + 
        '<p class="help-block"><%= __s.include_screenshot %></p>' +
		'<p class="help-block">Hebrew and Greek text cannot be sent through this form.</p>' +
        '</form>' +
        '</div>' + //end body
        '<div class="modal-footer">' +
        '<button type="button" class="btn stepButton" data-dismiss="modal"><%= __s.close %></button>' +
        '<button type="button" class="btn sendFeedback stepButton"><%= __s.help_feedback %></button>' +
        '</div>' + //end footer
        '</div>' + //end content
        '</div>' + //end dialog
        '</div>', //end modal

    initialize: function () {
        this.render();
    },
    validate: function() {
        var success = true;
        //we check and add error classes if need be
        this.feedbackForm.find("input, select, textarea").each(function(i, item) {
           var el = $(this);
           if(step.util.isBlank(el.val()) || (el.attr("id") == 'feedbackEmail' && el.val().indexOf('@') == -1)) {
               el.closest(".form-group").addClass("has-error");
               success = false;
           } else {
               el.closest(".form-group").removeClass("has-error");
           }
        });
        return success;
    },
    render: function () {
        var self = this;
        this.feedbackForm = $(_.template(this.template)({ email: step.settings.get("userFeedbackEmail") || "" }));
        this.$el.append(this.feedbackForm);
    
        this.feedbackForm.on("show.bs.modal", function(){
            //blank out all fields 
            self.feedbackForm.find("#feedbackType").val("Bug");
            self.feedbackForm.find("#feedbackEmail").val(step.settings.get("userFeedbackEmail") || "" );
            self.feedbackForm.find("#feedbackDescription").val("");
            self.feedbackForm.find("#feedbackSummary").val("");
        });
        
        $(".sendFeedback").click(function (ev) {
            ev.preventDefault();
            if(!self.validate()) {
                return;
            }
            
            require(["html2canvas"], function () {
                var formData = [];
                var email = self.feedbackForm.find("#feedbackEmail").val();

                //store email locally
                step.settings.save({ userFeedbackEmail: email }, {silent: true});

                formData.push({ key: "type", value: self.feedbackForm.find("#feedbackType").val()});
                formData.push({ key: "email", value: email});
                formData.push({ key: "description", value: self.feedbackForm.find("#feedbackDescription").val()});
                formData.push({ key: "summary", value: self.feedbackForm.find("#feedbackSummary").val()});
                formData.push({ key: "url", value: document.URL});
                self.feedbackForm.modal("hide");
//                self.feedbackForm.remove();
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
    }
});
