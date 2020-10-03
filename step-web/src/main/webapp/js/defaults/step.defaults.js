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
GREEK_WORDS_MEANING = [__s.greek_word_meaning, __s.greek_word_meaning_explanation];
HEBREW_WORDS_MEANING = [__s.hebrew_word_meaning, __s.hebrew_word_meaning_explanation];

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
    pageSize : 20,
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
        interOptionsExplanations : [ __s.passage_interleaved_explanation, __s.passage_interleaved_with_comparison_explanation, __s.passage_interlinear_explanation, __s.passage_column_view_explanation, __s.passage_column_view_with_compare_explanation],
        interNamedOptions : ["INTERLEAVED", "INTERLEAVED_COMPARE", "INTERLINEAR", "COLUMN", "COLUMN_COMPARE"]
        
    },
    analysis : {
        scope : [__s.stats_scope_chapter, __s.stats_scope_nearby_chapters, __s.stats_scope_book],
        scopeType : ["CHAPTER", "NEAR_BY_CHAPTER", "BOOK" ],
		sort: [__s.stats_sort_by_frequency, __s.stats_sort_by_reversed_frequency, __s.stats_sort_by_alphabet],
		sortType: ["SORT_BY_FREQUENCY", "SORT_BY_REVERSED_FREQUENCY", "SORT_BY_ALPHABET"],
        kind : [__s.stats_type_word, __s.stats_type_text, __s.stats_type_subjects],
        //it is deliberate that PASSAGE has no associated translation. - it should be the last unmatched element
        kindTypes : ["WORD", "TEXT", "SUBJECT", "PASSAGE"]
    },
    infoPopup : {
        lexiconTab : 0,
        wordleTab : 1
    },
    search: {
        luceneValidateRegex : /[!\&\|/():~\[\]{}^+-]|AND|OR|NOT/,
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
                                { label: __s.epistles,            value: __s.epistles_range }
                              ],
            //order and indices are important below
            simpleTextTypes : [ __s.simple_search_types_one_or_more_words, 
                                __s.simple_search_types_all_words, 
                                __s.simple_search_types_exact, 
                                __s.simple_search_types_similar, 
                                __s.simple_search_types_starting_with],
            simpleTextTypesReference : ["ANY", "ALL", "EXACT", "SIMILAR", "STARTS"],
            simpleTextSecondaryTypes : [  __s.simple_search_types_one_or_more_words,
                                         __s.simple_search_types_all_words, __s.simple_search_types_exact,
                                         __s.simple_search_types_similar, __s.simple_search_types_starting_with],
            simpleTextSecondaryTypesReference : ["ANY", "ALL", "EXACT", "SIMILAR", "STARTS"],
            simpleTextIncludes : [__s.simple_search_includes_include, __s.simple_search_includes_exclude],
            simpleTextIncludesReference : ["INCLUDE", "EXCLUDE"],
            simpleTextProximities : [__s.simple_search_proximity_same_verse,
                                     __s.simple_search_proximity_1_verse,
                                     __s.simple_search_proximity_2_verses,
                                     __s.simple_search_proximity_6_verses,
                                     __s.simple_search_proximity_30_verses],
            simpleTextProximitiesReference : [0,1,2,6,30],
            simpleTextSortBy : [ __s.simple_search_sort_by_relevance, __s.simple_search_sort_by_bible_occurence]
            
        },
        
        original : {
            originalTypes : [WORDS_MEANING[0],
                             GREEK_WORDS[0],
                             GREEK_WORDS_MEANING[0],
                             HEBREW_WORDS[0],
                             HEBREW_WORDS_MEANING[0]
            ],
            //Need to match LexicalSuggestionType
            originalTypesReference : ["MEANING", "GREEK", "GREEK_MEANING", "HEBREW", "HEBREW_MEANING"],
            originalForms: [ALL_RELATED, ALL_FORMS, SPECIFIC_FORM],
            originalFormsReference : ["RELATED", "ALL", "SPECIFIC"],
            originalSorting:        [SCRIPTURE, VOCABULARY, ORIGINAL_SPELLING],
            originalSortingValues:  ["SCRIPTURE", "VOCABULARY", "ORIGINAL_SPELLING"]
        },

        subject : {
            subjectTypes : ["ESV", "NAVE", "NAVE_EXTENDED"]
        }
    }
};
