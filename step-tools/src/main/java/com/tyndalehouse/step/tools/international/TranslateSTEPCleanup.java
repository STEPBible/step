package com.tyndalehouse.step.tools.international;

import com.memetix.mst.language.Language;
import com.memetix.mst.translate.Translate;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Enumeration;
import java.util.Locale;
import java.util.Properties;
import java.util.ResourceBundle;
import java.util.regex.Pattern;

/**
 * Integration to Microsoft translate
 */
public class TranslateSTEPCleanup {

    public static void main(String[] args) throws IOException {
        final String sourceLanguage = args[0];

        for(String s : TranslateSTEP.BUNDLES) {
            Properties target = new Properties();
            final ResourceBundle bundle = ResourceBundle.getBundle(s, Locale.forLanguageTag(sourceLanguage));
            final Enumeration<String> keys = bundle.getKeys();
            while(keys.hasMoreElements()) {
                final String k = keys.nextElement();
                final String value = bundle.getString(k);

                System.out.println("before: " + value);

                String after = TranslateSTEP.cleanupText(value);
                System.out.println(" after: " + value);

//                break;
            }

//            final FileOutputStream fileOutputStream = new FileOutputStream(new File("c:\\dev\\projects\\step\\step-core\\src\\main\\resources\\" + s + "_" + sourceLanguage + ".properties"));
//            target.store(fileOutputStream, "");
//            fileOutputStream.close();
        }
    }

}
