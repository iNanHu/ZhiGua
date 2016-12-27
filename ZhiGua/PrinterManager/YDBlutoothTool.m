//
//  YDBlutoothTool.m
//  PrintDemo
//
//  Created by long1009 on 16/1/15.
//  Copyright © 2016年 long1009. All rights reserved.
//
#import "SHAlertView.h"
#import "YDBlutoothTool.h"
#import "MyPeripheral.h"
#import "UUID.h"
#import "JQPrinter.h"
#import "ReliableBurstData.h"
#import "MMPrinterManager.h"
#import "WJSCommonDefine.h"
#import "PrintService.h"
#import "DejalActivityView.h"

#import <UIKit/UIKit.h>

#define ScanTimeInterval 1.0

#define PRINT_START_X 12

#define PRINT_FONT_HEIGHT 20

#define PRINT_LINE_SPACE 15

// 新北洋状态定义
typedef enum
{
    YDPrinterOpen,
    YDPrinterPaperOut,
    YDPrinterDataLost
}YDPrinterState;

@interface YDBlutoothTool () <CBCentralManagerDelegate,CBPeripheralDelegate,ReliableBurstDataDelegate>
{
    NSInteger clickedRow;
}

@property (nonatomic, strong) CBCharacteristic *currentCharacteristic;
@property (nonatomic, strong) CBPeripheral *tempPeripal;
@property(readonly) ReliableBurstData *transmit;

// 济强
@property (nonatomic,strong) CBCentralManager *centralManager;
@property (nonatomic,strong) NSTimer *scanTimer;
@property (nonatomic,strong) JQPrinter *printer;
@property (nonatomic,assign) NSInteger printCount;
@property (nonatomic,assign) BOOL isRuning; //服务是否启动
@property (nonatomic,assign) BOOL isPrinting; //设备是否正在打印
@property (nonatomic,assign) NSInteger printState;
@property (nonatomic,strong) NSOperationQueue *queue;
@property (nonatomic,strong) NSBlockOperation *printOp;

@end

@implementation YDBlutoothTool

@synthesize serialNumberChar;

// 创建蓝牙单例
static YDBlutoothTool *blutoothTool;
+ (YDBlutoothTool *)sharedBlutoothTool
{
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        blutoothTool = [[self alloc] init];
        [blutoothTool initWithCBCentralManager];
    });
    return blutoothTool;
}

- (NSOperationQueue *)printQueue {
    
    return _queue;
}

// 初始化蓝牙管理者
- (void)initWithCBCentralManager
{
    clickedRow = -1;
    
    dispatch_queue_t queue = dispatch_get_main_queue();
    _centralManager = [[CBCentralManager alloc] initWithDelegate:self queue:queue options:@{CBCentralManagerOptionShowPowerAlertKey:@YES}];
    [_centralManager setDelegate:self];
    
    _transmit = [[ReliableBurstData alloc] init];
    _transmit.delegate = self;
    [self initPrintQueue];
}

- (void)startPrintServ {

    _isRuning = YES;
    _printOp = [NSBlockOperation blockOperationWithBlock:^{
        
        while (_isRuning) {
            
            [NSThread sleepForTimeInterval:6];
            _printCount++;
            _printCount = _printCount%10;
            
            if (_currentPeripheral && _strMacAddr) {
                if (!_isPrinting && (_printCount == 9 || ![self isPrintOk])) {
                    [self getPrinterState];
                    NSLog(@"PrintStatus Reporting...");
                }
            }
        }
    }];
    [_queue addOperation:_printOp];
}

- (void)stopPrintServ {
    
    _isRuning = NO;
    [_printOp cancel];
    if ([_printOp isCancelled])
        _printOp = nil;
}

- (JQPrinter *)printer {
    
    if (!_printer) {
        _printer = [[JQPrinter alloc] init];
    }
    return _printer;
}

- (void)initPrintQueue {
    
    // 1.创建队列
    _queue = [[NSOperationQueue alloc] init];
}



- (void)scanPeripehrals
{
    if(_centralManager.state == CBCentralManagerStatePoweredOn){
        [_centralManager scanForPeripheralsWithServices:nil options:nil];
    }
}

- (CBCentralManagerState)getBluetoothState {
    
    if (_centralManager) {
        return (CBCentralManagerState)_centralManager.state;
    }
    return CBCentralManagerStatePoweredOn;
}

- (NSString *)stringFromHexString:(NSString *)hexString {
    
    if (([hexString length] % 2) != 0)
        return nil;
    
    NSMutableString *string = [NSMutableString string];
    
    for (NSInteger i = 0; i < [hexString length]; i += 2) {
        
        NSString *hex = [hexString substringWithRange:NSMakeRange(i, 2)];
        NSInteger decimalValue = 0;
        sscanf([hex UTF8String], "%x", &decimalValue);
        [string appendFormat:@"%c", decimalValue];
    }
    
    return string;
}

- (void)updateDevStatus:(NSString *)btName andBtMac:(NSString *)btMac {
    
    _currentPeripheral = _tempPeripal;
    [self.printer setPort:(CBPeripheral*)_currentPeripheral];
    [self connectSuccee];
    if (_strMacAddr) {
        [[MMPrinterManager shareInstance]printStatusOnlineWithBtName:btName andBtMac:_strMacAddr];
    }
    RunOnMainThread([[NSNotificationCenter defaultCenter]postNotificationName:@"connectSucc" object:btName];)
}

-(void)readCharState {
    [_currentPeripheral readValueForCharacteristic:_transparentDataReadChar];
}

-(void)readSerialNum {
    [_currentPeripheral readValueForCharacteristic:_serialNumDataReadChar];
}

#pragma mark - 蓝牙连接的代理方法
// 蓝牙连接状态
- (void)centralManagerDidUpdateState:(CBCentralManager *)central {
    if(central.state == CBCentralManagerStatePoweredOn){
        [self scanPeripehrals];
    }
}

// 发现蓝牙设备
- (void)centralManager:(CBCentralManager *)central
 didDiscoverPeripheral:(CBPeripheral *)peripheral
     advertisementData:(NSDictionary<NSString *,id> *)advertisementData
                  RSSI:(NSNumber *)RSSI {
    
    if(!peripheral.name || [peripheral.name isEqualToString:@""])
        return;
    
    if (0 == self.peripheralsArray.count)
    {
        [self addPeripheralsArrayWith:peripheral];
    }
    else {
        
        BOOL isExist = NO;
        for (YDBluetoothConnectModel *bluetoothConnectModel in self.peripheralsArray)
        {
            if ([bluetoothConnectModel.peripheral.name isEqualToString:peripheral.name])
            {
                isExist = YES;
            }
        }
        
        if (!isExist)
        {
            [self addPeripheralsArrayWith:peripheral];
        }
    }
    if (nil != self.blutoothToolContectedList)
    {
        self.blutoothToolContectedList(self.peripheralsArray);
    }
    [[NSNotificationCenter defaultCenter]postNotificationName:UPDATE_PRINTERINFO object:nil];
}


//连接蓝牙设备成功
- (void)centralManager:(CBCentralManager *)central didConnectPeripheral:(CBPeripheral *)peripheral
{
    NSLog(@"蓝牙已成功连接");
    NSLog(@"connected: %@",peripheral.name);
    
    _tempPeripal = peripheral;
    _tempPeripal.delegate = self;
    [self discoverServices];
    
}

//连接蓝牙设备失败
- (void)centralManager:(CBCentralManager *)central didFailToConnectPeripheral:(CBPeripheral *)peripheral error:(NSError *)error
{
    NSLog(@"蓝牙连接失败");
    [self connectFailed];
    RunOnMainThread([[NSNotificationCenter defaultCenter]postNotificationName:@"connectFail" object:peripheral.name];)
}

//断开连接
- (void)centralManager:(CBCentralManager *)central didDisconnectPeripheral:(CBPeripheral *)peripheral error:(NSError *)error
{

    NSLog(@"disconnectd %@",peripheral.name);
    if (peripheral.name) {
        [self printOffline];
        _currentPeripheral = nil;
        _strMacAddr = nil;
        [self connectBreak];
        RunOnMainThread([[NSNotificationCenter defaultCenter]postNotificationName:@"connectFail" object:peripheral.name];)
    }
    
}

- (void)centralManager:(CBCentralManager *)central didRetrievePeripherals:(NSArray *)peripherals
{
    NSLog(@"11");
    if([peripherals count] >=1)
    {
        //        [self connectDevice:[peripherals objectAtIndex:0]];
    }
}

#pragma mark - 蓝牙设备代理方法


// 外设已经查找到服务
- (void)peripheral:(CBPeripheral *)peripheral didDiscoverServices:(NSError *)error
{
    // 遍历所有的服务
    for (CBService *service in peripheral.services)
    {
        
        //NSLog(@"==========%@", service.UUID.UUIDString);
        // 扫描服务下面的特征
        [peripheral discoverCharacteristics:nil forService:service];
        
    }
    
}

// 找到服务上得特征
- (void)peripheral:(CBPeripheral *)peripheral didDiscoverCharacteristicsForService:(CBService *)service error:(NSError *)error
{
    _currentPeripheral = peripheral;
    CBCharacteristic *aChar = nil;
    if ([service.UUID isEqual:[CBUUID UUIDWithString:UUIDSTR_ISSC_PROPRIETARY_SERVICE]]) {
        for (aChar in service.characteristics)
        {
            if ([aChar.UUID isEqual:[CBUUID UUIDWithString:UUIDSTR_ISSC_TRANS_RX]]) {
                [self setTransparentDataWriteChar:aChar];
                NSLog(@"found TRANS_RX");
                
            }
            else if ([aChar.UUID isEqual:[CBUUID UUIDWithString:UUIDSTR_ISSC_TRANS_TX]]) {
                [peripheral setNotifyValue:TRUE forCharacteristic:aChar];
                [self setTransparentDataReadChar:aChar];
                [[aChar  value] getBytes: &_printState length: sizeof(_printState)];
                NSLog(@"found UUIDSTR_ISSC_TRANS_TX: %d",_printState);
                [self printStatus];
            }
            else if ([aChar.UUID isEqual:[CBUUID UUIDWithString:UUIDSTR_CONNECTION_PARAMETER_CHAR]]) {
                [self setConnectionParameterChar:aChar];
                NSLog(@"found CONNECTION_PARAMETER_CHAR");
            }
            else if ([aChar.UUID isEqual:[CBUUID UUIDWithString:UUIDSTR_AIR_PATCH_CHAR]]) {
                [self setAirPatchChar:aChar];
                NSLog(@"found UUIDSTR_AIR_PATCH_CHAR");
                [_transmit enableReliableBurstTransmit:_currentPeripheral andAirPatchCharacteristic:_airPatchChar];
            }
        }
    } else if ([service.UUID isEqual:[CBUUID UUIDWithString:UUIDSTR_DEVICE_INFO_SERVICE]]) {
        for (aChar in service.characteristics)
        {
            if ([aChar.UUID isEqual:[CBUUID UUIDWithString:UUIDSTR_SERIAL_NUMBER_CHAR]]) {
                [peripheral readValueForCharacteristic:aChar];
                [self setSerialNumberChar:aChar];
            }
        }
    }
}



- (void)peripheral:(CBPeripheral *)peripheral didDiscoverDescriptorsForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error
{
    //NSLog(@"===%s===%@===", __func__, characteristic);
}

- (void)peripheral:(CBPeripheral *)peripheral didDiscoverIncludedServicesForService:(CBService *)service error:(NSError *)error
{
    //NSLog(@"===%s===%@===", __func__, service);
}


- (void)peripheral:(CBPeripheral *)peripheral didModifyServices:(NSArray<CBService *> *)invalidatedServices
{
    //NSLog(@"===%s===%@===", __func__, invalidatedServices);
}

- (void)peripheral:(CBPeripheral *)peripheral didReadRSSI:(NSNumber *)RSSI error:(NSError *)error
{
    //NSLog(@"===%s===%@===", __func__, RSSI);
}
- (void)peripheral:(CBPeripheral *)peripheral didUpdateNotificationStateForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error
{
    //NSLog(@"===%s===%@===", __func__, characteristic);
}

//获取打印机返回值回调,数值存于characteristic value内
- (void)peripheral:(CBPeripheral *)peripheral didUpdateValueForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error
{
    //NSLog(@"===%s===%@===", __func__, characteristic);
    //NSLog(@"[CBController] didUpdateValueForCharacteristic %@",[characteristic  value]);
    
    if ([characteristic.service.UUID isEqual:[CBUUID UUIDWithString:UUIDSTR_DEVICE_INFO_SERVICE]]) {

        if ([characteristic.UUID isEqual:[CBUUID UUIDWithString:UUIDSTR_MANUFACTURE_NAME_CHAR]]) {
            NSLog(@"[CBController] update manufacture name");
        }
        else if ([characteristic.UUID isEqual:[CBUUID UUIDWithString:UUIDSTR_MODEL_NUMBER_CHAR]]) {
            NSLog(@"[CBController] update model number");
        }
        else if ([characteristic.UUID isEqual:[CBUUID UUIDWithString:UUIDSTR_SERIAL_NUMBER_CHAR]]) {
            NSString *resMac = [[NSString alloc] initWithData:characteristic.value encoding:NSUTF8StringEncoding];
            NSLog(@"[CBController] update serial number: %@",resMac);
            
            if (resMac && ![resMac isEqualToString:@""]) {
                _strMacAddr = resMac;
                [self updateDevStatus:peripheral.name andBtMac:resMac];
            }
            
            NSLog(@"macString:%@",resMac);

        }
        else if ([characteristic.UUID isEqual:[CBUUID UUIDWithString:UUIDSTR_HARDWARE_REVISION_CHAR]]) {
            NSLog(@"[CBController] update hardware revision");

        }
        else if ([characteristic.UUID isEqual:[CBUUID UUIDWithString:UUIDSTR_FIRMWARE_REVISION_CHAR]]) {
            NSLog(@"[CBController] update firmware revision");

        }
        else if ([characteristic.UUID isEqual:[CBUUID UUIDWithString:UUIDSTR_SOFTWARE_REVISION_CHAR]]) {
            
            NSLog(@"[CBController] update software revision");
        }
        else if ([characteristic.UUID isEqual:[CBUUID UUIDWithString:UUIDSTR_SYSTEM_ID_CHAR]]) {
            NSLog(@"[CBController] update system ID");
        }
        else if ([characteristic.UUID isEqual:[CBUUID UUIDWithString:UUIDSTR_IEEE_11073_20601_CHAR]]) {
            NSLog(@"[CBController] update IEEE_11073_20601: %@",characteristic.value);
        }
    }
    else if ([characteristic.service.UUID isEqual:[CBUUID UUIDWithString:UUIDSTR_ISSC_PROPRIETARY_SERVICE]]) {
        if ([characteristic.UUID isEqual:[CBUUID UUIDWithString:UUIDSTR_CONNECTION_PARAMETER_CHAR]]) {
            NSLog(@"[CBController] update connection parameter: %@", characteristic.value);
            unsigned char buf[10];
            CONNECTION_PARAMETER_FORMAT *parameter;
            
            [characteristic.value getBytes:&buf[0] length:sizeof(CONNECTION_PARAMETER_FORMAT)];
            parameter = (CONNECTION_PARAMETER_FORMAT *)&buf[0];

        }
        else if ([characteristic.UUID isEqual:[CBUUID UUIDWithString:UUIDSTR_AIR_PATCH_CHAR]]) {
            [_transmit decodeReliableBurstTransmitEvent:characteristic.value];
        }
        else if ((_transServiceUUID == nil) && [characteristic.UUID isEqual:[CBUUID UUIDWithString:UUIDSTR_ISSC_TRANS_TX]]) {
            
            [peripheral setNotifyValue:TRUE forCharacteristic:characteristic];
            [self setTransparentDataReadChar:characteristic];
            [[characteristic  value] getBytes: &_printState length: sizeof(_printState)];
            NSLog(@"update UUIDSTR_ISSC_TRANS_TX: %d",_printState);
            [self printStatus];
        }
    }
    else if (_transServiceUUID && [characteristic.service.UUID isEqual:_transServiceUUID]) {
        if ([characteristic.UUID isEqual:_transTxUUID]) {
        }
    }
}

- (void)peripheral:(CBPeripheral *)peripheral didUpdateValueForDescriptor:(CBDescriptor *)descriptor error:(NSError *)error
{
    //NSLog(@"===%s===%@===", __func__, descriptor);
}
- (void)peripheral:(CBPeripheral *)peripheral didWriteValueForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error
{
    //NSLog(@"===%s===%@===", __func__, characteristic);
    if (_currentPeripheral == nil) {
        return;
    }
    if ([_transmit isReliableBurstTransmit:characteristic]) {
        return;
    }
    if ((_transServiceUUID == nil) && [characteristic.UUID isEqual:[CBUUID UUIDWithString:UUIDSTR_ISSC_TRANS_RX]]) {
        [self didSendTransparentDataStatus:error];
    }
    else if (_transServiceUUID && [characteristic.UUID isEqual:_transRxUUID]) {
        [self didSendTransparentDataStatus:error];
    }
    
}

- (void) didSendTransparentDataStatus:(NSError *)error {
    //NSLog(@"[DataTransparentViewController] didSendTransparentDataStatus");
    if (error == nil) {
        if (_printer.sendFlag) {
            [NSTimer scheduledTimerWithTimeInterval:0.001 target:self selector:@selector(sendPrintData) userInfo:nil repeats:NO];
        }
    }
}


- (void)peripheral:(CBPeripheral *)peripheral didWriteValueForDescriptor:(CBDescriptor *)descriptor error:(NSError *)error
{
    //NSLog(@"===%s===%@===", __func__, descriptor);
}

- (void)peripheralDidUpdateName:(CBPeripheral *)peripheral
{
    //NSLog(@"===%s===%@===", __func__, peripheral);
}
- (void)peripheralDidUpdateRSSI:(CBPeripheral *)peripheral error:(NSError *)error
{
    //NSLog(@"===%s===%@===", __func__, error);
}



- (NSInteger)getPrintCurState {
    
    return _printState;
}

- (BOOL)isPrintOk {
    
    BOOL isPrinting = false;
    BOOL isOverHeat = false;
    BOOL isNoPaper = false;
    BOOL isBattLow = false;
    BOOL isCoverOpen =false;
    if (_printState & STATE_NOPAPER_UNMASK) {
        isNoPaper = true;
    }
    if (_printState & STATE_OVERHEAT_UNMASK) {
        isOverHeat = true;
    }
    if (_printState & STATE_PRINTING_UNMASK) {
        isPrinting = true;
    }
    if (_printState & STATE_COVEROPEN_UNMASK) {
        isCoverOpen = true;
    }
    if (_printState & STATE_BATTERYLOW_UNMASK) {
        isBattLow = true;
    }
    return !(isNoPaper || isCoverOpen || isOverHeat);
}

- (void)discoverServices
{
    NSMutableArray *uuids = [[NSMutableArray alloc] initWithObjects:[CBUUID UUIDWithString:UUIDSTR_DEVICE_INFO_SERVICE], [CBUUID UUIDWithString:UUIDSTR_ISSC_PROPRIETARY_SERVICE], nil];
    [_tempPeripal discoverServices:uuids];
}

- (void)connectPeripheral:(CBPeripheral *)peripheral
{
    [_centralManager connectPeripheral:peripheral options:nil];
}


// 断开蓝牙连接
- (void)breakConnect:(BOOL) bShow
{
    if (!_currentPeripheral || !_strMacAddr)
        return ;
    NSString *strName = _currentPeripheral.name;
    [_centralManager cancelPeripheralConnection:self.currentPeripheral];
    if (bShow){
        RunOnMainThread([[NSNotificationCenter defaultCenter]postNotificationName:@"disConnectSucc" object:strName];)
        [[PrintService shareInstance]stopMQTT];
        _currentPeripheral = nil;
        _strMacAddr = nil;
        [self connectBreak];
    }
}

// 蓝牙连接失败
- (void)bluetoothConnectFailed
{
    //设备不支持蓝牙 弹框提示用户
    NSLog(@"不支持蓝牙");
}

#pragma mark - 蓝牙连接的代理方法
- (void)addPeripheralsArrayWith:(CBPeripheral *)peripheral
{
    YDBluetoothConnectModel *connectModel = [[YDBluetoothConnectModel alloc] init];
    connectModel.peripheral = peripheral;
    connectModel.bluetoothConnectType = YDBluetoothDisconnected;
    [self.peripheralsArray addObject:connectModel];
}

// 选择打印机
- (void)connectActionWithPerial:(YDBluetoothConnectModel *)selModel
{
    //操作同一个设备
    if (nil != self.currentPeripheral && [selModel.peripheral.name isEqual:self.currentPeripheral.name]) {
        [self breakConnect:YES];
        return;
    }
    // 连接打印机断开之前蓝牙连接,并连接另外一台设备
    if (nil != self.currentPeripheral) {
        [self breakConnect:NO];
        if (_strMacAddr) {
            [[MMPrinterManager shareInstance]printStatusOfflineWithBtName:self.currentPeripheral.name andBtMac:_strMacAddr];
        }
        [[PrintService shareInstance]stopMQTT];
        _currentPeripheral = nil;
        _strMacAddr = nil;
        [self connectBreak];

        // 检测蓝牙状态
        if (_centralManager.state == CBCentralManagerStateUnsupported)
        {
            //设备不支持蓝牙
            [self bluetoothConnectFailed];
            RunOnMainThread([[NSNotificationCenter defaultCenter]postNotificationName:@"connectFail" object:self.currentPeripheral.name];)
        }
        else
        {
            //设备支持蓝牙连接
            if (_centralManager.state == CBCentralManagerStatePoweredOn)
            {
                //[self updateBlueToothArray];
                //连接设备
                _tempPeripal = selModel.peripheral;
                
                // 济强打印机连接方法
                [self connectPeripheral:_tempPeripal];
            }
        }
    } else { //连接新的蓝牙设备
    
        // 检测蓝牙状态
        if (_centralManager.state == CBCentralManagerStateUnsupported)
        {
            //设备不支持蓝牙
            [self bluetoothConnectFailed];
            RunOnMainThread([[NSNotificationCenter defaultCenter]postNotificationName:@"connectFail" object:_currentPeripheral.name];)
        }
        else
        {
            //设备支持蓝牙连接
            if (_centralManager.state == CBCentralManagerStatePoweredOn)
            {
                //[self updateBlueToothArray];
                //连接设备
                _tempPeripal = selModel.peripheral;
                
                // 济强打印机连接方法
                [self connectPeripheral:_tempPeripal];
            }
        }
    }
    
    
}

#pragma mark - 蓝牙连接状态提示
- (void)connectSuccee
{
    if (nil != self.blutoothToolContectedSucceed)
    {
        for (YDBluetoothConnectModel *connectModel in self.peripheralsArray)
        {
            if ([connectModel.peripheral.name isEqualToString:self.currentPeripheral.name])
            {
                connectModel.bluetoothConnectType = YDBluetoothConnect;
            }
        }
        self.blutoothToolContectedSucceed(self.peripheralsArray);
    }
}

- (void)connectFailed
{
    if (nil != self.blutoothToolContectedFailed)
    {
        for (YDBluetoothConnectModel *connectModel in self.peripheralsArray)
        {
            connectModel.bluetoothConnectType = YDBluetoothDisconnected;
        }
        self.blutoothToolContectedFailed(self.peripheralsArray);
    }
}

- (void)connectBreak
{
    if (nil != self.blutoothToolContectedUnlink)
    {
        for (YDBluetoothConnectModel *connectModel in self.peripheralsArray)
        {
            connectModel.bluetoothConnectType = YDBluetoothDisconnected;
        }
        self.blutoothToolContectedUnlink(self.peripheralsArray);
    }
}

- (void)alertViewShowWithMessage:(NSString *)message cancleButton:(NSString *)cancelButton certainButton:(NSString *)certainButton alertType:(NSInteger)alertType
{
    UIAlertView *alertView = [[UIAlertView alloc] initWithTitle:@"提示" message:message delegate:self cancelButtonTitle:cancelButton otherButtonTitles:certainButton, nil];
    alertView.tag = alertType;
    
    [alertView show];
}

- (void)printOnline {
    
    if (_currentPeripheral && _strMacAddr)
        [[MMPrinterManager shareInstance]printStatusOnlineWithBtName:_currentPeripheral.name andBtMac:_strMacAddr];
}

- (void)printOffline {
    
    if (_currentPeripheral && _strMacAddr)
        [[MMPrinterManager shareInstance]printStatusOfflineWithBtName:_currentPeripheral.name andBtMac:_strMacAddr];
}

#pragma mark - 懒加载
- (NSMutableArray *)peripheralsArray
{
    if (nil == _peripheralsArray)
    {
        _peripheralsArray = [NSMutableArray array];
    }
    return _peripheralsArray;
}

- (NSMutableData *)hexStrToData:(NSString *)hexStr
{
    NSMutableData *data= [[NSMutableData alloc] init];
    NSUInteger len = [hexStr length];
    
    unsigned char whole_byte;
    char byte_chars[3] = {'\0','\0','\0'};
    int i;
    for (i=0; i < len/2; i++)
    {
        byte_chars[0] = [hexStr characterAtIndex:i*2];
        byte_chars[1] = [hexStr characterAtIndex:i*2+1];
        whole_byte = strtol(byte_chars, NULL, 16);
        [data appendBytes:&whole_byte length:1];
    }
    return data;
}

- (BOOL)isPrint {
    
    return _isPrinting;
}

- (void)configureTransparentServiceUUID: (NSString *)serviceUUID txUUID:(NSString *)txUUID rxUUID:(NSString *)rxUUID
{
    NSLog(@"8");
    
}

- (void)configureDeviceInformationServiceUUID:(NSString *)UUID1 UUID2:(NSString *)UUID2
{
    NSLog(@"9");
}

- (BOOL)printWithModel:(NSDictionary *) dicOrder
{
    if (!dicOrder)
        return NO;
    
    _isPrinting = YES;
    self.printer.sendFinish = TRUE;
    [self printStatus];
    // 打印联数
    long printCount = (long)[[dicOrder objectForKey:@"printCount"]integerValue];
    for (int i = 0; i < printCount; i++) {
        NSInteger iCount = 0;
        self.printer.sendFlag = TRUE;
        while(!self.printer.sendFinish) {
            NSLog(@"wait for print End....");
            [NSThread sleepForTimeInterval:2];
            if (iCount++ > 2)
                break;
        }
        [self wrapPrintDataWithModel:dicOrder];
        NSLog(@"printWithModel: print End...");
        [NSThread sleepForTimeInterval:2.5];
        //获取打印机状态
        [self getPrinterState];
        [NSThread sleepForTimeInterval:3.5f];
        NSLog(@"getPrintState: End...");
        
        NSLog(@"进入循环 Print End...,%ld",(long)_printState);
        //打印机缺纸时，进入等待循环
        if(_printState & STATE_NOPAPER_UNMASK){
            NSLog(@"打印机缺纸");
            RunOnMainThread(
                            [[NSNotificationCenter defaultCenter]postNotificationName:NOTI_PRINT_STATE_NOPAPER object:nil];)
            NSInteger iWaitCount = 0;
            while(YES) {
                if (iWaitCount++ > 24 || !_strMacAddr) {
                    i = (int)printCount;
                    break;
                }
                [NSThread sleepForTimeInterval:4.0f];
                [self getPrinterState];
                [NSThread sleepForTimeInterval:2.0f];
                //打印机可用时，中断循环
                if ([self isPrintOk]) {
                    break;
                }
            }
            NSLog(@"跳出循环 Print End...,%ld,iwaitCount: %ld",(long)_printState,iWaitCount);
            //缺纸后重新打印上一张
            if (iWaitCount > 0 && !(_printState & STATE_NOPAPER_UNMASK)) {
                i--;
                NSLog(@"缺纸后重新打印上一张,%d",i);
                [NSThread sleepForTimeInterval:3.0f];
            }
        }
        
    }
    _isPrinting = NO;
    
    return YES;
}


- (void)printStatus {
    
    [[MMPrinterManager shareInstance]printStatusWithBtName:_currentPeripheral.name andBtMac:_strMacAddr andPrintState:_printState];
}

//发送打印数据
- (void)sendPrintData
{
    if (!self.printer.sendFlag)
    {
        return;
    }
    
//    if (![_transmit canSendReliableBurstTransmit]) {
//        [NSTimer scheduledTimerWithTimeInterval:0.00001 target:self selector:@selector(sendPrintData) userInfo:nil repeats:NO];
//        
//        return;
//    }
    
    int r = self.printer.printerInfo.wrap.dataLength;
    if (r==0)
    {
//        self.printer.sendFlag = FALSE;
//        self.printer.sendFinish = FALSE;
        return;
    }
    int sendLength = 64;
    if (r < sendLength)
    {
        sendLength = r;
    }
    NSData *data = [self.printer.printerInfo.wrap getData:sendLength];
    
    [self sendTransparentDataA:data andType:CBCharacteristicWriteWithoutResponse];
}


- (void)sendTransparentDataA:(NSData *)data andType:(CBCharacteristicWriteType)type{
    [self sendTransparentData:data type:type];
    [NSTimer scheduledTimerWithTimeInterval:0.00001 target:self selector:@selector(sendPrintData) userInfo:nil repeats:NO];
}


- (CBCharacteristicWriteType)sendTransparentData:(NSData *)data type:(CBCharacteristicWriteType)type {
    //NSLog(@"[MyPeripheral] sendTransparentData:%@", data);
    
    if (_transparentDataWriteChar == nil) {
        return CBCharacteristicWriteWithResponse;
    }
    CBCharacteristicWriteType actualType = type;
    if (type == CBCharacteristicWriteWithResponse) {
        if (!(_transparentDataWriteChar.properties & CBCharacteristicPropertyWrite))
            actualType = CBCharacteristicWriteWithoutResponse;
    }
    else {
        if (!(_transparentDataWriteChar.properties & CBCharacteristicPropertyWriteWithoutResponse))
            actualType = CBCharacteristicWriteWithResponse;
    }
    if (actualType == CBCharacteristicWriteWithoutResponse) {
        [_transmit reliableBurstTransmit:data withTransparentCharacteristic:_transparentDataWriteChar];
    }
    else {
        [_currentPeripheral writeValue:data forCharacteristic:_transparentDataWriteChar type:actualType];
    }
    
    return actualType;
}

//回调函数
- (void)reliableBurstData:(ReliableBurstData *)reliableBurstData didSendDataWithCharacteristic:(CBCharacteristic *)transparentDataWriteChar {
    [self sendPrintData];
    
}

- (void)wrapPrintDataWithModel:(NSDictionary *) dicOrder;
{
    //缓冲区复位
    [self.printer.printerInfo.wrap reset];
    [self.printer.esc restorePrinter];
    [self printOrder:dicOrder];
    if (self.printer.printerInfo.wrap.dataLength)
    {
        _printer.sendFinish = TRUE;
    }
    [self sendPrintData];
    NSLog(@"wrapPrintDataWithModel: print End...");
}

- (void)getPrinterState {
    
    //NSLog(@"getPrinterState start....");
    self.printer.sendFinish = false;
    self.printer.sendFlag = TRUE;
    //缓冲区复位
    [self.printer.printerInfo.wrap reset];
    [self.printer.esc restorePrinter];
 
    [self.printer.esc getPrinterStatue];
    
    if (self.printer.printerInfo.wrap.dataLength)
    {
        self.printer.sendFinish = TRUE;
    }
    if (!self.printer.sendFlag)
    {
        return;
    }
    
    int r = self.printer.printerInfo.wrap.dataLength;
    if (r==0)
    {
        return;
    }
    int sendLength = 64;
    if (r < sendLength)
    {
        sendLength = r;
    }
    NSData *data = [self.printer.printerInfo.wrap getData:sendLength];
    [_currentPeripheral writeValue:data forCharacteristic:_transparentDataWriteChar type:CBCharacteristicWriteWithResponse];
    
    //NSLog(@"getPrinterState End...");
}

+ (NSDictionary *)dicWithString:(NSString *)jsonString
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

- (void)printOrder:(NSDictionary *) dicOrder {
    
    // 商户名称
    NSString *merchantName = [dicOrder objectForKey:@"merchantName"];
    // 商户电话
    NSString *shopPhone = [dicOrder objectForKey:@"shopPhone"];
    // 商户地址
    NSString *shopAddress = [dicOrder objectForKey:@"shopAddress"];
    // 银行账号列表
    //bankAccount银行帐号  name账户名称  bankName银行名称
    NSArray *bankList = [dicOrder objectForKey:@"bankList"];
    
    // 进货数量
    long pgoodsCount = [[dicOrder objectForKey:@"pgoodsCount"] integerValue];
    // 退货数量
    long rgoodsCount = [[dicOrder objectForKey:@"rgoodsCount"] integerValue];
    
    NSString *empName = [dicOrder objectForKey:@"empName"];
    NSString *customerName = [dicOrder objectForKey:@"customerName"];
    // 总金额(欠款+本单金额)
    double billAmount = [[dicOrder objectForKey:@"billAmount"] doubleValue];
    // 订单总金额
    double receivablePay = [[dicOrder objectForKey:@"receivablePay"] doubleValue];
    // 上欠金额
    double historyArrears = [[dicOrder objectForKey:@"historyArrears"] doubleValue];
    // 优惠支付
    double discountPay = [[dicOrder objectForKey:@"discountPay"] doubleValue];
    // 实收
    double actualPayment = [[dicOrder objectForKey:@"actualPayment"] doubleValue];
    NSString *createTime = [dicOrder objectForKey:@"createTime"];
    
    //计算商品多出的一部分
    NSInteger addHeight = 0;
    NSArray *arrGoods = (NSArray *) [dicOrder objectForKey:@"goods"];
    addHeight += (PRINT_FONT_HEIGHT + PRINT_LINE_SPACE)*(arrGoods.count - 1);
    
    
    //计算银行卡号是否多出一部分
    
    if (bankList.count > 0) {
        for (int k = 0; k < bankList.count; k++) {
            NSDictionary *dicBank = [bankList objectAtIndex:k];
            NSString *strName = [dicBank objectForKey:@"name"];
            NSString *strBankName = [dicBank objectForKey:@"bankName"];
            NSString *strBankAcc = [dicBank objectForKey:@"bankAccount"];
            NSString *strDesc = [NSString stringWithFormat:@"户名账号(%d)：%@   %@： %@",k,strName,strBankName,strBankAcc];
            NSInteger maxLen = 34;
            if (strDesc.length > maxLen) {
                addHeight += PRINT_FONT_HEIGHT + PRINT_LINE_SPACE;
            }
        }
    }
    
    NSInteger pageHeight = 920 + addHeight;
    [self.printer.jpl.page start:0 originY:0 pageWidth:576 pageHeight:pageHeight rotate:x0];
    
    int printPos = 4;
    
    // 标题
    [self.printer.jpl.text drawOut:CENTER startx:0 endx:576 y:printPos text:merchantName fontHeight:28 bold:YES reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
    
    // 虚线
    NSString *line = @"------------------------------------------------------------------------";
    
    printPos += 75;
    
    [self.printer.jpl.text drawOut:PRINT_START_X y:printPos text:line fontHeight:8 bold:NO reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
    
    // 摘要
    printPos += 30;
    NSString *strCustom = [NSString stringWithFormat:@"客户：%@",customerName];
    [self.printer.jpl.text drawOut:PRINT_START_X y:printPos text:strCustom fontHeight:PRINT_FONT_HEIGHT bold:NO reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
    NSString *strEmpName = [NSString stringWithFormat:@"开单员：%@",empName];
    [self.printer.jpl.text drawOut:200 y:printPos text:strEmpName fontHeight:PRINT_FONT_HEIGHT bold:NO reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
    NSString *strCreatTime = [NSString stringWithFormat:@"开单时间：%@",createTime];
    printPos += PRINT_FONT_HEIGHT + PRINT_LINE_SPACE;
    [self.printer.jpl.text drawOut:PRINT_START_X y:printPos text:strCreatTime fontHeight:PRINT_FONT_HEIGHT bold:NO reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
    
    printPos += 45;
    [self.printer.jpl.text drawOut:PRINT_START_X y:printPos text:line fontHeight:8 bold:NO reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
    
    // 订单列表
    printPos += 30;
    [self.printer.jpl.text drawOut:PRINT_START_X y:printPos text:@"商品名称" fontHeight:PRINT_FONT_HEIGHT bold:NO reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
    [self.printer.jpl.text drawOut:200 y:printPos text:@"单价" fontHeight:PRINT_FONT_HEIGHT bold:NO reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
    [self.printer.jpl.text drawOut:325 y:printPos text:@"数量" fontHeight:PRINT_FONT_HEIGHT bold:NO reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
    [self.printer.jpl.text drawOut:450 y:printPos text:@"小计" fontHeight:PRINT_FONT_HEIGHT bold:NO reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
    
    for (int i = 0; i < arrGoods.count; i++) {
        NSDictionary *dicGood = arrGoods[i];
        NSString *commodityName = [dicGood objectForKey:@"commodityName"];
        double price = [[dicGood objectForKey:@"price"] doubleValue];
        long count = [[dicGood objectForKey:@"count"] integerValue];
        double total = [[dicGood objectForKey:@"total"] integerValue];
        printPos += PRINT_FONT_HEIGHT + PRINT_LINE_SPACE;
        [self.printer.jpl.text drawOut:PRINT_START_X y:printPos text:commodityName];
        [self.printer.jpl.text drawOut:200 y:printPos text:[NSString stringWithFormat:@"%.2f",price]];
        [self.printer.jpl.text drawOut:325 y:printPos text:[NSString stringWithFormat:@"%ld",count]];
        [self.printer.jpl.text drawOut:450 y:printPos text:[NSString stringWithFormat:@"%.2f",total]];
    }
    
    printPos += 45;
    [self.printer.jpl.text drawOut:PRINT_START_X y:printPos text:line fontHeight:8 bold:NO reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
    
    printPos += PRINT_FONT_HEIGHT + PRINT_LINE_SPACE + 10;
    NSString *strIn = [NSString stringWithFormat:@"进：%ld",pgoodsCount];
    [self.printer.jpl.text drawOut:PRINT_START_X y:printPos text:strIn fontHeight:PRINT_FONT_HEIGHT bold:NO reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
    NSString *strOut = [NSString stringWithFormat:@"退：%ld",rgoodsCount];
    [self.printer.jpl.text drawOut:120 y:printPos text:strOut fontHeight:PRINT_FONT_HEIGHT bold:NO reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
    printPos += PRINT_FONT_HEIGHT + PRINT_LINE_SPACE;
    NSString *strAllCount = [NSString stringWithFormat:@"本单总金额：%.2f",billAmount];
    [self.printer.jpl.text drawOut:PRINT_START_X y:printPos text:strAllCount fontHeight:PRINT_FONT_HEIGHT bold:NO reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
    NSString *strUpCount = [NSString stringWithFormat:@"上欠金额：%.2f",historyArrears];
    [self.printer.jpl.text drawOut:250 y:printPos text:strUpCount fontHeight:PRINT_FONT_HEIGHT bold:NO reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
    printPos += PRINT_FONT_HEIGHT + PRINT_LINE_SPACE;
    NSString *strDiscountPay = [NSString stringWithFormat:@"优惠金额：%.2f",discountPay];
    [self.printer.jpl.text drawOut:PRINT_START_X y:printPos text:strDiscountPay fontHeight:PRINT_FONT_HEIGHT bold:NO reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
    
    printPos += PRINT_FONT_HEIGHT + PRINT_LINE_SPACE;
    NSString *strReceivablePay = [NSString stringWithFormat:@"应收金额：%.2f",receivablePay];
    [self.printer.jpl.text drawOut:PRINT_START_X y:printPos text:strReceivablePay fontHeight:PRINT_FONT_HEIGHT bold:NO reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
    
    printPos += 45;
    [self.printer.jpl.text drawOut:PRINT_START_X y:printPos text:line fontHeight:8 bold:NO reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
    
    // 实收金额
    printPos += PRINT_FONT_HEIGHT + PRINT_LINE_SPACE;
    NSString *strActPayment = [NSString stringWithFormat:@"实收：%.2f",actualPayment];
    [self.printer.jpl.text drawOut:PRINT_START_X y:printPos text:strActPayment fontHeight:PRINT_FONT_HEIGHT bold:YES reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
    
    //下欠金额
    NSString *strXiaPayment = [NSString stringWithFormat:@"下欠金额：%.2f",receivablePay - actualPayment];
    [self.printer.jpl.text drawOut:288 y:printPos text:strXiaPayment fontHeight:PRINT_FONT_HEIGHT bold:YES reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
    
    // 地址
    printPos += PRINT_FONT_HEIGHT + 2*PRINT_LINE_SPACE;
    NSString *strShopAddr = [NSString stringWithFormat:@"地址：%@",shopAddress];
    if (shopAddress.length > 24) {
        ;
    }
    [self.printer.jpl.text drawOut:PRINT_START_X y:printPos text:strShopAddr fontHeight:PRINT_FONT_HEIGHT bold:NO reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
    // 联系方式
    printPos += PRINT_FONT_HEIGHT + PRINT_LINE_SPACE;
    NSString *strShopPhone = [NSString stringWithFormat:@"联系方式：%@",shopPhone];
    [self.printer.jpl.text drawOut:PRINT_START_X y:printPos text:strShopPhone fontHeight:PRINT_FONT_HEIGHT bold:NO reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
    
    // 银行账号
    if (bankList.count > 0) {
        for (int k = 0; k < bankList.count; k++) {
            printPos += PRINT_FONT_HEIGHT + PRINT_LINE_SPACE;
            NSDictionary *dicBank = [bankList objectAtIndex:k];
            NSString *strName = [dicBank objectForKey:@"name"];
            NSString *strBankName = [dicBank objectForKey:@"bankName"];
            NSString *strBankAcc = [dicBank objectForKey:@"bankAccount"];
            NSString *strDesc = [NSString stringWithFormat:@"户名账号(%d)：%@   %@： %@",k,strName,strBankName,strBankAcc];
            NSInteger maxLen = 34;
            if (strDesc.length > maxLen) {
                
                NSString *strTemp = [strDesc substringToIndex:maxLen];
                NSString *strLeft = [strDesc substringWithRange:NSMakeRange(maxLen, strDesc.length - maxLen)];
                [self.printer.jpl.text drawOut:PRINT_START_X y:printPos text:strTemp fontHeight:PRINT_FONT_HEIGHT bold:NO reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
                printPos += PRINT_FONT_HEIGHT + PRINT_LINE_SPACE;
                [self.printer.jpl.text drawOut:PRINT_START_X y:printPos text:strLeft fontHeight:PRINT_FONT_HEIGHT bold:NO reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
            }else {
                [self.printer.jpl.text drawOut:PRINT_START_X y:printPos text:strDesc fontHeight:PRINT_FONT_HEIGHT bold:NO reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
            }
        }
    }
    
    // 底部提示
    printPos += PRINT_FONT_HEIGHT + PRINT_LINE_SPACE + 20;
    [self.printer.jpl.text drawOut:PRINT_START_X y:printPos text:@"提醒：钱款，货物请当面点清，离店概不负责" fontHeight:PRINT_FONT_HEIGHT bold:NO reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
    printPos += PRINT_FONT_HEIGHT + PRINT_LINE_SPACE;
    [self.printer.jpl.text drawOut:PRINT_START_X y:printPos text:@"智瓜商客系统" fontHeight:PRINT_FONT_HEIGHT bold:NO reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x1 rotateAngle:ROTATE_0];
    
    // 虚线
    printPos += 45;
    [self.printer.jpl.grahic line:PRINT_START_X startPointY:printPos endPointX:576 - PRINT_START_X endPointY:printPos width:2];
    
    [self.printer.jpl.page end];
    
    [self.printer.jpl.page print];
    
}


/*
- (void)printOrder:(NSDictionary *) dicOrder {
 
    // 商户名称
    NSString *merchantName = [dicOrder objectForKey:@"merchantName"];
    // 商户电话
    NSString *shopPhone = [dicOrder objectForKey:@"shopPhone"];
    // 商户地址
    NSString *shopAddress = [dicOrder objectForKey:@"shopAddress"];
    // 银行账号列表
    //bankAccount银行帐号  name账户名称  bankName银行名称
    NSArray *bankList = [dicOrder objectForKey:@"bankList"];
 
    // 进货数量
    long pgoodsCount = [[dicOrder objectForKey:@"pgoodsCount"] integerValue];
    // 退货数量
    long rgoodsCount = [[dicOrder objectForKey:@"rgoodsCount"] integerValue];
    
    NSString *empName = [dicOrder objectForKey:@"empName"];
    NSString *customerName = [dicOrder objectForKey:@"customerName"];
    // 总金额(欠款+本单金额)
    double billAmount = [[dicOrder objectForKey:@"billAmount"] doubleValue];
    // 订单总金额
    double receivablePay = [[dicOrder objectForKey:@"receivablePay"] doubleValue];
    // 上欠金额
    double historyArrears = [[dicOrder objectForKey:@"historyArrears"] doubleValue];
    // 优惠支付
    double discountPay = [[dicOrder objectForKey:@"discountPay"] doubleValue];
    // 实收
    double actualPayment = [[dicOrder objectForKey:@"actualPayment"] doubleValue];
    NSString *createTime = [dicOrder objectForKey:@"createTime"];
        
    // 标题
    [self.printer.esc.text printOut:CENTER height:x32 bold:YES enlarge:TEXT_ENLARGE_NORMAL text:merchantName];
    [self.printer.esc feedEnter];
    // 虚线
    NSString *line = @"------------------------------------------------------------------------";
    [self.printer.esc.text printOut:CENTER height:x16 bold:NO enlarge:TEXT_ENLARGE_NORMAL text:line];
    // 摘要
    NSString *strCustom = [NSString stringWithFormat:@"客户：%@",customerName];
    [self.printer.esc.text drawOut:0 y:0 text:strCustom];
    NSString *strEmpName = [NSString stringWithFormat:@"开单员：%@",empName];
    [self.printer.esc.text drawOut:288 y:0 text:strEmpName];
    [self.printer.esc feedEnter];
    NSString *strCreatTime = [NSString stringWithFormat:@"开单时间：%@",createTime];
    [self.printer.esc.text printOut:strCreatTime];
    
    [self.printer.esc.text printOut:CENTER height:x16 bold:NO enlarge:TEXT_ENLARGE_NORMAL text:line];
    [self.printer.esc feedEnter];
    // 订单列表
//    [self.printer.jpl.text drawOut:PRINT_START_X y:0 text:@"商品名称"];
//    [self.printer.jpl.text drawOut:200 y:0 text:@"单价"];
//    [self.printer.esc.text drawOut:325 y:0 text:@"数量"];
//    [self.printer.jpl.text drawOut:400 y:0 text:@"小计"];
    [self.printer.esc feedEnter];

    NSArray *arrGoods = (NSArray *) [dicOrder objectForKey:@"goods"];
    for (int i = 0; i < arrGoods.count; i++) {
        NSDictionary *dicGood = arrGoods[i];
        NSString *commodityName = [dicGood objectForKey:@"commodityName"];
        double price = [[dicGood objectForKey:@"price"] doubleValue];
        long count = [[dicGood objectForKey:@"count"] integerValue];
        double total = [[dicGood objectForKey:@"total"] integerValue];
        [self.printer.jpl.text drawOut:PRINT_START_X y:0 text:commodityName];
        [self.printer.jpl.text drawOut:200 y:0 text:[NSString stringWithFormat:@"%.2f",price]];
        [self.printer.jpl.text drawOut:325 y:0 text:[NSString stringWithFormat:@"%ld",count]];
        [self.printer.jpl.text drawOut:450 y:0 text:[NSString stringWithFormat:@"%.2f",total]];
        [self.printer.esc feedEnter];
    }
 
/*    [self.printer.esc feedLines:1];
    [self.printer.esc.text drawOut:PRINT_FONT_HEIGHT text:line];
    
    printPos += PRINT_FONT_HEIGHT + PRINT_LINE_SPACE + 10;
    NSString *strIn = [NSString stringWithFormat:@"进：%ld",pgoodsCount];
    [self.printer.esc.text drawOut:PRINT_START_X y:0 height:PRINT_FONT_HEIGHT bold:NO text:strIn];
    NSString *strOut = [NSString stringWithFormat:@"退：%ld",rgoodsCount];
    [self.printer.esc.text drawOut:120 y:0 height:PRINT_FONT_HEIGHT bold:NO text:strOut];
    [self.printer.esc feedEnter];

    NSString *strAllCount = [NSString stringWithFormat:@"本单总金额：%.2f",billAmount];
    [self.printer.esc.text drawOut:PRINT_START_X y:0 height:PRINT_FONT_HEIGHT bold:NO text:strAllCount];
    NSString *strUpCount = [NSString stringWithFormat:@"上欠金额：%.2f",historyArrears];
    [self.printer.esc.text drawOut:250 y:0 height:PRINT_FONT_HEIGHT bold:NO text:strUpCount];
    [self.printer.esc feedEnter];
    NSString *strDiscountPay = [NSString stringWithFormat:@"优惠金额：%.2f",discountPay];
    [self.printer.esc.text drawOut:PRINT_START_X y:0 height:PRINT_FONT_HEIGHT bold:NO text:strDiscountPay];
    [self.printer.esc feedEnter];
    
    NSString *strReceivablePay = [NSString stringWithFormat:@"应收金额：%.2f",receivablePay];
    [self.printer.esc.text drawOut:PRINT_START_X y:0 height:PRINT_FONT_HEIGHT bold:NO text:strReceivablePay];
    [self.printer.esc feedEnter];
    
    [self.printer.esc feedLines:1];
    [self.printer.esc.text drawOut:PRINT_FONT_HEIGHT text:line];
    [self.printer.esc feedLines:2];
    
    // 实收金额
    printPos += PRINT_FONT_HEIGHT + PRINT_LINE_SPACE;
    NSString *strActPayment = [NSString stringWithFormat:@"实收：%.2f",actualPayment];
    [self.printer.esc.text drawOut:PRINT_START_X y:0 height:PRINT_FONT_HEIGHT bold:NO text:strActPayment];

    //下欠金额
    NSString *strXiaPayment = [NSString stringWithFormat:@"下欠金额：%.2f",receivablePay - actualPayment];
    [self.printer.esc.text drawOut:288 y:0 height:PRINT_FONT_HEIGHT bold:NO text:strXiaPayment];
    [self.printer.esc feedEnter];
    
    // 地址
    printPos += PRINT_FONT_HEIGHT + 2*PRINT_LINE_SPACE;
    NSString *strShopAddr = [NSString stringWithFormat:@"地址：%@",shopAddress];
    [self.printer.esc.text drawOut:PRINT_FONT_HEIGHT text:strShopAddr];
    // 联系方式
    printPos += PRINT_FONT_HEIGHT + PRINT_LINE_SPACE;
    NSString *strShopPhone = [NSString stringWithFormat:@"联系方式：%@",shopPhone];
    [self.printer.esc.text drawOut:PRINT_FONT_HEIGHT text:strShopPhone];
    
    // 银行账号
    if (bankList.count > 0) {
        for (int k = 0; k < bankList.count; k++) {
            printPos += PRINT_FONT_HEIGHT + PRINT_LINE_SPACE;
            NSDictionary *dicBank = [bankList objectAtIndex:k];
            NSString *strName = [dicBank objectForKey:@"name"];
            NSString *strBankName = [dicBank objectForKey:@"bankName"];
            NSString *strBankAcc = [dicBank objectForKey:@"bankAccount"];
            NSString *strDesc = [NSString stringWithFormat:@"户名账号(%d)：%@   %@： %@",k,strName,strBankName,strBankAcc];
            [self.printer.esc.text drawOut:PRINT_FONT_HEIGHT text:strDesc];
            [self.printer.esc feedEnter];
        }
    }
    
    // 底部提示
    [self.printer.esc.text drawOut:PRINT_FONT_HEIGHT text:@"提醒：钱款，货物请当面点清，离店概不负责"];
    [self.printer.esc feedEnter];
    [self.printer.esc.text drawOut:PRINT_FONT_HEIGHT text:@"智瓜商客系统"];
    [self.printer.esc feedEnter];
    [self.printer.esc.grahic linedrawOut:0 endPoint:575];
    [self.printer.esc feedEnter];
    
    [self.printer.esc feedLines:4];
 
}*/

////获取打印机状态
- (BOOL)JQprintGetStatue
{
     return [self.printer.esc getPrinterStatue];
}

- (void)updateBlueToothArray {
    
    if (nil != self.blutoothToolContectedList)
    {
        self.blutoothToolContectedList(self.peripheralsArray);
    }
}

@end
