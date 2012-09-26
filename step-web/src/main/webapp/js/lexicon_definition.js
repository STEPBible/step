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

step.lexicon = {
    passageId : 0,
    sameWordSearch : function() {
        this._doSearch("exact");
    },

    relatedWordSearch : function() {
        this._doSearch("related");
    },

    wordGrammarSearch : function() {

    },

    _doSearch : function(searchType) {
        var query = $("span[info-name ='strongNumber']").val();
        if(step.util.raiseErrorIfBlank(query, "No strong data is available")) {
            var targetPassageId = this.passageId;
            step.state.original.strong(targetPassageId, query);
            step.state.original.searchType(targetPassageId, searchType);
            step.state.activeSearch(targetPassageId, 'SEARCH_ORIGINAL');
        }
    }
};

/**
 * The bookmarks components record events that are happening across the
 * application, for e.g. passage changes, but will also show related information
 * to the passage.
 */
function LexiconDefinition() {
    var self = this;
    // listen for particular types of events and call the prototype functions
    this.getPopup().hear("show-all-strong-morphs", function(selfElement, data) {
//        console.log(data);
        self.showDef(data);

        // temporary measure, but we can keep it in as a safe-guard against no
        // strong mapping being found:
        $("span[info-name ='strong']").val(data.strong);
    });

    var currentLevel = step.state.view.getDetail();
    $("#origin").detailSlider({
        key: "lexicon",
        scopeSelector : "#lexiconDefinition"
    });
}
    
LexiconDefinition.prototype.getPopup = function() {
    if (this.popup) {
        this.popup.css('display', 'inline-block');
        return this.popup;
    }

    // create the popup container
    this.popup = $("#lexiconDefinition");
    this.popup.tabs().draggable({
        handle : "#lexiconDefinitionHeader",
    });
    $("#lexiconDefinition").tabs("select", 0)
    
    $('#lexiconPopupClose').click(function() {
        $('#lexiconDefinition').hide();
    });
    return this.popup;
};

LexiconDefinition.prototype.showDef = function(data) {
    var self = this;

    step.lexicon.passageId = data.passageId;

    // create all tabs - first remove everything, then re-add.
    var strong = data.strong;
    var morph = data.morph;
    var verse = $(data.source).closest("span.verse").filter("a:first").attr("name");

    // Get info on word
    $.getSafe(MODULE_GET_INFO + strong + "/" + morph + "/" + verse, function(data) {
        self.showOriginalWordData(data);
    });

    this.reposition();
};

LexiconDefinition.prototype.showOriginalWordData = function(data) {
    // remove previous information
    this.populateNames(data.morphInfos, "#grammarContainer");
    this.populateNames(data.vocabInfos, "#vocabContainer");
    
    //finally do the odd-ones out - TODO - deal with multiple vocabs
    if(data.vocabInfos[0] && data.vocabInfos[0].similarStrongs) {
        var similarStrongs = "";
        for(var i in data.vocabInfos[0].similarStrongs) {
            similarStrongs += "<a onclick='alert(\"" + data.vocabInfos[0].similarStrongs[i].code + "\");'>" + data.vocabInfos[0].similarStrongs[i].word + "</a>&nbsp;";
        }
        
        $("*[info-name = 'similarStrongLinks']", "#vocabContainer").html(similarStrongs);
    }
};

LexiconDefinition.prototype.resetContainer = function(container) {
    $("*", container).each(function(index, element) {
        if ($(element).attr("info-name")) {
            $(element).html("");
        }
    });
};

LexiconDefinition.prototype.populateNames = function(data, container) {
    this.resetContainer(container);

    // now check if we have information, if not, then hide
    if (data.length == 0) {
        $(container).hide();
        return;
    } else {
        $(container).show();
    }

    $("*", container).each(function(index, item) {
        var infoName = $(item).attr("info-name");
        if (infoName) {
            var infos = infoName.split("|");
            var content = data[0][infos[0]];
            if(content == "") {
                content = data[0][infos[1]];
            }
            
            if (content) {
                if (content.replace) {
                    content = content.replace(/_([^_]*)_/g, "<span class=\"emphasisePopupText\">$1</span>");
                }

                var targetItem = $(item);
                if(targetItem.length > 0) {
                    targetItem.html(content);
                }
            }
        }

        var dependencyList = $(item).attr("depends-on");
        if (dependencyList) {
            var dependencies = dependencyList.split(",");

            // if any one of the dependencies is to be shown, then we show
            for ( var ii = 0; ii < dependencies.length; ii++) {
                if (data[0][dependencies[ii]] != "") {
                    $(item).toggle(true);
                    return;
                }
            }
            $(item).toggle(false);
        }
    });
};

LexiconDefinition.prototype.getShortKey = function(k) {
    var subKey = k.substring(k.indexOf(':') + 1);
    if (subKey[0] == 'G' || subKey[0] == 'H') {
        return subKey.substring(1);
    }
    return subKey;
};

LexiconDefinition.prototype.reposition = function() {
    // if left position is negative, then we assume it's off screen and need
    // position
    if (this.getPopup().css("left")[0] == '-') {
        // position in the middle
        this.getPopup().position({
            of : $("body"),
            my : "right top",
            at : "right top",
            collision : "fit flip",
        });
    }
};
