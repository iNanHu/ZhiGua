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

@interface YDBlutoothTool () <CBCentralManagerDelegate,CBPeripheralDelegate>
{
    NSInteger clickedRow;
}

@property (nonatomic, strong) MPCharacteristic *currentCharacteristic;
@property (nonatomic, strong) MPPeripheral *tempPeripal;

// 济强
@property (nonatomic,strong) MPCentralManager *centralManager;
@property (nonatomic,strong) NSTimer *scanTimer;
@property (nonatomic,strong) JQPrinter *printer;
@property (nonatomic, assign) BOOL isRuning; //服务是否启动
@property (nonatomic,assign) BOOL isPrinting; //设备是否正在打印
@property (nonatomic,assign) NSInteger printState;
@property (nonatomic,strong) NSOperationQueue *queue;
@property (nonatomic,strong) NSBlockOperation *printOp;

@end

@implementation YDBlutoothTool

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
    __weak typeof(self) weakSelf = self;
    _centralManager = [[MPCentralManager alloc] initWithQueue:nil];
    [_centralManager setUpdateStateBlock:^(MPCentralManager *centralManager){
        if(centralManager.state == CBCentralManagerStatePoweredOn){
            [weakSelf scanPeripehrals];
        }
        else{
            [weakSelf updateBlueToothArray];
            [[NSNotificationCenter defaultCenter]postNotificationName:UPDATE_PRINTERINFO object:nil];
        }
    }];
    [self initPrintQueue];
}

- (void)startPrintServ {

    _isRuning = YES;
    _printOp = [NSBlockOperation blockOperationWithBlock:^{
        
        while (_isRuning) {
            NSLog(@"PrintStatus Reporting...");
            [NSThread sleepForTimeInterval:60];
            if (_currentPeripheral && _strMacAddr) {
                [self getPrinterState];
                [NSThread sleepForTimeInterval:2.0f];
                [self printStatus];
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
        [_centralManager scanForPeripheralsWithServices:nil options:nil withBlock:^(MPCentralManager *centralManager, MPPeripheral *peripheral, NSDictionary *advertisementData, NSNumber *RSSI) {
            [self updateBlueToothArray];
            [[NSNotificationCenter defaultCenter]postNotificationName:UPDATE_PRINTERINFO object:nil];
        }];
    }
}

- (CBCentralManagerState)getBluetoothState {
    
    if (_centralManager) {
        return _centralManager.state;
    }
    return CBCentralManagerStatePoweredOn;
}

- (void)updateBlueToothArray {
    
    NSArray *tempArr = _centralManager.discoveredPeripherals;
    
    for (MPPeripheral *peripheral in tempArr) {
        if(!peripheral.name || [peripheral.name isEqualToString:@""])
            continue;
        
        if (0 == self.peripheralsArray.count)
        {
            [self addPeripheralsArrayWith:peripheral];
        }
        else
        {
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
    }
    if (nil != self.blutoothToolContectedList)
    {
        self.blutoothToolContectedList(self.peripheralsArray);
    }
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
    __weak typeof(self) weakSelf = self;
    [_tempPeripal discoverServices:nil withBlock:^(MPPeripheral *peripheral, NSError *error) {
        for(MPService *service in peripheral.services){
        //NSLog(@"service UUID: %@",service.UUID);
            [weakSelf discoverCharacteristicForServices:service];
        }
    }];
}

- (void)discoverCharacteristicForServices:(MPService *)service
{
    [service discoverCharacteristics:nil withBlock:^(MPPeripheral *peripheral, MPService *service, NSError *error) {
        for (MPCharacteristic *character in service.characteristics) {
            NSLog(@"MPCharacter UUID: %@",[character UUID]);
            if ([character.UUID isEqual:[CBUUID UUIDWithString:@"49535343-8841-43F4-A8D4-ECBE34729BB3"]])
            {
                _currentCharacteristic = character;
                //NSLog(@"setCurrentChararcteristic:");
            }
            else if([character.UUID isEqual:[CBUUID UUIDWithString:@"49535343-1E4D-4BD9-BA61-23C647249616"]]){
                [peripheral setNotifyValue:TRUE forCharacteristic:character withBlock:^(MPPeripheral *peripheral, MPCharacteristic *characteristic, NSError *error) {
                    //NSLog(@"setNotifyValue:");
                    NSLog(@"===%s===%@===", __func__, characteristic);
                    NSLog(@"[CBController] didUpdateValueForCharacteristic %@",[characteristic  value]);
                    [[characteristic  value] getBytes: &_printState length: sizeof(_printState)];
                    [self printStatus];
                    
                }];
            }else if([service.UUID isEqual:[CBUUID UUIDWithString:@"180A"]] &&
                     [character.UUID isEqual:[CBUUID UUIDWithString:@"2A25"]]){
                [character readValueWithBlock:^(MPPeripheral *peripheral, MPCharacteristic *characteristic, NSError *error){
                    NSString *value = [NSString stringWithFormat:@"%@",characteristic.value];
                    NSMutableString *macString = [[NSMutableString alloc] init];
                    [macString appendString:[value substringWithRange:NSMakeRange(1, 8)]];
                    [macString appendString:[value substringWithRange:NSMakeRange(10, 8)]];
                    [macString appendString:[value substringWithRange:NSMakeRange(19, 8)]];
                    NSString *resMac = [self stringFromHexString:macString];
                    if (resMac && ![resMac isEqualToString:@""]) {
                        _strMacAddr = resMac;
                        [self updateDevStatus:_tempPeripal.name andBtMac:resMac];
                    }
                    
                    NSLog(@"srcMac: %@  macString:%@",macString,resMac);
                }];
            }
        }
    }];
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

- (NSString *)stringFromHexString:(NSString *)hexString {
    
    // The hex codes should all be two characters.
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

- (void)connectPeripheral:(MPPeripheral *)peripheral
{
    [_centralManager connectPeripheral:peripheral options:nil withSuccessBlock:^(MPCentralManager *centralManager, MPPeripheral *peripheral) {
        NSLog(@"connected: %@",peripheral.name);
        _tempPeripal = peripheral;
        [self discoverServices];
    } withDisConnectBlock:^(MPCentralManager *centralManager, MPPeripheral *peripheral, NSError *error) {
        NSLog(@"disconnectd %@",peripheral.name);
        [self printOffline];
        _currentPeripheral = nil;
        _strMacAddr = nil;
        [self connectFailed];
        RunOnMainThread([[NSNotificationCenter defaultCenter]postNotificationName:@"connectFail" object:peripheral.name];)
    }];
}


// 开启蓝牙扫描
- (void)startScan
{
    NSLog(@"开始搜索");
    if (nil == _scanTimer)
    {
        _scanTimer = [NSTimer timerWithTimeInterval:ScanTimeInterval target:self selector:@selector(scanForPeripherals) userInfo:nil repeats:YES];
        [[NSRunLoop mainRunLoop] addTimer:_scanTimer forMode:NSDefaultRunLoopMode];
    }
    if (_scanTimer && !_scanTimer.valid)
    {
        [_scanTimer fire];
    }
}

// 结束蓝牙扫描
- (void)stopScan
{
    NSLog(@"停止搜索");
    if (_scanTimer && _scanTimer.valid)
    {
        [_scanTimer invalidate];
        _scanTimer = nil;
    }
    [_centralManager stopScan];
}

// 断开蓝牙连接
- (void)breakConnect:(BOOL) bShow
{
    if (!_currentPeripheral || !_strMacAddr) {
        return ;
    }
    [_centralManager cancelPeripheralConnection:self.currentPeripheral withBlock:^(MPCentralManager *centralManager, MPPeripheral *peripheral, NSError *error) {
        if (!error) {
            if (_strMacAddr) {
                [[MMPrinterManager shareInstance]printStatusOfflineWithBtName:peripheral.name andBtMac:_strMacAddr];
            
            }
            if (bShow)
                RunOnMainThread([[NSNotificationCenter defaultCenter]postNotificationName:@"disConnectSucc" object:peripheral.name];)
            [[PrintService shareInstance]stopMQTT];
            _currentPeripheral = nil;
            _strMacAddr = nil;
            [self connectBreak];
            
        }else {
            RunOnMainThread([[NSNotificationCenter defaultCenter]postNotificationName:@"disConnectFail" object:peripheral.name];)
        }
    }];
}

// 蓝牙连接失败
- (void)bluetoothConnectFailed
{
    //设备不支持蓝牙 弹框提示用户
    NSLog(@"不支持蓝牙");
}

#pragma mark - 蓝牙连接的代理方法
- (void)addPeripheralsArrayWith:(MPPeripheral *)peripheral
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
    if (nil != self.currentPeripheral)
    {
        [_centralManager cancelPeripheralConnection:self.currentPeripheral withBlock:^(MPCentralManager *centralManager, MPPeripheral *peripheral, NSError *error) {
            if (!error) {
                if (_strMacAddr) {
                    [[MMPrinterManager shareInstance]printStatusOfflineWithBtName:peripheral.name andBtMac:_strMacAddr];
                    
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
                    RunOnMainThread([[NSNotificationCenter defaultCenter]postNotificationName:@"connectFail" object:peripheral.name];)
                }
                else
                {
                    //设备支持蓝牙连接
                    if (_centralManager.state == CBCentralManagerStatePoweredOn)
                    {
                        [self updateBlueToothArray];
                        //连接设备
                        _tempPeripal = selModel.peripheral;
                        
                        // 济强打印机连接方法
                        [self connectPeripheral:_tempPeripal];
                    }
                }
                
            }else {
                RunOnMainThread([[NSNotificationCenter defaultCenter]postNotificationName:@"disConnectFail" object:_currentPeripheral.name];)
            }
        }];
        
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
                [self updateBlueToothArray];
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
    // 连接打印机, 停止蓝牙搜索
    //[self stopScan];
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
    //NSDictionary *dicPrintInfo = [NSDictionary dictionaryWithDictionary:dicOrder];
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
            [NSThread sleepForTimeInterval:2];
            if (iCount++ > 1)
                break;
        }
        [self wrapPrintDataWithModel:dicOrder];
        NSLog(@"printWithModel: print End...");
        [NSThread sleepForTimeInterval:3.f];
        //获取打印机状态
        [self getPrinterState];
        [NSThread sleepForTimeInterval:2.f];
        
        //设备打印时打开盖子，需要进行判断
        if(_printState & STATE_COVEROPEN_UNMASK && _printState & STATE_PRINTING_UNMASK) {
            NSInteger iWaitCount = 0;
            while(YES) {
                if (iWaitCount++ > 12) {
                    i = (int)printCount;
                    break;
                }
                [NSThread sleepForTimeInterval:3.0f];
                [self getPrinterState];
                [NSThread sleepForTimeInterval:2.0f];
                //打印机可用时，中断循环
                if ([self isPrintOk]) {
                    i--;
                    break;
                }
            }

        }
        
        NSLog(@"进入循环 Print End...,%ld",(long)_printState);
        //打印机缺纸时，进入等待循环
        if(_printState & STATE_NOPAPER_UNMASK){
            RunOnMainThread(
                            [[NSNotificationCenter defaultCenter]postNotificationName:NOTI_PRINT_STATE_NOPAPER object:nil];)
            NSInteger iWaitCount = 0;
            while(YES) {
                if (iWaitCount++ > 24) {
                    i = (int)printCount;
                    break;
                }
                [NSThread sleepForTimeInterval:3.0f];
                [self getPrinterState];
                [NSThread sleepForTimeInterval:2.0f];
                //打印机可用时，中断循环
                if ([self isPrintOk]) {
                    break;
                }
            }
            NSLog(@"跳出循环 Print End...,%ld",(long)_printState);
            //缺纸后重新打印上一张
            if (iWaitCount > 0 && !(_printState & STATE_NOPAPER_UNMASK)) {
                i--;
                NSLog(@"缺纸后重新打印上一张,%d",i);
            }
        }
        
    }
    //等待3s获取打印机状态
    [NSThread sleepForTimeInterval:3.0f];
    _isPrinting = NO;
    [self getPrinterState];
    
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
        _isPrinting = NO;
        [[YDBlutoothTool sharedBlutoothTool]printStatus];
        return;
    }
    
    int r = self.printer.printerInfo.wrap.dataLength;
    if (r==0)
    {
        self.printer.sendFlag = FALSE;
        self.printer.sendFinish = FALSE;
        _isPrinting = NO;
        return;
    }
    
    int sendLength = 50;
    if (r < sendLength)
    {
        sendLength = r;
    }
    NSData *data = [self.printer.printerInfo.wrap getData:sendLength];
    
    [self sendTransparentDataA:data];
}

// 打印
- (void)sendTransparentDataA:(NSData *)data
{
    if (_currentCharacteristic) {
        [_currentPeripheral writeValue:data forCharacteristic:_currentCharacteristic type:CBCharacteristicWriteWithResponse withBlock:^(MPPeripheral *peripheral, MPCharacteristic *characteristic, NSError *error) {
            if (!error) {
                NSLog(@"发送成功");
            }else {
                NSLog(@"发送失败");
            }
            self.printer.sendFinish = TRUE;
        }];
        [NSThread sleepForTimeInterval:0.00001];
        [self sendPrintData];
    } else {
        self.printer.sendFinish = TRUE;
    }
    
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
    
    NSLog(@"getPrinterState start....");
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
    [self sendPrintData];
    NSLog(@"getPrinterState End...");
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

        NSInteger pageHeight = 900 + addHeight;
        [self.printer.jpl.page start:0 originY:0 pageWidth:576 pageHeight:pageHeight rotate:x0];
        
        int printPos = 0;
        
        // 标题
        [self.printer.jpl.text drawOut:CENTER startx:PRINT_START_X endx:576 - PRINT_START_X y:printPos text:merchantName fontHeight:18 bold:YES reverse:NO underLine:NO deletLine:NO enlargeX:x1 enlargeY:x2 rotateAngle:ROTATE_0];
        
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
- (IBAction)print:(id)sender {
    
    if(_printer.sendFinish == TRUE)
    {
        return;
    }
    _printer.sendFlag = TRUE;
    [self wrapPrintData];
    if (_printer.printerInfo.wrap.dataLength) {
        _printer.sendFinish = TRUE;
    }
    [self sendPrintData];
    
}
//发送打印数据
-(void) sendPrintData {
    if (!_printer.sendFlag) return;
    if (![connectedPeripheral.transmit canSendReliableBurstTransmit]) {
        [NSTimer scheduledTimerWithTimeInterval:0.00001 target:self selector:@selector(sendPrintData) userInfo:nil repeats:NO];
        
        return;
    }
    int r = _printer.printerInfo.wrap.dataLength;
    if (r==0) {
        _printer.sendFlag = FALSE;
        _printer.sendFinish = FALSE;
        return;
    }
    
    int sendLength = 64;
    if (r < sendLength) {
        sendLength = r;
    }
    NSData *data = [_printer.printerInfo.wrap getData:sendLength];
    
    [self sendTransparentDataA:data];
}

- (void)sendTransparentDataA:(NSData *)data {
    [_currentPeripheral sendTransparentData:data type:CBCharacteristicWriteWithoutResponse];
    [NSTimer scheduledTimerWithTimeInterval:0.00001 target:self selector:@selector(sendPrintData) userInfo:nil repeats:NO];
}
*/
////获取打印机状态
- (BOOL)JQprintGetStatue
{
     return [self.printer.esc getPrinterStatue];
}
@end
