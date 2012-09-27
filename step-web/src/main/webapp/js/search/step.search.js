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
    pageSize : step.defaults.pageSize,
    totalResults : 0,
    refinedSearch : [],
    lastSearch: "",    
    
    original : {
        //place for two filters
        filters : [undefined, undefined],
        
        search : function(passageId) {
            var query = step.state.original.originalQuerySyntax(passageId);
            if(query != undefined) {
                query = query.replace('/', '#');
            } 
            var pageNumber = step.state.original.originalPageNumber(passageId);
            var versions = step.state.original.originalSearchVersion(passageId);
            var context = step.state.original.originalSearchContext(passageId);
            var sortOrder = $("fieldset:visible", step.util.getPassageContainer(passageId)).detailSlider("value") > 0 ? step.state.original.originalSorting(passageId) : false;
            var filter = step.search.original.filters[passageId];
            
            var versions = step.state.original.originalSearchVersion(passageId);
            if(versions == undefined) {
                versions = "";
            }
            
            if(!this._versionsContainsStrongs(versions)) {
                versions = "KJV," + versions;
                step.state.original.originalSearchVersion(passageId, versions);
            }
            
            if(filter && filter.length != 0) {
                query += " where original is (" + filter.join() + ") ";
            }
            
            step.search._validateAndRunSearch(passageId, query, versions, sortOrder, context, pageNumber);
        },

        _versionsContainsStrongs : function(versions) {
            if(step.util.isBlank(versions)) {
                return false;
            }
            
            if(step.versions == undefined) {
                //assume true, since we are most likely in a situation where things are being reloaded
                return true;
            }
            
            var vs = versions.split(",");
        
           //iterate through all versions of interes
           for(var j = 0; j < vs.length; j++) {
               //looking for them in step.versions
               for(var i = 0; i < step.versions.length; i++) {
                   if(vs[j] == step.versions[i].initials) {
                       if(step.versions[i].hasStrongs) {
                           return true;
                       } else {
                           //break and continue round for the next
                           break;
                       }
                   }
               }
           }
           
           return false;
        }
    },
    
    quick : {
        search : function(passageId) {
            var query = $.trim(step.state.quick.searchQuerySyntax(passageId));
            if(query == undefined) {
                returned;
            }
            
            if(query[0] == 'o') {
                query = query.replace('/', '#');
            }
            
            var version = this._getQuickVersions(passageId);
            
            var context = 0;
            var ranked = false;
            var pageNumber = step.search.pageSize;
            
            step.search._validateAndRunSearch(passageId, query, version, ranked, context, pageNumber);
        },
        
        _getQuickVersions : function(passageId) {
            var passageContainer = step.util.getPassageContainer(passageId);
            var versions = $("fieldset:visible", passageContainer).find(".searchVersions, .passageVersion, .extraVersions");
            var versionInitials = "";
            $.each(versions, function(i, item) {
                versionInitials += $(this).val();
                versionInitials += ',';
            });
            return versionInitials;
        }
    },
    
    timeline : {
        reference : function(passageId) {
//            console.log("Searching timeline by reference");
            step.search._validateAndRunSearch(passageId, "dr=" + step.state.timeline.timelineReference(passageId), step.state.passage.version(passageId), false, 0, 1);
        },
        
        description: function(passageId) {
//            console.log("Searching by timeline description");
            step.search._validateAndRunSearch(passageId, "d=" + step.state.timeline.timelineEventDescription(passageId), step.state.passage.version(passageId), false, 0, 1);
        },
        
        dating : function(passageId) {
//            console.log("Searching by dating");            
        }
    },
    
    subject : {
        search : function(passageId) {
//            console.log("Subject search");
            
            var query = step.state.subject.subjectQuerySyntax(passageId);
            var pageNumber = step.state.subject.subjectPageNumber(passageId); 
            
            step.search._validateAndRunSearch(passageId, query, "ESV", false, 0, pageNumber);
        },
    },
    
    simpleText : {
        search : function(passageId) {
//            console.log("Simple text search...");
            var query = $.trim(step.state.simpleText.simpleTextQuerySyntax(passageId));
            var version = step.state.simpleText.simpleTextSearchVersion(passageId);
            var context = step.state.simpleText.simpleTextSearchContext(passageId);
            var ranked = false; // step.state.simpleText.simpleTextSortByRelevance(passageId) == step.defaults.search.textual.simpleTextSortBy[0];
            var pageNumber = step.state.simpleText.simpleTextPageNumber(passageId);
            
            step.search._validateAndRunSearch(passageId, query, version, ranked, context, pageNumber);
        }
    },
    
    textual : {
        search : function(passageId){
//            console.log("Advanced text search...");
            var query = $.trim(step.state.textual.textQuerySyntax(passageId));
            var version = step.state.textual.textSearchVersion(passageId);
            var context = step.state.textual.textSearchContext(passageId);
            var ranked = step.state.textual.textSortByRelevance(passageId);
            var pageNumber = step.state.textual.textPageNumber(passageId);

            step.search._validateAndRunSearch(passageId, query, version, ranked, context, pageNumber);
        },
    },
    
    
    _validateAndRunSearch : function(passageId, query, version, ranked, context, pageNumber) {
        if(step.util.isBlank(query)) {
            step.search._displayResults({}, passageId);
            return;
        }

        step.search._doSearch(passageId, query, version, pageNumber, ranked, context);
    },

    _doSearch : function(passageId, query, version, pageNumber, ranked, context, highlightTerms) {
        var self = this;
        
        var versionArg = " in (" + version.toUpperCase() + ")";
        var pageNumberArg = pageNumber == null ? 1 : pageNumber;
        var rankedArg = ranked == undefined ? false : ranked;
        var contextArg = context == undefined || isNaN(context) ? 0 : context;
        var pageSizeArg = this.pageSize;
        var finalInnerQuery = query + versionArg;
        
        var refinedQuery = this._joinInRefiningSearches(finalInnerQuery);
        var highlightTerms = this._highlightingTerms(refinedQuery);
        
        var args = [encodeURIComponent(refinedQuery), rankedArg, contextArg, pageNumberArg, pageSizeArg];
        
        $.getSafe(SEARCH_DEFAULT, args, function(searchQueryResults) {
            self._updateTotal(passageId, searchQueryResults.total, pageNumberArg);
            self.lastSearch = searchQueryResults.query;
            self._displayResults(searchQueryResults, passageId);
            
            if(searchQueryResults.strongHighlights) {
                self._highlightStrongs(passageId, searchQueryResults.strongHighlights);
            } else {
                self._highlightResults(passageId, highlightTerms);
            }
        });
    },
    
    _highlightingTerms : function(query) {
        var terms = [];
        var termBase = query.substring(2);

        //remove the search in (v1, v2, v3)
        termBase = termBase.replace(/in \([^)]+\)/gi, "");
        termBase = termBase.replace("=>", " ")
        
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
//        console.log(terms);
        return terms;
    },
    
    _highlightStrongs : function(passageId, strongsList) {
        if(strongsList == undefined) {
            return;
        }
        
        //now let's iterate through the list of strongs, find all the elements that match, and add the highlight class
        var passageContainer = step.util.getPassageContainer(passageId);

        for(var i = 0; i < strongsList.length; i++) {
            $("span[strong~='" + strongsList[i] + "']", passageContainer).addClass("ui-state-highlight");
        }
    },
   
    _joinInRefiningSearches : function(query) {
        if(this.refinedSearch.length != 0) {
            return this.refinedSearch.join("=>") + "=>" + query;
        }
        
        return query;
    },
    
    _updateTotal : function(passageId, total, pageNumber) {
        var resultsLabel = $("fieldset:visible .resultsLabel", step.util.getPassageContainer(passageId));
        
        //1 = 1 + (pg1 - 1) * 50, 51 = 1 + (pg2 -1) * 50 
        var start = total == 0 ? 0 : 1 + ((pageNumber -1) * step.search.pageSize);
        var end = pageNumber * step.search.pageSize;
        end = end < total ? end : total;
        
        resultsLabel.html("Showing results <em>" + start + " - " + end + "</em> of <em>" + total + "</em>");
        
        this.totalResults = total;  
    },
    
    _highlightResults : function(passageId, highlightTerms) {
        var verses = $(".searchResults", step.util.getPassageContent(passageId)).get(0);
        if(highlightTerms == undefined || verses == undefined) {
            step.search.highlightTerms = [];
            return;
        }
        
        step.search.highlightTerms = highlightTerms;
        for(var i = 0; i < highlightTerms.length; i++) {
            if(!step.util.isBlank(highlightTerms[i])) {
                var regex = new RegExp("\\b" + highlightTerms[i] + "\\b", "ig");
                doHighlight(verses, "ui-state-highlight", regex);
            }
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
                resultItem += self._displayPassageResults(item.verses, passageId, false, undefined);
                resultItem += "</table>";
            }
            
            resultItem = "<tr><td class='masterSearchResultRow'><a class='' href='#' onclick='step.timeline.show("+ passageId + ", \"" + aTarget + "\")'>" + item.description +  "</a></td><td>" + resultItem +"</td>";
                        
            resultHtml += resultItem;
        });
        
        resultHtml += "</table>";
        return resultHtml;
    },
    
    // qualifiedSearchResults = {result: , key: }
    _displayPassageResults : function(searchResults, passageId, goToChapter, sortOrder, contentGenerator) {
        var results = "";
        
        var lastUnicode = "";
                
        $.each(searchResults, function(i, item) {
            if(item.accentedUnicode && item.accentedUnicode != lastUnicode) {
                results += "<th class='searchResultStrongHeader' colspan='2'>";
                
                if(sortOrder == VOCABULARY) {
                    results += (item.stepGloss == undefined ? "-" : item.stepGloss) + " (<em>" + item.stepTransliteration + "</em> ; " +  "<span class='ancientSearch'>" + item.accentedUnicode + "</span>)";
                } else {
                    results += "<span class='ancientSearch'>" + item.accentedUnicode + "</span> (<em>" + item.stepTransliteration + "</em>): " + (item.stepGloss == undefined ? "-" : item.stepGloss);
                }
                
                results += "</th>";
                lastUnicode = item.accentedUnicode;
            }
            
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
        var sortOrder = searchQueryResults.order;

        //remove any hebrew language css
        step.util.getPassageContainer(passageId).removeClass("hebrewLanguage greekLanguage");
        
        if (searchResults == undefined || searchResults.length == 0) {
            results += "<span class='notApplicable'>No search results were found</span>";
            this._changePassageContent(passageId, results);
            this._doOriginalWordToolbar(searchQueryResults.definitions, passageId);
            return;
        } 
        
        if(searchQueryResults.query.startsWith("d=") || searchQueryResults.query.startsWith("dr=")) {
            results += this._displayTimelineEventResults(searchResults, passageId);
        } else if(searchQueryResults.query.startsWith("s=")) {
            results += this._displaySubjectResults(searchResults, passageId);
        } else {
            results += "<table class='searchResults'>";
            
            if(searchResults[0].preview) {
                    results += this._displayPassageResults(searchResults, passageId, true, sortOrder);
            } else {
                //we customize the generation of the actual verse content to add the version
                results += this._displayPassageResults(searchResults, passageId, true, sortOrder, function (item) {
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

        this._doOriginalWordToolbar(searchQueryResults.definitions, passageId);
    },
    
    _doOriginalWordToolbar : function(definitions, passageId) {
        var passageContent = step.util.getPassageContent(passageId);
        if(definitions) {
            //add a toolbar in there for each word
            var originalWordToolbar = $("<div class='originalWordSearchToolbar'></div>");
            var values = step.search.original.filters[passageId] || [];
            
            $.each(definitions, function(i, item) {
                var link = "<input type='checkbox' " +
                		"value='" + (item.matchingForm == undefined ? "" : item.matchingForm) +"' " +
                	    "id='ows_" + passageId + "_" + i + "' " +
                        ($.inArray(item.matchingForm, values) != -1 ? "checked='checked'" : "") +   
                    " /><label for='ows_" + passageId + "_" + i  + "' ><span class='ancientSearchButton'>" + item.matchingForm + "</span>" +
//                		"<br />" + item.stepTransliteration + 
                		"<br />";
                if(item.gloss) {
                    link += item.gloss;
                }
                link += "</label>";
                originalWordToolbar.append(link);
            });
            
            originalWordToolbar.find("input").button().click(function() {
                //get all selected checkboxes
                var options = $(this).closest(".originalWordSearchToolbar").find("input[type='checkbox']:checked");
                var filter = [];
                $.each(options, function(i, item) {
                  filter.push($(this).val());  
                });
                
                step.search.original.filters[passageId] = filter;
                step.search.original.search(passageId);
            });
            
            originalWordToolbar.buttonset();

            var bar = $("<div></div>").append("<h4 class='lexicalGrouping'>The following lexical forms have been included in the search:</h4>").append(originalWordToolbar).append("<hr />");
            passageContent.prepend(bar);
        }
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





