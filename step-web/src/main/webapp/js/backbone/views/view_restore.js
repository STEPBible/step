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

var RestorePassageView = Backbone.View.extend({
        template: '<div class="modal" id="restorePassages" tabindex="-1" role="dialog" aria-labelledby="restorePassagesLabel" ' +
            'aria-hidden="true">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content stepModalFgBg">' +
            '<div class="modal-header">' +
			step.util.modalCloseBtn("restorePassages") +
            '<h4 class="modal-title" id="restoreSessionTitle"><%= __s.restore_previous_session %></h4>' +
            '</div>' + //end header
            '<div class="modal-body">' +
            '<p><%= __s.previous_passages %>' +
            '<form role="form">' +
            '<% _.each(passages, function(p) { %>' +
            '<div class="checkbox">' +
            '<label>' +
            '<input type="checkbox" class="" data-passage-id="<%= p.get(\'passageId\') %>" checked="checked" />' +
            '<span class="argSummary argSumSpan"><%= step.util.ui.renderArgs(p.get("searchTokens"), null, "span") %></span>' +
            '</label>' +
            '</div>' +
            '<% }); %>' +
            '</form>' + //end form
            '<p><%= __s.previous_passages_warning %></p>' +
            '</div>' + //end body
            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-default closeModal" ><%= __s.close %></button>' +
            '<button type="button" class="btn btn-primary restoreModels"><%= __s.restore %></button>' +
            '</div>' + //end footer
            '</div>' + //end content
            '</div>' + //end dialog
            '</div>', //end modal
        el: function () {
            return $("body")
        },

        initialize: function (opts) {
            _.bindAll(this);
            this.closeCallback = opts.callback;
            this.render();
        },

        render: function () {
            var self = this;

            var corePassage = step.passages.findWhere({ passageId: 0 });

            //create collection of all passages, except for 0 id passage
            var firstMatchDeleted = false;
            var allRestorablePassages = [];
            for (var i = 0; i < step.passages.length; i++) {
                var p = step.passages.at(i);
                if (p.get("passageId") != 0) {
                    if (!firstMatchDeleted && p.get("signature") == corePassage.get("signature")) {
                        //copy over the position
                        corePassage.save({ position: p.get("position") }, { silent: true }, { silent: true });
                        
                        //we simply delete p, as it's highly likely we're already restored it.
                        p.destroy();
                        i--;
                        firstMatchDeleted = true;
                    } else {
                        //copy the original page of results back into 'results'
                        allRestorablePassages.push(p);
                    }
                }
            }

            //if we have no passages, then simply return now
            if (allRestorablePassages.length == 0) {
                this.closeModal();
                return;
            }

            this.restoreForm = $(_.template(this.template)({ passages: allRestorablePassages }));
            this.$el.append(this.restoreForm);

            $(".closeModal").click(this.closeModalHandler);
            $(".restoreModels").click(function (ev) {
                ev.preventDefault();

                //for each passage that is ticked, restore it
                $("[data-passage-id]").each(function (i, item) {
                    var el = $(this);
                    var model = step.passages.findWhere({ passageId: el.data('passage-id') });
                    if (el.prop('checked')) {
                        //restore column
                        step.util.createNewColumn(false, model);
                        step.router.handleRenderModel(model, null, null, -1);
                    } else {
                        //never notify, no point
                        step.passages.remove(model, {silent: true});
                    }
                });

                
                //now let's restore the correct order
                var comparator = function(a, b) { return $.data(a, "item")[field] < $.data(b, "item")[field] ? -1 : 1; };
                $(".column").not(".examplesColumn").sortElements(function(a,b) {
                    //we compare the respective positions of the various models
                    var aEl = $(a);
                    var bEl = $(b);
                    var aPassageId = aEl.find(".passageContainer").attr("passage-id");
                    var bPassageId = bEl.find(".passageContainer").attr("passage-id");
                    var aModel = step.passages.findWhere({passageId: parseInt(aPassageId) });
                    var bModel = step.passages.findWhere({passageId: parseInt(bPassageId) });
                    return aModel.get("position") < bModel.get("position") ? -1 : 1;
                });
                
                
                self.closeModal();
            });
            this.restoreForm.modal("show");
        },
        closeModalHandler: function () {
            for (var i = 0; i < step.passages.length; i++) {
                var p = step.passages.at(i);
                if (p.get("passageId") != 0) {
                    p.destroy();
                    i--;
                }
            }
            this.closeModal();
        },
        closeModal: function () {
            if(this.restoreForm) {
                this.restoreForm.modal("hide");
            }

            $('body').removeClass('modal-open');
            $('.modal-backdrop').remove();
            
            this.closeCallback();
        }
    })
    ;
