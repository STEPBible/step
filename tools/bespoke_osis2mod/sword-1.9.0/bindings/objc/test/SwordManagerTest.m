//
//  SwordManagerTest.m
//  ObjCSword
//
//  Created by Manfred Bergmann on 02.03.16.
//
//

#import <XCTest/XCTest.h>
#import <ObjCSword/ObjCSword.h>

@interface SwordManagerTest : XCTestCase

@end

@implementation SwordManagerTest {
    SwordManager *mgr;
}

- (void)setUp {
    [super setUp];

    [Configuration configWithImpl:[[OSXConfiguration alloc] init]];
    [[FilterProviderFactory providerFactory] initWithImpl:[[DefaultFilterProvider alloc] init]];
    
    NSString *modulePath = [[[NSBundle bundleForClass:[self class]] resourcePath] stringByAppendingPathComponent:@"TestModules"];
    
    mgr = [SwordManager managerWithPath:modulePath];
}

- (void)testAvailableModules {
    XCTAssert(mgr != nil);
    
    NSInteger count = [[mgr allModules] count];
    XCTAssert(count > 0);
    NSLog(@"Modules: %lu", count);
}

- (void)testGetModule {
    SwordModule *mod = [mgr moduleWithName:@"KJV"];
    XCTAssert(mod != nil);
    XCTAssert([[mod name] isEqualToString:@"KJV"]);
}

- (void)testReloadWithRenderedKey_String {
    SwordModule *mod = [mgr moduleWithName:@"KJV"];

    [mod setKeyString:@"Gen 1:1"];
    NSString *text = [mod renderedText];
    XCTAssert(text != nil);
    XCTAssert(text.length > 0);
    NSLog(@"text: %@", text);
    
    [mgr reloadManager];
    mod = [mgr moduleWithName:@"KJV"];
    XCTAssert(mod != nil);
    XCTAssert([[mod name] isEqualToString:@"KJV"]);
}

- (void)testReloadWithRenderedKey_SwordKey {
    SwordModule *mod = [mgr moduleWithName:@"KJV"];
    
    SwordKey *key = [SwordKey swordKeyWithRef:@"Gen 1"];
    [mod setSwordKey:key];
    NSString *text = [mod renderedText];
    XCTAssert(text != nil);
    XCTAssert(text.length > 0);
    NSLog(@"text: %@", text);
    
    [mgr reloadManager];
    mod = [mgr moduleWithName:@"KJV"];
    XCTAssert(mod != nil);
    XCTAssert([[mod name] isEqualToString:@"KJV"]);
}

- (void)testReloadWithRenderedKey_CustomRender {
    SwordModule *mod = [mgr moduleWithName:@"KJV"];

    NSArray *textEntries = [(SwordBible *)mod renderedTextEntriesForRef:@"Gen 1" context:0];
    XCTAssert(textEntries != nil);
    NSLog(@"Entries: %lu", [textEntries count]);
    XCTAssert([textEntries count] == 31);
    
    [mgr reloadManager];
    mod = [mgr moduleWithName:@"KJV"];
    XCTAssert(mod != nil);
    XCTAssert([[mod name] isEqualToString:@"KJV"]);
}

@end
