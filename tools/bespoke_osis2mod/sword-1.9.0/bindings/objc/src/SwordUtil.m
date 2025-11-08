//
// Created by mbergmann on 18.12.12.
//
// To change the template use AppCode | Preferences | File Templates.
//


#import <ObjCSword/ObjCSword.h>
#import "SwordUtil.h"


@implementation SwordUtil

+ (NSDictionary *)dictionaryFromUrl:(NSURL *)aURL {
    NSMutableDictionary *ret = [NSMutableDictionary dictionary];

    NSString *scheme = [aURL scheme];
    if([scheme isEqualToString:@"sword"]) {
        // in this case host is the module and path the reference
        ret[ATTRTYPE_MODULE] = [aURL host];
        ret[ATTRTYPE_VALUE] = [[[aURL path] stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding]
                stringByReplacingOccurrencesOfString:@"/" withString:@""];
        ret[ATTRTYPE_TYPE] = @"scriptRef";
        ret[ATTRTYPE_ACTION] = @"showRef";
    } else if([scheme isEqualToString:@"applewebdata"]) {
        // in this case
        NSString *path = [aURL path];
        NSString *query = [aURL query];
        if([[path lastPathComponent] isEqualToString:@"passagestudy.jsp"]) {
            NSArray *data = [query componentsSeparatedByString:@"&"];
            NSString *type = @"x";
            NSString *module = @"";
            NSString *passage = @"";
            NSString *value = @"1";
            NSString *action = @"";
            for(NSString *entry in data) {
                if([entry hasPrefix:@"type="]) {
                    type = [entry componentsSeparatedByString:@"="][1];
                } else if([entry hasPrefix:@"module="]) {
                    module = [entry componentsSeparatedByString:@"="][1];
                } else if([entry hasPrefix:@"passage="]) {
                    passage = [entry componentsSeparatedByString:@"="][1];
                } else if([entry hasPrefix:@"action="]) {
                    action = [entry componentsSeparatedByString:@"="][1];
                } else if([entry hasPrefix:@"value="]) {
                    value = [entry componentsSeparatedByString:@"="][1];
                } else {
                    ALog(@"Unknown parameter: %@", entry);
                }
            }

            ret[ATTRTYPE_MODULE] = [module stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
            ret[ATTRTYPE_PASSAGE] = [passage stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
            ret[ATTRTYPE_VALUE] = [value stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
            ret[ATTRTYPE_ACTION] = [action stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
            ret[ATTRTYPE_TYPE] = [type stringByReplacingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
        }
    }

    return ret;
}

+ (NSArray *)padStrongsNumbers:(NSArray *)unpaddedNumbers {
    NSMutableArray *buf = [NSMutableArray array];
    for(NSString *lemma in unpaddedNumbers) {
        [buf addObjectsFromArray:[self padStrongsNumber:lemma]];
    }
    return [NSArray arrayWithArray:buf];
}

+ (NSArray *)padStrongsNumber:(NSString *)unpaddedNumber {
    NSMutableArray *buf = [NSMutableArray array];
    // Hebrew
    NSString *prefix = nil;
    if([unpaddedNumber hasPrefix:@"H"]) {
        prefix = @"H";
    }
    if([unpaddedNumber hasPrefix:@"G"]) {
        prefix = @"G";
    }
    
    if(prefix != nil) {
        // lemma may contain more codes concatenated by space
        NSArray *keys = [unpaddedNumber componentsSeparatedByString:@" "];
        for(__strong NSString *key in keys) {
            // trim
            key = [key stringByReplacingOccurrencesOfString:@" " withString:@""];
            NSArray *keyComps = [key componentsSeparatedByString:prefix];
            if(keyComps.count == 2) {
                NSString *keyValue = [self leftPadStrongsFormat:keyComps[1]];
                // add to result array
                [buf addObject:[NSString stringWithFormat:@"%@%@", prefix, keyValue]];
            }
        }
    } else {
        [buf addObject:unpaddedNumber];
    }
    
    return [NSArray arrayWithArray:buf];
}

+ (NSString *)leftPadStrongsFormat:(NSString *)unpadded {
    int number = [unpadded intValue];
    return [NSString stringWithFormat:@"%005i", number];
}

@end