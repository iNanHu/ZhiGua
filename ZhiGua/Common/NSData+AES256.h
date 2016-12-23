//
//  NSData+AES256.h
//  SmartHouseNew
//
//  Created by 壹道IOS开发 on 16/8/3.
//  Copyright © 2016年 一道物联科技. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CommonCrypto/CommonDigest.h>
#import <CommonCrypto/CommonCryptor.h>

@interface NSData(AES256)
-(NSData *) aes256_encrypt:(NSString *)key;
-(NSData *) aes256_decrypt:(NSString *)key;
- (NSData *)AES128EncryptWithKey:(NSString *)key;   //加密
- (NSData *)AES128DecryptWithKey:(NSString *)key;   //解密
@end
