//
//  MMPrinterManager.h
//  MMPrinterDemo
//
//  Created by Zhaomike on 16/3/17.
//  Copyright © 2016年 mikezhao. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "MPPeripheral.h"
#import <CoreBluetooth/CoreBluetooth.h>

@interface MMPrinterManager : NSObject

+ (id)shareInstance;

//更新设备上线
- (void)printStatusOnlineWithBtName:(NSString *)strBtName andBtMac:(NSString *)strBtMac;

//更新设备下线
- (void)printStatusOfflineWithBtName:(NSString *)strBtName andBtMac:(NSString *)strBtMac;

//更新设备打印状态
- (void)printStatusWithBtName:(NSString *)strBtName andBtMac:(NSString *)strBtMac andPrintState:(NSInteger) printState;

@end
