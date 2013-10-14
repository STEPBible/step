/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project All rights
 * reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice, this
 * list of conditions and the following disclaimer. Redistributions in binary
 * form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided
 * with the distribution. Neither the name of the Tyndale House, Cambridge
 * (www.TyndaleHouse.com) nor the names of its contributors may be used to
 * endorse or promote products derived from this software without specific prior
 * written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/

if (!step) {
    step = {};
}

step.config = {
    currentInstalls : [],
    currentIndexing : [],
    
    init : function() {
        var self = this;
        // get all installed modules
        this.populateInstalledModules();

        // add click handler to acknowledge warning message
        $("#dismissWarning").click(function() {
            $(this).remove();
            self.populateInstallableModules();
            $(".waitingLabel").show();
        });

        $("#leftColumn, #rightColumn").droppable({
            accept : ".version",
            activeClass : "ui-state-highlight",
            drop : function(event, ui) {
                self.receiveItem(ui.draggable, this);
            }
        });
        
        //kick off update progress thread...
        this.updateProgress();
    },

    receiveItem : function(draggedItem, parent) {
        var self = this;
        var item = $.data(draggedItem.get(0), "item");
        draggedItem.remove();
        var module = self.renderVersion(item, $(parent));
        
        //now work out where it landed and do the appropriate action:
        if($(parent).attr('id') == 'rightColumn') {
            $("<div class='progress' id='"  + item.initials + "'>&nbsp;</div>").appendTo(module);
            
            $(parent).find(".container").prepend(module);
            
            //index module
            //bible is about to be installed - add progress bar...
            self.currentInstalls.push(item.initials);
            $.get(SETUP_INSTALL_BIBLE + item.initials, function() {
            });
        } else {
            //remove item
            $.get(SETUP_REMOVE_MODULE + item.initials, function(data) {

            });
        }
    },

    /** modules that have yet to be installed */
    populateInstallableModules : function() {
        
        var installableColumn = $("#leftColumn");
        var self = this;
        $.get(MODULE_GET_ALL_INSTALLABLE_MODULES + "BIBLES,COMMENTARIES", function(data) {
            $(".waitingLabel").remove();
            $.each(data, function(i, item) {
                self.renderVersion(item, installableColumn);
            });
        });
    },

    /** loads the installed modules from the server */
    populateInstalledModules : function() {
        var self = this;
        var installedColumn = $("#rightColumn");
        $.get(MODULE_GET_ALL_MODULES, function(data) {
            $.each(data, function(i, item) {
                self.renderVersion(item, installedColumn).addClass("installed");
            });
        });
    },

    updateProgress : function() {
        var self = this;
        this.queryProgress(SETUP_PROGRESS_INSTALL, this.currentInstalls, 0, function(initials) {
            //now kick off indexing
            //indexing is now in progress
            self.currentIndexing.push(initials);
            $.get(SETUP_REINDEX + initials, function() {
            });
        });

        
        this.queryProgress(SETUP_PROGRESS_INDEX, this.currentIndexing, 50);
                
        delay(function() { step.config.updateProgress(); }, 1000);
    },
    
    queryProgress : function(progressUrl, versions, offsetProgress, completeHandler) {
        if(versions != 0) {
            $.get(progressUrl + versions.join(), function(data) {
                for(var i = 0; i < versions.length; i++) {
                    var item = $("#" + versions[i]);
                    var currentWidth = item.width();
                    var newWidth = 100 - ((data[i] * 100 / 2) + offsetProgress)  + "%";
                    var realNewWidth = currentWidth > newWidth ? currentWidth : newWidth;
                    item.animate({
                        //because we do indexing to, the current progress is only up-to 50%
                        width: realNewWidth
                    }, 900);
                    
                    if(data[i] == 1) {
                        //remove from in progress list
                        var initials = versions.splice(i, 1);
                        
                        if(completeHandler) {
                            completeHandler(initials);
                        }
                    }
                }
            });
        }
    },
    
    renderVersion : function(item, column) {
        var self = this;

        var category = item.category == 'BIBLE' ? __s.bible : __s.commentary;
        var features = step.util.ui.getFeaturesLabel(item);
        if (features == "") {
            features = " " + __s.not_applicable;
        }

        var module = $(
                "<div class='version ui-corner-all'>" + 
                "<div class='versionContainer'><div class='versionHeader'>" + 
                "<span class='name'>" + 
                item.name + 
                "</span>" + 
                " (<span class='initials'>" + item.shortInitials + "</span>) " + 
                "</div>" + 
                "<div class='versionColumn'>" +
                __s.category +
                "<div class='category'>" + category + "</div></div>" + 
                "<div class='versionColumn'>" + __s.language +
                "<div class='languageName'>" + item.languageName + "</div> (<span class='languageCode'>" +
                        	item.languageCode + "</span>)</div>" + "<div class='features'>" +
                        			__s.features + features + "</div>"
                        + "<div class='installNow'><a href='#'>" + __s.install_now +
                        		"</a></div>" + 
                          "<div class='removeNow'><a href='#'>" + __s.remove +
                          "</a></div>" +                
                            "</div></div>").draggable({
            revert : "invalid",
            containment : "document",
            cursor : "move"
        });

        module.find(".installNow a").click(function() {
            self.receiveItem(module, $("#rightColumn"));
        });

        module.find(".removeNow a").click(function() {
            self.receiveItem(module, $("#leftColumn"));
        });

        $.data(module.get(0), "item", item);
        column.find(".container").append(module);

        this.resizeColumns();

        return module;
    },

    resizeColumns : function() {
        $("#leftColumn, #rightColumn").css("height", "auto");

        var leftHeight = $("#leftColumn").height();
        var rightHeight = $("#rightColumn").height();
        var maxHeight = leftHeight < rightHeight ? rightHeight : leftHeight;

        $("#leftColumn, #rightColumn").height(maxHeight);
    },
    
    sortBy : function(field) {
        $("#sortLinks a").removeClass("selected");
        $("#" + field + "Sort").addClass('selected');


        var comparator = function(a, b) { return $.data(a, "item")[field] < $.data(b, "item")[field] ? -1 : 1; };
        $("#rightColumn .version").sortElements(comparator);
        $("#leftColumn .version").sortElements(comparator);

        $(".version *").removeClass("ui-state-highlight");
        $(".version ." + field).addClass("ui-state-highlight");
    },
    
    filterBy : function(field) {
        if(field) {
            $("#filterLinks a").removeClass("selected");
            $("#" + field + "Filter").addClass('selected');
        } else {
            field = $("#filterLinks a.selected").attr("filterType");
        }
        
        
        var value = $("#filterValue").val();
        $(".version").hide();
        var lc = $("#leftColumn ." + field + ":contains(\"" + value +"\")").closest(".version").show();
        var rc = $("#rightColumn ." + field + ":contains(\"" + value +"\")").closest(".version").show();
    }
}

$(document).ready(function() {
    step.config.init();
    $("#filterValue").keyup(function() {
        step.config.filterBy();
    });
});
