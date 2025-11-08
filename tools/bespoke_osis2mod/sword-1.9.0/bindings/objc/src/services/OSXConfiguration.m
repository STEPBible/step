//
//  OSXConfiguration.m
//  ObjCSword
//
//  Created by Manfred Bergmann on 12.06.10.
//  Copyright 2010 Software by MABE. All rights reserved.
//

#import "OSXConfiguration.h"


@implementation OSXConfiguration

- (NSString *)osVersion {
    return [[NSDictionary dictionaryWithContentsOfFile:@"/System/Library/CoreServices/SystemVersion.plist"] objectForKey:@"ProductVersion"];
}

- (NSString *)bundleVersion {
    return (NSString *)CFBundleGetValueForInfoDictionaryKey(CFBundleGetMainBundle(), kCFBundleVersionKey);
}

- (NSString *)defaultModulePath {
    NSArray *urls = [[NSFileManager defaultManager] URLsForDirectory:NSApplicationSupportDirectory inDomains:NSUserDomainMask];
    if(urls.count > 0) {
        return [[(NSURL *)urls[0] path] stringByAppendingPathComponent:@"Sword"];
    }
    return nil;
}

- (NSString *)defaultAppSupportPath {
    NSArray *urls = [[NSFileManager defaultManager] URLsForDirectory:NSApplicationSupportDirectory inDomains:NSUserDomainMask];
    if(urls.count > 0) {
        NSString *folder = [[(NSURL *)urls[0] path] stringByAppendingPathComponent:@"ObjCSword"];
        if(![[NSFileManager defaultManager] fileExistsAtPath:folder]) {
            [[NSFileManager defaultManager] createDirectoryAtPath:folder withIntermediateDirectories:NO attributes:nil error:NULL];
        }
        return folder;
    }
    return nil;
}

- (NSString *)tempFolder {
    NSArray *urls = [[NSFileManager defaultManager] URLsForDirectory:NSCachesDirectory inDomains:NSUserDomainMask];
    if(urls.count > 0) {
        NSString *folder = [[(NSURL *)urls[0] path] stringByAppendingPathComponent:@"ObjCSword"];
        if(![[NSFileManager defaultManager] fileExistsAtPath:folder]) {
            [[NSFileManager defaultManager] createDirectoryAtPath:folder withIntermediateDirectories:NO attributes:nil error:NULL];
        }
        return folder;
    }
    return nil;
}

- (NSString *)logFile {
    NSArray *urls = [[NSFileManager defaultManager] URLsForDirectory:NSLibraryDirectory inDomains:NSUserDomainMask];
    if(urls.count > 0) {
        return [[[(NSURL *)urls[0] path] stringByAppendingPathComponent:@"Logs"] stringByAppendingPathComponent:@"ObjCSword.log"];
    }
    return nil;
}

@end
