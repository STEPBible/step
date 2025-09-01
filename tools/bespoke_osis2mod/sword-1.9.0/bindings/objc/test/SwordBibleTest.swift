//
//  SwordBibleTest.swift
//  ObjCSword
//
//  Created by Manfred Bergmann on 04.10.14.
//
//

import Foundation
import XCTest

class SwordBibleTest: XCTestCase {
    
    var mgr: SwordManager?
    
    override func setUp() {
        super.setUp()
    
        Configuration.config(withImpl: OSXConfiguration())
        FilterProviderFactory().initWithImpl(DefaultFilterProvider())
        mgr = SwordManager(path:Configuration.config().defaultModulePath())
    }
    
    func testGetBible() {
        let bibleMod = mgr?.module(withName: "GerNeUe")
        XCTAssertNotNil(bibleMod);
    }
}
