//
//  WGS84TOGCJ02.h
//  ZhiGua
//
//  Created by alexyang on 2016/12/27.
//  Copyright © 2016年 com.iNanhu. All rights reserved.
//
#import <CoreLocation/CLLocation.h>
#import <Foundation/Foundation.h>

@interface WGS84TOGCJ02 : NSObject
//判断是否已经超出中国范围
+(BOOL)isLocationOutOfChina:(CLLocationCoordinate2D)location;
//转GCJ-02
+(CLLocationCoordinate2D)transformFromWGSToGCJ:(CLLocationCoordinate2D)wgsLoc;
@end
