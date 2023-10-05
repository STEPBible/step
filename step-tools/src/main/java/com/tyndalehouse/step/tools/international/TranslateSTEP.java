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
public class TranslateSTEP {
    public static final String[] BUNDLES = new String[]{"HtmlBundle", "InteractiveBundle", "ErrorBundle", "SetupBundle"};
    private static final Pattern PERCENT_SIGN = Pattern.compile("% %");
    private static final Pattern PERCENT_SIGN_FOLLOW = Pattern.compile("([^%]\\s+)(%\\s)(\\w)");
    private static final Pattern LESS_THAN = Pattern.compile("&lt;");
    private static final Pattern GREATER_THAN = Pattern.compile("&gt;");
    private static final Pattern TAG_START = Pattern.compile("<\\s+");
    private static final Pattern TAG_END = Pattern.compile("/ >");
    private static final Pattern MARKER = Pattern.compile("\\$ ");

    public static void main(String[] args) throws IOException {
        Translate.setContentType("text/html");
        Translate.setClientId(args[0]);
        Translate.setClientSecret(args[1]);
        final String sourceLanguage = args[2];
        final String targetLanguage = args[3];

        for (String s : BUNDLES) {
            Properties target = new Properties();
            final ResourceBundle bundle = ResourceBundle.getBundle(s, Locale.forLanguageTag(sourceLanguage));
            final ResourceBundle englishBundle = ResourceBundle.getBundle(s, Locale.forLanguageTag("en"));
            final Enumeration<String> keys = bundle.getKeys();
            while (keys.hasMoreElements()) {
                final String k = keys.nextElement();
                final String value = bundle.getString(k);
                final String englishValue = englishBundle.getString(k);
                translate(sourceLanguage, targetLanguage, target, k, value, englishValue);
//                break;
            }

            final FileOutputStream fileOutputStream = new FileOutputStream(new File("c:\\dev\\projects\\step\\step-core\\src\\main\\resources\\" + s + "_" + targetLanguage + ".properties"));
            target.store(fileOutputStream, "");
            fileOutputStream.close();
        }
    }

    private static void translate(final String sourceLanguage, final String targetLanguage, final Properties target, final String k, final String value, final String englishValue) {
        if (value.equals(englishValue)) {
            //converting from English
            System.out.println("Converting from English");
            translate(target, "en", targetLanguage, k, value);
        } else {
            //converting from other language
            System.out.println("Converting from " + sourceLanguage);
            translate(target, sourceLanguage, targetLanguage, k, value);
        }
    }

    private static void translate(final Properties bundle, final String sourceLanguage, final String targetLanguage, final String k, final String value) {
        Language source = Language.fromString(sourceLanguage);
        Language target = Language.fromString(targetLanguage);
        System.out.printf("Translating %s[%s] from %s to %s\n", k, value, source.toString(), target.toString());

        String translatedText = null;
        try {
            translatedText = Translate.execute(value, source, target);

            bundle.put(k, cleanupText(translatedText));
        } catch (Exception e) {
            System.out.println("Unable to translate " + k + " " + value);
        }
    }

    public static String cleanupText(final String translatedText) {
        return PERCENT_SIGN_FOLLOW.matcher(
                PERCENT_SIGN.matcher(MARKER.matcher(TAG_END.matcher(TAG_START.matcher(GREATER_THAN.matcher(LESS_THAN.matcher(translatedText).replaceAll("<")).replaceAll(">")).replaceAll("<")).replaceAll("/>")).replaceAll("\\$")).replaceAll("%%"))
        .replaceAll("$1$3");

    }
}
