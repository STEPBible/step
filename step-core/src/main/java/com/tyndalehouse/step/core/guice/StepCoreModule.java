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

import java.util.List;
import java.util.Map;
import java.util.Properties;

import net.sf.ehcache.CacheManager;
import net.sf.ehcache.config.CacheConfiguration;
import net.sf.ehcache.config.Configuration;

import org.crosswire.jsword.book.install.Installer;

import com.avaje.ebean.EbeanServer;
import com.google.inject.Provides;
import com.google.inject.TypeLiteral;
import com.google.inject.name.Names;
import com.tyndalehouse.step.core.data.EntityManager;
import com.tyndalehouse.step.core.data.create.Loader;
import com.tyndalehouse.step.core.data.entities.Session;
import com.tyndalehouse.step.core.data.impl.EntityManagerImpl;
import com.tyndalehouse.step.core.guice.providers.DatabaseConfigProvider;
import com.tyndalehouse.step.core.guice.providers.DefaultInstallersProvider;
import com.tyndalehouse.step.core.guice.providers.DefaultLexiconRefsProvider;
import com.tyndalehouse.step.core.guice.providers.DefaultVersionsProvider;
import com.tyndalehouse.step.core.guice.providers.ServerSessionProvider;
import com.tyndalehouse.step.core.guice.providers.TestData;
import com.tyndalehouse.step.core.service.BibleInformationService;
import com.tyndalehouse.step.core.service.FavouritesService;
import com.tyndalehouse.step.core.service.GeographyService;
import com.tyndalehouse.step.core.service.ModuleService;
import com.tyndalehouse.step.core.service.MorphologyService;
import com.tyndalehouse.step.core.service.SearchService;
import com.tyndalehouse.step.core.service.TimelineService;
import com.tyndalehouse.step.core.service.UserDataService;
import com.tyndalehouse.step.core.service.VocabularyService;
import com.tyndalehouse.step.core.service.impl.BibleInformationServiceImpl;
import com.tyndalehouse.step.core.service.impl.FavouritesServiceImpl;
import com.tyndalehouse.step.core.service.impl.GeographyServiceImpl;
import com.tyndalehouse.step.core.service.impl.ModuleServiceImpl;
import com.tyndalehouse.step.core.service.impl.MorphologyServiceImpl;
import com.tyndalehouse.step.core.service.impl.SearchServiceImpl;
import com.tyndalehouse.step.core.service.impl.TimelineServiceImpl;
import com.tyndalehouse.step.core.service.impl.UserDataServiceImpl;
import com.tyndalehouse.step.core.service.impl.VocabularyServiceImpl;
import com.tyndalehouse.step.core.service.jsword.JSwordMetadataService;
import com.tyndalehouse.step.core.service.jsword.JSwordModuleService;
import com.tyndalehouse.step.core.service.jsword.JSwordPassageService;
import com.tyndalehouse.step.core.service.jsword.JSwordSearchService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordMetadataServiceImpl;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordModuleServiceImpl;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordPassageServiceImpl;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordSearchServiceImpl;
import com.tyndalehouse.step.core.service.jsword.impl.JSwordVersificationServiceImpl;
import com.tyndalehouse.step.core.utils.AbstractStepGuiceModule;

/**
 * The module configuration that configures the application via guice
 * 
 * @author chrisburrell
 * 
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

        // for now just have a method that statically initialises the cache
        initialiseCacheManager();

        bind(SearchService.class).to(SearchServiceImpl.class).asEagerSingleton();

        bind(JSwordPassageService.class).to(JSwordPassageServiceImpl.class).asEagerSingleton();
        bind(JSwordModuleService.class).to(JSwordModuleServiceImpl.class).asEagerSingleton();
        bind(JSwordMetadataService.class).to(JSwordMetadataServiceImpl.class).asEagerSingleton();
        bind(JSwordVersificationService.class).to(JSwordVersificationServiceImpl.class).asEagerSingleton();
        bind(JSwordSearchService.class).to(JSwordSearchServiceImpl.class);

        bind(BibleInformationService.class).to(BibleInformationServiceImpl.class).asEagerSingleton();
        bind(ModuleService.class).to(ModuleServiceImpl.class).asEagerSingleton();
        bind(MorphologyService.class).to(MorphologyServiceImpl.class).asEagerSingleton();
        bind(VocabularyService.class).to(VocabularyServiceImpl.class).asEagerSingleton();
        bind(TimelineService.class).to(TimelineServiceImpl.class);
        bind(GeographyService.class).to(GeographyServiceImpl.class);
        bind(FavouritesService.class).to(FavouritesServiceImpl.class).asEagerSingleton();
        bind(UserDataService.class).to(UserDataServiceImpl.class).asEagerSingleton();
        bind(Loader.class).asEagerSingleton();

        bind(Session.class).toProvider(ServerSessionProvider.class);

        bind(new TypeLiteral<List<String>>() {
        }).annotatedWith(Names.named("defaultVersions")).toProvider(DefaultVersionsProvider.class);
        bind(new TypeLiteral<Map<String, String>>() {
        }).annotatedWith(Names.named("defaultLexiconRefs")).toProvider(DefaultLexiconRefsProvider.class);
        bind(new TypeLiteral<List<Installer>>() {
        }).toProvider(DefaultInstallersProvider.class);
        bind(EntityManager.class).to(EntityManagerImpl.class).asEagerSingleton();
        bind(EbeanServer.class).toProvider(DatabaseConfigProvider.class).asEagerSingleton();

        // now bind the test data
        if (Boolean.valueOf(stepProperties.getProperty("test.data.load"))) {
            bind(TestData.class).asEagerSingleton();
        }
    }

    /**
     * we return the singleton instance here
     * 
     * @return the singleton cache manager
     */
    @Provides
    public CacheManager getCacheManager() {
        return CacheManager.getInstance();
    }

    /**
     * initialises the cache manager. e.g. disables update checker
     */
    private void initialiseCacheManager() {
        final Configuration config = new Configuration();
        config.setUpdateCheck(false);
        config.defaultCache(new CacheConfiguration());
        CacheManager.create(config);
    }

}
