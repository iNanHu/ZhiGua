//
//  NSString +AES256.h
//  SmartHouseNew
//
//  Created by 壹道IOS开发 on 16/8/3.
//  Copyright © 2016年 一道物联科技. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CommonCrypto/CommonDigest.h>
#import <CommonCrypto/CommonCryptor.h>

#import "NSData+AES256.h"

#define __BASE64( text )        [CommonFunc base64StringFromText:text]
#define __TEXT( base64 )        [CommonFunc textFromBase64String:base64]

@interface NSString(AES256)

-(NSString *) aes256_encrypt:(NSString *)key;
-(NSString *) aes256_decrypt:(NSString *)key;

@end
