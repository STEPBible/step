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

namespace Sword.Tests
{
	class LookupExample
	{
		public static void Main (string[] args)
		{	
			if (args.Length != 2)
			{
				Console.WriteLine ("usage: lookup <module> <key>");
				return;
			}
			Lookup(args[0], args[1]);
			return;
		}
		
		public static void Lookup(string modName, string key)
		{
			using(var manager = new Manager())
			{
				var module = manager.GetModuleByName(modName);
				
				if (module == null) 
				{
					Console.Error.WriteLine("Could not find module {0}.  Available modules:", modName);
					foreach(var modInfo in manager.GetModInfoList())
					{
						Console.WriteLine ("{0}\t - {1}", modInfo.Name, modInfo.Description);
					}
					return;
				}
				 
				module.KeyText = key;
				
				Console.WriteLine(module.KeyText);
				Console.WriteLine("==Raw=Entry============");
				Console.WriteLine(module.RawEntry);
				Console.WriteLine("==Render=Text============");
				Console.WriteLine(module.RenderText());
				Console.WriteLine("==Strip=Text============");
				Console.WriteLine(module.StripText());
				Console.WriteLine("=========================="); 
			}
		}

		public static void ParseKeyList()
		{
			using(var manager = new Manager())
			{
				var module = manager.GetModuleByName("ESV");
				
				if (module == null) 
				{
					Console.Error.WriteLine("Could not find module {0}.  Available modules:", "ESV");
					foreach(var modInfo in manager.GetModInfoList())
					{
						Console.WriteLine ("{0}\t - {1}", modInfo.Name, modInfo.Description);
					}
					return;
				}
				 
				module.KeyText = "jn.3.16";
				
				Console.WriteLine("==Render=Entry============");
				Console.WriteLine(module.KeyText);
				Console.WriteLine("RenderText: " + module.RenderText());
				Console.WriteLine("StripText: " + module.StripText());
				
				Console.WriteLine("RawText: " + module.RawEntry);
				Console.WriteLine("=========================="); 
				
				foreach(var key in module.ParseKeyList("James 1:19-30"))
				{
					Console.WriteLine (key);	
				}
			}
		}
		
		public static void Search()
		{
			using(var manager = new Manager())
			{
				var module = manager.GetModuleByName("ESV");
				
				if (module == null) 
				{
					Console.Error.WriteLine("Could not find module {0}.  Available modules:", "ESV");
					foreach(var modInfo in manager.GetModInfoList())
					{
						Console.WriteLine ("{0}\t - {1}", modInfo.Name, modInfo.Description);
					}
					return;
				}
				
				foreach(var hit in module.Search("sin", SearchType.REGEX, 0, null))
				{
					Console.WriteLine(hit.Key); 
				}
				module.TerminateSearch();
			}
		}
	}
}
