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
                //TODO - version for original word search
                step.search._doSearch(searchType, passageId, query, 'KJV');
            }
        }
    },
    quick : {
        search : function() {
            console.log("Executing quick search");
        },
    },
    
    timeline : {
        reference : function(passageId) {
            console.log("Searching timeline by reference");
            $.getSafe(SEARCH_TIMELINE_REFERENCE, [step.state.passage.version(passageId), step.state.timeline.timelineReference(passageId)], function(results) {
                step.search._displayResults(results, passageId);
            });
        },
        
        description: function(passageId) {
            console.log("Searching by timeline description");
            $.getSafe(SEARCH_TIMELINE_DESCRIPTION, [step.state.passage.version(passageId), step.state.timeline.timelineEventDescription(passageId)], function(results) {
                step.search._displayResults(results, passageId);
            });
        },
        
        dating : function(passageId) {
            console.log("Searching by dating");            
        }
    },
    
    subject : {
        search : function(passageId) {
            console.log("Subject search");
            
            var query = step.state.subject.subjectQuerySyntax(passageId);
            
            var highlightTerms = this._highlightingTerms(query);
            $.getSafe(SEARCH_SUBJECT, ['ESV', query], function(results) {
                step.search._displayResults(results, passageId);
                step.search._highlightResults(passageId, highlightTerms);
            });
        },
        
        _highlightingTerms : function(query) {
            if(query == undefined || query.length < 2) {
                return [];
            }
            return query.substring(2).split(" ");
        }
    },
    
    simpleText : {
        search : function(passageId) {
            console.log("Simple text search...");
            var query = $.trim(step.state.simpleText.simpleTextQuerySyntax(passageId));
            var version = step.state.simpleText.simpleTextSearchVersion(passageId);
            var context = step.state.simpleText.simpleTextSearchContext(passageId);
            var ranked = step.state.simpleText.simpleTextSortByRelevance(passageId);
            step.search.textual._validateAndRunSearch(passageId, query, version, ranked, context);
        }
    },
    
    textual : {
        search : function(passageId){
            console.log("Advanced text search...");
            var query = $.trim(step.state.textual.textQuerySyntax(passageId));
            var version = step.state.textual.textSearchVersion(passageId);
            var context = step.state.textual.textSearchContext(passageId);
            var ranked = step.state.textual.textSortByRelevance(passageId);
            this._validateAndRunSearch(passageId, query, version, ranked, context);
        },
        
        _validateAndRunSearch : function(passageId, query, version, ranked, context) {
            if(step.util.isBlank(query)) {
                return;
            }
            
            if (step.util.raiseErrorIfBlank(query, "Please fill in the form first")) {
                step.search._doSearch(SEARCH_DEFAULT, passageId, query, version.toUpperCase(), ranked, context, this._highlightingTerms(query));
            }
        },
        
        _highlightingTerms : function(query) {
            var terms = [];
            var termBase = query.substring(2);
            
            //remove range restrictions, -word and -"a phrase"
            termBase = termBase.replace(/[+-]\[[^\]]*]/g, "");
            termBase = termBase.replace(/-[a-zA-Z]+/g, "");
            termBase = termBase.replace(/-"[^"]+"/g, "");
            
            //remove distances and brackets
            termBase = termBase.replace(/~[0-9]+/g, "");
            termBase = termBase.replace(/[\(\)]*/g, "");
            termBase = termBase.replace(/ AND /g, " ");
            
            var matches = termBase.match(/"[^"]*"/);
            if(matches) {
                for(var i = 0; i < matches.length; i++) {
                    terms.push(matches[i].substring(1, matches[i].length -1));
                }
            }
            
            //then remove it from the query
            termBase = termBase.replace(/"[^"]*"/, "");
            var smallTerms = termBase.split(" ");
            if(smallTerms) {
                for(var i = 0; i < smallTerms.length; i++) {
                    var consideredTerm = smallTerms[i].trim(); 
                    if(consideredTerm.length != "") {
                        terms.push(consideredTerm);   
                    }
                }
            }
            console.log(terms);
            return terms;
        }
    },

   
    _doSearch : function(searchType, passageId, query, version, ranked, context, highlightTerms) {
        var self = this;
        var contextArg = context == undefined || isNaN(context) ? 0 : context;
        var args = ranked == null ? [version, query] : [version, query, ranked, contextArg];
        
        $.getSafe(searchType, args, function(searchQueryResults) {
            self._displayResults(searchQueryResults, passageId);
            self._highlightResults(passageId, highlightTerms);
        });
    },
    
    _highlightResults : function(passageId, highlightTerms) {
        var verses = $(".searchResults", step.util.getPassageContent(passageId)).get(0);
        if(highlightTerms == undefined || verses == undefined) {
            step.search.highlightTerms = [];
            return;
        }
        
        step.search.highlightTerms = highlightTerms;
        for(var i = 0; i < highlightTerms.length; i++) {
            var regex = new RegExp("\\b" + highlightTerms[i] + "\\b", "ig");
            doHighlight(verses, "highlight", regex);
        }
        
    },
    
    _displayTimelineEventResults : function(results, passageId) {
        var resultHtml = "<table>";
        var self = this;
        $.each(results, function(i, item) {
            var resultItem = "";
            var aTarget = "";
            if(item.verses && item.verses.length > 0) {
                aTarget = $.map(item.verses, function(item, i) { return item.key; }).join();
                
                resultItem += "<table class='masterSearchTable'>";
                resultItem += self._displayPassageResults(item.verses, passageId, false);
                resultItem += "</table>";
            }
            
            resultItem = "<tr><td class='masterSearchResultRow'><a class='' href='#' onclick='step.timeline.show("+ passageId + ", \"" + aTarget + "\")'>" + item.description +  "</a></td><td>" + resultItem +"</td>";
                        
            resultHtml += resultItem;
        });
        
        resultHtml += "</table>";
        return resultHtml;
    },
    
    // qualifiedSearchResults = {result: , key: }
    _displayPassageResults : function(searchResults, passageId, goToChapter, contentGenerator) {
        var results = "";
        $.each(searchResults, function(i, item) {
            results += "<tr class='searchResultRow'><td class='searchResultKey'> ";
            results += goToPassageArrow(true, item.key, "searchKeyPassageArrow", goToChapter);
            results += item.key;
            results += goToPassageArrow(false, item.key, "searchKeyPassageArrow", goToChapter);
            results += "</td><td class='searchResultRow'>";
            
            if(contentGenerator != undefined) {
                results += contentGenerator(item);
            } else {
                results += item.preview;
            }
            
            results += "</td></tr>";
        });
        return results;
    },
    
    _displaySubjectResults : function(searchResults, passageId) {
        var results = "<ul class='subjectSection searchResults'>";
        
        var headingsSearch = searchResults[0].headingsSearch;
        var headingsResults = headingsSearch.results;
        
        for(var i = 0; i < headingsResults.length; i++) {
            results += "<li class='subjectHeading'>";
            results += "<span class='subjectSearchLink'>";
            results += goToPassageArrow(true, headingsResults[i].key, "searchKeyPassageArrow", true);
            results += headingsResults[i].key;
            results += goToPassageArrow(false, headingsResults[i].key, "searchKeyPassageArrow", true);
            results += "</span>";
            results += headingsResults[i].preview;
            results += "</li>";
        }
        
        return results += "</ul>";
    },

    _displayResults : function(searchQueryResults, passageId) {
        var results = "";
        var searchResults = searchQueryResults.results;

        //remove any hebrew language css
        step.util.getPassageContainer(passageId).removeClass("hebrewLanguage");
        
        
        if (searchResults == undefined || searchResults.length == 0) {
            results += "<span class='notApplicable'>No search results were found</span>";
            this._changePassageContent(passageId, results);
            return;
        } 
        
        if(searchQueryResults.query.indexOf("timeline") == 0) {
            results += this._displayTimelineEventResults(searchResults, passageId);
        } else if(searchQueryResults.query.indexOf("subject") == 0) {
            results += this._displaySubjectResults(searchResults, passageId);
        } else {
            results += "<table class='searchResults'>";
            
            if(searchResults[0].preview) {
                    results += this._displayPassageResults(searchResults, passageId, true);
            } else {
                //we customize the generation of the actual verse content to add the version
                results += this._displayPassageResults(searchResults, passageId, true, function (item) {
                    var content= "";
                    $.each(item.verseContent, function(i, verseContent) {
                        content += "<div class='multiVersionSubResult'><span class='smallResultKey'>(" + verseContent.contentKey + ")</span> " + verseContent.preview +"</div>";
                    });
                    return content;
                });
            }
            
            results += "</table>";
        }
        

        if (searchQueryResults.maxReached == true) {
            results += "<span class='notApplicable'>The maximum number of search results was reached. Please refine your search to see continue.</span>";
        }
        
        this._changePassageContent(passageId, results);
    },
    
    _changePassageContent : function(passageId, content) {
        var passageContent = $(step.util.getPassageContent(passageId));
        passageContent.html(content);
        refreshLayout();
    },
    
    showToolbar : function(passageId) {
        var passageContainer = step.util.getPassageContainer(passageId);
        step.state._showFieldSet(passageContainer, "Search toolbar");
    }
};





