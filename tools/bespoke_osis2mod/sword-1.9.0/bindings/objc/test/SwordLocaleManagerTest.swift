//
//  SwordLocaleManagerTest.swift
//  ObjCSword
//
//  Created by Manfred Bergmann on 02.10.16.
//
//

import XCTest

class SwordLocaleManagerTest: XCTestCase {

    override func setUp() {
        super.setUp()
    }
    
    override func tearDown() {
        super.tearDown()
    }

    func testDefaultLocalSetup() {
        let locMgr = SwordLocaleManager.default()
        locMgr?.initLocale()
        
        let defaultLocName = locMgr?.getDefaultLocaleName()
        print(defaultLocName)
        XCTAssert(defaultLocName != nil)
        XCTAssert(defaultLocName == "de")
    }
}
