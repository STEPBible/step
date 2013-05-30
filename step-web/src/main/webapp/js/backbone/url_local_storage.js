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

Backbone.LocalStorage.extend = Backbone.Collection.extend;
var UrlLocalStorage = Backbone.LocalStorage.extend({
    /**
     * Override the fetch method to take items from the URL, instead of from the local storage if need be.
     */
    findAll : function() {
        var models = Backbone.LocalStorage.prototype.findAll.call(this);

//        for(var i = 0; i < models.length; i++) {
//            this.overrideFromUrl(models[i]);
//        }
        return models;
    },

    /**
     * Given a particular part of the URL, extract the parameters section and apply to the model
     * @param model the model in question
     * @param urlPart the concatenated form of the parameters
     */
    overrideModelValues: function (model, urlPart) {
        var params = urlPart.split("|");
        model.updateModel({params : params});
    },

    overrideFromUrl : function(model) {
        var passageId = model.passageId;

        //get fragment for passage id
        var fragments = stepRouter.getColumnFragments(Backbone.history.getFragment());
        for(var i = 0; i < fragments.length; i++) {
            if(fragments[i].length <= 3) {
                continue;
            }

            if(fragments[i].indexOf("/passage/") != -1) {
                //then we're dealing with a passage
            } else {
                //then we're dealing with a search
                var urlParts = fragments[i].split("/");

                //first 2nd part at index 1 will always be the passage id
                if(urlParts.length < 2 || urlParts[1] != passageId) {
                    continue;
                }

                //last part is always going to be the list of parameters
                this.overrideModelValues(model, urlParts[urlParts.length - 1]);
            }
        }

        //if fragment exists, then get rid of the model


    }
});
