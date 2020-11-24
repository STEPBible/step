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
package com.tyndalehouse.step.core.guice;

import com.google.inject.TypeLiteral;
import com.google.inject.name.Names;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.data.create.Loader;
import com.tyndalehouse.step.core.data.entities.impl.EntityManagerImpl;
import com.tyndalehouse.step.core.guice.providers.DefaultInstallersProvider;
import com.tyndalehouse.step.core.guice.providers.DefaultVersionsProvider;
import com.tyndalehouse.step.core.guice.providers.OfflineInstallersProvider;
import com.tyndalehouse.step.core.service.jsword.impl.StepConfigValueInterceptor;
import com.tyndalehouse.step.core.service.*;
import com.tyndalehouse.step.core.service.helpers.VersionResolver;
import com.tyndalehouse.step.core.service.impl.*;
import com.tyndalehouse.step.core.service.impl.suggestion.GreekAncientLanguageServiceImpl;
import com.tyndalehouse.step.core.service.impl.suggestion.GreekAncientMeaningServiceImpl;
import com.tyndalehouse.step.core.service.impl.suggestion.HebrewAncientLanguageServiceImpl;
import com.tyndalehouse.step.core.service.impl.suggestion.HebrewAncientMeaningServiceImpl;
import com.tyndalehouse.step.core.service.impl.suggestion.MeaningSuggestionServiceImpl;
import com.tyndalehouse.step.core.service.impl.suggestion.ReferenceSuggestionServiceImpl;
import com.tyndalehouse.step.core.service.impl.suggestion.SuggestionServiceImpl;
import com.tyndalehouse.step.core.service.impl.suggestion.TextSuggestionServiceImpl;
import com.tyndalehouse.step.core.service.jsword.*;
import com.tyndalehouse.step.core.service.jsword.impl.*;
import com.tyndalehouse.step.core.service.search.OriginalWordSuggestionService;
import com.tyndalehouse.step.core.service.search.SubjectEntrySearchService;
import com.tyndalehouse.step.core.service.search.SubjectSearchService;
import com.tyndalehouse.step.core.service.search.impl.OriginalWordSuggestionServiceImpl;
import com.tyndalehouse.step.core.service.search.impl.SearchServiceImpl;
import com.tyndalehouse.step.core.service.search.impl.SubjectEntryServiceImpl;
import com.tyndalehouse.step.core.service.search.impl.SubjectSearchServiceImpl;
import com.tyndalehouse.step.core.utils.AbstractStepGuiceModule;
import org.crosswire.jsword.book.install.Installer;
import org.crosswire.jsword.book.sword.ConfigValueInterceptor;

import java.util.List;
import java.util.Properties;

/**
 * The module configuration that configures the application via guice
 *
 * @author chrisburrell
 */
@SuppressWarnings("PMD.CouplingBetweenObjects")
public class StepCoreModule extends AbstractStepGuiceModule {
    private static final String GUICE_PROPERTIES = "/step.core.properties";

    /**
     * sets up the module with the relevant properties file
     */
    public StepCoreModule() {
        super(GUICE_PROPERTIES);
    }

    @Override
    protected void doConfigure() {
        final Properties stepProperties = getModuleProperties();
        bind(Properties.class).annotatedWith(Names.named("StepCoreProperties")).toInstance(stepProperties);

        // services used on start-up
        bind(AppManagerService.class).to(AppManagerImpl.class).asEagerSingleton();
        bind(SearchService.class).to(SearchServiceImpl.class).asEagerSingleton();
        bind(LanguageService.class).to(LanguageServiceImpl.class).asEagerSingleton();
        bind(JSwordPassageService.class).to(JSwordPassageServiceImpl.class).asEagerSingleton();
        bind(JSwordModuleService.class).to(JSwordModuleServiceImpl.class).asEagerSingleton();
        bind(JSwordMetadataService.class).to(JSwordMetadataServiceImpl.class).asEagerSingleton();
        bind(JSwordVersificationService.class).to(JSwordVersificationServiceImpl.class).asEagerSingleton();
        bind(BibleInformationService.class).to(BibleInformationServiceImpl.class).asEagerSingleton();
        bind(InternationalRangeService.class).to(InternationalRangeServiceImpl.class).asEagerSingleton();
        bind(ModuleService.class).to(ModuleServiceImpl.class).asEagerSingleton();
        bind(PassageOptionsValidationService.class).to(PassageOptionsValidationServiceImpl.class).asEagerSingleton();
        bind(VersionResolver.class).asEagerSingleton();
        bind(SuggestionService.class).to(SuggestionServiceImpl.class).asEagerSingleton();
        bind(HebrewAncientMeaningServiceImpl.class).asEagerSingleton();
        bind(GreekAncientMeaningServiceImpl.class).asEagerSingleton();
        bind(HebrewAncientLanguageServiceImpl.class).asEagerSingleton();
        bind(GreekAncientLanguageServiceImpl.class).asEagerSingleton();
        bind(MeaningSuggestionServiceImpl.class).asEagerSingleton();
        bind(ReferenceSuggestionServiceImpl.class).asEagerSingleton();
        bind(TextSuggestionServiceImpl.class).asEagerSingleton();
        bind(ConfigValueInterceptor.class).to(StepConfigValueInterceptor.class).asEagerSingleton();

        // others that can wait
        bind(JSwordAnalysisService.class).to(JSwordAnalysisServiceImpl.class);
        bind(AnalysisService.class).to(AnalysisServiceImpl.class);
        bind(JSwordSearchService.class).to(JSwordSearchServiceImpl.class);
        bind(MorphologyService.class).to(MorphologyServiceImpl.class);
        bind(VocabularyService.class).to(VocabularyServiceImpl.class);
        bind(StrongAugmentationService.class).to(StrongAugmentationServiceImpl.class);
        bind(TimelineService.class).to(TimelineServiceImpl.class);
//pt20201119 This code was never used so Patrick Tang commented it out on November 19, 2020.  Search for the "November 19, 2020" string to find all the related changes in the Java code.
//pt20201119        bind(GeographyService.class).to(GeographyServiceImpl.class);
        bind(Loader.class);
        bind(UserService.class).to(UserServiceImpl.class);
        bind(LexiconDefinitionService.class).to(LexiconDefinitionServiceImpl.class);
        bind(SubjectSearchService.class).to(SubjectSearchServiceImpl.class);
        bind(SubjectEntrySearchService.class).to(SubjectEntryServiceImpl.class);
        bind(SwingService.class).to(SwingServiceImpl.class);
        bind(OriginalWordSuggestionService.class).to(OriginalWordSuggestionServiceImpl.class);
        bind(SupportRequestService.class).to(SupportRequestServiceImpl.class);
        bind(JSwordRelatedVersesService.class).to(JSwordRelatedVersesServiceImpl.class);
                
        bind(new TypeLiteral<List<String>>() {
        }).annotatedWith(Names.named("defaultVersions")).toProvider(DefaultVersionsProvider.class);

        // installers, offline and online
        bind(new TypeLiteral<List<Installer>>() {
        }).annotatedWith(Names.named("onlineInstallers")).toProvider(DefaultInstallersProvider.class);

        bind(new TypeLiteral<List<Installer>>() {
        }).annotatedWith(Names.named("offlineInstallers")).toProvider(OfflineInstallersProvider.class);

        bind(EntityManager.class).to(EntityManagerImpl.class).asEagerSingleton();
    }
}
