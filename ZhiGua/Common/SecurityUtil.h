//
//  SecurityUtil.h
//  SmartHouseNew
//
//  Created by 壹道IOS开发 on 16/8/3.
//  Copyright © 2016年 一道物联科技. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface SecurityUtil : NSObject

#pragma mark - base64
+ (NSString*)encodeBase64String:(NSString *)input;
+ (NSString*)decodeBase64String:(NSString *)input;

+ (NSString*)encodeBase64Data:(NSData *)data;
+ (NSString*)decodeBase64Data:(NSData *)data;

#pragma mark - AES加密
//将string转成带密码的data
+ (NSString*)encryptAESData:(NSString*)string app_key:(NSString*)key ;
//将带密码的data转成string
+(NSString*)decryptAESData:(NSData*)data app_key:(NSString*)key ;

+ (NSData *) md5:(NSString *) input;

@end
