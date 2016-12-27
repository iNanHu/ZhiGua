//
//  MMPrinterManager.m
//  MMPrinterDemo
//
//  Created by Zhaomike on 16/3/17.
//  Copyright © 2016年 mikezhao. All rights reserved.
//
#import <CommonCrypto/CommonDigest.h>
#import "MMPrinterManager.h"
#import "YDBlutoothTool.h"
#import "MyPeripheral.h"
#import "JQPrinter.h"
#import "PrinterType.h"
#import "PrintService.h"
#import "SecurityUtil.h"
#import "NetManager.h"
#import "XMLReader.h"
#import "UserDataMananger.h"

#define PRINT_LINE_SPACE 10

@interface MMPrinterManager()
@property (nonatomic, strong) NSString *strMac;
@property (nonatomic, strong) NSString *strName;
@property (nonatomic, assign) NSInteger onlieCount; //设备上线超传计数
@end

@implementation MMPrinterManager

+ (id)shareInstance {
    static MMPrinterManager *myPrintMgr;
    static dispatch_once_t predicate;
    dispatch_once(&predicate, ^{
        myPrintMgr = [[self alloc] init];
        
    });
    return myPrintMgr;
}

- (NSString*) sha1:(NSString *)src
{
    const char *cstr = [src cStringUsingEncoding:NSUTF8StringEncoding];
    NSData *data = [NSData dataWithBytes:cstr length:src.length];
    
    uint8_t digest[CC_SHA1_DIGEST_LENGTH];
    
    CC_SHA1(data.bytes, data.length, digest);
    
    NSMutableString* output = [NSMutableString stringWithCapacity:CC_SHA1_DIGEST_LENGTH * 2];
    
    for(int i = 0; i < CC_SHA1_DIGEST_LENGTH; i++)
        [output appendFormat:@"%02x", digest[i]];
    
    return output;
}

-(NSString *)ret32bitString {
    
    char data[32];
    for (int x=0;x<32;data[x++] = (char)('A' + (arc4random_uniform(26))));
    return [[NSString alloc] initWithBytes:data length:32 encoding:NSUTF8StringEncoding];
}

- (NSString *)getTokenIdWithNonce:(NSString *)nonce andTimeStamp:(NSString *) timeStamp {
    
    NSString *token = @"zgone";
    NSArray *arr = @[token,timeStamp,nonce];
    //给params排序
    NSArray *tempArr = [arr sortedArrayUsingComparator:^NSComparisonResult(id  _Nonnull obj1, id  _Nonnull obj2) {
        NSString *strTitle1 = [obj1 lowercaseString];
        NSString *strTitle2 = [obj2 lowercaseString];
        NSString *sTtitle1 = [strTitle1 substringToIndex:1];
        NSString *sTitle2 = [strTitle2 substringToIndex:1];
        NSComparisonResult result = [sTtitle1 compare:sTitle2];
        
        return result;
    }];
    arr = [NSMutableArray arrayWithArray:tempArr];
    
    NSString *strToken = [NSString stringWithFormat:@"%@%@%@",arr[0],arr[1],arr[2]];
    
    return [self sha1:strToken];
}

- (void)printStatusOnlineWithBtName:(NSString *)strBtName andBtMac:(NSString *)strBtMac{
    
    NSString *strUserName = [[UserDataMananger sharedManager] strUserName];
    NSString *strUserPwd = [[UserDataMananger sharedManager] strUserPsd];
    NSString *strRoleType = [[UserDataMananger sharedManager] strRoleType];
    
    NSString *strRandom = [self ret32bitString];
    NSString *interval = [NSString stringWithFormat:@"%ld000",(long)[[NSDate date] timeIntervalSince1970]];
    NSString *strSig = [self getTokenIdWithNonce:strRandom andTimeStamp:interval];
    
    _strName = strBtName;
    _strMac = strBtMac;

    NSLog(@"printStatusOnlineWithBtName: psd %@",strUserPwd);
    
    NSData *dataPwd = [SecurityUtil md5:strUserPwd];
    strUserPwd = [SecurityUtil encodeBase64Data:dataPwd];
    
    NSMutableString *reqxml = [[NSMutableString alloc]init];
    [reqxml appendString:@"<?xml version=\"1.0\" encoding=\"utf-16\"?>\n"];
    [reqxml appendString:@"<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\">\n"];
    [reqxml appendString:@"<soap:Body>\n"];
    [reqxml appendString:@"<printerOnlineWS xmlns=\"http://ws.wechat.zg1sk.com/\">\n"];
    [reqxml appendString:@"<arg0 xmlns=\"\">\n"];
    [reqxml appendFormat:@"<nonce>%@</nonce>\n",strRandom];
    [reqxml appendFormat:@"<signature>%@</signature>\n",strSig];
    [reqxml appendFormat:@"<timestamp>%@</timestamp>\n",interval];
    [reqxml appendFormat:@"<accounts>%@</accounts>\n",strUserName];
    [reqxml appendFormat:@"<mac>%@</mac>\n",strBtMac];
    [reqxml appendFormat:@"<password>%@</password>\n",strUserPwd];
    [reqxml appendFormat:@"<printerName>%@</printerName>\n",strBtName];
    [reqxml appendFormat:@"<roleType>%@</roleType>\n",strRoleType];
    [reqxml appendFormat:@"</arg0>\n"];
    [reqxml appendFormat:@"</printerOnlineWS>\n"];
    [reqxml appendFormat:@"</soap:Body>\n"];
    [reqxml appendFormat:@"</soap:Envelope>\n"];
    
    NSDictionary *dicTemp = @{@"body":reqxml};
    
    SuccBlock sucBlock = ^(id  _Nullable responseObject) {
        NSError *err = nil;
        NSArray *arrVal = @[@"S:Envelope",@"S:Body",@"ns2:printerOnlineWSResponse",@"PrinterOnlineResponse"];
        NSDictionary *dicRes = [XMLReader dictionaryForXMLData:responseObject error:&err];
        for (int i = 0; i < arrVal.count; i++) {
            dicRes = [dicRes objectForKey:arrVal[i]];
        }
        
        NSDictionary *dicResCode = [dicRes objectForKey:@"resultCode"];
        NSDictionary *dicMsg = [dicRes objectForKey:@"msg"];
        NSString *strResCode = [dicResCode objectForKey:@"text"];
        NSString *strMsg = [dicMsg objectForKey:@"text"];
        
        NSLog(@"resultCode: %@ msg: %@",strResCode,strMsg);
        
        if ([strResCode isEqualToString:@"000000"]) {
            NSLog(@"更新设备上线成功");
            
            NSDictionary *dicHost = [dicRes objectForKey:@"mqttHost"];
            NSDictionary *dicMqttName = [dicRes objectForKey:@"mqttUserName"];
            NSDictionary *dicMqttPsd = [dicRes objectForKey:@"mqttPassWord"];
            NSDictionary *dicEqId = [dicRes objectForKey:@"equipmentID"];
            NSString *strHost = [dicHost objectForKey:@"text"];
            NSString *strMqttName = [dicMqttName objectForKey:@"text"];
            NSString *strMqttPsd = [dicMqttPsd objectForKey:@"text"];
            NSString *strEqId = [dicEqId objectForKey:@"text"];
            
            [[PrintService shareInstance] initClientModule:strMqttName andPwd:strMqttPsd andMsgId:strEqId andHost:strHost];
            
            _onlieCount = 0;
        } else {
            NSLog(@"err: %@",strMsg);
            if (_onlieCount++ >= 3) {
                [self printStatusOnlineWithBtName:_strName andBtMac:_strMac];
            }else {
                [[YDBlutoothTool sharedBlutoothTool]breakConnect:YES];
            }
        }
    };
    FailBlock failBlock = ^(id  _Nullable responseObject, NSError * _Nonnull error) {
        
        NSLog(@"error: %@",error);
        if (_onlieCount++ >= 3) {
            [self printStatusOnlineWithBtName:_strName andBtMac:_strMac];
        }else {
            [[YDBlutoothTool sharedBlutoothTool]breakConnect:YES];
        }
    };
    
    [[NetManager shareInstance]postMsg:PRINTIN withParams:dicTemp withSuccBlock:sucBlock withFailBlock:failBlock];
}

- (void)printStatusOfflineWithBtName:(NSString *)strBtName andBtMac:(NSString *)strBtMac {
    
    NSString *strUserName = [[UserDataMananger sharedManager] strUserName];
    NSString *strUserPwd = [[UserDataMananger sharedManager] strUserPsd];
    NSString *strRoleType = [[UserDataMananger sharedManager] strRoleType];
    NSString *strRandom = [self ret32bitString];
    NSString *interval = [NSString stringWithFormat:@"%ld000",(long)[[NSDate date] timeIntervalSince1970]];
    NSString *strSig = [self getTokenIdWithNonce:strRandom andTimeStamp:interval];
    
    NSLog(@"printStatusOfflineWithBtName: userPsd %@",strUserPwd);
    
    NSData *dataPwd = [SecurityUtil md5:strUserPwd];
    strUserPwd = [SecurityUtil encodeBase64Data:dataPwd];
    
    NSMutableString *reqxml = [[NSMutableString alloc]init];
    [reqxml appendString:@"<?xml version=\"1.0\" encoding=\"utf-16\"?>\n"];
    [reqxml appendString:@"<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\">\n"];
    [reqxml appendString:@"<soap:Body>\n"];
    [reqxml appendString:@"<printerOfflineWS xmlns=\"http://ws.wechat.zg1sk.com/\">\n"];
    [reqxml appendString:@"<arg0 xmlns=\"\">\n"];
    [reqxml appendFormat:@"<nonce>%@</nonce>\n",strRandom];
    [reqxml appendFormat:@"<signature>%@</signature>\n",strSig];
    [reqxml appendFormat:@"<timestamp>%@</timestamp>\n",interval];
    [reqxml appendFormat:@"<accounts>%@</accounts>\n",strUserName];
    [reqxml appendFormat:@"<mac>%@</mac>\n",strBtMac];
    [reqxml appendFormat:@"<password>%@</password>\n",strUserPwd];
    [reqxml appendFormat:@"<printerName>%@</printerName>\n",strBtName];
    [reqxml appendFormat:@"<roleType>%@</roleType>\n",strRoleType];
    [reqxml appendFormat:@"</arg0>\n"];
    [reqxml appendFormat:@"</printerOfflineWS>\n"];
    [reqxml appendFormat:@"</soap:Body>\n"];
    [reqxml appendFormat:@"</soap:Envelope>\n"];
    
    NSDictionary *dicTemp = @{@"body":reqxml};
    
    SuccBlock sucBlock = ^(id  _Nullable responseObject) {
        NSError *err = nil;
        NSArray *arrVal = @[@"S:Envelope",@"S:Body",@"ns2:printerOfflineWSWSResponse",@"printerOfflineWSeResponse"];
        NSDictionary *dicRes = [XMLReader dictionaryForXMLData:responseObject error:&err];
        for (int i = 0; i < arrVal.count; i++) {
            dicRes = [dicRes objectForKey:arrVal[i]];
        }
        
        NSDictionary *dicResCode = [dicRes objectForKey:@"resultCode"];
        NSDictionary *dicMsg = [dicRes objectForKey:@"msg"];
        NSString *strResCode = [dicResCode objectForKey:@"text"];
        NSString *strMsg = [dicMsg objectForKey:@"text"];
        NSLog(@"resultCode: %@ msg: %@",strResCode,strMsg);
        
        if ([strResCode isEqualToString:@"000000"]) {
            NSLog(@"更新设备下线成功");
        } else {
            NSLog(@"err: %@",strMsg);
        }
    };
    FailBlock failBlock = ^(id  _Nullable responseObject, NSError * _Nonnull error) {
        
        NSLog(@"error: %@",error);
    };
    
    [[NetManager shareInstance]postMsg:PRINTIN withParams:dicTemp withSuccBlock:sucBlock withFailBlock:failBlock];
}

- (void)printStatusWithBtName:(NSString *)strBtName andBtMac:(NSString *)strBtMac andPrintState:(NSInteger) printState {

    NSString *strRandom = [self ret32bitString];
    NSString *interval = [NSString stringWithFormat:@"%ld000",(long)[[NSDate date] timeIntervalSince1970]];
    NSString *strSig = [self getTokenIdWithNonce:strRandom andTimeStamp:interval];
    //更新设备状态
    BOOL isPrinting = false;
    BOOL isOverHeat = false;
    BOOL isNoPaper = false;
    BOOL isBattLow = false;
    BOOL isCoverOpen =false;
    if (printState & STATE_NOPAPER_UNMASK) {
        isNoPaper = true;
    }
    if (printState & STATE_OVERHEAT_UNMASK) {
        isOverHeat = true;
    }
    if (printState & STATE_PRINTING_UNMASK) {
        isPrinting = true;
    }
    if (printState & STATE_COVEROPEN_UNMASK) {
        isCoverOpen = true;
    }
    if (printState & STATE_BATTERYLOW_UNMASK) {
        isBattLow = true;
    }
    
    NSMutableString *reqxml = [[NSMutableString alloc]init];
    [reqxml appendString:@"<?xml version=\"1.0\" encoding=\"utf-16\"?>\n"];
    [reqxml appendString:@"<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\">\n"];
    [reqxml appendString:@"<soap:Body>\n"];
    [reqxml appendString:@"<reportPrinterStatusWS xmlns=\"http://ws.wechat.zg1sk.com/\">\n"];
    [reqxml appendString:@"<arg0 xmlns=\"\">\n"];
    [reqxml appendFormat:@"<nonce>%@</nonce>\n",strRandom];
    [reqxml appendFormat:@"<signature>%@</signature>\n",strSig];
    [reqxml appendFormat:@"<timestamp>%@</timestamp>\n",interval];
    [reqxml appendFormat:@"<batteryLow>%d</batteryLow>\n",isBattLow];
    [reqxml appendFormat:@"<coverOpen>%d</coverOpen>\n",isCoverOpen];
    [reqxml appendFormat:@"<mac>%@</mac>\n",strBtMac];
    [reqxml appendFormat:@"<noPaper>%d</noPaper>\n",isNoPaper];
    [reqxml appendFormat:@"<overHeat>%d</overHeat>\n",isOverHeat];
    [reqxml appendFormat:@"<printerName>%@</printerName>\n",strBtName];
    [reqxml appendFormat:@"<printing>%d</printing>\n",isPrinting];
    [reqxml appendFormat:@"</arg0>\n"];
    [reqxml appendFormat:@"</reportPrinterStatusWS>\n"];
    [reqxml appendFormat:@"</soap:Body>\n"];
    [reqxml appendFormat:@"</soap:Envelope>\n"];
    
    NSDictionary *dicTemp = @{@"body":reqxml};
    
    SuccBlock sucBlock = ^(id  _Nullable responseObject) {
        NSError *err = nil;
        NSDictionary *dicRes = [XMLReader dictionaryForXMLData:responseObject error:&err];
        NSString *strResCode = [dicRes objectForKey:@"resultCode"];
        NSString *strMsg = [dicRes objectForKey:@"msg"];
        //NSLog(@"reportPrinterStatus: %@ msg: %@",strResCode,strMsg);
    };
    FailBlock failBlock = ^(id  _Nullable responseObject, NSError * _Nonnull error) {
        
        NSLog(@"reportPrinterStatus error: %@",error);
    };
    
    [[NetManager shareInstance]postMsg:PRINTIN withParams:dicTemp withSuccBlock:sucBlock withFailBlock:failBlock];
}

- (void)reportLatitude:(double)latitude andLongitude:(double)longitude {

    NSString *strUserName = [[UserDataMananger sharedManager] strUserName];
    NSString *strRoleType = [[UserDataMananger sharedManager] strRoleType];
    NSMutableString *strUrl = [[NSMutableString alloc]init];
    if ([strRoleType isEqualToString:@"0"]) { //员工
        [strUrl appendFormat:@"%@/zgskwechat/WechatEmpMerchantPosition_updateMerchantPosition",SERVADDR];
    }else {
        [strUrl appendFormat:@"%@/zgskwechat/WechatBossMerchantPosition_updateMerchantPosition",SERVADDR];
    }
    [strUrl appendFormat:@"?position.latitude=%.6f&position.longitude=%.6f&position.userAccount=%@",latitude,longitude,strUserName];
    
    SuccBlock sucBlock = ^(id  _Nullable responseObject) {
        NSError *error;
        NSDictionary *dicRes = [NSJSONSerialization JSONObjectWithData:responseObject options:NSJSONReadingMutableContainers error:&error];
        if (dicRes) {
            NSLog(@"reportLatitude responseObject: %@",[dicRes description]);
            NSString *strCode = [dicRes objectForKey:@"resultCode"];
            NSString *strResInfo = [dicRes objectForKey:@"resultInfo"];
            if ([strCode isEqualToString:@"250101"]) {
                NSLog(@"上传位置信息成功");
            }else{
                NSLog(@"上传位置信息失败，%@",strResInfo);
            }
        }
        
    };
    FailBlock failBlock = ^(id  _Nullable responseObject, NSError * _Nonnull error) {
        
        NSLog(@"error: %@",error);
    };
    
    [[NetManager shareInstance]postMsg:strUrl withParams:nil withSuccBlock:sucBlock withFailBlock:failBlock];
}

- (void)getUserPostionList {
    
    NSString *strRoleType = [[UserDataMananger sharedManager] strRoleType];
    NSString *strUrl = @"";
    if ([strRoleType isEqualToString:@"0"]) { //员工
        strUrl = [NSString stringWithFormat:@"%@/zgskwechat/WechatEmpMerchantPosition_positionList",SERVADDR];
    }else {
        strUrl = [NSString stringWithFormat:@"%@/zgskwechat/WechatBossMerchantPosition_positionList",SERVADDR];
    }
    
    SuccBlock sucBlock = ^(id  _Nullable responseObject) {
        NSArray *dicArr = [NSArray arrayWithArray:responseObject];
        if (dicArr && dicArr.count) {
            //NSLog(@"getUserPostionList responseObject: %@",[dicArr description]);
            RunOnMainThread([[NSNotificationCenter defaultCenter]postNotificationName:@"updateUserMapInfo" object:dicArr];)
        }
    };
    FailBlock failBlock = ^(id  _Nullable responseObject, NSError * _Nonnull error) {
        
        NSLog(@"error: %@",error);
    };
    [[NetManager shareInstance]getMsg:strUrl andParam:nil withSuccBlock:sucBlock withFailBlock:failBlock];
}
@end
