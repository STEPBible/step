package com.tyndalehouse.step.rest.controllers;

import com.tyndalehouse.step.core.data.processors.AugmentedStrongProcessor;
import com.tyndalehouse.step.core.models.*;
import com.tyndalehouse.step.core.models.search.*;
import com.tyndalehouse.step.core.service.BibleInformationService;
import com.tyndalehouse.step.core.service.SearchService;
import com.tyndalehouse.step.core.service.SuggestionService;
import com.tyndalehouse.step.core.service.helpers.SuggestionContext;
import com.tyndalehouse.step.core.service.impl.SearchType;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.search.OriginalWordSuggestionService;
import com.tyndalehouse.step.core.service.search.SubjectEntrySearchService;
import com.tyndalehouse.step.core.utils.ConversionUtils;
import com.tyndalehouse.step.core.utils.StringUtils;
import com.yammer.metrics.annotation.Timed;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.regex.Pattern;

import static com.tyndalehouse.step.core.exceptions.UserExceptionType.APP_MISSING_FIELD;
import static com.tyndalehouse.step.core.utils.ValidateUtils.notBlank;

/**
 * Caters for searching across the data base
 */
@Singleton
public class SearchController {
    private static final Pattern SPLIT_TOKENS = Pattern.compile("@");
    private static final Logger LOGGER = LoggerFactory.getLogger(SearchController.class);
    private static final String DEFAULT_OPTIONS = "NHVUG";
    private final SearchService searchService;
    private final SuggestionService suggestionService;
    private final OriginalWordSuggestionService originalWordSuggestions;
    private final SubjectEntrySearchService subjectEntries;
    private final BibleInformationService bibleInformationService;

    /**
     * @param search                  the search service
     * @param originalWordSuggestions the original word suggestions
     * @param subjectEntries          is able to retrieve the search entries
     */
    @Inject
    public SearchController(final SearchService search,
                            final SuggestionService suggestionService,
                            final OriginalWordSuggestionService originalWordSuggestions,
                            final SubjectEntrySearchService subjectEntries,
                            final BibleInformationService bibleInformationService) {
        this.searchService = search;
        this.suggestionService = suggestionService;
        this.originalWordSuggestions = originalWordSuggestions;
        this.subjectEntries = subjectEntries;
        this.bibleInformationService = bibleInformationService;
    }

    /**
     * Suggests options to the user.
     *
     * @param input the input from the user
     */
    @Timed(name = "suggest", group = "search", rateUnit = TimeUnit.SECONDS, durationUnit = TimeUnit.MILLISECONDS)
    public List<AutoSuggestion> suggest(final String input) {
        return this.suggest(input, null);
    }

    /**
     * Suggests options to the user.
     *
     * @param input   the user input
     * @param context any specific user context, such as the selection of a book, or a particular master version already
     *                in the box
     * @return
     */
    public List<AutoSuggestion> suggest(String input, final String context) {
        return suggest(input, context, null, null);
    }

    public List<AutoSuggestion> suggest(final String input, final String context, final String referencesOnly) {
        return suggest(input, context, referencesOnly, null);
    }

        /**
         * Suggests options to the user.
         *
         * @param input          the input from the user
         * @param context        any specific user context, such as the selection of a book, or a particular master version
         *                       already in the box
         * @param referencesOnly true to indicate we only want references back
         */
    @Timed(name = "suggest", group = "search", rateUnit = TimeUnit.SECONDS, durationUnit = TimeUnit.MILLISECONDS)
    public List<AutoSuggestion> suggest(final String input, final String context, final String referencesOnly,
                                        final String searchLanguage) {
        boolean onlyReferences = false;
        if (StringUtils.isNotBlank(referencesOnly)) {
            onlyReferences = Boolean.parseBoolean(referencesOnly);
        }

        if (input.indexOf('=') != -1) {
            return new ArrayList<AutoSuggestion>();
        }

        final List<AutoSuggestion> autoSuggestions = new ArrayList<AutoSuggestion>(128);
        String bookContext = JSwordPassageService.REFERENCE_BOOK;
        String referenceContext = null;
        String limitType = null;
        boolean exampleData = false;

        if (StringUtils.isNotBlank(context)) {
            //there are some context items... Parse them
            //if there is a reference= restriction, then we will only return references, otherwise, we default
            final List<SearchToken> searchTokens = parseTokens(context);
            for (SearchToken st : searchTokens) {
                if (SearchToken.VERSION.equals(st.getTokenType())) {
                    bookContext = st.getToken();
                } else if (SearchToken.REFERENCE.equals(st.getTokenType())) {
                    referenceContext = st.getToken();
                } else if (SearchToken.LIMIT.equals(st.getTokenType())) {
                    limitType = st.getToken();
                } else if (SearchToken.EXAMPLE_DATA.equals(st.getTokenType())) {
                    exampleData = true;
                }
            }
        }

        if (onlyReferences || referenceContext != null) {
            addReferenceSuggestions(limitType, input, autoSuggestions, bookContext, referenceContext);
        } else {
            addDefaultSuggestions(input, autoSuggestions, limitType, bookContext, exampleData, searchLanguage);
        }
        addCountsToSuggestions(autoSuggestions, context);
        return autoSuggestions;
    }

    private void addCountsToSuggestions(List<AutoSuggestion> autoSuggestions, final String context) {
        for (int i = 0; i < autoSuggestions.size(); i ++) {
            AutoSuggestion currentSuggestion = autoSuggestions.get(i);
            String currentType = currentSuggestion.getItemType();
            if (currentType.equals("text")) {
                TextSuggestion text = (TextSuggestion) autoSuggestions.get(i).getSuggestion();
                if (text == null) continue;
                String searchText = text.getText().trim();
                int posOfSpace = searchText.indexOf(" ");
                if (posOfSpace == -1) { // One word
                    if (!searchText.substring(0, 1).equals("\"") && // first and last chars are not a "
                            !searchText.substring(searchText.length() - 1).equals("\"") &&
                            searchText.substring(searchText.length() - 1).equals("*")) { // last char is a *
                        AutoSuggestion newSuggestion = new AutoSuggestion(); // Add a suggestion to search the string with * at the end
                        newSuggestion.setItemType(currentType);
                        TextSuggestion newTextSuggestion = new TextSuggestion();
                        newTextSuggestion.setText("\"" + searchText.substring(0, searchText.length() - 1) + "\"");
                        newSuggestion.setSuggestion(newTextSuggestion);
                        autoSuggestions.add(newSuggestion);
                    }
                } else {
                    String firstWord = searchText.substring(0, posOfSpace);
                    String restOfString = searchText.substring(posOfSpace + 1);
                    if (firstWord.equals("#AND:")) {
                        String[] multiWords = restOfString.split("\\s");
                        searchText = multiWords[0];
                        for (int j = 1; j < multiWords.length; j++) {
                            searchText += "@" + currentType + "=" + multiWords[j];
                        }
                    } else if ((searchText.indexOf('"') == -1) &&
                            (searchText.toLowerCase().indexOf(" and ") == -1) &&
                            (searchText.toLowerCase().indexOf(" or ") == -1)) {
                        AutoSuggestion newSuggestion1 = new AutoSuggestion();
                        newSuggestion1.setItemType(currentType);
                        TextSuggestion newTextSuggestion1 = new TextSuggestion();
                        newTextSuggestion1.setText("#AND: " + searchText);
                        newSuggestion1.setSuggestion(newTextSuggestion1);
                        autoSuggestions.add(newSuggestion1);

                        AutoSuggestion newSuggestion2 = new AutoSuggestion();
                        newSuggestion2.setItemType(currentType);
                        TextSuggestion newTextSuggestion2 = new TextSuggestion();
                        String[] multiWords = searchText.split("\\s");
                        String searchTextWithoutAsterisk = "";
                        for (int j = 0; j < multiWords.length; j++) {
                            if (j > 0) searchTextWithoutAsterisk += " ";
                            searchTextWithoutAsterisk += multiWords[j].split("\\*")[0];
                        }
                        newTextSuggestion2.setText('"' + searchTextWithoutAsterisk + '"');
                        newSuggestion2.setSuggestion(newTextSuggestion2);
                        autoSuggestions.add(newSuggestion2);
                    }
                }
                AbstractComplexSearch result = masterSearch(context + currentType + "=" + searchText, true);
                currentSuggestion.setCount(((SearchResult) result).getTotal());
            }
            else if (currentType.equals("meanings")) {
                LexiconSuggestion meaning = (LexiconSuggestion) currentSuggestion.getSuggestion();
                if (meaning == null) continue;
                currentSuggestion.setCount(((SearchResult) masterSearch(context + currentType + "=" + meaning.getGloss(), true)).getTotal());
            }
            else if (currentType.equals("subject")) {
                SubjectSuggestion subject = (SubjectSuggestion) currentSuggestion.getSuggestion();
                if (subject == null) continue;
                List<SearchType> searchTypes = ((SubjectSuggestion) currentSuggestion.getSuggestion()).getSearchTypes();
                boolean getCount = false;
                if (searchTypes.size() == 3)
                    getCount = true;
                else {
                    for (SearchType thisSearchType: searchTypes) {
                        if (thisSearchType.name().equals("SUBJECT_SIMPLE")) {
                            getCount = true;
                            continue;
                        }
                    }
                }
                if (getCount)
                    currentSuggestion.setCount( ((SearchResult) masterSearch(context + currentType + "=" + subject.getValue(), true)).getTotal() );
            }
        }
    }

    /**
     * @param input                the input entered by the user so far
     * @param autoSuggestions      the list of suggestions
     * @param limitType            only one type of data is requested
     * @param referenceBookContext the reference book (i..e master book) that has already been selected by the user.
     * @param exampleData          example data is requested
     */
    private void addDefaultSuggestions(final String input, final List<AutoSuggestion> autoSuggestions, final String limitType,
                                       final String referenceBookContext, final boolean exampleData, final String searchLanguage) {
        SuggestionContext context = new SuggestionContext();
        context.setMasterBook(referenceBookContext);
        context.setInput(StringUtils.trim(input));
        context.setSearchType(limitType);
        context.setExampleData(exampleData);

        if (exampleData) {
            convert(autoSuggestions, this.suggestionService.getFirstNSuggestions(context), searchLanguage);
        } else if (StringUtils.isBlank(limitType)) {
            // we only return the right set of suggestions if there is a limit type
            convert(autoSuggestions, this.suggestionService.getTopSuggestions(context), searchLanguage);
        } else {
            convert(autoSuggestions, this.suggestionService.getFirstNSuggestions(context), searchLanguage);
        }
    }

    private void convert(final List<AutoSuggestion> autoSuggestions, final SuggestionsSummary topSuggestions,
                         final String searchLanguage) {
        for (SingleSuggestionsSummary summary : topSuggestions.getSuggestionsSummaries()) {
            String currentSearchType = summary.getSearchType();
            if (searchLanguage != null) {
                if (searchLanguage.equals("en")) {
                    if ((!currentSearchType.equals("meanings")) &&
                            (!currentSearchType.equals("subject")) &&
                            (!currentSearchType.equals("text")))
                        continue;
                } else if (searchLanguage.equals("he")) {
                    if ((!currentSearchType.equals("hebrewMeanings")) &&
                            (!currentSearchType.equals("hebrew")))
                        continue;
                } else if (searchLanguage.equals("gr")) {
                    if ((!currentSearchType.equals("greekMeanings")) &&
                            (!currentSearchType.equals("greek")))
                        continue;
                }
            }
            //we render each option
            final List<? extends PopularSuggestion> popularSuggestions = summary.getPopularSuggestions();
            for (PopularSuggestion p : popularSuggestions) {
                AutoSuggestion au = new AutoSuggestion();
                au.setItemType(currentSearchType);
                au.setSuggestion(p);
                autoSuggestions.add(au);
            }

            if (summary.getMoreResults() > 0 && !SearchToken.REFERENCE.equals(summary.getSearchType())) {
                AutoSuggestion au = new AutoSuggestion();
                au.setItemType(currentSearchType);
                au.setGrouped(true);
                au.setCount(summary.getMoreResults());
                au.setMaxReached(SuggestionService.MAX_RESULTS_NON_GROUPED <= summary.getMoreResults());
                au.setExtraExamples(summary.getExtraExamples());
                autoSuggestions.add(au);
            }
        }

        //re-order the greek overflows
        int lastNTWord = -1;
        for(int ii = 0; ii < autoSuggestions.size(); ii++) {
            if(SearchToken.GREEK_MEANINGS.equals(autoSuggestions.get(ii).getItemType())) {
                lastNTWord = ii;
            }

            if(SearchToken.GREEK.equals(autoSuggestions.get(ii).getItemType())) {
                AutoSuggestion as = autoSuggestions.remove(ii);
                autoSuggestions.add(lastNTWord + 1, as);
                lastNTWord++;
            }
        }

    }

    /**
     * Adds the references that match the input
     *
     * @param limitType       limits the types of suggestions to just 1 kind
     * @param input           input from the user
     * @param autoSuggestions the list of suggestions
     * @param version         the version to use in our lookup
     * @param bookScope       the book for which we are looking up chapters
     */
    private void addReferenceSuggestions(final String limitType, final String input, final List<AutoSuggestion> autoSuggestions,
                                         final String version, final String bookScope) {
        addAutoSuggestions(limitType, SearchToken.REFERENCE, autoSuggestions, bibleInformationService.getBibleBookNames(input, version, bookScope));
    }

    /**
     * @param items the list of all items
     */
    public AbstractComplexSearch masterSearch(final String items) {
        return this.masterSearch(items, null, null, null, null, null, null, null, false);
    }

    public AbstractComplexSearch masterSearch(final String items, final boolean countOnly) {
        return this.masterSearch(items, null, null, null, null, null, null, null, countOnly);
    }

    /**
     * @param items   the list of all items
     * @param options current display options
     */
    public AbstractComplexSearch masterSearch(final String items, final String options) {
        return this.masterSearch(items, options, null, null, null, null, null, null, false);
    }

    /**
     * @param items   the list of all items
     * @param options current display options
     * @param display the display options
     */
    public AbstractComplexSearch masterSearch(final String items, final String options, final String display) {
        return this.masterSearch(items, options, display, null, null, null, null, null, false);
    }

    /**
     * @param items      the list of all items
     * @param options    current display options
     * @param display    the display options
     * @param pageNumber the number of the page that is desired
     */
    public AbstractComplexSearch masterSearch(final String items, final String options, final String display, final String pageNumber) {
        return this.masterSearch(items, options, display, pageNumber, null, null, null, null, false);
    }

    /**
     * @param items      the list of all items
     * @param options    current display options
     * @param display    the display options
     * @param pageNumber the number of the page that is desired
     * @param filter     the type of filter required on an original word search
     */
    public AbstractComplexSearch masterSearch(final String items, final String options, final String display, final String pageNumber, final String filter) {
        return this.masterSearch(items, options, display, pageNumber, filter, null, null, null, false);
    }

    /**
     * @param items      the list of all items
     * @param options    current display options
     * @param display    the display options
     * @param pageNumber the number of the page that is desired
     * @param filter     the type of filter required on an original word search
     * @param sort
     */
    public AbstractComplexSearch masterSearch(final String items, final String options, final String display, final String pageNumber, final String filter, final String sort) {
        return this.masterSearch(items, options, display, pageNumber, filter, sort, null, null, false);
    }

    /**
     * @param items      the list of all items
     * @param options    current display options
     * @param display    the display options
     * @param pageNumber the number of the page that is desired
     * @param filter     the type of filter required on an original word search
     * @param context    the amount of context to add to the verses hit by a search
     */
    public AbstractComplexSearch masterSearch(final String items, final String options, final String display, final String pageNumber, final String filter, final String sort, final String context) {
        return this.masterSearch(items, options, display, pageNumber, filter, sort, context, null, false);
    }

    /**
     * @param items      the list of all items
     * @param options    current display options
     * @param display    the display options
     * @param pageNumber the number of the page that is desired
     * @param filter     the type of filter required on an original word search
     * @param context    the amount of context to add to the verses hit by a search
     * @param userLanguage    the language of the user (e.g.: en, zh, es, ...
     */
    @Timed(name = "master-search", group = "search", rateUnit = TimeUnit.SECONDS, durationUnit = TimeUnit.MILLISECONDS)
    public AbstractComplexSearch masterSearch(final String items, final String options, final String display,
                                              final String pageNumber, final String filter, final String sortOrder, final String context, final String userLanguage) {
        return this.masterSearch(items, options, display, pageNumber, filter, sortOrder, context, userLanguage, false);
    }

    public AbstractComplexSearch masterSearch(final String items, final String options, final String display,
                                              final String pageNumber, final String filter, final String sortOrder, final String context, final String userLanguage, final boolean countOnly) {
        final List<SearchToken> searchTokens = parseTokens(items);
        final int page = ConversionUtils.getValidInt(pageNumber, 1);
        final int searchContext = ConversionUtils.getValidInt(context, 0);
        return this.searchService.runQuery(searchTokens, getDefaultedOptions(options), display, page, filter, sortOrder, searchContext, items, userLanguage, countOnly);
    }

    /**
     * Parses a string in the form of a=2|c=1 into a list of search tokens
     *
     * @param items
     * @return
     */
    private List<SearchToken> parseTokens(final String items) {
        String[] tokens;
        if (!StringUtils.isBlank(items))
            tokens = SPLIT_TOKENS.split(items.replaceAll("\\|", "@").replaceAll("@@", "@"));
        else
            tokens = new String[0];

        for (int i = 1; i < tokens.length; i++) { // Handle search parameter with @.  For example: text=morph:H2603A@*Vq*
            if ((tokens[i].indexOf("=") == -1) && 
                ((tokens[i-1].indexOf("text=morph:") == 0) || (tokens[i-1].indexOf("syntax=t=morph:") == 0))) {
                tokens[i-1] += "@" + tokens[i]; // based on the above example, concatenate text=morph:H2603A with *Vq*
                tokens[i] = ""; // based on above example, empty out the element with *Vq*
            }
        }
        List<SearchToken> searchTokens = new ArrayList<SearchToken>();
        for (String t : tokens) {
            int indexOfPrefix = t.indexOf('=');
            if (indexOfPrefix == -1) {
                if (t.length() > 0)
                    LOGGER.warn("Ignoring item: [{}]", t);
                continue;
            }

            String text = t.substring(indexOfPrefix + 1);
            searchTokens.add(new SearchToken(t.substring(0, indexOfPrefix), text));
        }
        return searchTokens;
    }

    /**
     * @param options if null, returns the default options
     * @return the default options for any passage
     */
    private String getDefaultedOptions(final String options) {
        return StringUtils.isBlank(options) ? DEFAULT_OPTIONS : options;
    }

    /**
     * @param autoSuggestions the current suggestions
     * @param suggestions     the list of all suggestions to add
     * @param type            the type of the items
     */
    private void addAutoSuggestions(final String limitType, final String type, final List<AutoSuggestion> autoSuggestions, final List<? extends PopularSuggestion> suggestions) {
        if (StringUtils.isNotBlank(limitType) && !limitType.equals(type)) {
            // we only return the right set of suggestions if there is a limit type
            return;
        }

        //else, we render each option
        for (Object o : suggestions) {
            AutoSuggestion au = new AutoSuggestion();
            au.setItemType(type);
            au.setSuggestion(o);
            autoSuggestions.add(au);
        }
    }


    /**
     * Obtains a list of suggestions to display to the user
     *
     * @param greek true, to indicate Greek
     * @param form  the form input so far
     * @return a list of suggestions
     */
    @Timed(name = "exact-form-lookup", group = "languages", rateUnit = TimeUnit.SECONDS, durationUnit = TimeUnit.MILLISECONDS)
    public List<LexiconSuggestion> getExactForms(final String form, final String greek) {
        notBlank(form, "Blank lexical prefix passed.", APP_MISSING_FIELD);
        return this.originalWordSuggestions.getExactForms(form, Boolean.parseBoolean(greek));
    }

    /**
     * @param root       the root word
     * @param fullHeader the header
     * @param version    to be looked up
     * @return the list of verses for this subject
     */
    public SubjectEntries getSubjectVerses(final String root, final String fullHeader,
                                           final String version) {
        return this.getSubjectVerses(root, fullHeader, version, null, "0");
    }

    /**
     * @param root       the root word
     * @param fullHeader the header
     * @param version    to be looked up
     * @return the list of verses for this subject
     */
    public SubjectEntries getSubjectVerses(final String root, final String fullHeader,
                                           final String version, final String limitingReference) {
        return this.getSubjectVerses(root, fullHeader, version, limitingReference, "0");
    }


    /**
     * @param root       the root word
     * @param fullHeader the header
     * @param version    to be looked up
     * @param reference  the limiting reference
     * @param context    the context to use to expand the references
     * @return the list of verses for this subject
     */
    @Timed(name = "subject-search-verses", group = "search", rateUnit = TimeUnit.SECONDS, durationUnit = TimeUnit.MILLISECONDS)
    public SubjectEntries getSubjectVerses(final String root, final String fullHeader,
                                           final String version, final String reference, final String context) {
        return this.subjectEntries.getSubjectVerses(root, fullHeader, version, reference, ConversionUtils.getValidInt(context, 0));
    }
}
