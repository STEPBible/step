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
using System.Runtime.InteropServices;

namespace Sword
{
	public class Manager : IDisposable
	{
		IntPtr _handle;
		
		public Manager ()
		{
			_handle = NativeMethods.org_crosswire_sword_SWMgr_new();
		}
		
		public Manager (string path)
		{
			_handle = NativeMethods.org_crosswire_sword_SWMgr_newWithPath(path);
		}
		
		
		internal IntPtr Handle
		{
			get
			{
				return _handle;	
			}
		}
		
		protected void Dispose(bool disposing)
		{
			if(disposing)
			{
				if(_handle != IntPtr.Zero)
				{
					NativeMethods.org_crosswire_sword_SWMgr_delete(_handle);
					_handle = IntPtr.Zero;
				}
			}
		}
		
		public Module GetModuleByName(string name)
		{
			IntPtr modulePtr = NativeMethods.org_crosswire_sword_SWMgr_getModuleByName(_handle, name);
			if(modulePtr == IntPtr.Zero)
			{
				return null;	
			}
			return new Module(modulePtr);
		}
		
		/// <summary>
		/// Gets a list of the installed modules
		/// </summary>
		public IEnumerable<ModInfo> GetModInfoList()
		{
			IntPtr modulesPointer = NativeMethods.org_crosswire_sword_SWMgr_getModInfoList(_handle);
			ModInfo modInfo = (ModInfo)Marshal.PtrToStructure(modulesPointer, typeof(ModInfo));
			
			while (modInfo.Name != null) 
			{
				yield return modInfo;
				modulesPointer = new IntPtr(modulesPointer.ToInt64() + Marshal.SizeOf(typeof(ModInfo)));
				modInfo = (ModInfo)Marshal.PtrToStructure(modulesPointer, typeof(ModInfo));
			}
		}
		
		public string Version
		{
			get
			{
				IntPtr versionPtr = NativeMethods.org_crosswire_sword_SWMgr_version(_handle);	
				return Marshal.PtrToStringAnsi(versionPtr);
			}
		}
		
		public string PrefixPath
		{
			get
			{
				IntPtr prefixPathPtr = NativeMethods.org_crosswire_sword_SWMgr_getPrefixPath(_handle);	
				return Marshal.PtrToStringAnsi(prefixPathPtr);
			}
		}
		
		public string ConfigPath
		{
			get
			{
				IntPtr configPathPtr = NativeMethods.org_crosswire_sword_SWMgr_getConfigPath(_handle);	
				return Marshal.PtrToStringAnsi(configPathPtr);
			}
		}
		
		public void SetGlobalOption(string option, string @value)
		{
			NativeMethods.org_crosswire_sword_SWMgr_setGlobalOption(_handle, option, @value);
		}
		
		public IEnumerable<string> GetGlobalOptionValues(string option)
		{
			IntPtr optionsPtr = NativeMethods.org_crosswire_sword_SWMgr_getGlobalOptionValues(_handle, option);
			return NativeMethods.MarshalStringArray(optionsPtr);
		}
		
		public void SetCipherKey(string modName, byte[] key)
		{
			NativeMethods.org_crosswire_sword_SWMgr_setCipherKey(_handle, modName, key);
		}
		
		public bool Javascript
		{
			set
			{
				NativeMethods.org_crosswire_sword_SWMgr_setJavascript(_handle, value);
			}
		}
		
		public IEnumerable<string> AvailableLocales
		{
			get
			{
				IntPtr localesPtr = NativeMethods.org_crosswire_sword_SWMgr_getAvailableLocales(_handle);
				return NativeMethods.MarshalStringArray(localesPtr);
			}
		}
		
		public string DefaultLocale
		{
			set
			{
				NativeMethods.org_crosswire_sword_SWMgr_setDefaultLocale(_handle, value);
			}
		}
		
		public string Translate(string text, string localeName)
		{
			IntPtr translatedPtr = NativeMethods.org_crosswire_sword_SWMgr_translate(_handle, text, localeName);
			return Marshal.PtrToStringAnsi(translatedPtr);
		}
		
		public void Dispose ()
		{
			Dispose (true);
			GC.Collect();
		}
	}
}

