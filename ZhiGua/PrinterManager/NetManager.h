//
//  NetManager.h
//  BluePrint
//
//  Created by alexyang on 2016/11/15.
//  Copyright © 2016年 com.iNanhu. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "WJSCommonDefine.h"

@interface NetManager : NSObject

+(id)shareInstance;

- (void)postMsg:(NSString *)url withParams:(NSDictionary *)dicParams withSuccBlock:(SuccBlock) succBlock  withFailBlock:(FailBlock) failBlock;

- (void)getMsg:(NSString *)url andParam:(NSDictionary *)dicParams withSuccBlock:(SuccBlock) succBlock withFailBlock:(FailBlock) failBlock;
@end
