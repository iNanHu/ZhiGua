//
//  PrintService.m
//  BluePrint
//
//  Created by alexyang on 2016/11/10.
//  Copyright © 2016年 com.iNanhu. All rights reserved.
//
#import "MMPrinterManager.h"
#import "WJSCommonDefine.h"
#define kMQTTServerHost @"139.196.154.235"
#import "ZJLocationService.h"
#import "UserDataMananger.h"
#import "PrintService.h"
#import "YDBlutoothTool.h"

@interface PrintService()

@property (nonatomic, strong) MQTTClient *client;
@property (nonatomic, strong) NSString *clientTopic;
@property (nonatomic, strong) NSMutableArray *arrPrintTask;
@property (nonatomic, strong) NSBlockOperation *printOp;
@property (nonatomic, assign) BOOL isConnect; //是否连接中
@property (nonatomic, assign) BOOL isRuning; //服务器是否启动
@end
@implementation PrintService

+ (id)shareInstance {
    
    static PrintService *printMgr;
    
    static dispatch_once_t predicate;
    dispatch_once(&predicate, ^{
        printMgr = [[self alloc] init];
        printMgr.arrPrintTask = [[NSMutableArray alloc] init];
    });
    return printMgr;
}

- (MQTTClient *)client {
    
    if (!_client) {
        
        NSString *clientID = [UIDevice currentDevice].identifierForVendor.UUIDString;
        
        _client = [[MQTTClient alloc] initWithClientId:clientID];
    }
    return _client;
}

- (void)initClientModule:(NSString *)userName andPwd:(NSString *)userPwd andMsgId:(NSString *)msgId andHost:(NSString *)hostId {
    
    if (_isConnect)
        return;
    
    _clientTopic = [@"client_" stringByAppendingString:msgId];
    //连接服务器  连接后，会通过block将连接结果code返回，然后执行此段代码块
    
    //这个接口是修改过后的接口，修改后抛出了name＋password
    self.client.host = kMQTTServerHost;
    self.client.username = userName;
    self.client.password = userPwd;
    self.client.port = 61613;
    [self.client connectWithCompletionHandler:^(MQTTConnectionReturnCode code) {
        if (code == ConnectionAccepted)//连接成功
        {
            // 订阅
            [self.client subscribe:_clientTopic withCompletionHandler:^(NSArray *grantedQos) {
                // The client is effectively subscribed to the topic when this completion handler is called
                NSLog(@"subscribed to topic %@", _clientTopic);
                NSLog(@"return:%@",grantedQos);
                
                RunOnMainThread(
                    BOOL bLocation = [ZJLocationService statrLocation];
                    if (bLocation) {
                        //开启后台定位
                        [ZJLocationService backgroundForPauseTime:0 locationCounts:5];
                        
                        [ZJLocationService sharedModel].lastBlock = ^(CLLocation *location) {
                            NSLog(@"block backgroundLocation: %f", location.coordinate.latitude);
                            [ZJLocationService statrLocation];
                            //开启后台定位
                            [ZJLocationService backgroundForPauseTime:0 locationCounts:100];
                        };
                        [ZJLocationService sharedModel].updateBlock = ^(CLLocation *location) {
                            //NSLog(@"update Location: %f,%f", location.coordinate.latitude,location.coordinate.longitude);
                            //获取当前位置信息
                            [[UserDataMananger sharedManager]setCurLoaction2D:location.coordinate];
                            NSInteger iPos = [[ZJLocationService sharedModel] updateRate];
                            if (iPos++ > 20) {
                                iPos = 0;
                                [[ZJLocationService sharedModel]setUpdateRate:iPos];
                                [[MMPrinterManager shareInstance]reportLatitude:location.coordinate.latitude andLongitude:location.coordinate.longitude];
                            }
                        };
                    })

            }];
            _isConnect = YES;
        } else {
            _isConnect = NO;
        }
    }];
    __block NSMutableArray *weakArrTask = _arrPrintTask;
    __block PrintService *weakSelf = self;
    //MQTTMessage  里面的数据接收到的是二进制，这里框架将其封装成了字符串
    [self.client setMessageHandler:^(MQTTMessage* message)
     {
         //接收到消息，更新界面时需要切换回主线程
         NSDictionary *dic = [PrintService dictionaryWithJsonString:message.payloadString];
         NSString *msgIdc = [dic objectForKey:@"id"];
         NSString *msgType = [dic objectForKey:@"type"];
         NSLog(@"receive Msg from serv %@ %@",msgIdc,msgType);
         if ([msgType isEqualToString:@"DTO"]) {
             NSString *msgId = [dic objectForKey:@"id"];
             NSString *recvTopic = [dic objectForKey:@"clientTopic"];
             NSString *strContent = [dic objectForKey:@"content"];
             NSDictionary *content = [PrintService dictionaryWithJsonString:strContent];
             NSDictionary *dicPrint = [content objectForKey:@"10002"];
             if (dicPrint && [[YDBlutoothTool sharedBlutoothTool]isPrintOk]) {
                 [weakSelf onMQTTAck:msgId andTopic:recvTopic andRecvStatus:YES];
                 [weakArrTask addObject:dicPrint];
             }else {
                 [weakSelf onMQTTAck:msgId andTopic:recvTopic  andRecvStatus:NO];
             }
         }
     }];
}

- (void)onMQTTAck:(NSString *)msgId andTopic:(NSString *)recvTopic andRecvStatus:(BOOL) recvStatus{
    
    NSDictionary *dicAck = @{
                             @"id":msgId,
                             @"clientTopic":_clientTopic,
                             @"type":@"ACK",
                             @"ackStuts":[NSNumber numberWithBool:recvStatus]
                             };
    NSData *ackData = [NSJSONSerialization dataWithJSONObject:dicAck options:NSJSONWritingPrettyPrinted error:nil];
    [self.client publishData:ackData toTopic:recvTopic withQos:AtLeastOnce retain:NO completionHandler:^(int mid) {
        NSLog(@"Ack To Serv:%d",mid);
    }];
}

- (void)stopMQTT {
    
    [self.client disconnectWithCompletionHandler:^(NSUInteger code) {
        _isConnect = NO;
        [ZJLocationService stopLocation];
    }];

}

- (void)stopMQTTServ {
    
    [self stopMQTT];
    _isRuning = NO;
    [_arrPrintTask removeAllObjects];
    [_printOp cancel];
    if ([_printOp isCancelled])
        _printOp = nil;
    
}

- (void)startMQTTServ {
    
    _isRuning = YES;
    _printOp = [NSBlockOperation blockOperationWithBlock:^{
        
        while (_isRuning) {
            [NSThread sleepForTimeInterval:2];
            //NSLog(@"PrintService Runing...");
            if (_arrPrintTask.count) {
                NSLog(@"PrintList Count: %lu",(unsigned long)_arrPrintTask.count);
                
                if ([[YDBlutoothTool sharedBlutoothTool]isPrintOk] &&
                    ![[YDBlutoothTool sharedBlutoothTool] isPrint]) {
                    NSDictionary *dicInfo = [NSDictionary dictionaryWithDictionary:[_arrPrintTask objectAtIndex:0]];
                    [_arrPrintTask removeObjectAtIndex:0];
                    BOOL bRet = [[YDBlutoothTool sharedBlutoothTool] printWithModel:dicInfo];
                    if (bRet) {
                        NSLog(@"print success!");
                        
                    } else {
                        NSLog(@"print failed!");
                    }
                    NSLog(@"PrintList removed Count: %lu",(unsigned long)_arrPrintTask.count);
                }
            }
        }
    }];
    [[[YDBlutoothTool sharedBlutoothTool] printQueue] addOperation:_printOp];
}

+ (NSDictionary *)dictionaryWithJsonString:(NSString *)jsonString
{
    if (jsonString == nil) {
        return nil;
    }
    
    NSData *jsonData = [jsonString dataUsingEncoding:NSUTF8StringEncoding];
    NSError *err;
    NSDictionary *dic = [NSJSONSerialization JSONObjectWithData:jsonData
                                                        options:NSJSONReadingMutableContainers
                                                          error:&err];
    if(err)
    {
        NSLog(@"json解析失败：%@",err);
        return nil;
    }
    return dic;
}

- (void)reconServ {
    
    [self.client reconnect];
}

@end
