//
//  Page.h
//  BLETR
//
//  Created by JQTEK on 15/4/15.
//  Copyright (c) 2015年 ISSC. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "JPLBase.h"
//#import "MyPeripheral.h"
#import "PrinterInfo.h"

@interface Page : JPLBase


typedef NS_ENUM(Byte, PAGE_ROTATE)
{
    x0,
    x90,
};

-(BOOL)start;
-(BOOL)start:(int)originX originY:(int)originY pageWidth:(int)pageWidth pageHeight:(int)pageHeight rotate:(PAGE_ROTATE)rotate;
-(BOOL)end;
-(BOOL)print;
-(BOOL)print:(int)coun;

@end
