//
//  PrintService.h
//  BluePrint
//
//  Created by alexyang on 2016/11/10.
//  Copyright © 2016年 com.iNanhu. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "MQTTKit.h"

@interface PrintService : NSThread
+ (id)shareInstance;
- (void)initClientModule:(NSString *)userName andPwd:(NSString *)userPwd andMsgId:(NSString *)msgId andHost:(NSString *)hostId;
//- (void)onMQTTAck:(NSString *)msgId andRecvStatus:(BOOL) recvStatus;
- (void)stopMQTT;
- (void)startMQTTServ;
- (void)stopMQTTServ;
@end
