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
    template: '<button class="btn btn-primary btn-xs" id="raiseSupportTrigger" data-toggle="modal" data-target="#raiseSupport"><%= __s.help_feedback %></button>' +
        '<div class="modal fade" id="raiseSupport" tabindex="-1" role="dialog" aria-labelledby="raiseSupportLabel" aria-hidden="true">' +
        '<div class="modal-dialog">' +
        '<div class="modal-content">' +
        '<div class="modal-header">' +
        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
        '<h4 class="modal-title" id="raiseSupportLabel"><%= __s.help_feedback %></h4>' +
        '</div>' +
        '<div class="modal-body">' +
        '<form role="form">' +
        '<div class="form-group">' +
        '<label for="feedbackName"><%= __s.register_name %></label>' +
        '<input type="text" class="form-control" id="feedbackName">' +
        '</div>' +
        '<div class="form-group">' +
        '<label for="feedbackEmail"><%= __s.register_email %></label>' +
        '<input type="email" class="form-control" id="feedbackEmail">' +
        '</div>' +
        '<div class="form-group">' +
        '<label for="feedbackSummary"><%= __s.feedback_summary %></label> ' +
        '<input type="text" class="form-control" id="feedbackSummary">' +
        '</div>' +
        '<div class="form-group">' +
        '<label for="feedbackDescription"><%= __s.feedback_description %></label> ' +
        '<textarea class="form-control" id="feedbackDescription" />' +
        '</div>' +
        '<p class="help-block"><%= __s.include_screenshot %></p>' +
        '</div>' +
        '</form>' +
        '</div>' +
        '<div class="modal-footer">' +
        '<button type="button" class="btn btn-default" data-dismiss="modal"><%= __s.close %></button>' +
        '<button type="button" class="btn btn-primary sendFeedback"><%= __s.help_feedback %></button>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>',

    initialize: function () {
        this.render();
    },

    render: function () {
        var self = this;
        this.feedbackForm = $(_.template(this.template)());
        this.$el.append(this.feedbackForm);
        this.feedbackForm.find(".sendFeedback").click(function (ev) {
            ev.preventDefault();
            require(["html2canvas"], function () {
                var name = "name=" + self.feedbackForm.find("#feedbackName").val();
                var email = "email=" + self.feedbackForm.find("#feedbackEmail").val();
                var description = "description=" + self.feedbackForm.find("#feedbackDescription").val();
                var summary = "summary=" + self.feedbackForm.find("#feedbackSummary").val();
                var currentUrl = "url=" + document.URL;
                self.feedbackForm.find("#raiseSupport").modal("hide");
                self.feedbackForm.remove();

                var url = SUPPORT_CREATE + "?" + [name, email, description, summary, currentUrl].join("&");

                html2canvas(document.body, {
                    onrendered: function (canvas) {
                        step.util.postCanvasToURL(url, "form", "file", canvas, "image/png");
                    }
                });
            });
        });
    }
});
