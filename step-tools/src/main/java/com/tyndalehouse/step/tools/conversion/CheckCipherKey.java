package com.tyndalehouse.step.tools.conversion;

import org.jasypt.util.text.BasicTextEncryptor;

/**
 * Given the STEP obfuscation key and the cipher key for the module, creates a key
 * to be packaged in the STEP mods.d modules configuration directories.
 */
public class CheckCipherKey {
    public static void main(String[] args) {
        BasicTextEncryptor bte = new BasicTextEncryptor();
        bte.setPassword(args[0]);
        System.out.println(bte.decrypt(args[1]));
    }
}
