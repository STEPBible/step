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

import java.lang.reflect.Method;

public class DemoAppConfigReloader {

  /**
   * Reload instace configuration in the demo application. Makes this call with Reflection API to the <code>init()</code> method.
   */
  public static void reinitialize(Object o) throws Exception {
    System.out.println(" -- reinitialize()");
    
    Method initMethod = getAbstractCanvasClass().getDeclaredMethod("init");
    initMethod.setAccessible(true);
    initMethod.invoke(o);
  }

  
  public static void repaint() throws Exception {
    Method repaintMethod = getAbstractCanvasClass().getMethod("repaint");
    repaintMethod.setAccessible(true);
    
    Method getInstanceMethod = getAbstractCanvasClass().getDeclaredMethod("getInstance");
    Object gcanvasInstance = getInstanceMethod.invoke(null);
    
    repaintMethod.invoke(gcanvasInstance);
  }
 

  private static Class getAbstractCanvasClass() throws Exception {
    return Class.forName("org.zeroturnaround.jrebel.flagDemo.AbstractCanvas");    
  }
  
}
