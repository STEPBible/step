package com.tyndalehouse.step.core.service.jsword.impl;

import com.tyndalehouse.step.core.utils.StringUtils;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.book.sword.ConfigEntryType;
import org.crosswire.jsword.book.sword.ConfigValueInterceptor;
import org.jasypt.util.text.BasicTextEncryptor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Config value interceptor, to decrypt STEP cipher keys
 */
@Singleton
public class StepConfigValueInterceptor implements ConfigValueInterceptor {
    private static final Logger LOGGER = LoggerFactory.getLogger(StepConfigValueInterceptor.class);
    private final BasicTextEncryptor encryptor;
//    private final Set<String> books;
    private final Map<String, String> decryptions = new HashMap<>();

    @Inject
    public StepConfigValueInterceptor(@Named("app.internal.key") String key) {
        final BasicTextEncryptor encryptor = new BasicTextEncryptor();

        final String sysKey = System.getProperty("app.internal.key");
        if(sysKey != null) {
            //then use this one instead
            encryptor.setPassword(sysKey);
        } else {
            encryptor.setPassword(key);
        }
        this.encryptor = encryptor;
//        this.books = new HashSet(Arrays.asList(StringUtils.split(lockedBooks)));
    }

    @Override
    public Object intercept(final String bookName, final ConfigEntryType configEntryType, final Object value) {
        if (value != null && ConfigEntryType.CIPHER_KEY.equals(configEntryType) && isSTEPBook(bookName.toLowerCase())) {
            try {
                String decryptedResult = decryptions.get(value);
                if(decryptedResult != null) {
                    return decryptedResult;
                }

                final String valueAsString = (String) value;
                final String decrypt = this.encryptor.decrypt(valueAsString);
                synchronized (this) {
                    decryptions.put(valueAsString, decrypt);
                }
                return decrypt;
            } catch (Exception ex) {
                //unable to decrypt
                LOGGER.error(ex.getMessage());
                LOGGER.debug(ex.getMessage(), ex);
            }
        }
            return value;
    }

    private boolean isSTEPBook(final String initials) {
        Book b = Books.installed().getBook(initials);
        if(b == null) {
            return false;
        }

        final Object stepLocked = b.getBookMetaData().getProperty("STEPLocked");
        if(stepLocked instanceof List) {
            return Boolean.parseBoolean((String)((List) stepLocked).get(0));
        }
        return Boolean.parseBoolean((String) stepLocked);
    }
}
