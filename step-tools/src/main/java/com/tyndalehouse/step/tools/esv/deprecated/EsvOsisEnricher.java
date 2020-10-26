package com.tyndalehouse.step.tools.esv.deprecated;

import java.io.File;
import java.io.IOException;
import java.util.*;
import java.util.regex.Pattern;

import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.TransformerFactoryConfigurationError;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;

import org.apache.commons.io.FileUtils;
import org.crosswire.jsword.book.Book;
import org.crosswire.jsword.book.Books;
import org.crosswire.jsword.passage.NoSuchKeyException;
import org.jdom2.Content;
import org.jdom2.Element;
import org.jdom2.JDOMException;
import org.jdom2.input.SAXBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Reads in an xml file and tries to track progress with a tagging sheet, enriching where it can
 *
 * @deprecated
 * @author chrisburrell
 */
@Deprecated
public class EsvOsisEnricher {
    private static Pattern PUNCTUATION = Pattern.compile("[,?!./\\-:;'\"—]+");
    private static final Logger LOGGER = LoggerFactory.getLogger(EsvOsisEnricher.class);
    private final Set<String> canonicals = new HashSet<String>();
    private Map<String, Deque<Word>> verseContent;

    public static void main(final String[] args) throws JDOMException, IOException, NoSuchKeyException,
            TransformerFactoryConfigurationError, TransformerException {
        new EsvOsisEnricher().process("c:\\Downloads\\esv-osis-sect.xml", "c:\\temp\\tagging.csv");
    }

    private void process(final String osisFile, final String mappingFile) throws JDOMException, IOException,
            NoSuchKeyException, TransformerFactoryConfigurationError, TransformerException {
        init(mappingFile);

        final SAXBuilder builder = new SAXBuilder();
        builder.setValidation(false);

        // final Document doc = builder.build(f);

        final StreamSource streamSource = new StreamSource(getClass().getResourceAsStream("/enrich.xsl"));
        final Transformer newTransformer = TransformerFactory.newInstance().newTransformer(streamSource);

        final StreamSource original = new StreamSource(getClass().getResourceAsStream("/esv2011.xml"));

        final StreamResult result = new StreamResult(new File("d:\\temp\\esv-out.xml"));

        newTransformer.setParameter("state", new EnricherState(this.verseContent));

        newTransformer.transform(original, result);

        String s = FileUtils.readFileToString(new File("d:\\temp\\esv-out.xml"));
        s = s.replaceAll("#&lt;#", "<");
        s = s.replaceAll("#&gt;#", ">");
        FileUtils.write(new File("d:\\temp\\esv-out.xml"), s);

        // result.getWriter().close();

        // final Element rootElement = doc.getRootElement();
        // final Iterator<Content> content = rootElement.getDescendants();
        // parseContent(content);

    }

    private void init(final String tagging) throws IOException, NoSuchKeyException {
        this.canonicals.add("q");
        this.canonicals.add("divineName");
        readMappingFile(new File(tagging));
    }

    private void readMappingFile(final File tagging) throws IOException, NoSuchKeyException {
        final Book b = Books.installed().getBook("ESV_th");

        List<String> lines = FileUtils.readLines(tagging);

        this.verseContent = new HashMap<String, Deque<Word>>();
        Deque<Word> currentVerseWords = null;
        String currentVerse = null;
        int lineNumber = 1;
        for (String lineText : lines) {
            String[] line = lineText.split("\\t");
            LOGGER.trace("line: {}", (Object[]) line);
            Word w;
            if (line.length <= 1) {
                LOGGER.warn("Blank line found in file, line {}", lineNumber);
                continue;
            } else if (line.length == 2) {
                w = new Word(line[1]);
            } else {
                w = new Word(line[1], line[2]);
            }

            if (!line[0].equalsIgnoreCase(currentVerse)) {
                LOGGER.trace("New verse {}", line[0]);
                currentVerseWords = new LinkedList<Word>();
                try {
                    this.verseContent.put(b.getKey(getValidOsisRef(line[0])).getOsisID(),
                            currentVerseWords);
                } catch (final NoSuchKeyException e) {
                    LOGGER.warn("[{}]: Failure to resolve verse to OSIS reference.", line[0]);
                    continue;
                }
            }

            LOGGER.trace("Adding word {}", w.getW());
            currentVerseWords.add(w);

            currentVerse = line[0];
            lineNumber++;
        }

    }

    private String getValidOsisRef(final String ref) {
        if (ref.startsWith("Sol")) {
            return ref.replace("Sol", "Song");
        }

        return ref;
    }

    private void parseContent(final Iterator<Content> content) {
        boolean isVerse = false;
        String currentVerse = null;

        while (content.hasNext()) {
            final Content c = content.next();
            if (c instanceof Element) {
                final Element element = (Element) c;
                if ("verse".equals(element.getName())) {
                    currentVerse = element.getAttributeValue("sID");
                    if (currentVerse != null) {
                        LOGGER.debug("Found opening verse marker");
                        isVerse = true;
                    }

                    if (element.getAttribute("eID") != null) {
                        LOGGER.debug("Found end verse marker");
                        isVerse = false;
                    }
                    // processVerse(element, null);
                } else {
                    if (isVerse) {
                        processVerse(currentVerse, c);
                    }
                }
            } else {
                // we're in between 2 verses
                if (isVerse) {
                    processVerse(currentVerse, c);
                }
                // System.out.println(c);
            }
        }
    }

    private void processVerse(final String currentVerse, final Content c) {

        LOGGER.trace("Processing verse {}", currentVerse);

        final Deque<Word> queue = this.verseContent.get(currentVerse);
        if (queue == null || queue.size() == 0) {
            LOGGER.warn("[{}]: no matching data available, skipping", currentVerse);
            return;
        }
    }

    public static String reduce(final String s) {
        if (s == null) {
            return "";
        }
        return PUNCTUATION.matcher(s).replaceAll(" ").replace("  ", " ");
    }

}
