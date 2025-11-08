//
//  SwordLocaleManager.mm
//  ObjCSword
//
//  Created by Manfred Bergmann on 01.08.10.
//  Copyright 2010 Software by MABE. All rights reserved.
//

#import "SwordLocaleManager.h"

#include <swmgr.h>		// C++ Sword API
#include <localemgr.h>

@implementation SwordLocaleManager

+ (SwordLocaleManager *)defaultManager {
    static SwordLocaleManager *instance = nil;
    if(instance == nil) {
        // use default path
        instance = [[SwordLocaleManager alloc] init];
    }
    
	return instance;
}

- (void)initLocale {
    // set locale swManager
    NSString *resourcePath = [[NSBundle bundleForClass:[SwordLocaleManager class]] resourcePath];
    NSString *localePath = [resourcePath stringByAppendingPathComponent:@"locales.d"];
    [self initLocaleWithLocaledPath:localePath];
}

- (void)initLocaleWithLocaledPath:(NSString *)aPath {
    sword::LocaleMgr *lManager = sword::LocaleMgr::getSystemLocaleMgr();
    lManager->loadConfigDir([aPath UTF8String]);
    
    //get the language
    NSArray *availLocales = [NSLocale preferredLanguages];
    
    NSString *lang = nil;
    NSString *loc;
    BOOL haveLocale = NO;
    // for every language, check if we know the locales
    sword::StringList localeList = lManager->getAvailableLocales();
    NSEnumerator *iter = [availLocales objectEnumerator];
    while((loc = [iter nextObject]) && !haveLocale) {
        // check if this locale is available in SWORD
        sword::StringList::iterator it;
        sword::SWBuf locale;
        for(it = localeList.begin(); it != localeList.end(); ++it) {
            locale = *it;
            NSString *swLoc = [NSString stringWithUTF8String:locale.c_str()];
            if([loc hasPrefix:swLoc]) {
                haveLocale = YES;
                lang = swLoc;
                break;
            }
        }        
    }
    
    if(haveLocale) {
        lManager->setDefaultLocaleName([lang UTF8String]);    
    }
}

- (NSString *)getDefaultLocaleName {
    sword::LocaleMgr *lManager = sword::LocaleMgr::getSystemLocaleMgr();
    
    const char *localeName = lManager->getDefaultLocaleName();
    if(localeName == NULL) return nil;
    else return [NSString stringWithUTF8String:localeName];
}

@end
