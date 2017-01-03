//
//  YDBluetoothConnectModel.h
//  PrintDemo
//
//  Created by long1009 on 16/2/1.
//  Copyright © 2016年 long1009. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>

typedef enum
{
    YDBluetoothConnect,
    YDBluetoothDisconnected
    
}YDBluetoothConnectType;

@interface YDBluetoothConnectModel : NSObject

@property (nonatomic, strong) CBPeripheral *peripheral;
@property (nonatomic, strong) NSString *strBtMacAddr;

@property (nonatomic, assign) YDBluetoothConnectType bluetoothConnectType;
@end
