//
//  Printer.m
//  BLETR
//
//  Created by JQTEK on 15/3/30.
//  Copyright (c) 2015年 ISSC. All rights reserved.
//

#import "JQPrinter.h"
#import "ESC.h"

@implementation JQPrinter
@synthesize esc;
@synthesize port;
@synthesize printerInfo;
@synthesize sendFlag;
@synthesize sendFinish;
@synthesize jpl;

-(id)init{
    self=[super init];
    if(self){
        port = nil;
        wrap = [[WrapDatas alloc]init];
        printerInfo = [[PrinterInfo alloc]init];
        printerInfo.model = VMP02_P;
        printerInfo.wrap = wrap;
        
        esc = [[ESC alloc]init];
        esc.printInfo = printerInfo;
        
        jpl = [[JPL alloc]init];
        jpl.printInfo = printerInfo;
        
        [esc getPrinterStatue];
        
        sendFlag = FALSE;
        sendFinish = FALSE;
        
    }
    return self;
}



-(void) setPort:(CBPeripheral *) value{
    if (port == value)
    {
        return;
    }
//    port.deviceInfoDelegate=self;
//    port.proprietaryDelegate=self;
    
    port = value;
    esc.port = port;
    jpl.port = port;
}



@end
