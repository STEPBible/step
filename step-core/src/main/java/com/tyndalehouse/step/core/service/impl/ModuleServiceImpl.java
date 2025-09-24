package com.tyndalehouse.step.core.service.impl;

import com.tyndalehouse.step.core.models.BibleVersion;
import com.tyndalehouse.step.core.models.ClientSession;
import com.tyndalehouse.step.core.service.ModuleService;
import com.tyndalehouse.step.core.service.helpers.VersionResolver;
import com.tyndalehouse.step.core.service.jsword.JSwordModuleService;
import com.tyndalehouse.step.core.service.jsword.JSwordVersificationService;
import org.crosswire.jsword.versification.Versification;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.BookCategory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Provider;
import javax.inject.Singleton;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.tyndalehouse.step.core.utils.JSwordUtils.getSortedSerialisableList;

/**
 * Looks up module information, for example lexicon definitions for particular references
 */
@Singleton
public class ModuleServiceImpl implements ModuleService {
    private static final Logger LOGGER = LoggerFactory.getLogger(ModuleServiceImpl.class);
    private final JSwordModuleService jswordModuleService;
    private final Provider<ClientSession> clientSession;
    private final VersionResolver resolver;
    private final JSwordVersificationService versificationService;

    /**
     * constructs a service to give module information and content.
     * 
     * @param jswordModuleService the service to register and manipulate modules
     * @param clientSession the client session to validate security
     */
    @Inject
    public ModuleServiceImpl(final JSwordModuleService jswordModuleService,
                             final Provider<ClientSession> clientSession, final VersionResolver resolver,
                             final JSwordVersificationService versificationService) {
        this.jswordModuleService = jswordModuleService;
        this.clientSession = clientSession;
        this.resolver = resolver;
        this.versificationService = versificationService;
    }

    @Override
    public List<BibleVersion> getAvailableModules() {
        LOGGER.debug("Getting bible versions");
        return getSortedSerialisableList(this.jswordModuleService.getInstalledModules(BookCategory.BIBLE,
                BookCategory.COMMENTARY), this.clientSession.get().getLocale(),
                this.resolver, this.versificationService);
    }

    @Override
    public List<BibleVersion> getAllInstallableModules(int installerIndex, final BookCategory... categories) {
        final BookCategory[] selected = categories.length == 0 ? new BookCategory[] { BookCategory.BIBLE,
                BookCategory.COMMENTARY } : categories;

        LOGGER.info("Returning all modules currently not installed");
        final List<Book> installedVersions = this.jswordModuleService.getInstalledModules(selected);
        final List<Book> allModules = this.jswordModuleService.getAllModules(installerIndex, selected);

        return getSortedSerialisableList(subtract(allModules, installedVersions),
                this.clientSession.get().getLocale(), this.resolver, this.versificationService);
    }

    /**
     *
     * @param originalBooks list a the master list
     * @param booksToRemove list b the list of items to take out
     * @return the trimmed list
     */
    public static Collection<Book> subtract(final List<Book> originalBooks, final List<Book> booksToRemove) {
        //unfortunately, can't use Book.equals(), and therefore normal sets, because
        //Book.equals() compares all of the SwordBookMetaData, which can be different
        //if STEP has its own version of the books.
        //convert the first list to a map, keyed by version intials
        Map<String, Book> books = new HashMap<String, Book>(originalBooks.size()*2);
        for(Book b : originalBooks) {
            books.put(b.getInitials(), b);
        }

        for(Book b : booksToRemove) {
            books.remove(b.getInitials());
        }

        return books.values();
    }
}
