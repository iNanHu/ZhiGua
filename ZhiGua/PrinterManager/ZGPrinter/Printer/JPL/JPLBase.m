//
//  JPLBase.m
//  BLETR
//
//  Created by JQTEK on 15/4/15.
//  Copyright (c) 2015年 ISSC. All rights reserved.
//

#import "JPLBase.h"

@implementation JPLBase
@synthesize port;
@synthesize printInfo;
@synthesize buffer;

-(id) init{
    self = [super init];
    port = nil;
    printInfo = nil;
    return self;
}


@end
