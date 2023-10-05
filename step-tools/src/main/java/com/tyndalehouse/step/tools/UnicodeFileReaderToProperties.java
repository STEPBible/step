package com.tyndalehouse.step.tools;

import com.tyndalehouse.step.core.utils.StringConversionUtils;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.io.filefilter.FileFileFilter;
import org.apache.commons.io.filefilter.IOFileFilter;
import org.apache.xml.serializer.OutputPropertyUtils;

import java.io.*;
import java.nio.charset.Charset;
import java.util.Collection;
import java.util.List;
import java.util.Properties;

public class UnicodeFileReaderToProperties {
    public static void main(String[] args) throws IOException {
        Properties p = new Properties();

        final Collection<File> files = FileUtils.listFiles(new File("C:\\dev\\projects\\cue.language\\src\\cue\\lang\\stop"), new FileFileFilter() {}, new IOFileFilter() {
                    @Override
                    public boolean accept(final File file) {
                        return true;
                    }

                    @Override
                    public boolean accept(final File file, final String s) {
                        return true;
                    }
                });
        
        for (File f : files) {
            readFile(f, p);
        }

        p.store(new OutputStreamWriter(new FileOutputStream("c:\\temp\\out.properties")), "");
    }

    private static void readFile(final File f, final Properties p) throws IOException {
        final List<String> lines = FileUtils.readLines(f);
        StringBuilder sb = new StringBuilder(1024);
        for (String line : lines) {
            sb.append(StringConversionUtils.unAccent(line, true));
            sb.append(' ');
        }

        p.setProperty(f.getName(), sb.toString());
    }
}
