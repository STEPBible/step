//
//  iOSConfiguration.m
//  ObjCSword-iOS
//
//  Created by Manfred Bergmann on 10.03.11.
//  Copyright 2011 Software by MABE. All rights reserved.
//

#import "iOSConfiguration.h"


@implementation iOSConfiguration

- (NSString *)osVersion {
    return [[UIDevice currentDevice] systemVersion];
}

- (NSString *)bundleVersion {
    return (NSString *)CFBundleGetValueForInfoDictionaryKey(CFBundleGetMainBundle(), kCFBundleVersionKey);
}

- (NSString *)defaultModulePath {
    return [[NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex: 0] stringByAppendingString: @"/Modules"];
}

- (NSString *)defaultAppSupportPath {
    return [[NSSearchPathForDirectoriesInDomains(NSApplicationSupportDirectory, NSUserDomainMask, YES) objectAtIndex: 0] stringByAppendingString: @"/"];
}

- (NSString *)tempFolder {
    return [[NSSearchPathForDirectoriesInDomains(NSCachesDirectory, NSUserDomainMask, YES) objectAtIndex: 0] stringByAppendingString: @"/Temp"];
}

- (NSString *)logFile {
    return [super logFile];
}

@end
