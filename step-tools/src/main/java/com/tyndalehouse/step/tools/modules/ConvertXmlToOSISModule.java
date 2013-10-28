package com.tyndalehouse.step.tools.modules;

import com.tyndalehouse.step.core.utils.IOUtils;
import org.apache.commons.io.FileUtils;
import org.apache.velocity.Template;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.VelocityEngine;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.xml.parsers.*;
import java.io.*;
import java.util.Properties;
import java.util.concurrent.*;

/**
 * @author chrisburrell
 */
public class ConvertXmlToOSISModule {
    private static final Logger LOGGER = LoggerFactory.getLogger(ConvertXmlToOSISModule.class);
    private static File SOURCE_DIRECTORY = new File("c:\\dev\\projects\\ebible\\downloads");
    private static File BASE_ERRORS = new File("c:\\dev\\projects\\ebible\\output\\errors\\");
    private static File BASE_OUTPUT = new File("c:\\dev\\projects\\ebible\\output\\modules\\texts\\ztext\\");
    private static File BASE_CONF = new File("c:\\dev\\projects\\ebible\\output\\mods.d");
    private static VelocityEngine ENGINE;

    static {
        Properties p = new java.util.Properties();
        p.setProperty("resource.loader", "class");
        p.setProperty("class.resource.loader.class",
                "org.apache.velocity.runtime.resource.loader.ClasspathResourceLoader");

        ENGINE = new VelocityEngine();
        ENGINE.init(p);
    }

    private void convert() throws Exception {
        final BlockingQueue<Runnable> queue = new ArrayBlockingQueue<Runnable>(1024);
        final ExecutorService executorService = new ThreadPoolExecutor(3,3, 1, TimeUnit.DAYS, queue);
        
        final File[] files = SOURCE_DIRECTORY.listFiles();
        for (final File f : files) {
            if (f.isDirectory()) {
                final File[] unzippedFiles = f.listFiles();
                for (final File unzipped : unzippedFiles) {
                    if (unzipped.getName().endsWith(".xml")) {
                        executorService.submit(new Runnable() {
                            @Override
                            public void run() {
                                try {
                                    convertToXml(f.getName(), unzipped);
                                    LOGGER.debug("Finished [{}], [{}] remaining", f.getName(), queue.size());
                                } catch (Exception e) {
                                    LOGGER.error("Failed to convert [{}]", f.getName(), e);
                                }
                            }
                        });
                        break;
                    }
                }
//                break;
            }
        }
        executorService.shutdown();
    }

    private void convertToXml(final String moduleName, final File osisSource) throws Exception {
        LOGGER.debug("Reading [{}]", moduleName);

        SAXParserFactory spf = SAXParserFactory.newInstance();
        final SAXParser saxParser = spf.newSAXParser();
        final ExtractHeaderInformationSax header = new ExtractHeaderInformationSax();
        saxParser.parse(osisSource, header);

        LOGGER.debug("title:[{}], description:[{}], copyright:[{}], license:[{}], language:[{}], versification:[{}]",
                header.getTitle(),
                header.getDescription(),
                header.getCopyright(),
                header.getLicense(),
                header.getLanguage(),
                header.getVersification());

        String sanitizedModuleName = moduleName.replace("-", "").toLowerCase();

        File outputDirectory = new File(BASE_OUTPUT, sanitizedModuleName);
        outputDirectory.mkdirs();
        BASE_ERRORS.mkdirs();
//        
//        LOGGER.debug("Converting [{}] to OSIS Module", sanitizedModuleName);
//        Process p = Runtime.getRuntime().exec(String.format("osis2mod %s %s -z -v %s", outputDirectory.getAbsolutePath(), osisSource.getAbsolutePath(), header.getVersification()));
//        LOGGER.debug("Conversion of [{}] finished.", sanitizedModuleName);
//        outputErrors(p, moduleName);
//        p.waitFor();

        outputConfFile(header, sanitizedModuleName, FileUtils.sizeOfDirectory(outputDirectory));

    }

    private void outputConfFile(final ExtractHeaderInformationSax header, String sanitizedModuleName, long bytes) throws IOException {
        
        final Template template = ENGINE.getTemplate("conf.vm");
        VelocityContext context = new VelocityContext();
        context.put("upperInitials", sanitizedModuleName.toUpperCase());
        context.put("lowerInitials", sanitizedModuleName.toLowerCase());
        context.put("title", header.getTitle());
        context.put("copyright", header.getCopyright());
        context.put("description", header.getDescription());
        context.put("language", header.getLanguage());
        context.put("license", getLicense(header.getLicense()));
        context.put("licenseText", header.getLicense());
        context.put("versification", header.getVersification());
        context.put("about", header.getAbout());
        context.put("installSize", bytes);
        context.put("xref", header.isHasCrossRefs());
        context.put("footnotes", header.isHasFootNotes());
        context.put("headings", header.isHasHeadings());
        context.put("morphology", header.isHasMorphology());
        context.put("redletters", header.isHasRedLetter());
        context.put("strongs", header.isHasStrongs());

        FileWriter fw = new FileWriter(new File(BASE_CONF, sanitizedModuleName + ".conf"));
        template.merge(context, fw);
        IOUtils.closeQuietly(fw);
    }

    private String getLicense(final String license) {
        if (license.contains("by-nc-nd")) {
            return "Creative Commons: by-nc-nd";
        } else if (license.contains("by-nc-sa")) {
            return "Creative Commons: by-nc-sa";
        } else if (license.contains("by-nc")) {
            return "Creative Commons: by-nc";
        } else if (license.contains("by-nd")) {
            return "Creative Commons: by-nd";
        } else if (license.contains("by-sa")) {
            return "Creative Commons: by-sa";
        } else if (license.contains("CC0")) {
            return "Creative Commons: CC0";
        } else if (license.contains("Public Domain")) {
            return "Public Domain";
        }
        LOGGER.error("Unknown license: [{}]", license);
        return "Unknown";
    }

    private void outputErrors(final Process p, final String moduleName) throws IOException {
        BufferedReader in = new BufferedReader(
                new InputStreamReader(p.getInputStream()));
        StringBuilder content = new StringBuilder(256);
        String line;
        while ((line = in.readLine()) != null) {
            content.append(line);
            content.append("\r\n");
        }
        FileUtils.writeStringToFile(new File(BASE_ERRORS, moduleName + ".log"), content.toString());
        in.close();
    }

    /**
     * @param args the SOURCE_DIRECTORY containing all the modules
     */
    public static void main(String[] args) throws Exception {
        new ConvertXmlToOSISModule().convert();
    }

}
