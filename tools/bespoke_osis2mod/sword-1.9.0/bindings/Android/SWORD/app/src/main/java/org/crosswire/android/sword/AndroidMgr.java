/******************************************************************************
 *
 *  AndroidMgr.java -
 *
 * $Id: SWMgr.java 2833 2013-06-29 06:40:28Z chrislit $
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

import android.app.Application;
import android.content.Context;

public class AndroidMgr extends SWMgr {

	private Application app;

	public AndroidMgr(Application app) {
		super(false);
		this.app = app;
		reInit();
	}

	@Override
	public String             getStorageBasePath() {
		Context context = app.getApplicationContext();
		return context.getFilesDir().getAbsolutePath();
	}
}


