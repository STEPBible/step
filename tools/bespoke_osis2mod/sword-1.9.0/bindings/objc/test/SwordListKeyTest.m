//
//  SwordListKeyTest.m
//  MacSword2
//
//  Created by Manfred Bergmann on 10.04.09.
//  Copyright 2009 __MyCompanyName__. All rights reserved.
//

#import <ObjCSword/ObjCSword.h>
#import "SwordListKeyTest.h"

@implementation SwordListKeyTest

- (void)testContainsKey {
    SwordListKey *lk = [SwordListKey listKeyWithRef:@"Gen 1:1-5" v11n:@"KJV"];
    SwordVerseKey *vk = [SwordVerseKey verseKeyWithRef:@"Gen 1:3"];
    XCTAssertTrue([lk containsKey:vk], @"");
}

/*
- (void)testNumberOfVerses {
    SwordListKey *lk = [SwordListKey listKeyWithRef:@"gen 1:2-20" v11n:@"KJV"];
    XCTAssertNotNil(lk, @"");
    XCTAssertTrue(([lk numberOfVerses] == 19), @"");
}
*/

- (void)testVerseEnumeratorAllObjects {
    SwordListKey *lk = [SwordListKey listKeyWithRef:@"gen 1:2-20" v11n:@"KJV"];
    XCTAssertNotNil(lk, @"");
    
    VerseEnumerator *ve = [lk verseEnumerator];
    NSArray *verseRefs = [ve allObjects];
    XCTAssertNotNil(verseRefs, @"");
    XCTAssertTrue(([verseRefs count] == 19), @"");
}

- (void)testVerseEnumeratorNextObject {
    SwordListKey *lk = [SwordListKey listKeyWithRef:@"gen 1:2-20" v11n:@"KJV"];
    XCTAssertNotNil(lk, @"");
    
    VerseEnumerator *ve = [lk verseEnumerator];
    int count = 0;
    NSString *ref;
    while((ref = [ve nextObject])) {
        count++;
    }
    XCTAssertTrue((count == 19), @"");
}

@end
