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

////////////////////////////////////////
// LANGUAGE
////////////////////////////////////////
WORDS_MEANING = [__s.words_meaning, __s.words_meaning_explanation];
GREEK_WORDS = [__s.greek_word, __s.greek_word_explanation];
HEBREW_WORDS = [__s.hebrew_word, __s.hebrew_word_explanation];

SPECIFIC_FORM = __s.specific_form;
ALL_FORMS = __s.all_forms;
ALL_RELATED = __s.all_related_words;
SPECIFIC_GRAMMAR = __s.specific_grammar;
ORIGINAL_SPELLING =  __s.original_spelling;
VOCABULARY = __s.vocabulary;
SCRIPTURE= __s.scripture;

if(!window.step) { window.step = {}; }
step.defaults = {
    detailLevel : 0,
    pageSize : 50,
    syncMode : -1,
    passages : [{
            version : 'ESV',
            reference : 'Mat 1',
            options : ["H", "V", "N"]
        }, {
            version : 'ESV',
            reference : 'Gen 1',
            options : ["H", "V", "N"]
        }
    ],
    passage : {
        interOptions : [ __s.passage_interleaved, __s.passage_interleaved_with_comparison, __s.passage_interlinear, __s.passage_column_view, __s.passage_column_view_with_compare],
        interNamedOptions : ["INTERLEAVED", "INTERLEAVED_COMPARE", "INTERLINEAR", "COLUMN", "COLUMN_COMPARE"],
        interOptionsNoInterlinear : [__s.passage_interleaved, __s.passage_interleaved_with_comparison, __s.passage_column_view, __s.passage_column_view_with_compare],
        interNoInterlinearDefault : __s.passage_interleaved,
        interInterlinearDefault : __s.passage_interlinear
    },
    
    search: {
        textual : {
            sortByRelevance : true,
            availableRanges : [ { label: __s.whole_bible,         value: __s.whole_bible_range }, 
                                { label: __s.old_testament,       value: __s.old_testament_range },
                                { label: __s.new_testament,       value: __s.new_testament_range },
                                { label: __s.the_pentateuch,      value: __s.the_pentateuch_range },
                                { label: __s.history_books,       value: __s.history_books_range },
                                { label: __s.poetic_books,        value: __s.poetic_books_range },
                                { label: __s.prophets,            value: __s.prophets_range },
                                { label: __s.gospels_and_acts,    value: __s.gospels_and_acts_range },
                                { label: __s.epistles,            value: __s.epistles_range },
                                { label: __s.list_books,            value: ""}
                              ],
            //order and indices are important below
            simpleTextTypes : [ __s.simple_search_types_one_or_more_words, 
                                __s.simple_search_types_all_words, 
                                __s.simple_search_types_exact, 
                                __s.simple_search_types_similar, 
                                __s.simple_search_types_starting_with],
            simpleTextSecondaryTypes : [ __s.simple_search_types_all_words, __s.simple_search_types_exact],
            simpleTextIncludes : [__s.simple_search_includes_include, __s.simple_search_includes_exclude],
            simpleTextProximities : [__s.simple_search_proximity_same_verse,
                                     __s.simple_search_proximity_1_verse,
                                     __s.simple_search_proximity_2_verses,
                                     __s.simple_search_proximity_6_verses,
                                     __s.simple_search_proximity_30_verses],
            simpleTextSortBy : [ __s.simple_search_sort_by_relevance, __s.simple_search_sort_by_bible_occurence]
            
        },
        
        original : {
            originalTypes : [WORDS_MEANING[0],
                             GREEK_WORDS[0], 
                             HEBREW_WORDS[0]],
            originalForms: [ALL_RELATED, ALL_FORMS, SPECIFIC_FORM],
            originalSorting:        [SCRIPTURE, VOCABULARY, ORIGINAL_SPELLING],
            originalSortingValues:  ["SCRIPTURE", "VOCABULARY", "ORIGINAL_SPELLING"]
        }
    }
};
