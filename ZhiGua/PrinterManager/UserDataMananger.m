//
//  UserDataMananger.m
//  BluePrint
//
//  Created by alexyang on 2016/12/9.
//  Copyright © 2016年 com.iNanhu. All rights reserved.
//

#import "UserDataMananger.h"
#define kUsernameKey @"login_username_key"
#define kPasswordKey @"login_pwd_key"
#define kPasswordAKey @"login_apwd_key"
#define kUserRoleKey @"login_role_key"
#define kRemPsdKey   @"login_rem_pwd"

@implementation UserDataMananger

@synthesize curLoaction2D;
static UserDataMananger *manager;
+ (id)sharedManager
{
    @synchronized(self)
    {
        if (!manager)
        {
            manager = [[UserDataMananger alloc] init];
            
        }
        return manager;
    }
}

- (void)setStrUserName:(NSString *)strUserName
{
    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
    [userDefaults setObject:strUserName forKey:kUsernameKey];
    [userDefaults synchronize];
}

- (NSString *)strUserName
{
    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
    return [userDefaults objectForKey:kUsernameKey];
}

- (void)setStrUserPsd:(NSString *)strPsd
{
    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
    [userDefaults setObject:strPsd forKey:kPasswordKey];
    [userDefaults synchronize];
}

- (NSString *)strUserPsd
{
    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
    return [userDefaults objectForKey:kPasswordKey];
}

- (void)setStrUserAPsd:(NSString *)strAPsd
{
    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
    [userDefaults setObject:strAPsd forKey:kPasswordAKey];
    [userDefaults synchronize];
}

- (NSString *)strUserAPsd
{
    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
    return [userDefaults objectForKey:kPasswordAKey];
}

- (void)setStrRoleType:(NSString *)strRoleType
{
    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
    [userDefaults setObject:strRoleType forKey:kUserRoleKey];
    [userDefaults synchronize];
}

- (NSString *)strRoleType
{
    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
    return [userDefaults objectForKey:kUserRoleKey];
}

- (void)setBRemPsd:(BOOL)bRemPsd
{
    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
    [userDefaults setObject:[NSNumber numberWithBool:bRemPsd] forKey:kRemPsdKey];
    [userDefaults synchronize];
}

- (BOOL)bRemPsd
{
    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
    NSNumber *nRemPsd = [userDefaults objectForKey:kRemPsdKey];
    return [nRemPsd boolValue];
}

- (void)setCurLoaction2D:(CLLocationCoordinate2D)curLoaction2Dc {
    
    curLoaction2D = curLoaction2Dc;
}

- (CLLocationCoordinate2D)curLoaction2D {
    
    return curLoaction2D;
}

@end
