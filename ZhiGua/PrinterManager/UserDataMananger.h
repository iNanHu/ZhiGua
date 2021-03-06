//
//  UserDataMananger.h
//  BluePrint
//
//  Created by alexyang on 2016/12/9.
//  Copyright © 2016年 com.iNanhu. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreLocation/CLLocation.h>

@interface UserDataMananger : NSObject

@property (nonatomic, strong) NSString *strUserName;
@property (nonatomic, strong) NSString *strUserPsd;
@property (nonatomic, strong) NSString *strUserAPsd;
@property (nonatomic, strong) NSString *strRoleType;
@property (nonatomic, assign) BOOL bRemPsd;
@property (nonatomic, assign) CLLocationCoordinate2D curLoaction2D;

+ (id)sharedManager;
@end
