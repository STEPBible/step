//CHECKSTYLE:OFF
package com.tyndalehouse.step.tools.analysis;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

public class ConcatenateSpecificForms {
    public static void main(final String args[]) {
        try {
            final FileReader reader = new FileReader(
                    "D:\\dev\\projects\\step\\step-core\\src\\main\\resources\\com\\tyndalehouse\\step\\core\\data\\create\\lexicon\\specific_forms.txt");
            final BufferedReader r = new BufferedReader(reader);
            String line = "";
            String lastStrong = "";
            final FileWriter writer = new FileWriter(new File("d:\\temp.txt"));
            final BufferedWriter w = new BufferedWriter(writer);

            while ((line = r.readLine()) != null) {
                final String[] split = line.split(",");
                if (!lastStrong.equals(split[0])) {
                    w.write('\n');
                    w.write(split[0]);
                    w.write(',');
                } else {
                    w.write(' ');
                }
                // then append to same line
                w.append(split[1]);

                lastStrong = split[0];
            }

            w.close();
            r.close();
        } catch (final FileNotFoundException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        } catch (final IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
    }
}
