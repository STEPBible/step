// Copyright 2014  CrossWire Bible Society (http://www.crosswire.org)
//  	CrossWire Bible Society
//  	P. O. Box 2528
//  	Tempe, AZ  85280-2528
//  
//  This program is free software; you can redistribute it and/or modify it
//  under the terms of the GNU General Public License as published by the
//  Free Software Foundation version 2.
//  
//  This program is distributed in the hope that it will be useful, but
//  WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
//  General Public License for more details.
using System;
using System.Collections.Generic;

namespace Sword
{
	public class InstallManager :  IDisposable
	{
		readonly IntPtr _handle;
		
		public InstallManager (string baseDirectory)
		{
			_handle = NativeMethods.org_crosswire_sword_InstallMgr_new(baseDirectory, IntPtr.Zero);
		}
		
		public void SetUserDisclaimerConfirmed()
		{
			NativeMethods.org_crosswire_sword_InstallMgr_setUserDisclaimerConfirmed(_handle);	
		}
		
		/// <summary>
		/// Retrieves a list of sources from the master server.
		/// </summary>
		/// <returns>
		/// True if successful
		/// False if SetUserDisclaimerConfirmed has not been called.
		/// False if the sync failed.
		/// </returns>
		public bool SyncConfig()
		{
			int result = NativeMethods.org_crosswire_sword_InstallMgr_syncConfig(_handle);
			return result == 0 ? true : false;
		}
		
		/// <summary>
		/// Gets the remote sources.
		/// You may need to call SyncConfig before calling this
		/// to get an upto date source list.
		/// </summary>
		public IEnumerable<string> RemoteSources
		{
			get
			{
				IntPtr remoteSourcesPtr = NativeMethods.org_crosswire_sword_InstallMgr_getRemoteSources(_handle);
				return NativeMethods.MarshalStringArray(remoteSourcesPtr);
			}
		}
		
		public bool RefreshRemoteSource(string sourceName)
		{
			int result = NativeMethods.org_crosswire_sword_InstallMgr_refreshRemoteSource(_handle, sourceName);
			return result == 0 ? true : false;
		}
		
		public IEnumerable<ModInfo> GetRemoteModInfoList(Manager manager, string sourceName)
		{
			IntPtr pointer = NativeMethods.org_crosswire_sword_InstallMgr_getRemoteModInfoList(_handle, manager.Handle, sourceName);
			return NativeMethods.MarshallModInfoArray(pointer);
		}
		
		public bool RemoteInstallModule(Manager to, string sourceName, string modName)
		{
			int result = NativeMethods.org_crosswire_sword_InstallMgr_remoteInstallModule(_handle, to.Handle, sourceName, modName);
			return result == 0 ? true : false;
		}
		
		protected void Dispose(bool disposing)
		{
			if(disposing)
			{
				if(_handle != IntPtr.Zero)
				{
					NativeMethods.org_crosswire_sword_InstallMgr_delete(_handle);
				}
			}
		}
		
		public void Dispose ()
		{
			Dispose (true);
			GC.Collect();
		}
	}
}

