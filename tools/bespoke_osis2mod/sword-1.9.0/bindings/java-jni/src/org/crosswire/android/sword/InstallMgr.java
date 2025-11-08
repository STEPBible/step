/******************************************************************************
 *
 *  InstallMgr.java -	
 *
 * $Id: InstallMgr.java 3507 2017-11-01 10:36:39Z scribe $
 *
 * Copyright 2009-2013 CrossWire Bible Society (http://www.crosswire.org)
 *	CrossWire Bible Society
 *	P. O. Box 2528
 *	Tempe, AZ  85280-2528
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the
 * Free Software Foundation version 2.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 */

package org.crosswire.android.sword;

public class InstallMgr {
	
	public static interface InstallProgressReporter {
		public void update(long totalBytes, long completedBytes);
		public void preStatus(long totalBytes, long completedBytes, String message);
	}

	public native void reInit();

	public native void             setUserDisclaimerConfirmed();
	public native int              syncConfig();
	public native int              uninstallModule(String modName);
	public native String []        getRemoteSources();
	public native int              refreshRemoteSource(String sourceName);
	public native SWMgr.ModInfo [] getRemoteModInfoList(String sourceName);
	public native int              remoteInstallModule(String sourceName, String modName, InstallProgressReporter progressReporter);
	public int                     remoteInstallModule(String sourceName, String modName) { return remoteInstallModule(sourceName, modName, null); }
	public native SWModule         getRemoteModuleByName(String source, String name);

}

