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

step.search = {
    tagging : {
        exact : function(passageId) {
            this._doStrongSearch(passageId, SEARCH_STRONG_EXACT);
        },

        related : function(passageId) {
            this._doStrongSearch(passageId, SEARCH_STRONG_RELATED);
        },

        _doStrongSearch : function(passageId, searchType) {
            var query = step.state.original.strong(passageId);

            if (step.util.raiseErrorIfBlank(query, "Please enter a strong number")) {
                step.search._doSearch(searchType, passageId, query);
            }
        }
    },
    
    timeline : {
        reference : function(passageId) {
            console.log("Searching timeline by reference");
            $.getSafe(SEARCH_TIMELINE_REFERENCE, [step.state.passage.version(passageId), step.state.timeline.reference(passageId)], function(results) {
                step.search._displayResults(results, passageId);
            });
        },
        
        description: function(passageId) {
            console.log("Searching by timeline description");
            $.getSafe(SEARCH_TIMELINE_DESCRIPTION, [step.state.passage.version(passageId), step.state.timeline.description(passageId)], function(results) {
                step.search._displayResults(results, passageId);
            });
        },
        
        dating : function(passageId) {
            console.log("Searching by dating");            
        }
    },
    
    textual : {
        search : function(passageId){
            console.log("Searching text...");
            var query = $.trim(step.state.textual.textQuerySyntax(passageId));
            if(step.util.isBlank(query)) {
                return;
            }
                        
            var ranked = step.state.textual.textSortByRelevance(passageId);
            
            if (step.util.raiseErrorIfBlank(query, "Please fill in the form first")) {
                step.search._doSearch(SEARCH_DEFAULT, passageId, query, ranked);
            }
        }
    },
    
    handleSearch : function(element) {
        var passageId = step.passage.getPassageId(element);
        var passageContainer = step.util.getPassageContainer(passageId);
        var passageContent = step.util.getPassageContent(passageId);
        var query = $(".versionSearchBox", passageContainer).val();
        if (step.util.raiseErrorIfBlank(query, "Please provide a query")) {
            this._doSearch(SEARCH_DEFAULT, passageId, query, passageContent);
        }
    },

    _doSearch : function(searchType, passageId, query, ranked) {
        var self = this;
        var version = step.state.passage.version(passageId);
        var args = ranked == null ? [version, query] : [version, query, ranked];
        
        $.getSafe(searchType, args, function(searchQueryResults) {
            self._displayResults(searchQueryResults, passageId);
        });
    },
    
    _displayTimelineEventResults : function(results, passageId) {
        var resultHtml = "<ul class='searchResults'>";
        var self = this;
        $.each(results, function(i, item) {
            var resultItem = "";
            var aTarget = "";
            if(item.verses && item.verses.length > 0) {
                aTarget = $.map(item.verses, function(item, i) { return item.key; }).join();
                
                resultItem += "<ul>";
                resultItem += self._displayPassageResults(item.verses, passageId);
                resultItem += "</ul>";
            }
            
            resultItem = "<li class='searchResultRow'><a class='searchResultKey' href='#' onclick='step.timeline.show("+ passageId + ", \"" + aTarget + "\")'>" + item.description +  "</a></li>" + resultItem;
                        
            resultHtml += resultItem;
        });
        
        resultHtml += "</ul>";
        return resultHtml;
    },
    
    _displayPassageResults : function(searchResults, passageId) {
        var results = "";
        $.each(searchResults, function(i, item) {
            results += "<li class='searchResultRow'><span class='searchResultKey'> ";
            results += goToPassageArrow(true, item.key, "searchKeyPassageArrow");
            results += item.key;
            results += goToPassageArrow(false, item.key, "searchKeyPassageArrow");
            results += "</span>";
            results += item.preview;
            results += "</li>";
        });
        return results;
    },

    _displayResults : function(searchQueryResults, passageId) {
        var results = "";
        var searchResults = searchQueryResults.results;

        if (searchResults.length == 0) {
            results += "<span class='notApplicable'>No search results were found</span>";
            return;
        }

        if(searchQueryResults.query.indexOf("timeline") == 0) {
            results += this._displayTimelineEventResults(searchResults, passageId);
        } else {
            results += "<ul class='searchResults'>";
            results += this._displayPassageResults(searchResults, passageId);
            results += "</ul>";
        }
        

        if (searchQueryResults.maxReached == true) {
            results += "<span class='notApplicable'>The maximum number of search results was reached. Please refine your search to see continue.</span>";
        }
        
        $(step.util.getPassageContent(passageId)).html(results);
    }
};
