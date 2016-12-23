//
//  NetManager.m
//  BluePrint
//
//  Created by alexyang on 2016/11/15.
//  Copyright © 2016年 com.iNanhu. All rights reserved.
//

#import "NetManager.h"
#import <AFNetworking.h>
#import "WJSCommonDefine.h"
@implementation NetManager

+(id)shareInstance {
    
    static dispatch_once_t predicate;
    static NetManager *dataManager;
    dispatch_once(&predicate, ^{
        dataManager = [[self alloc] init];
    });
    return dataManager;
}

- (void)postMsg:(NSString *)url withParams:(NSDictionary *)dicParams  withSuccBlock:(SuccBlock) succBlock  withFailBlock:(FailBlock) failBlock {
    
    AFURLSessionManager *manager = [[AFURLSessionManager alloc] initWithSessionConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]];
    
    manager.securityPolicy = [AFSecurityPolicy policyWithPinningMode:AFSSLPinningModeNone];
    manager.securityPolicy.allowInvalidCertificates = YES;
    [manager.securityPolicy setValidatesDomainName:NO];
    
    manager.responseSerializer = [AFHTTPResponseSerializer serializer];
    NSMutableURLRequest *req = [[AFHTTPRequestSerializer serializer] requestWithMethod:@"POST" URLString:url parameters:nil error:nil];
    
    req.timeoutInterval= 30;
    [req setValue:@"text/xml;charset=utf-8" forHTTPHeaderField:@"content-type"];
    NSString *strBody = [dicParams objectForKey:@"body"];
    [req setHTTPBody:[strBody dataUsingEncoding:NSUTF8StringEncoding]];
    
    [[manager dataTaskWithRequest:req completionHandler:^(NSURLResponse * _Nonnull response, id  _Nullable responseObject, NSError * _Nullable error) {
        
        if (!error) {
            succBlock(responseObject);
        } else {
            failBlock(responseObject, error);
        }
    }] resume];
}

- (void)getMsg:(NSString *)url andParam:(NSDictionary *)dicParams withSuccBlock:(SuccBlock) succBlock withFailBlock:(FailBlock) failBlock {
    
    AFURLSessionManager *manager = [[AFURLSessionManager alloc] initWithSessionConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration]];
    
    manager.responseSerializer = [AFHTTPResponseSerializer serializer];
    NSMutableURLRequest *req = [[AFHTTPRequestSerializer serializer] requestWithMethod:@"GET" URLString:url parameters:dicParams error:nil];
    
    req.timeoutInterval= 30;
    
    [[manager dataTaskWithRequest:req completionHandler:^(NSURLResponse * _Nonnull response, id  _Nullable responseObject, NSError * _Nullable error) {
        
        if (!error) {
            NSString *receiveStr = [[NSString alloc]initWithData:responseObject encoding:NSUTF8StringEncoding];
            NSData * data = [receiveStr dataUsingEncoding:NSUTF8StringEncoding];
            NSDictionary *jsonDict = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingMutableLeaves error:nil];
            if (jsonDict)
                succBlock(jsonDict);
            else
                succBlock(responseObject);
        } else {
            NSDictionary *dicInfo = (NSDictionary *)responseObject;
            NSString *strCode = [dicInfo objectForKey:@"errorCode"];
            NSString *strMsg = [dicInfo objectForKey:@"message"];
            NSLog(@"Error: %@  %@",strCode,strMsg);
            failBlock(responseObject,error);
        }
    }] resume];
}

-(NSString*)DataTOjsonString:(id)object
{
    NSString *jsonString = nil;
    NSError *error;
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:object
                                                       options:NSJSONWritingPrettyPrinted // Pass 0 if you don't care about the readability of the generated string
                                                         error:&error];
    if (! jsonData) {
        NSLog(@"Got an error: %@", error);
    } else {
        jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    }
    return jsonString;
}

@end
