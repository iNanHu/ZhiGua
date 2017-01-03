//
//  YDBlutoothTool.h
//  PrintDemo
//
//  Created by long1009 on 16/1/15.
//  Copyright © 2016年 long1009. All rights reserved.
//
#import <Foundation/Foundation.h>
#import "YDBluetoothConnectModel.h"
#import <CoreBluetooth/CoreBluetooth.h>
#import <UIKit/UIKit.h>

@class YDPrintModel;
@class MyPeripheral;

typedef void (^YDBlutoothToolContectedList) (NSArray *);
typedef void (^YDBlutoothToolContectedSucceed) (NSArray *);
typedef void (^YDBlutoothToolContectedFailed) (NSArray *);
typedef void (^YDBlutoothToolContectedUnlink) (NSArray *);

@interface YDBlutoothTool : NSObject
{
    CBUUID *_transServiceUUID;
    CBUUID *_transTxUUID;
    CBUUID *_transRxUUID;
}

// 蓝牙连接列表
@property (nonatomic, copy) YDBlutoothToolContectedList blutoothToolContectedList;

// 蓝牙连接成功
@property (nonatomic, copy) YDBlutoothToolContectedSucceed blutoothToolContectedSucceed;

// 蓝牙连接失败
@property (nonatomic, copy) YDBlutoothToolContectedFailed blutoothToolContectedFailed;

// 蓝牙断开连接
@property (nonatomic, copy) YDBlutoothToolContectedUnlink blutoothToolContectedUnlink;

// 蓝牙搜索结果数组
@property (nonatomic, strong) NSMutableArray *peripheralsArray;

// 当前设备
@property (nonatomic, strong) CBPeripheral *currentPeripheral;

@property(retain) CBCharacteristic *serialNumberChar;
@property(retain) CBCharacteristic *airPatchChar;
@property(retain) CBCharacteristic *serialNumDataReadChar;
@property(retain) CBCharacteristic *transparentDataWriteChar;
@property(retain) CBCharacteristic *transparentDataReadChar;
@property(retain) CBCharacteristic *connectionParameterChar;

//当前设备的mac地址
@property (nonatomic,strong) NSString *strMacAddr;

// 蓝牙单例
+ (YDBlutoothTool *)sharedBlutoothTool;

// 断开蓝牙连接 是否连接另一个设备
- (void)breakConnect:(BOOL) bRec;

// 连接蓝牙
- (void)connectActionWithPerial:(YDBluetoothConnectModel *)selModel;

// 打印
- (BOOL)printWithModel:(NSDictionary *)dicOrder;

// 获取已经配对好的设备信息
//- (NSArray *)getConnectedEquipmentInfo;

- (NSOperationQueue *)printQueue;

- (BOOL)isPrint;

//获取蓝牙开启状态
- (CBCentralManagerState)getBluetoothState;

//启动打印服务器
- (void)startPrintServ;

//关闭打印服务器
- (void)stopPrintServ;

//设备上线
- (void)printOffline;

//设备下线
- (void)printOnline;

//设备状态上报
- (void)printStatus;

- (NSInteger)getPrintCurState;

//获取打印机状态
- (void)getPrinterState;

- (BOOL)isPrintOk;

- (void)updateBlueToothArray;

- (BOOL)JQprintGetStatue;
@end
