//
//  SwordListKey.mm
//  MacSword2
//
//  Created by Manfred Bergmann on 10.04.09.
//  Copyright 2009 __MyCompanyName__. All rights reserved.
//

#import <ObjCSword/ObjCSword.h>

@implementation SwordListKey

+ (SwordListKey *)listKeyWithRef:(NSString *)aRef {
    return [[SwordListKey alloc] initWithRef:aRef];
}

+ (SwordListKey *)listKeyWithRef:(NSString *)aRef v11n:(NSString *)scheme {
    return [[SwordListKey alloc] initWithRef:aRef v11n:scheme];
}

+ (SwordListKey *)listKeyWithRef:(NSString *)aRef headings:(BOOL)headings v11n:(NSString *)scheme {
    return [[SwordListKey alloc] initWithRef:aRef headings:headings v11n:scheme];
}

+ (SwordListKey *)listKeyWithSWListKey:(sword::ListKey *)aLk {
    return [[SwordListKey alloc] initWithSWListKey:aLk];
}

+ (SwordListKey *)listKeyWithSWListKey:(sword::ListKey *)aLk makeCopy:(BOOL)copy {
    return [[SwordListKey alloc] initWithSWListKey:aLk makeCopy:copy];    
}

- (id)init {
    return [super init];
}

- (SwordListKey *)initWithSWListKey:(sword::ListKey *)aLk {
    return (SwordListKey *) [super initWithSWKey:aLk];
}

- (SwordListKey *)initWithSWListKey:(sword::ListKey *)aLk makeCopy:(BOOL)copy {
    return (SwordListKey *) [super initWithSWKey:aLk makeCopy:copy];
}

- (SwordListKey *)initWithRef:(NSString *)aRef {
    return [self initWithRef:aRef v11n:nil];
}

- (SwordListKey *)initWithRef:(NSString *)aRef v11n:(NSString *)scheme {
    return [self initWithRef:aRef headings:NO v11n:scheme];
}

- (SwordListKey *)initWithRef:(NSString *)aRef headings:(BOOL)headings v11n:(NSString *)scheme {
    sword::VerseKey vk;
    vk.setIntros((char)headings);
    if(scheme) {
        vk.setVersificationSystem([scheme UTF8String]);
    }
    sword::ListKey listKey = vk.parseVerseList([aRef UTF8String], "gen", true);
    sword::ListKey *lk = new sword::ListKey(listKey);
    lk->setPersist(true);

    return (SwordListKey *) [super initWithSWKey:lk];
}

- (NSInteger)numberOfVerses {
    NSInteger ret = 0;
    if(sk) {
        for(*sk = sword::TOP; !sk->popError(); *sk++) ret++;
    }
    return ret;
}

- (void)parse {
}

- (void)parseWithHeaders {
}

- (VerseEnumerator *)verseEnumerator {
    return [[VerseEnumerator alloc] initWithListKey:self];
}

- (BOOL)containsKey:(SwordVerseKey *)aVerseKey {
    BOOL ret = NO;
    if(sk) {
        *sk = [[aVerseKey osisRef] UTF8String];
        ret = !sk->popError();
    }
    return ret;
}

- (sword::ListKey *)swListKey {
    return (sword::ListKey *)sk;
}

@end
