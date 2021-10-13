/*******************************************************************************
 * Copyright (c) 2012, Directors of the Tyndale STEP Project
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without 
 * modification, are permitted provided that the following conditions 
 * are met:
 *
 * Redistributions of source code must retain the above copyright 
 * notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright 
 * notice, this list of conditions and the following disclaimer in 
 * the documentation and/or other materials provided with the 
 * distribution.
 * Neither the name of the Tyndale House, Cambridge (www.TyndaleHouse.com)  
 * nor the names of its contributors may be used to endorse or promote 
 * products derived from this software without specific prior written 
 * permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT 
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS 
 * FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE 
 * COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, 
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, 
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; 
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER 
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT 
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF 
 * THE POSSIBILITY OF SUCH DAMAGE.
 ******************************************************************************/
package com.tyndalehouse.step.core.service.search.impl;

import com.tyndalehouse.step.core.data.EntityDoc;
import com.tyndalehouse.step.core.data.EntityIndexReader;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.exceptions.LuceneSearchException;
import com.tyndalehouse.step.core.exceptions.TranslatedException;
import com.tyndalehouse.step.core.models.*;
import com.tyndalehouse.step.core.models.search.KeyedSearchResultSearchEntry;
import com.tyndalehouse.step.core.models.search.KeyedVerseContent;
import com.tyndalehouse.step.core.models.search.LexicalSearchEntry;
import com.tyndalehouse.step.core.models.search.SearchEntry;
import com.tyndalehouse.step.core.models.search.SearchResult;
import com.tyndalehouse.step.core.models.search.SubjectSuggestion;
import com.tyndalehouse.step.core.models.search.SuggestionType;
import com.tyndalehouse.step.core.models.search.SyntaxSuggestion;
import com.tyndalehouse.step.core.models.search.TextSuggestion;
import com.tyndalehouse.step.core.models.search.TimelineEventSearchEntry;
import com.tyndalehouse.step.core.models.search.VerseSearchEntry;
import com.tyndalehouse.step.core.service.BibleInformationService;
import com.tyndalehouse.step.core.service.JSwordRelatedVersesService;
import com.tyndalehouse.step.core.service.LexiconDefinitionService;
import com.tyndalehouse.step.core.service.SearchService;
import com.tyndalehouse.step.core.service.StrongAugmentationService;
import com.tyndalehouse.step.core.service.TimelineService;
import com.tyndalehouse.step.core.service.helpers.GlossComparator;
import com.tyndalehouse.step.core.service.helpers.VersionResolver;
import com.tyndalehouse.step.core.service.impl.AbortQueryException;
import com.tyndalehouse.step.core.service.impl.IndividualSearch;
import com.tyndalehouse.step.core.service.impl.SearchQuery;
import com.tyndalehouse.step.core.service.impl.SearchType;
import com.tyndalehouse.step.core.service.jsword.JSwordMetadataService;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordSearchService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.service.search.SubjectSearchService;
import com.tyndalehouse.step.core.utils.StringConversionUtils;
import com.tyndalehouse.step.core.utils.StringUtils;
import com.tyndalehouse.step.core.utils.language.GreekUtils;
import org.apache.lucene.queryParser.MultiFieldQueryParser;
import org.apache.lucene.queryParser.ParseException;
import org.apache.lucene.queryParser.QueryParser;
import org.apache.lucene.queryParser.QueryParser.Operator;
import org.apache.lucene.search.Query;
import org.apache.lucene.util.Version;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.passage.*;
import org.crosswire.jsword.versification.Versification;
import org.crosswire.jsword.versification.VersificationsMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Singleton;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.tyndalehouse.step.core.service.helpers.OriginalWordUtils.STRONG_NUMBER_FIELD;
import static com.tyndalehouse.step.core.service.helpers.OriginalWordUtils.convertToSuggestion;
import static com.tyndalehouse.step.core.service.helpers.OriginalWordUtils.getFilter;
import static com.tyndalehouse.step.core.service.impl.VocabularyServiceImpl.padStrongNumber;
import static com.tyndalehouse.step.core.utils.StringUtils.isNotBlank;
import static java.lang.Character.isDigit;

/**
 * A federated search service implementation. see {@link SearchService}
 *
 * @author chrisburrell
 */
@Singleton
public class SearchServiceImpl implements SearchService {
    /**
     * value representing a vocabulary sort
     */
    public static final String VOCABULARY_SORT = "VOCABULARY";
    /**
     * value representing a original spelling sort
     */
    public static final Pattern AUGMENTED_STRONG = Pattern.compile("strong:([Hh]\\d+[a-zA-Z])");
    public static final Pattern ALL_STRONGS = Pattern.compile("strong:[GgHh]\\d+\\w?");
    public static final Object ORIGINAL_SPELLING_SORT = "ORIGINAL_SPELLING";
    private static final String SYNTAX_FORMAT = "[%s...]";
    private static final String[] BASE_GREEK_VERSIONS = new String[]{"WHNU", "Byz", "LXX"};
    private static final String BASE_HEBREW_VERSION = "OSMHB";
    private static final Logger LOGGER = LoggerFactory.getLogger(SearchServiceImpl.class);
    private static final String STRONG_QUERY = "strong:";
    private static final String NO_FILTER = "all";
    private final JSwordSearchService jswordSearch;
    private final TimelineService timeline;
    private final EntityIndexReader definitions;
    private final EntityIndexReader specificForms;
    private final EntityIndexReader timelineEvents;
    private final JSwordMetadataService jswordMetadata;
    private final JSwordVersificationService versificationService;
    private final SubjectSearchService subjects;
    private final BibleInformationService bibleInfoService;
    private final StrongAugmentationService strongAugmentationService;
    private VersionResolver versionResolver;
    private LexiconDefinitionService lexiconDefinitionService;
    private JSwordRelatedVersesService relatedVerseService;

    /**
     * @param jswordSearch              the search service
     * @param subjects                  the service that executes Subject searches
     * @param timeline                  the timeline service
     * @param bibleInfoService          the service to get information about various bibles/commentaries
     * @param entityManager             the manager for all entities stored in lucene
     * @param relatedVerseService       the related verse service
     * @param strongAugmentationService the service to deal with augmentation of strong numbers
     */
    @Inject
    public SearchServiceImpl(final JSwordSearchService jswordSearch,
                             final JSwordMetadataService jswordMetadata,
                             final JSwordVersificationService versificationService,
                             final SubjectSearchService subjects, final TimelineService timeline,
                             final BibleInformationService bibleInfoService,
                             final EntityManager entityManager,
                             final VersionResolver versionResolver,
                             final LexiconDefinitionService lexiconDefinitionService,
                             final JSwordRelatedVersesService relatedVerseService,
                             final StrongAugmentationService strongAugmentationService) {
        this.jswordSearch = jswordSearch;
        this.jswordMetadata = jswordMetadata;
        this.versificationService = versificationService;
        this.subjects = subjects;
        this.timeline = timeline;
        this.bibleInfoService = bibleInfoService;
        this.versionResolver = versionResolver;
        this.lexiconDefinitionService = lexiconDefinitionService;
        this.relatedVerseService = relatedVerseService;
        this.strongAugmentationService = strongAugmentationService;
        this.definitions = entityManager.getReader("definition");
        this.specificForms = entityManager.getReader("specificForm");
        this.timelineEvents = entityManager.getReader("timelineEvent");

    }

    @Override
    public long estimateSearch(final SearchQuery sq) {
        try {
            return this.jswordSearch.estimateSearchResults(sq);
            // CHECKSTYLE:OFF
        } catch (final Exception ex) {
            // we catch any exception, trace log it
            LOGGER.warn("Unable to estimate query: [{}]. Exception message: [{}]", sq.getOriginalQuery(),
                    ex.getMessage());
            LOGGER.trace(ex.getMessage(), ex);
            return -1;
            // CHECKSTYLE:ON
        }
    }

    @Override
    public AbstractComplexSearch runQuery(final List<SearchToken> searchTokens, final String options,
                                          final String display, final int page, final String filter,
                                          final String sort, int context, final String originalItems, final String userLanguage) {
        final long timeStart = System.currentTimeMillis();
        boolean hasSearches = false;
        final List<String> versions = new ArrayList<String>(4);
        final StringBuilder references = new StringBuilder();
        final List<SearchToken> referenceTokens = new ArrayList<SearchToken>(2);

        //first pass - get the set of versions and references
        for (SearchToken token : searchTokens) {
            if (SearchToken.VERSION.equals(token.getTokenType())) {
                versions.add(token.getToken());
            } else if (SearchToken.REFERENCE.equals(token.getTokenType())) {
                if (references.length() > 0) {
                    references.append(';');
                }

                //add to list, so that we can replace all tokens later
                referenceTokens.add(token);
                references.append(token.getToken());
            } else {
                //any other token means at least 1 search
                hasSearches = true;
            }
        }

        //now default the version and references
        if (versions.size() == 0) {
            String defaultVersion = JSwordPassageService.REFERENCE_BOOK;
			if (userLanguage.toLowerCase().startsWith("es")) defaultVersion = "SpaRV1909";
            else if (userLanguage.equalsIgnoreCase("zh")) defaultVersion = "CUns";
            else if (userLanguage.equalsIgnoreCase("zh_tw")) defaultVersion = "CUn";
			else if (userLanguage.toLowerCase().startsWith("bg")) defaultVersion = "BulProtRev";
			else if (userLanguage.toLowerCase().startsWith("hi")) defaultVersion = "HinULB";
            versions.add(defaultVersion);
            searchTokens.add(new SearchToken("version", defaultVersion));
        }

        if (!hasSearches && references.length() == 0) {
            String bestReference = getBestReference(versions);
            references.append(bestReference);
            final SearchToken token = new SearchToken("reference", bestReference);
            searchTokens.add(token);
            referenceTokens.add(token);
        }

        //second pass add all 
        final String aggregatedReferences = references.toString();
        final AbstractComplexSearch complexSearch = runCorrectSearch(
                versions, aggregatedReferences,
                options, StringUtils.isBlank(display) ? InterlinearMode.NONE.name() : display,
                searchTokens, page, filter, sort, context, userLanguage);

        aggregateTokenForPassageLookups(searchTokens, referenceTokens, complexSearch);
        enhanceSearchTokens(versions.get(0), searchTokens);
        signRequest(complexSearch, display, filter, sort, context, originalItems);
        complexSearch.setSearchTokens(searchTokens);
        complexSearch.setTimeTookTotal(System.currentTimeMillis() - timeStart);
        return complexSearch;
    }

    /**
     * The best reference will always be the NT reference, unless there's a hebrew text (and not a greek). The only
     * exception to this rule is when hebrew appears first in the list, then we will show the hebrew.
     *
     * @param versions the list of versions
     * @return the best reference
     */
    private String getBestReference(List<String> versions) {
        for (int i = 0; i < versions.size(); i++) {
            String v = versions.get(i);
            return this.jswordMetadata.getFirstChapterReference(v);
        }
        //should never happen
        return "Gen.1";
    }

    /**
     * This method allows us to sign and uniquely identify a request. Most parameters should make it into this list.
     * Page numbers don't, as we always restore the first page!
     *
     * @param sort          the type of sort
     * @param context       the number of extra verses to lookup for each verse
     * @param display       the type of display mode, e.g. interlinear, interleaved, etc.
     * @param filter        the filter to apply (or blank to retrieve just the particular search query.
     * @param originalItems the original query as given by the user
     * @return the results from the search/passage lookup
     */
    private void signRequest(final AbstractComplexSearch result,
                             final String display,
                             final String filter,
                             final String sort,
                             int context,
                             final String originalItems) {
        StringBuilder key = new StringBuilder();
        key.append(StringUtils.getNonNullString(originalItems, ""));
        key.append('-');
        key.append(StringUtils.getNonNullString(display, "NONE"));
        key.append('-');

        if (result.getSearchType() != SearchType.PASSAGE) {
            key.append(StringUtils.getNonNullString(filter, ""));
            key.append('-');
            key.append(StringUtils.getNonNullString(sort, ""));
            key.append('-');
            key.append(context);
        }
        result.setSignature(key.toString());
    }

    /**
     * For passage lookups, we have a restriction on how many verses we can show
     *
     * @param searchTokens    the original list of search tokens
     * @param referenceTokens the reference tokens that formed what we passed down to the service layer
     * @param complexSearch   the results of the complex search
     */
    private void aggregateTokenForPassageLookups(final List<SearchToken> searchTokens, final List<SearchToken> referenceTokens, final AbstractComplexSearch complexSearch) {
        if (complexSearch instanceof OsisWrapper) {
            searchTokens.removeAll(referenceTokens);
            searchTokens.add(new SearchToken(SearchToken.REFERENCE, ((OsisWrapper) complexSearch).getOsisId()));
        }
    }

    /**
     * Enhances search tokens, meaning that <p /> for versions, we return the short initials and long initials in the
     * form of a 'BibleVersion' <p /> for references, we return the keywraper <p /> for strong numbers, we return the
     * lexicon suggestion <p /> for everything else, null.
     *
     * @param masterVersion the master version to use looking up references and so on.
     * @param searchTokens  a list of search tokens
     * @return with enhanced meta data if any
     */
    private void enhanceSearchTokens(final String masterVersion, final List<SearchToken> searchTokens) {
        for (SearchToken st : searchTokens) {
            final String tokenType = st.getTokenType();
            if (SearchToken.VERSION.equals(tokenType)) {
                //probably need to show the short initials
                BibleVersion version = new BibleVersion();
                version.setInitials(this.versionResolver.getLongName(st.getToken()));
                version.setShortInitials(this.versionResolver.getShortName(st.getToken()));
                st.setEnhancedTokenInfo(version);
            } else if (SearchToken.REFERENCE.equals(tokenType)) {
                //could take the key but that has all parts combined
                final KeyWrapper kw = this.bibleInfoService.getKeyInfo(st.getToken(), masterVersion, masterVersion);
                String osisRef;
                if (kw.getKey() != null) {
                    osisRef = kw.getKey().getOsisRef();
                } else {
                    osisRef = kw.getOsisKeyId();
                }
                final BookName bookName = new BookName(kw.getName(), kw.getName(), BookName.Section.PASSAGE, false, osisRef);
                st.setEnhancedTokenInfo(bookName);
            } else if (SearchToken.STRONG_NUMBER.equals(tokenType)) {
                //hit the index and look up that strong number...
                st.setEnhancedTokenInfo(this.lexiconDefinitionService.lookup(st.getToken()));
            } else if (SearchToken.EXACT_FORM.equals(tokenType)) {
                ExactForm ef = new ExactForm();
                ef.setText(st.getToken());
                ef.setGreek(GreekUtils.isGreekText(st.getToken()));
                st.setEnhancedTokenInfo(ef);
            } else if (SearchToken.SUBJECT_SEARCH.equals(tokenType) ||
                    SearchToken.NAVE_SEARCH.equals(tokenType) ||
                    SearchToken.NAVE_SEARCH_EXTENDED.equals(tokenType)) {
                SubjectSuggestion ss = new SubjectSuggestion();
                ss.setValue(st.getToken());
                st.setEnhancedTokenInfo(ss);
            } else if (SearchToken.TEXT_SEARCH.equals(tokenType)) {
                final TextSuggestion textSuggestion = new TextSuggestion();
                textSuggestion.setText(st.getToken());
                st.setEnhancedTokenInfo(textSuggestion);
            } else if (SearchToken.MEANINGS.equals(tokenType)) {
                final LexiconSuggestion meaningSuggestion = new LexiconSuggestion();
                meaningSuggestion.setGloss(st.getToken());
                st.setEnhancedTokenInfo(meaningSuggestion);
            } else if (SearchToken.SYNTAX.equals(tokenType)) {
                SyntaxSuggestion ss = new SyntaxSuggestion();

                //take the first word, after stripping off any reference, etc.
                String syntax = st.getToken();
                syntax = IndividualSearch.MAIN_RANGE.matcher(syntax).replaceAll("").replaceAll("[()]+", "");
                if (StringUtils.isBlank(syntax)) {
                    ss.setText("...");
                } else {
                    int i = syntax.indexOf(' ');
                    if (i != -1) {
                        ss.setText(String.format(SYNTAX_FORMAT, syntax.substring(0, i + 1)));
                    } else {
                        ss.setText(String.format(SYNTAX_FORMAT, syntax));
                    }
                }
                ss.setValue(st.getToken());
                st.setEnhancedTokenInfo(ss);
            } else if (SearchToken.TOPIC_BY_REF.equals(st.getTokenType())) {
                final TextSuggestion enhancedTokenInfo = new TextSuggestion();
                enhancedTokenInfo.setText(st.getToken());
                st.setEnhancedTokenInfo(enhancedTokenInfo);
            } else if (SearchToken.RELATED_VERSES.equals(st.getTokenType())) {
                final TextSuggestion enhancedTokenInfo = new TextSuggestion();
                enhancedTokenInfo.setText(st.getToken());
                st.setEnhancedTokenInfo(enhancedTokenInfo);
            }
            //nothing to do 
            // for subject searches or 
            // for text searches or 
            // for meaning searches
        }
    }

    /**
     * Establishes what the correct search should be and kicks off the right type of search
     *
     * @param versions    the list of versions
     * @param references  the list of references
     * @param options     the options
     * @param displayMode the display mode
     * @param filter      the filter to apply to the searhc. Blank retrieves just the current search term, non-blank
     *                    returns all non-blank (usually strong) matches as well
     * @param sort        the sort to apply to the search
     * @param pageNumber  the page number of interest
     * @param context     amount of context to be used in searhc
     * @return the results
     */
    private AbstractComplexSearch runCorrectSearch(final List<String> versions, final String references,
                                                   final String options, final String displayMode,
                                                   final List<SearchToken> searchTokens,
                                                   final int pageNumber,
                                                   final String filter,
                                                   final String sort,
                                                   final int context, final String userLanguage) {
        final List<IndividualSearch> individualSearches = new ArrayList<IndividualSearch>(2);
        String[] filters = null;
        if (StringUtils.isNotBlank(filter)) {
            filters = StringUtils.split(filter, "[ ,]+");
        }

        for (SearchToken st : searchTokens) {
            final String tokenType = st.getTokenType();
            if (SearchToken.STRONG_NUMBER.equals(tokenType)) {
                addWordSearches(versions, references, st.getToken(), filters, individualSearches);
            } else if (SearchToken.MEANINGS.equals(tokenType)) {
                addSearch(SearchType.ORIGINAL_MEANING, versions, references, st.getToken(), filters, individualSearches);
            } else if (SearchToken.EXACT_FORM.equals(tokenType)) {
                addSearch(SearchType.EXACT_FORM, versions, references, st.getToken(), filters, individualSearches);
            } else if (SearchToken.TEXT_SEARCH.equals(tokenType)) {
                addSearch(SearchType.TEXT, versions, references, st.getToken(), null, individualSearches);
            } else if (SearchToken.SUBJECT_SEARCH.equals(tokenType)) {
                addSearch(SearchType.SUBJECT_SIMPLE, versions, references, st.getToken(), null, individualSearches);
            } else if (SearchToken.NAVE_SEARCH.equals(tokenType)) {
                addSearch(SearchType.SUBJECT_EXTENDED, versions, references, st.getToken(), null, individualSearches);
            } else if (SearchToken.NAVE_SEARCH_EXTENDED.equals(tokenType)) {
                addSearch(SearchType.SUBJECT_FULL, versions, references, st.getToken(), null, individualSearches);
            } else if (SearchToken.TOPIC_BY_REF.equals(tokenType)) {
                addSearch(SearchType.SUBJECT_RELATED, versions, references, st.getToken(), null, individualSearches);
            } else if (SearchToken.RELATED_VERSES.equals(tokenType)) {
                addSearch(SearchType.RELATED_VERSES, versions, references, st.getToken(), null, individualSearches);
            } else if (SearchToken.SYNTAX.equals(tokenType)) {
                //add a number of searches from the query syntax given...
                final IndividualSearch[] searches = new SearchQuery(st.getToken(), versions.toArray(new String[versions.size()]), null,
                        context, pageNumber, references).getSearches();
                for (IndividualSearch is : searches) {
                    individualSearches.add(is);
                }
            } else {
                //ignore and do nothing - generally references and versions which have been parsed already
            }
        }
        //we will prefer a word search to anything else...
        if (individualSearches.size() != 0) {
            return this.search(new SearchQuery(pageNumber, context, displayMode, sort, individualSearches.toArray(new IndividualSearch[individualSearches.size()])), options);
        }
        return this.bibleInfoService.getPassageText(
                versions.get(0), references, options,
                getExtraVersions(versions), displayMode, userLanguage);
    }

    /**
     * @param searchType         the type of search
     * @param versions           the list of versions
     * @param references         the list of references
     * @param searchTerm         the search term
     * @param individualSearches the searches to perform
     */
    private void addSearch(final SearchType searchType, final List<String> versions, final String references, final String searchTerm, final String[] filter, final List<IndividualSearch> individualSearches) {
        individualSearches.add(new IndividualSearch(searchType, versions, searchTerm, getInclusion(references), filter));
    }

    /**
     * Adds a word search to the list of searches we will perform
     *
     * @param versions           the list of versions
     * @param references         the list of references
     * @param strong             the strong number/criteria
     * @param individualSearches the searches to perform
     */
    private void addWordSearches(final List<String> versions, final String references,
                                 String strong, final String[] filters,
                                 final List<IndividualSearch> individualSearches) {
        String[] filtersForSearch = filters;
        if (filters == null || filters.length == 0) {
            filtersForSearch = new String[]{strong};
        } else if (filters.length == 1 && NO_FILTER.equals(filters[0])) {
            filtersForSearch = new String[0];
        }

        boolean isGreek = strong.charAt(0) == 'G';
        individualSearches.add(new IndividualSearch(
                isGreek ? SearchType.ORIGINAL_GREEK_RELATED : SearchType.ORIGINAL_HEBREW_RELATED,
                versions, strong, getInclusion(references), filtersForSearch));
    }


    /**
     * @param references wraps the references in a jsword-lucene query syntax
     * @return the string of references
     */
    private String getInclusion(final String references) {
        if (references == null) {
            return null;
        }

        if ("".equals(references.trim())) {
            return "";
        }
        return String.format("+[%s]", references);
    }

    /**
     * Concatenates all but the last versions
     *
     * @param versions version
     * @return the concatenated versions
     */
    private String getExtraVersions(final List<String> versions) {
        StringBuilder sb = new StringBuilder(128);
        for (int i = 1; i < versions.size(); i++) {
            if (sb.length() > 0) {
                sb.append(',');
            }
            sb.append(versions.get(i));
        }
        return sb.toString();
    }

    @Override
    public SearchResult search(final SearchQuery sq) {
    	return search(sq, "");
    }

    public SearchResult search(final SearchQuery sq, final String options) {
        try {
            return doSearch(sq, options);
            // CHECKSTYLE:OFF
        } catch (final LuceneSearchException ex) {
            // CHECKSTYLE:ON
            throw new TranslatedException(ex, "search_invalid");
        }
    }

    /**
     * Carries out the required search
     *
     * @param sq the sq
     * @return the search result
     */
    private SearchResult doSearch(final SearchQuery sq, final String options) {
        final long start = System.currentTimeMillis();

        SearchResult result;
        // if we've only got one search, we want to retrieve the keys, the page, etc. all in one go
        try {

            if (sq.isIndividualSearch()) {
                result = executeOneSearch(sq, options);
            } else {
                result = executeJoiningSearches(sq);
            }
        } catch (final AbortQueryException ex) {
            result = new SearchResult();
        }

        // we split the query into separate searches
        // we run the search against the selected versions

        // we retrieve the keys
        // join the keys
        // return the results

        result.setSearchType(getBestSearchType(sq));
        result.setPageSize(sq.getPageSize());
        result.setPageNumber(sq.getPageNumber());
        result.setTimeTookTotal(System.currentTimeMillis() - start);
        result.setQuery(sq.getOriginalQuery());
        setBestRestriction(sq, result);
        final String[] allVersions = sq.getCurrentSearch().getVersions();
        result.setMasterVersion(this.versionResolver.getShortName(allVersions[0]));
        result.setExtraVersions(StringUtils.join(allVersions, 1));
        specialSort(sq, result);
        enrichWithLanguages(sq, result);
        return result;
    }

    private SearchType getBestSearchType(final SearchQuery sq) {
        IndividualSearch[] searches = sq.getSearches();
        for (IndividualSearch s : searches) {
            //we never return subject searches if we can avoid it
            final SearchType searchType = s.getType();
            if (SearchType.SUBJECT_RELATED != searchType &&
                    SearchType.SUBJECT_EXTENDED != searchType &&
                    SearchType.SUBJECT_FULL != searchType &&
                    SearchType.SUBJECT_SIMPLE != searchType) {
                return searchType;
            }
        }

        //then we only have subject searches
        return searches.length == 1 ? searches[0].getType() : SearchType.TEXT;
    }

    /**
     * Prefers the secondary restriction, if available, over the main range from the text/query syntax
     *
     * @param sq     the search query
     * @param result the result
     */
    private void setBestRestriction(SearchQuery sq, SearchResult result) {
        final String secondaryRange = sq.getLastSearch().getSecondaryRange();
        result.setSearchRestriction(
                StringUtils.isNotBlank(secondaryRange) ? secondaryRange :
                        StringUtils.cleanJSwordRestriction(sq.getLastSearch().getMainRange())
        );
    }

    /**
     * Puts the languages of each module into the result returned to the UI.
     *
     * @param sq     the search query
     * @param result the result
     */
    private void enrichWithLanguages(final SearchQuery sq, final SearchResult result) {
        IndividualSearch lastSearch = sq.getCurrentSearch();
        result.setLanguageCode(jswordMetadata.getLanguages(lastSearch.getVersions()));
    }

    /**
     * We may have a special type of sort to operate
     *
     * @param sq     the search query
     * @param result the result to be sorted
     */
    private void specialSort(final SearchQuery sq, final SearchResult result) {
        // we only do this kind of sort if we have some strong numbers, and at least 2!
        if (result.getStrongHighlights() != null && result.getStrongHighlights().size() > 1) {

            result.setOrder(sq.getSortOrder());
            if (VOCABULARY_SORT.equals(sq.getSortOrder())) {
                sortByStrongNumber(sq, result, new GlossComparator());
            }
        }
    }

    /**
     * For this kind of sort, we find out which strong number is present in a verse, then run a comparator on the strong
     * numbers sorts results by strong number
     *
     * @param sq         the search criteria
     * @param result     results
     * @param comparator the comparator to use to sort the strong numbers
     */
    private void sortByStrongNumber(final SearchQuery sq, final SearchResult result,
                                    final Comparator<? super EntityDoc> comparator) {
        // sq should have the strong numbers, if we're doing this kind of sort
        List<EntityDoc> strongNumbers = sq.getDefinitions();
        if (strongNumbers == null) {
            // stop searching
            LOGGER.warn("Attempting to sort by strong number, but no strong numbers available. ");
            return;
        }

        final Set<String> strongs = new HashSet<String>(result.getStrongHighlights());
        final List<SearchEntry> entries = result.getResults();
        final List<LexicalSearchEntry> noOrder = new ArrayList<LexicalSearchEntry>(0);

        final Map<String, List<LexicalSearchEntry>> keyedOrder = new HashMap<String, List<LexicalSearchEntry>>(
                strongs.size());

        extractAllStrongNumbers(strongs, entries, noOrder, keyedOrder);

        // now work out the order of the strong numbers, probably best in terms of the gloss...
        // order the definitions, then simply re-do the list of verse search entries
        Collections.sort(strongNumbers, comparator);

        // if we have filters, then we need to reduce further...
        strongNumbers = filterDefinitions(sq, strongNumbers);

        // now we have sorted definitions, we need to rebuild the search result
        final List<LexicalSearchEntry> newOrder = rebuildSearchResults(strongNumbers, keyedOrder);

        final String[] filter = sq.getCurrentSearch().getOriginalFilter();
        if (filter == null || filter.length == 0) {
            newOrder.addAll(noOrder);
        }
        result.setResults(specialPaging(sq, newOrder));
    }

    /**
     * Takes a new order and rebuilds a list of search results
     *
     * @param lexiconDefinitions the strong numbers, ordered
     * @param keyedOrder         the set of results to be re-ordered
     * @return a new list of results, now ordered
     */
    private List<LexicalSearchEntry> rebuildSearchResults(final List<EntityDoc> lexiconDefinitions,
                                                          final Map<String, List<LexicalSearchEntry>> keyedOrder) {
        final List<LexicalSearchEntry> newOrder = new ArrayList<LexicalSearchEntry>();
        for (final EntityDoc def : lexiconDefinitions) {
            final List<LexicalSearchEntry> list = keyedOrder.get(def.get(STRONG_NUMBER_FIELD));
            if (list != null) {
                newOrder.addAll(list);
                for (final LexicalSearchEntry e : list) {
                    e.setStepGloss(def.get("stepGloss"));
                    e.setStepTransliteration(def.get("stepTransliteration"));
                    e.setAccentedUnicode(def.get("accentedUnicode"));
                    e.setStrongNumber(def.get("strongNumber"));
                }
            }
        }
        return newOrder;
    }

    /**
     * Extracts all strong numbers from verses
     *
     * @param strongs    a place to store the strong numbers found so far in the search results, identified from the
     *                   search itself
     * @param entries    the verse entries that have been found
     * @param noOrder    the "noOrder" list which will contain all verse entries that cannot be matched
     * @param keyedOrder the new order, to be built up. In this method, we simply store the verses, which are sorted
     *                   later.
     */
    private void extractAllStrongNumbers(final Set<String> strongs, final List<SearchEntry> entries,
                                         final List<LexicalSearchEntry> noOrder, final Map<String, List<LexicalSearchEntry>> keyedOrder) {
        for (final SearchEntry entry : entries) {
            boolean added = false;
            if (entry instanceof VerseSearchEntry) {
                added = reOrderSearchEntry(strongs, keyedOrder, ((VerseSearchEntry) entry).getPreview(), (VerseSearchEntry) entry);
            } else if (entry instanceof KeyedSearchResultSearchEntry) {
                final KeyedSearchResultSearchEntry wrapperEntry = (KeyedSearchResultSearchEntry) entry;
                for (KeyedVerseContent e : wrapperEntry.getVerseContent()) {
                    added = reOrderSearchEntry(strongs, keyedOrder, e.getPreview(), wrapperEntry);
                    if (added) {
                        break;
                    }
                }
            }

            // should never happen
            if (!added) {
                if (entry instanceof LexicalSearchEntry) {
                    noOrder.add((LexicalSearchEntry) entry);
                } else {
                    LOGGER.error("Attempting to sort non LexicalSearchEntry.");
                }
            }
        }
    }

    /**
     * Re-orders the search entry
     *
     * @param strongs     the list of strongs in the verses
     * @param keyedOrder  the order that we're after
     * @param verseText   the OSIS fragment
     * @param parentEntry the entry that we're ordering in the list
     * @return true if the entry was added
     */
    private boolean reOrderSearchEntry(final Set<String> strongs, final Map<String, List<LexicalSearchEntry>> keyedOrder, final String verseText, final LexicalSearchEntry parentEntry) {
        for (final String strong : strongs) {
            if (strong == null) {
                continue;
            }

            if (verseText.contains(this.strongAugmentationService.reduce(strong))) {
                List<LexicalSearchEntry> list = keyedOrder.get(strong);
                if (list == null) {
                    list = new ArrayList<LexicalSearchEntry>(16);
                    keyedOrder.put(strong, list);
                }
                list.add(parentEntry);
                return true;
            }
        }
        return false;
    }

    /**
     * Sets the definitions onto the result object
     *
     * @param result             the result object
     * @param lexiconDefinitions the definitions that have been included in the search
     */
    private void setDefinitionForResults(final SearchResult result, final List<EntityDoc> lexiconDefinitions, SuggestionType suggestionType) {
        Collections.sort(lexiconDefinitions, new GlossComparator());
        List<LexiconSuggestion> suggestions = new ArrayList(lexiconDefinitions.size());
        for (final EntityDoc def : lexiconDefinitions) {
            suggestions.add(convertToSuggestion(def, null));
        }
        result.setDefinitions(suggestions);
    }

    /**
     * Keep definitions that are of current interest to the user... Remove all others
     *
     * @param sq                 the search criteria
     * @param lexiconDefinitions the definitions
     * @return a list of definitions to be included in the filter
     */
    private List<EntityDoc> filterDefinitions(final SearchQuery sq, final List<EntityDoc> lexiconDefinitions) {
        final String[] originalFilter = sq.getCurrentSearch().getOriginalFilter();
        if (originalFilter == null || originalFilter.length == 0) {
            return lexiconDefinitions;
        }

        // bubble intersection, acceptable, because we're only dealing with a handful of definitions
        final List<EntityDoc> keep = new ArrayList<EntityDoc>(lexiconDefinitions.size());

        for (final EntityDoc def : lexiconDefinitions) {
            for (final String filteredValue : originalFilter) {
                if (def.get("strongNumber").equals(filteredValue)) {
                    keep.add(def);

                    // break out of filterValues loop, and proceed with next definition
                    break;
                }
            }
        }
        return keep;
    }

    /**
     * Reduces the results to the correct page size
     *
     * @param sq       the search criteria
     * @param newOrder the elements in the new order
     * @return the new set of results, with only pageSize results
     */
    private List<SearchEntry> specialPaging(final SearchQuery sq, final List<LexicalSearchEntry> newOrder) {
        // runs paging after a special sort
        // we want
        final int firstElement = (sq.getPageNumber() - 1) * sq.getPageSize();
        final int lastElement = firstElement + sq.getPageSize();

        final List<SearchEntry> newResults = new ArrayList<SearchEntry>(sq.getPageSize());
        for (int ii = firstElement; ii < lastElement && ii < newOrder.size(); ii++) {
            newResults.add(newOrder.get(ii));
        }
        return newResults;
    }

    /**
     * Runs a number of searches, joining them together (known as "refine searches")
     *
     * @param sq the search query object
     * @return the list of search results
     */
    private SearchResult executeJoiningSearches(final SearchQuery sq) {
        // we run each individual search, and get all the keys out of each

        final Key results = runJoiningSearches(sq);
        return getSearchResultFromKey(sq, results);
    }

    /**
     * From a specific key, gets the search results
     *
     * @param sq      the search query
     * @param results the key to the results
     * @return the search result
     */
    private SearchResult getSearchResultFromKey(SearchQuery sq, Key results) {
        // now retrieve the results, we need to retrieve results as per the last type of search run
        // so first of all, we set the allKeys flag to false
        sq.setAllKeys(false);
        return extractSearchResults(sq, results);
    }

    /**
     * Runs each individual search and gives us a key that can be used to retrieve every passage
     *
     * @param sq the search query
     * @return the key to all the results
     */
    private Key runJoiningSearches(final SearchQuery sq) {
        Key results = null;
        do {
            switch (sq.getCurrentSearch().getType()) {
                case TEXT:
                    results = intersect(results, this.jswordSearch.searchKeys(sq));
                    break;
                case ORIGINAL_GREEK_FORMS:
                case ORIGINAL_HEBREW_FORMS:
                    adaptQueryForStrongSearch(sq);
                    results = intersect(results, this.jswordSearch.searchKeys(sq));
                    break;
                case ORIGINAL_GREEK_RELATED:
                case ORIGINAL_HEBREW_RELATED:
                    Set<String> strongs = adaptQueryForRelatedStrongSearch(sq);
                    results = intersect(results, this.runStrongTextSearchKeys(sq, strongs));
                    break;
                case ORIGINAL_MEANING:
                    adaptQueryForMeaningSearch(sq);
                    results = intersect(results, this.jswordSearch.searchKeys(sq));
                    break;
                case EXACT_FORM:
                    results = intersect(results, getKeysFromOriginalText(sq));
                    break;
                case SUBJECT_SIMPLE:
                case SUBJECT_EXTENDED:
                case SUBJECT_FULL:
                    sq.getCurrentSearch().setType(SearchType.SUBJECT_FULL);
                    sq.getCurrentSearch().setQuery(sq.getCurrentSearch().getOriginalQuery());
                    results = intersect(results, this.subjects.getKeys(sq));
                    break;
                case SUBJECT_RELATED:
                    //no override for related topic searches
                    results = intersect(results, this.subjects.getKeys(sq));
                    break;
                case RELATED_VERSES:
                    results = intersect(results, this.relatedVerseService.getRelatedVerses(sq.getCurrentSearch().getVersions()[0], sq.getCurrentSearch().getQuery()));
                    break;
                default:
                    throw new TranslatedException("refinement_not_supported", sq.getOriginalQuery(), sq
                            .getCurrentSearch().getType().getLanguageKey());
            }
        } while (sq.hasMoreSearches());
        return results;
    }

    /**
     * executes a single search
     *
     * @param sq the search query results
     * @return the results from the search query
     */
    private SearchResult executeOneSearch(final SearchQuery sq, final String options) {
        final IndividualSearch currentSearch = sq.getCurrentSearch();
        switch (currentSearch.getType()) {
            case TEXT:
                return runTextSearch(sq);
            case SUBJECT_SIMPLE:
            case SUBJECT_EXTENDED:
            case SUBJECT_FULL:
            case SUBJECT_RELATED:
                return this.subjects.search(sq);
            case TIMELINE_DESCRIPTION:
                return runTimelineDescriptionSearch(sq);
            case TIMELINE_REFERENCE:
                return runTimelineReferenceSearch(sq);
            case ORIGINAL_GREEK_FORMS:
            case ORIGINAL_HEBREW_FORMS:
                return runAllFormsStrongSearch(sq);
            case ORIGINAL_GREEK_RELATED:
                return runRelatedStrongSearch(sq, SuggestionType.GREEK, options);
            case ORIGINAL_HEBREW_RELATED:
                return runRelatedStrongSearch(sq, SuggestionType.HEBREW, options);
            case EXACT_FORM:
                return runExactOriginalTextSearch(sq);
            case ORIGINAL_MEANING:
                return runMeaningSearch(sq);
            case RELATED_VERSES:
                return runRelatedVerses(sq);
            default:
                throw new TranslatedException("search_unknown");
        }
    }

    /**
     * Extracts the search results from a multi-joined search query
     *
     * @param sq      the search query
     * @param results the results
     * @return the search results ready to send back
     */
    private SearchResult extractSearchResults(final SearchQuery sq, final Key results) {
        final IndividualSearch lastSearch = sq.getLastSearch();
        switch (lastSearch.getType()) {
            case TEXT:
            case ORIGINAL_MEANING:
            case EXACT_FORM:
            case ORIGINAL_GREEK_FORMS:
            case ORIGINAL_GREEK_RELATED:
            case ORIGINAL_HEBREW_RELATED:
            case ORIGINAL_HEBREW_FORMS:
            case SUBJECT_EXTENDED:
            case SUBJECT_RELATED:
            case SUBJECT_SIMPLE:
            case SUBJECT_FULL:
                return buildCombinedVerseBasedResults(sq, results, ""); // Options from user was not passed to this method
            default:
                throw new TranslatedException("refinement_not_supported", sq.getOriginalQuery(), lastSearch
                        .getType().getLanguageKey());

        }
    }

    /**
     * Runs a verse related search
     *
     * @param sq the search query
     * @return the search result, as per other searches, of related verses
     */
    private SearchResult runRelatedVerses(final SearchQuery sq) {
        return this.buildCombinedVerseBasedResults(sq,
                this.relatedVerseService.getRelatedVerses(sq.getCurrentSearch().getVersions()[0], sq.getCurrentSearch().getQuery()), ""); // Options from user was not passed to this method
    }

    /**
     * Runs a text search, collapsing the restrictions if need be
     *
     * @param sq the search query contained
     * @return the search to be run
     */
    private SearchResult runTextSearch(final SearchQuery sq) {
        final IndividualSearch currentSearch = sq.getCurrentSearch();
        final String secondaryRange = currentSearch.getSecondaryRange();
        if (StringUtils.isBlank(secondaryRange)) {
            return runJSwordTextSearch(sq);
        }

        final String[] versions = currentSearch.getVersions();
        final String masterVersion = versions[0];
        final Book bookFromVersion = this.versificationService.getBookFromVersion(masterVersion);
        Key k;
        try {
            k = bookFromVersion.getKey(secondaryRange);
        } catch (NoSuchKeyException e) {
            throw new TranslatedException(e, "invalid_reference_in_book", secondaryRange, bookFromVersion.getInitials());
        }

        k = intersect(k, this.jswordSearch.searchKeys(sq));
        return this.getSearchResultFromKey(sq, k);
    }

    /**
     * Runs a query against the JSword modules backends
     *
     * @param sq the search query contained
     * @return the search to be run
     */
    private SearchResult runJSwordTextSearch(SearchQuery sq) {
        final IndividualSearch is = sq.getCurrentSearch();

        // for text searches, we may have a prefix of t=
        final String[] versions = is.getVersions();

        if (versions.length == 1) {
            return this.jswordSearch.search(sq, versions[0]);
        }

        // build combined results
        return buildCombinedVerseBasedResults(sq, this.jswordSearch.searchKeys(sq), ""); // Options from user was not passed to this method
    }

    /**
     * Obtains all glosses with a particular meaning
     *
     * @param sq the search criteria
     * @return the result from the corresponding text search
     */
    private SearchResult runMeaningSearch(final SearchQuery sq) {
        final Set<String> strongs = adaptQueryForMeaningSearch(sq);

        final SearchResult result = runStrongTextSearch(sq, strongs, ""); // Options from user was not passed to this method
        setDefinitionForResults(result, sq.getDefinitions(), SuggestionType.MEANING);

        // we can now use the filter and save ourselves some effort
        return result;
    }

    /**
     * Runs the search looking for particular strongs
     *
     * @param sq the search query
     * @return the results
     */
    private SearchResult runAllFormsStrongSearch(final SearchQuery sq) {
        final Set<String> strongs = adaptQueryForStrongSearch(sq);

        // and then run the search
        return runStrongTextSearch(sq, strongs, ""); // Options from user was not passed to this method
    }

    /**
     * Looks up all related strongs then runs the search
     *
     * @param sq the search query
     * @return the results
     */
    private SearchResult runRelatedStrongSearch(final SearchQuery sq, SuggestionType suggestionType, final String options) {
        final Set<String> strongs = adaptQueryForRelatedStrongSearch(sq);

        // and then run the search
        final SearchResult result = runStrongTextSearch(sq, strongs, options);
        setDefinitionForResults(result, sq.getDefinitions(), suggestionType);
        return result;
    }

    /**
     * Runs a search using the exact form, i.e. without any lookups, a straight text search on the original text
     *
     * @param sq the search criteria
     * @return the results to be shown
     */
    private SearchResult runExactOriginalTextSearch(final SearchQuery sq) {
        final Key resultKeys = getKeysFromOriginalText(sq);

        final SearchResult searchResult = extractSearchResults(sq, resultKeys);
        searchResult.setStrongHighlights(getStrongs(this.specificForms.search("accentedUnicode", sq.getCurrentSearch().getQuery())));

        // return results from appropriate versions
        return searchResult;
    }

    /**
     * @param forms a set of docs representing specific forms
     * @return a list of strong numbers
     */
    private List<String> getStrongs(final EntityDoc[] forms) {
        List<String> strongs = new ArrayList<String>(forms.length);
        for (EntityDoc f : forms) {
            strongs.add(f.get("strongNumber"));
        }
        return strongs;
    }

    /**
     * Runs the search, and adds the strongs to the search results
     *
     * @param sq      the search criteria
     * @param strongs the list of strongs that were searched for
     * @return the search results
     */
    private SearchResult runStrongTextSearch(final SearchQuery sq, final Set<String> strongs, final String options) {
        Key key = runStrongTextSearchKeys(sq, strongs);

        final SearchResult textResults = buildCombinedVerseBasedResults(sq, key, options);

        textResults.setStrongHighlights(new ArrayList<>(strongs));
        return textResults;
    }

    private Key runStrongTextSearchKeys(SearchQuery sq, Set<String> strongs) {
        //searches for strongs have got slightly more complicated now that we are doing augmented strongs as well...
        // so for example, we have the query strong:h00001 strong:h00002 strong:h00003 strong:h00004a strong:h00005a
        //we can run a simple strong search for normal strong numbers
        //unfortunately, we to need run an extra search for each of the augmented strong numbers

        //split the search into the standard search and the other searches
        final List<String> augmentedStrongs = new ArrayList<>(2);
        final IndividualSearch currentSearch = sq.getCurrentSearch();
        String currentQuery = currentSearch.getQuery();
        final Matcher matchAugmentedStrongs = AUGMENTED_STRONG.matcher(currentQuery);
        final String simpleStrongSearch = matchAugmentedStrongs.replaceAll("");

        matchAugmentedStrongs.reset();
        while (matchAugmentedStrongs.find()) {
            final String as = matchAugmentedStrongs.group(1);
            augmentedStrongs.add(as);
            strongs.add(this.strongAugmentationService.reduce(as).toUpperCase());
        }

        //run the normal search
        Key key = null;
        if (simpleStrongSearch.contains("strong")) {
            currentSearch.setQuery(simpleStrongSearch);
            key = this.jswordSearch.searchKeys(sq);
        }

        //work out the original query without the normal strong numbers
        String blankQuery = ALL_STRONGS.matcher(currentQuery).replaceAll("");
        for (String as : augmentedStrongs) {
            currentSearch.setQuery(blankQuery + " strong:" + as.substring(0, as.length() - 1));
            Key potentialAugmentedResults = this.jswordSearch.searchKeys(sq);

            //filter results by augmented strong data set
            Key masterAugmentedFilter = this.strongAugmentationService.getVersesForAugmentedStrong(as);
            potentialAugmentedResults = intersect(potentialAugmentedResults, masterAugmentedFilter);

            //add results to current set
            if (key == null) {
                key = potentialAugmentedResults;
            } else {
                key.addAll(potentialAugmentedResults);
            }
        }

        currentSearch.setQuery(currentQuery);
        return key;
    }

    /**
     * Searches for all passage references matching an original text (greek or hebrew)
     *
     * @param sq the search criteria
     * @return the list of verses
     */
    private Key getKeysFromOriginalText(final SearchQuery sq) {
        final IndividualSearch currentSearch = sq.getCurrentSearch();
        final String[] soughtAfterVersions = currentSearch.getVersions();

        // overwrite version with WHNU to do the search
        if (GreekUtils.isGreekText(sq.getCurrentSearch().getQuery())) {
            currentSearch.setVersions(BASE_GREEK_VERSIONS);
            currentSearch.setQuery(unaccent(currentSearch.getQuery(), sq), true);
        } else {
            currentSearch.setVersions(new String[]{BASE_HEBREW_VERSION});
            currentSearch.setQuery(unaccent(currentSearch.getQuery(), sq), true);
        }

        final Key resultKeys = this.jswordSearch.searchKeys(sq);

        // now overwrite again and do the intersection with the normal text
        currentSearch.setVersions(soughtAfterVersions);
        return resultKeys;
    }

    /**
     * Attempts to recognise the input, whether it is a strong number, a transliteration or a hebrew/greek word
     *
     * @param sq the search criteria
     * @return a list of match strong numbers
     */
    private Set<String> getStrongsFromTextCriteria(final SearchQuery sq) {
        // we can be dealing with a strong number, if so, no work required...
        final String query = sq.getCurrentSearch().getQuery();
        if (query.isEmpty()) {
            return new HashSet<String>(0);
        }

        final boolean wildcard = query.charAt(query.length() - 1) == '*';
        final String searchQuery = wildcard ? query.replace("*", "%") : query;

        Set<String> strongs;
        if (isDigit(query.charAt(0)) || (query.length() > 1 && isDigit(query.charAt(1)))) {
            // then we're dealing with a strong number, without its G/H prefix
            strongs = getStrongsFromCurrentSearch(sq);
        } else {
            // we're dealing with some sort of greek/hebrew form so we search the tables for this
            strongs = searchTextFieldsForDefinition(searchQuery);
        }

        // run rules for transliteration
        if (strongs.isEmpty()) {
            // run transliteration rules
            final SearchType type = sq.getCurrentSearch().getType();
            if (type.isGreek() || type.isHebrew()) {
                strongs = findByTransliteration(searchQuery, type.isGreek());
            }
        }

        // now filter
        return strongs;
    }

    /**
     * Looks up all the glosses for a particular word, and then adapts to strong search and continues as before
     *
     * @param sq search criteria
     * @return a list of matching strongs
     */
    private Set<String> adaptQueryForMeaningSearch(final SearchQuery sq) {
        final String query = sq.getCurrentSearch().getQuery();


        final QueryParser queryParser = new QueryParser(Version.LUCENE_30, "translationsStem",
                this.definitions.getAnalyzer());
        queryParser.setDefaultOperator(Operator.OR);

        try {
            //we need to also add the step gloss, but since we need the analyser for stems,
            //we want to use the query parser that does the tokenization for us
            //could probably do better if required
            String[] terms = StringUtils.split(query);
            StringBuilder finalQuery = new StringBuilder();
            for (String term : terms) {
                final String escapedTerm = QueryParser.escape(term);
                finalQuery.append(escapedTerm);
                finalQuery.append(" stepGlossStem:");
                finalQuery.append(escapedTerm);
            }

            final Query parsed = queryParser.parse("-stopWord:true " + finalQuery.toString());
            final EntityDoc[] matchingMeanings = this.definitions.search(parsed);

            final Set<String> strongs = new HashSet<String>(matchingMeanings.length);
            for (final EntityDoc d : matchingMeanings) {
                final String strongNumber = d.get(STRONG_NUMBER_FIELD);
                if (isInFilter(strongNumber, sq)) {
                    strongs.add(strongNumber);
                }
            }

            final String textQuery = getQuerySyntaxForStrongs(strongs, sq);
            sq.getCurrentSearch().setQuery(textQuery, true);
            sq.setDefinitions(matchingMeanings);

            // return the strongs that the search will match
            return strongs;
        } catch (final ParseException e) {
            throw new TranslatedException(e, "search_invalid");
        }
    }

    /**
     * @param strongNumber the strong number
     * @param sq           the search query
     * @return true if the filter is empty, or if the strong number is in the filter
     */
    private boolean isInFilter(final String strongNumber, final SearchQuery sq) {
        final String[] originalFilter = sq.getCurrentSearch().getOriginalFilter();
        if (originalFilter == null || originalFilter.length == 0) {
            return true;
        }

        for (final String filterValue : originalFilter) {
            if (filterValue.equals(strongNumber)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Takes in a normal search query, and adapts the current search by rewriting the query syntax so that it can be
     * parsed by JSword
     *
     * @param sq the search query
     * @return a list of all matching strongs
     */
    private Set<String> adaptQueryForStrongSearch(final SearchQuery sq) {
        final Set<String> strongs = getStrongsFromTextCriteria(sq);

        final String textQuery = getQuerySyntaxForStrongs(strongs, sq);

        // we can now change the individual search query, to the real text search
        sq.getCurrentSearch().setQuery(textQuery, true);

        // return the strongs that the search will match
        return strongs;
    }

    /**
     * Adapts the search query to be used in a strong search
     *
     * @param sq the search query object
     * @return a list of strong numbers
     */
    private Set<String> adaptQueryForRelatedStrongSearch(final SearchQuery sq) {
        final Set<String> strongsFromQuery = getStrongsFromTextCriteria(sq);

        // look up the related strong numbers
        final Set<String> filteredStrongs = new HashSet<>(strongsFromQuery.size());
        final StringBuilder fullQuery = new StringBuilder(64);
        final QueryParser p = new QueryParser(Version.LUCENE_30, STRONG_NUMBER_FIELD,
                this.definitions.getAnalyzer());

        // get all words suggested in query
        final String query = retrieveStrongs(strongsFromQuery);
        final EntityDoc[] results = retrieveStrongDefinitions(sq, filteredStrongs, p, query, fullQuery);

        // now get all related words:
        final String relatedQuery = getRelatedStrongQuery(results);
        final EntityDoc[] relatedResults = retrieveStrongDefinitions(sq, filteredStrongs, p, relatedQuery,
                fullQuery);

        setUniqueConsideredDefinitions(sq, results, relatedResults);

        // append range to query
        sq.getCurrentSearch().setQuery(fullQuery.toString().toLowerCase(), true);
        return filteredStrongs;
    }

    /**
     * Sets up all definitions that are related, regardless of whether they have been filtered out. Makes a unique set
     * of these
     *
     * @param sq             the search query that is being
     * @param results        the results from the direct strong search
     * @param relatedResults the related results
     */
    private void setUniqueConsideredDefinitions(final SearchQuery sq, final EntityDoc[] results,
                                                final EntityDoc[] relatedResults) {
        // make entity docs unique:
        final Set<EntityDoc> joinedDocs = new HashSet<EntityDoc>(relatedResults.length + results.length);
        final Set<String> strongNumbers = new HashSet<String>(relatedResults.length + results.length);
        for (final EntityDoc queryDoc : results) {
            final String strong = queryDoc.get(STRONG_NUMBER_FIELD);
            if (!strongNumbers.contains(strong)) {
                joinedDocs.add(queryDoc);
                strongNumbers.add(strong);
            }
        }

        for (final EntityDoc relatedDoc : relatedResults) {
            final String strong = relatedDoc.get(STRONG_NUMBER_FIELD);
            if (!strongNumbers.contains(strong)) {
                joinedDocs.add(relatedDoc);
                strongNumbers.add(strong);
            }
        }
        sq.setDefinitions(new ArrayList<EntityDoc>(joinedDocs));
    }

    /**
     * Builds a query that gets the related-strong number entity documents
     *
     * @param results the source numbers
     * @return the query that gets the related numbers
     */
    private String getRelatedStrongQuery(final EntityDoc[] results) {
        final StringBuilder relatedQuery = new StringBuilder(results.length * 7);
        for (final EntityDoc doc : results) {
            String relatedNumbers = doc.get("relatedNumbers");
            if (StringUtils.isNotBlank(relatedNumbers)) {
                relatedQuery.append(relatedNumbers.replace(',', ' '));
            }
        }
        return relatedQuery.toString();
    }

    /**
     * Retrieves the correct entity documents from a built up query and passed in parser
     *
     * @param sq              the search query
     * @param filteredStrongs the list of filtered strongs so far
     * @param p               the parser
     * @param query           the query
     * @param fullQuery       the full query so far
     * @return the list of matched entity documents
     */
    private EntityDoc[] retrieveStrongDefinitions(final SearchQuery sq, final Set<String> filteredStrongs,
                                                  final QueryParser p, final String query, final StringBuilder fullQuery) {
        if (StringUtils.isNotBlank(query)) {

            Query q;
            try {
                q = p.parse(query);
            } catch (final ParseException e) {
                throw new TranslatedException(e, "search_invalid");
            }
            final EntityDoc[] results = this.definitions.search(q);

            for (final EntityDoc doc : results) {
                // remove from matched strong if not in filter
                final String strongNumber = doc.get(STRONG_NUMBER_FIELD);
                if (isInFilter(strongNumber, sq)) {
                    filteredStrongs.add(strongNumber);
                    fullQuery.append(STRONG_QUERY);
                    fullQuery.append(strongNumber);
                    fullQuery.append(' ');
                }
            }
            return results;
        }
        return new EntityDoc[0];
    }

    /**
     * Searches the underlying DB for the relevant entry
     *
     * @param searchQuery the query that is being passed in
     * @return the list of strongs matched
     */
    private Set<String> searchTextFieldsForDefinition(final String searchQuery) {
        // first look through the text forms
        final EntityDoc[] results = this.specificForms.search(new String[]{"accentedUnicode"},
                searchQuery, null, null, false);
        if (results.length == 0) {
            return lookupFromLexicon(searchQuery);
        }

        // if we matched more than one, then we don't have our assumed uniqueness... log warning and
        // continue with first matched strong
        final Set<String> listOfStrongs = new HashSet<String>();
        for (final EntityDoc f : results) {
            listOfStrongs.add(f.get(STRONG_NUMBER_FIELD));
        }
        return listOfStrongs;
    }

    /**
     * Looks up the search criteria from the lexicon
     *
     * @param query the query
     * @return a list of strong numbers
     */
    private Set<String> lookupFromLexicon(final String query) {
        // if we still have nothing, then look through the definitions
        final QueryParser parser = new QueryParser(Version.LUCENE_30, "accentedUnicode",
                this.definitions.getAnalyzer());
        Query parsed;
        try {
            parsed = parser.parse(QueryParser.escape(query));
        } catch (final ParseException e) {
            throw new TranslatedException(e, "search_invalid");
        }

        final EntityDoc[] results = this.definitions.search(parsed);

        final Set<String> matchedStrongs = new HashSet<String>();
        for (final EntityDoc d : results) {
            matchedStrongs.add(d.get(STRONG_NUMBER_FIELD));
        }

        return matchedStrongs;
    }

    /**
     * removes accents, hebrew vowels, etc.
     *
     * @param query query
     * @param sq    the current query criteria
     * @return the unaccented string
     */
    private String unaccent(final String query, final SearchQuery sq) {
        final SearchType currentSearchType = sq.getCurrentSearch().getType();
        switch (currentSearchType) {
            case EXACT_FORM:
                return StringConversionUtils.unAccent(StringConversionUtils.unAccent(query, true), false, false);
            case ORIGINAL_GREEK_FORMS:
            case ORIGINAL_GREEK_RELATED:
                return StringConversionUtils.unAccent(query, true);
            case ORIGINAL_HEBREW_FORMS:
            case ORIGINAL_HEBREW_RELATED:
                return StringConversionUtils.unAccent(query, false);

            default:
                return query;
        }
    }

    /**
     * Runs the transliteration rules on the input in an attempt to match an entry in the lexicon
     *
     * @param query   the query to be found
     * @param isGreek true to indicate Greek, false to indicate Hebrew
     * @return the strongs that have been found/matched.
     */
    private Set<String> findByTransliteration(final String query, final boolean isGreek) {
        // first find by transliterations that we have
        final String lowerQuery = query.toLowerCase(Locale.ENGLISH);

        final String simplifiedTransliteration = OriginalWordSuggestionServiceImpl
                .getSimplifiedTransliterationClause(isGreek, lowerQuery, false);

        final EntityDoc[] specificFormEntities = this.specificForms.searchSingleColumn(
                "simplifiedTransliteration", simplifiedTransliteration, getFilter(isGreek));

        // finally, if we haven't found anything, then abort
        if (specificFormEntities.length != 0) {
            final Set<String> strongs = new HashSet<String>(specificFormEntities.length);
            // nothing to search for..., so abort query
            for (final EntityDoc f : specificFormEntities) {
                strongs.add(f.get(STRONG_NUMBER_FIELD));
            }
            return strongs;
        }

        final MultiFieldQueryParser queryParser = new MultiFieldQueryParser(Version.LUCENE_30, new String[]{
                "simplifiedTransliteration", "stepTransliteration", "otherTransliteration"},
                this.definitions.getAnalyzer()
        );

        try {
            final Query luceneQuery = queryParser.parse("-stopWord:true " + lowerQuery);
            final EntityDoc[] results = this.definitions.search(luceneQuery);

            if (results.length == 0) {
                throw new AbortQueryException("No definitions found for input");
            }
            final Set<String> strongs = new HashSet<String>(results.length);
            for (final EntityDoc d : results) {
                strongs.add(d.get(STRONG_NUMBER_FIELD));
            }
            return strongs;
        } catch (final ParseException e) {
            throw new TranslatedException(e, "search_invalid");
        }

    }

    /**
     * splits up the query syntax and returns a list of all strong numbers required
     *
     * @param sq the search query
     * @return the list of strongs
     */
    private Set<String> getStrongsFromCurrentSearch(final SearchQuery sq) {
        final IndividualSearch currentSearch = sq.getCurrentSearch();
        final String searchStrong = currentSearch.getQuery();

        LOGGER.debug("Searching for strongs [{}]", searchStrong);
        return splitToStrongs(searchStrong, sq.getCurrentSearch().getType());
    }

    /**
     * Runs a timeline description search
     *
     * @param sq the search query
     * @return the search results
     */
    private SearchResult runTimelineDescriptionSearch(final SearchQuery sq) {
        return buildTimelineSearchResults(sq,
                this.timelineEvents.searchSingleColumn("name", sq.getCurrentSearch().getQuery()));
    }

    /**
     * Runs a timeline search, keyed by reference
     *
     * @param sq the search query
     * @return the search results
     */
    private SearchResult runTimelineReferenceSearch(final SearchQuery sq) {
        final EntityDoc[] events = this.timeline.lookupEventsMatchingReference(sq.getCurrentSearch()
                .getQuery());
        return buildTimelineSearchResults(sq, events);
    }

    /**
     * Construct the relevant entity structure to represent timeline search results
     *
     * @param sq     the search query
     * @param events the list of events retrieved
     * @return the search results
     */
    private SearchResult buildTimelineSearchResults(final SearchQuery sq, final EntityDoc[] events) {
        final List<SearchEntry> results = new ArrayList<SearchEntry>();
        final SearchResult r = new SearchResult();
        r.setResults(results);

        for (final EntityDoc e : events) {
            final String refs = e.get("storedReferences");
            final String[] references = StringUtils.split(refs);

            final List<VerseSearchEntry> verses = new ArrayList<VerseSearchEntry>();

            // TODO FIXME: REFACTOR to only make 1 jsword call?
            for (final String ref : references) {
                // TODO: REFACTOR only supports one version lookup
                final VerseSearchEntry verseEntry = new VerseSearchEntry();
                verses.add(verseEntry);
            }

            final TimelineEventSearchEntry entry = new TimelineEventSearchEntry();
            entry.setId(e.get("id"));
            entry.setDescription(e.get("name"));
            entry.setVerses(verses);
            results.add(entry);
        }
        return r;
    }

    /**
     * @param strongs a list of strongs
     * @param sq      the current search criteria containing the range of interest
     * @return the query syntax
     */
    private String getQuerySyntaxForStrongs(final Set<String> strongs, final SearchQuery sq) {
        final StringBuilder query = new StringBuilder(64);

        // adding a space in front in case we prepend a range
        query.append(' ');
        for (final String s : strongs) {
            query.append(STRONG_QUERY);
            query.append(s);
            query.append(' ');
        }

        final String mainRange = sq.getCurrentSearch().getMainRange();
        if (isNotBlank(mainRange)) {
            query.insert(0, mainRange);

        }
        return query.toString().trim().toLowerCase();
    }

    /**
     * Gets a query that retrieves a list of strong numbers. This query is used agains the lexicon definitions lucene
     * index, not the JSword-managed Bibles
     *
     * @param strongsFromQuery the strong numbers to select
     * @return a query looking up all the Strong numbers
     */
    private String retrieveStrongs(final Set<String> strongsFromQuery) {
        final StringBuilder query = new StringBuilder(strongsFromQuery.size() * 6 + 16);
//        query.append("-stopWord:true ");
        for (final String strong : strongsFromQuery) {
            query.append(strong);
            query.append(' ');
        }
        return query.toString();
    }

    /**
     * Parses the search query, returned in upper case in case a database lookup is required
     *
     * @param searchStrong the search query
     * @param searchType   type of search, this includes greek vs hebrew...
     * @return the list of strongs
     */
    private Set<String> splitToStrongs(final String searchStrong, final SearchType searchType) {
        final List<String> strongs = Arrays.asList(searchStrong.split("[, ;]+"));
        final Set<String> strongList = new HashSet<>();
        for (final String s : strongs) {
            //if non-augmented, we take the string
            final String prefixedStrong = isDigit(s.charAt(0)) ? getPrefixed(s, searchType) : s;
            String paddedStrong = padStrongNumber(prefixedStrong.toUpperCase(Locale.ENGLISH), false);

            if(Character.isDigit(paddedStrong.charAt(paddedStrong.length() - 1))) {
                Character suffix = this.strongAugmentationService.getAugmentedStrongSuffix(s);
                if (suffix != null) {
                    //add the suffix back
                    paddedStrong += suffix;
                }
            }
            strongList.add(paddedStrong);
        }
        return strongList;
    }

    /**
     * @param s          the string to add a prefix to
     * @param searchType the type of search
     * @return the prefixed string with H/G
     */
    private String getPrefixed(final String s, final SearchType searchType) {
        switch (searchType) {
            case ORIGINAL_GREEK_FORMS:
            case ORIGINAL_GREEK_RELATED:
                return 'G' + s;
            case ORIGINAL_HEBREW_FORMS:
            case ORIGINAL_HEBREW_RELATED:
                return 'H' + s;
            default:
                return null;

        }
    }

    /**
     * Builds the combined results
     *
     * @param sq      the search query object
     * @param results the set of keys that have been retrieved by each search
     * @return the set of results
     */
    private SearchResult buildCombinedVerseBasedResults(final SearchQuery sq, final Key results, final String options) {

        // combine the results into 1 giant keyed map
        final IndividualSearch currentSearch = sq.getCurrentSearch();

        Key adaptedResults = results;
        if(adaptedResults == null) {
            adaptedResults = PassageKeyFactory.instance().createEmptyKeyList(this.versificationService.getVersificationForVersion(JSwordPassageService.BEST_VERSIFICATION));
        }

        int total = adaptedResults.getCardinality();
        final Key pagedKeys = this.jswordSearch.rankAndTrimResults(sq, adaptedResults);

        // retrieve scripture content and set up basics
        final SearchResult resultsForKeys = this.jswordSearch.getResultsFromTrimmedKeys(sq, currentSearch.getVersions(), total, pagedKeys, options);
        resultsForKeys.setTotal(this.jswordSearch.getTotal(adaptedResults));
        resultsForKeys.setQuery(sq.getOriginalQuery());
        return resultsForKeys;
    }

    /**
     * Keeps keys of "results" where they are also in searchKeys
     *
     * @param results    the existing results that have already been obtained. If null, then searchKeys is returned
     * @param searchKeys the search keys of the current search
     * @return the intersection of both Keys, or searchKeys if results is null
     */
    private Key intersect(final Key results, final Key searchKeys) {
        //haven't started interesecting yet? just use the other side
        if (results == null) {
            return searchKeys;
        }

        //if the other side is empty, then we have no results
        if (searchKeys == null) {
            return results instanceof VerseKey ? new RangedPassage(((VerseKey) results).getVersification()) : new DefaultKeyList();
        }

        Key versifiedSearchKeys = searchKeys;
        if (results instanceof VerseKey && searchKeys instanceof VerseKey) {
            //get the results v11n
            final VerseKey resultVerses = (VerseKey) results;
            final VerseKey searchVerses = (VerseKey) searchKeys;

            if (LOGGER.isTraceEnabled()) {
                LOGGER.trace("Full results: [{}], secondary search [{}]", resultVerses.getOsisRef(), searchVerses.getOsisRef());
            }

            Versification v11nResults = resultVerses.getVersification();
            Versification v11nSearchKeys = searchVerses.getVersification();
            if (!v11nResults.equals(v11nSearchKeys)) {
                versifiedSearchKeys = VersificationsMapper.instance().map(KeyUtil.getPassage(searchKeys), v11nResults);
            }
        }


        // otherwise we interesect and adjust the "total"
        results.retainAll(versifiedSearchKeys);

        if (LOGGER.isTraceEnabled()) {
            LOGGER.trace("Results after retain: ", results.getOsisRef());
        }
        return results;
    }
}
