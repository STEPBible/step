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

import org.zeroturnaround.javarebel.Plugin;

import org.zeroturnaround.javarebel.ClassEventListener;
import org.zeroturnaround.javarebel.Integration;
import org.zeroturnaround.javarebel.IntegrationFactory;
import org.zeroturnaround.javarebel.ClassResourceSource;
import org.zeroturnaround.javarebel.LoggerFactory;
import org.zeroturnaround.javarebel.ReloaderFactory;

/**
 * A plugin that supports hotloading of demo-app config.
 */
public class PluginTemplate implements Plugin {

  /**
   * Set up the integration (register CBPs)
   */
  public void preinit() {

    // Register the CBP
    Integration i = IntegrationFactory.getInstance();
    ClassLoader cl = PluginTemplate.class.getClassLoader();
    i.addIntegrationProcessor(cl, "org.zeroturnaround.jrebel.flagDemo.AbstractCanvas", new ReloadAbstractCanvasStateCBP());
    
    registerListener();
  }
  
  

  private void registerListener() {
    // Set up the reload listener
    ReloaderFactory.getInstance().addClassReloadListener(
      new ClassEventListener() {
        public void onClassEvent(int eventType, Class klass) {

          try {
            Class abstractCanvasClass = Class.forName("org.zeroturnaround.jrebel.flagDemo.AbstractCanvas");
          
            // Check if it is child of AbstractCanvas
            if (abstractCanvasClass.isAssignableFrom(klass)) {
              System.out.println("An AbstractCanvas implementation class was reloaded .. re-painting the canvas");
              DemoAppConfigReloader.repaint();
              LoggerFactory.getInstance().echo("Repainted the canvas");
            }
            
          } catch (Exception e) {
            LoggerFactory.getInstance().error(e);
            System.out.println(e);
          }
        }

        public int priority() {
          return 0;
        }
      }
    );

  }

  public boolean checkDependencies(ClassLoader classLoader, ClassResourceSource classResourceSource) {
    return classResourceSource.getClassResource("org.zeroturnaround.jrebel.flagDemo.AbstractCanvas") != null;
  }

  public String getId() {
    return "jr-plugin-template";
  }

  public String getName() {
    return "JRebel Plugin Template";
  }

  public String getDescription() {
    return "Reload instance configuration for the JRebel SDK demo-app.";
  }

  public String getAuthor() {
    return null;
  }

  public String getWebsite() {
    return null;
  }

  public String getSupportedVersions() {
    return null;
  }

  public String getTestedVersions() {
    return null;
  }
}
