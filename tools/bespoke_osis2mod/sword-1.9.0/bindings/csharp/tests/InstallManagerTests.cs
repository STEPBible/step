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
using NUnit.Framework;
using System.Linq;

namespace Sword.Tests
{
	[TestFixture]
	public class InstallManagerTests
	{
		InstallManager _installManager;
		
		[SetUp]
		public void Setup()
		{
			_installManager = new InstallManager("baseDirectory");
		}
		
		[TearDown]
		public void TearDown()
		{
			_installManager.Dispose();
		}
		
		[Test]
		public void SetUserDisclaimerConfirmed_Called_DoesntCrash()
		{
			_installManager.SetUserDisclaimerConfirmed();
		}
		
		[Test]
		public void SyncConfig_UserDisclaimerConfirmed_ReturnsTrue()
		{
			//arrange
			_installManager.SetUserDisclaimerConfirmed();
			
			//act
			bool result = _installManager.SyncConfig();
			
			//assert
			Assert.That (result, Is.True);
		}
		
		[Test]
		public void SyncConfig_UserDisclaimerNotConfirmed_ReturnsFalse()
		{
			//act
			bool result = _installManager.SyncConfig();
			
			//assert
			Assert.That (result, Is.False);
		}
		
		[Test]
		public void RemoteSources_Called_ReturnsRemoteSources()
		{
			//arrange
			_installManager.SetUserDisclaimerConfirmed();
			_installManager.SyncConfig();
			
			//act
			var remoteSources = _installManager.RemoteSources.ToArray();
			
			//assert
			Assert.That (remoteSources.Length > 0);
		}
		
		[Test]
		public void RefreshRemoteSource_Called_ReturnsTrue()
		{
			//arrange
			_installManager.SetUserDisclaimerConfirmed();
			_installManager.SyncConfig();
			string firstSource =  _installManager.RemoteSources.First();
			bool result = _installManager.RefreshRemoteSource(firstSource);
			
			//act
			Assert.That (result, Is.True);
		}
		
		[Test]
		public void GetRemoteModInfoList_FirstSource_ReturnsModInfoList()
		{
			//arrange
			_installManager.SetUserDisclaimerConfirmed();
			_installManager.SyncConfig();
			string firstSource =  _installManager.RemoteSources.First();
			_installManager.RefreshRemoteSource(firstSource);
			
			ModInfo[] remoteModInfos;
			using(Manager manager = new Manager())
			{
				//act
				remoteModInfos = _installManager.GetRemoteModInfoList(manager, firstSource).ToArray();
			}
			
			//assert
			Assert.That (remoteModInfos.Length, Is.GreaterThan(0));
		}
		
		[Test]
		public void RemoteInstallModule_KJV_ReturnsTrue()
		{
			//arrange
			_installManager.SetUserDisclaimerConfirmed();
			Assert.That (_installManager.SyncConfig(), Is.True);
			Assert.That (_installManager.RefreshRemoteSource("CrossWire"), Is.True);
			
			using(Manager manager = new Manager("LocalManager"))
			{
				//act
				bool result = _installManager.RemoteInstallModule(manager, "CrossWire", "KJV");
				
				//assert
				Assert.That (result, Is.True);
			}
		}
	}
}

