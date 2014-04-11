/**
 * Copyright (C) 2010 ZeroTurnaround OU
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License v2 as published by
 * the Free Software Foundation, with the additional requirement that
 * ZeroTurnaround OU must be prominently attributed in the program.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You can find a copy of GNU General Public License v2 from
 *   http://www.gnu.org/licenses/gpl-2.0.txt
 */

package org.zeroturnaround.javarebel.integration.pluginTemplate;

import org.zeroturnaround.bundled.javassist.ClassPool;
import org.zeroturnaround.bundled.javassist.CtClass;
import org.zeroturnaround.bundled.javassist.CtMethod;
import org.zeroturnaround.bundled.javassist.NotFoundException;
import org.zeroturnaround.javarebel.LoggerFactory;
import org.zeroturnaround.javarebel.integration.support.JavassistClassBytecodeProcessor;

/**
 * Transforms the class <code>org.zeroturnaround.jrebel.flagDemo.AbstractCanvas</code>
 */
public class ReloadAbstractCanvasStateCBP extends JavassistClassBytecodeProcessor {

  public void process(ClassPool cp, ClassLoader cl, CtClass ctClass) throws Exception {
    
    LoggerFactory.getInstance().echo("Patching the AbstactCanvas class ..");
    
    try {
      CtMethod paintMethod = ctClass.getDeclaredMethod("repaint");
      paintMethod.insertBefore("org.zeroturnaround.javarebel.integration.pluginTemplate.DemoAppConfigReloader.reinitialize($0);");
      
    } catch (NotFoundException e) {
      LoggerFactory.getInstance().error(e);
    }
  }
}
