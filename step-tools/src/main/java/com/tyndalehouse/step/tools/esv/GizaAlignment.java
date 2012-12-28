package com.tyndalehouse.step.tools.esv;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.io.FileUtils;

public class GizaAlignment {
    public static void main(final String[] args) throws IOException {
        final List<String> readLines = FileUtils.readLines(new File(
                "d:\\dev\\projects\\giza\\112-12-27.161917.chris.A3.final"));

        int lineNo = 0;
        Map<Integer, String> wordMap = null;
        for (final String line : readLines) {

            if (line.startsWith("#")) {
                wordMap = new HashMap<Integer, String>(16);
                // output previous
                lineNo = 1;
                continue;
            }

            if (lineNo == 1) {
                final String[] words = line.split(" ");

                for (int i = 0; i < words.length; i++) {
                    wordMap.put(i + 1, words[i]);
                }
                lineNo = 2;
                continue;
            }

            if (lineNo == 2) {
                final StringBuilder sb = new StringBuilder(128);
                for (int ii = 0; ii < line.length(); ii++) {
                    if (line.charAt(ii) == '{') {
                        // open curly brace
                        // munge as many chars as possible
                        StringBuilder number = new StringBuilder();
                        while (line.charAt(++ii) != '}') {
                            // do nothing
                            if (line.charAt(ii) == ' ') {
                                if (number.length() != 0) {
                                    sb.append(wordMap.get(Integer.parseInt(number.toString())));
                                    sb.append(' ');
                                }
                                number = new StringBuilder();
                            } else {
                                number.append(line.charAt(ii));
                            }
                        }

                    } else {
                        sb.append(line.charAt(ii));
                    }
                }

                System.out.println(sb.toString());
                lineNo = 0;
            }
        }
    }
}
