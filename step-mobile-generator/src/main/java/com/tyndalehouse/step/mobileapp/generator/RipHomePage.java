package com.tyndalehouse.step.mobileapp.generator;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.URL;
import java.nio.channels.Channels;
import java.nio.channels.ReadableByteChannel;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Properties;

/**
 * Downloads the home page and amends it to suit the purposes of the mobile app
 */
public class RipHomePage {
    public static final String BASE_STEP = "http://localhost:8080/";

    public static void main(String[] args) throws IOException {
        new RipHomePage().process(BASE_STEP, "?mobile=online", "C:\\dev\\projects\\temp\\my-test-app\\www");
    }

    /**
     * Downloads the STEP home page and processes it.
     */
    private void process(final String url, final String args, final String directory) throws IOException {
        Document doc = download(url + args);
        applyRules(doc);
        outputDocument(doc);

        List<String> relativeLinks = scanLinks(doc);
        writeApp(directory, doc, relativeLinks);
    }

    private void writeApp(final String directory, final Document doc, final List<String> relativeLinks) throws IOException {
        final File root = new File(directory);
        FileUtils.forceMkdir(root);

        //write the main app, as index.html
        FileUtils.write(new File(root, "index.html"), doc.html());

        //download files and move to relevant directories
        for (final String relativeLink : relativeLinks) {
            downloadFileToDisk(root, relativeLink);
        }

        downloadInternationalFiles(root);
    }

    private void downloadInternationalFiles(final File root) throws IOException {
        Properties prop = new Properties();
        prop.load(getClass().getClassLoader().getResourceAsStream("step.core.properties"));

        String languages = prop.getProperty("app.languages.available");
        final String[] langs = StringUtils.split(languages, ",");
        for(String lang : langs) {
            downloadFileToDisk(root, "international/interactive.js?lang=" + lang, lang);
        }
    }

    private void downloadFileToDisk(final File root, final String filePath) throws IOException {
        downloadFileToDisk(root, filePath, null);
    }

    private void downloadFileToDisk(final File root, final String filePath, final String infix) throws IOException {
        final URL website = new URL(BASE_STEP + filePath);
        final ReadableByteChannel rbc = Channels.newChannel(website.openStream());

        final int directoryEnd = filePath.lastIndexOf('/');
        final File fileDirectory;
        String fileName;
        if (directoryEnd != -1) {
            fileDirectory = new File(root, filePath.substring(0, directoryEnd));
            FileUtils.forceMkdir(fileDirectory);
            fileName = filePath.substring(directoryEnd + 1);
        } else {
            fileName = filePath;
            fileDirectory = root;
        }

        //remove any arguments
        if(fileName.contains("?")) {
            fileName = fileName.substring(0, fileName.indexOf('?'));
        }

        if(infix != null) {
            //add the infix just before the file extension
            fileName = fileName.substring(0, fileName.indexOf('.')) + '-' + infix + fileName.substring(fileName.indexOf("."));
        }

        final FileOutputStream fos = new FileOutputStream(new File(fileDirectory, fileName));
        fos.getChannel().transferFrom(rbc, 0, Long.MAX_VALUE);
    }

    private List<String> scanLinks(final Document doc) {
        Iterator<Element> iterator = doc.select("[src], [rel]:not([rel=canonical])").iterator();
        List<String> links = new ArrayList<>();
        while (iterator.hasNext()) {
            final Element next = iterator.next();
            final String src = next.attr("src");
            if (StringUtils.isNotBlank(src)) {
                addRelativeURL(links, src);
            } else {
                addRelativeURL(links, next.attr("href"));
            }
        }
        return links;
    }

    private void addRelativeURL(final List<String> links, final String src) {
        if (!src.startsWith("international")) {
            links.add(src);
        }
    }

    private void outputDocument(final Document doc) {
        String html = doc.html();
        System.out.println(html);
    }

    private void applyRules(final Document doc) {
        removeExtras(doc);
    }


    private void removeComments(Node node) {
        // as we are removing child nodes while iterating, we cannot use a normal foreach over children,
        // or will get a concurrent list modification error.
        int i = 0;
        while (i < node.childNodes().size()) {
            Node child = node.childNode(i);
            if (child.nodeName().equals("#comment"))
                child.remove();
            else {
                removeComments(child);
                i++;
            }
        }
    }

    private void removeExtras(final Document doc) {
        doc.select(".passageContent").empty();
        doc.select(".examplesColumn").remove();
        doc.select("#raiseSupportTrigger").remove();
        removeComments(doc);
        doc.select("#languageMenu li").removeAttr("title");
    }

    private Document download(final String url) throws IOException {
        return Jsoup.connect(url).get();
    }
}
