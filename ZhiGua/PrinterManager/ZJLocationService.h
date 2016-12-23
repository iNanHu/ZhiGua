//
//  ZJLocationService.h
//  ZJLocation-OC
//
//  Created by ZeroJianMBP on 16/5/10.
//  Copyright © 2016年 ZeroJian. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreLocation/CoreLocation.h>

@interface ZJLocationService : NSObject <CLLocationManagerDelegate>

typedef void (^updateLocationBlock)(CLLocation *);

@property (nonatomic, copy) updateLocationBlock updateBlock;
@property (nonatomic, copy) updateLocationBlock lastBlock;

+ (void)statrLocation;
+ (void)stopLocation;
+ (ZJLocationService *)sharedModel;

+ (void)backgroundForPauseTime:(double)time locationCounts:(int)counts;
+ (void)backgroundForPauseTime:(double)time;
+ (void)backgroundForLocationCounts:(int)counts;


@end
