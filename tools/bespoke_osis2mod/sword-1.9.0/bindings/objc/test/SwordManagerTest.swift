//
//  SwordManagerTest.swift
//  ObjCSword
//
//  Created by Manfred Bergmann on 02.03.16.
//
//

import XCTest

class SwordManagerTest: XCTestCase {

    var mgr: SwordManager?

    override func setUp() {
        super.setUp()
        
        let modulesDir = NSBundle(forClass:self.dynamicType).resourcePath!.stringByAppendingString("/TestModules")
        NSLog("modulesDir: \(modulesDir)")
        
        Configuration.configWithImpl(OSXConfiguration())
        FilterProviderFactory().initWithImpl(DefaultFilterProvider())
        mgr = SwordManager(path:modulesDir)
    }
    
    func testAvailableModules() {
        XCTAssert(mgr != nil)
        XCTAssert(mgr?.modules.count > 0)
        NSLog("modules: \(mgr?.modules.count)")
    }
    
    func testGetModule() {
        let mod = mgr?.moduleWithName("kjv")
        XCTAssert(mod != nil)
        XCTAssert(mod?.name() == "KJV")
    }

    func testReload() {
        var mod = mgr?.moduleWithName("kjv")
        
        mgr?.reloadManager()
        mod = mgr?.moduleWithName("kjv")
        
        XCTAssert(mod != nil)
        XCTAssert(mod?.name() == "KJV")
    }

    func testReloadWithKeyString() {
        var mod = mgr?.moduleWithName("kjv")
        
        let te = mod?.renderedTextEntriesForRef("Gen 1")
        XCTAssert(te?.count > 0)
        NSLog(te![0] as! String)
        
//        mod?.setKeyString("Gen 1")
//        let text = mod?.renderedText()
//        XCTAssert(text != nil)
//        XCTAssert(text?.lengthOfBytesUsingEncoding(NSUTF8StringEncoding) > 0)
//        NSLog(text!)
        
        mgr?.reloadManager()
        mod = mgr?.moduleWithName("kjv")
        
        XCTAssert(mod != nil)
        XCTAssert(mod?.name() == "KJV")
    }
}
