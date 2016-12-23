//
//  PrinterInfo.h
//  BLETR
//
//  Created by JQTEK on 15/3/30.
//  Copyright (c) 2015年 ISSC. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "WrapDatas.h"

typedef NS_ENUM(NSInteger,  PRINTER_MODEL)
{
    NO_INIT,
    VMP02,
    VMP02_P,
    JLP351,
    JLP35,
    JLP351_IC,
    ULT113x,
    ULT1131_IC,
    EXP341
};

@interface PrinterInfo : NSObject{

}

@property(nonatomic)PRINTER_MODEL model;
@property(assign)int escPageWidth;
@property(assign)int escPageHeight;
@property(assign)int cmdBufferSize;
@property(assign)int jplSupport;
@property(assign)int cpclSupport;
@property(assign)int pageWidth;
@property(assign)int pageHeight;
@property(assign)WrapDatas *wrap;

@end
