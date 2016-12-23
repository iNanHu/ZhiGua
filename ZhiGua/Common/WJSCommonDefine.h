//
//  WJSCommonDefine.h
//  WenminYizhangtong
//
//  Created by sgyaaron on 16/6/28.
//  Copyright © 2016年 alexyang. All rights reserved.
//

#ifndef WJSCommonDefine_h
#define WJSCommonDefine_h

#import <Foundation/NSURLSession.h>
#define UMAppKey @"585348d63eae255b6a00142d"

//#define SERVADDR @"http://www.zhiguait.com" //Relaease
#define SERVADDR @"http://www.zhinengshagua.com" //Debug

#define PRINTERURL @"widget/link_printer"
#define EXITURL @"widget/WechatLoginAction_exit"
#define PRINTIN [NSString stringWithFormat:@"%@:8086/zgskwxWS",SERVADDR]

#define UPDATE_PRINTERINFO @"updatePrinterInfo"
#define AUTOLOGIN @"AutoLogin"

#define RunOnMainThread(code)   {dispatch_async(dispatch_get_main_queue(), ^{code;});}
#define RunInBackground(SEL,PARAMS) \
{[self performSelectorInBackground:@selector(SEL) withObject:PARAMS];}
#define RunAsync(code)      dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{code;});
#define Sleep(second)       usleep(second*1000*1000);

#define iOS8                     ([[[UIDevice currentDevice] systemVersion] floatValue] >= 8.0)
#define iPhone6                  (([UIScreen mainScreen].bounds.size.width == 750) ? YES : NO)
#define iPhone6P                 (([UIScreen mainScreen].bounds.size.width == 1080) ? YES : NO)
#define Custom_Blue_Select       [[UIColor alloc] initWithRed:178.0/255.0 green:210.0/255.0 blue:252.0/255.0 alpha:1]
#define IMAGEOF(x)               ([UIImage imageNamed:x])
/*
 *  设备Bounds
 */
#define UI_SCREEN_BOUND ([[UIScreen mainScreen] bounds])

/**
 *  设备宽度
 */
#define UI_SCREEN_WIDTH ([[UIScreen mainScreen] bounds].size.width)
/**
 *  设备高度
 */
#define UI_SCREEN_HEIGHT  ([[UIScreen mainScreen] bounds].size.height)

#define TT_FLIP_TRANSITION_DURATION 0.5

/*
 * 设备scale
 */

#define UI_MAIN_SCALE ([UIScreen mainScreen].scale)

/*
 * 关键视图
 */
#define UI_KEYWINDOW [UIApplication sharedApplication].keyWindow

/**
 *  设备高度
 */
#define Nav_HEIGHT  64
#define Tab_HEIGHT  45

#define TT_FLIP_TRANSITION_DURATION 0.5
/**
 *  设定颜色值
 */
#define UIColorFromRGB(rgbValue) [UIColor colorWithRed:((float)((rgbValue & 0xFF0000) >> 16))/255.0 green:((float)((rgbValue & 0xFF00) >> 8))/255.0 blue:((float)(rgbValue & 0xFF))/255.0 alpha:1.0]

#define RGBA(r, g, b, a)    [UIColor colorWithRed:(CGFloat)((r)/255.0) green:(CGFloat)((g)/255.0) blue:(CGFloat)((b)/255.0) alpha:(CGFloat)(a)]

#define RGB(r, g, b)        RGBA(r, g, b, 1.0)

#define TABLE_BGCLR         RGB(0xF7, 0xF7, 0xF7)

//用户信息
#define USRINFO_INVITEID   @"invite_number"
#define USRINFO_RANK       @"rank"

#define JSON_RES_SUCC       @"success"
#define JSON_RES_FAIL       @"error"



#define NAV_TO_HOMEVC       @"Nav_To_HomeVC"
#define NAV_TO_TUTORIALVC   @"SegToTutorialVC"
#define NAV_TO_MYFANSVC     @"NavToMyFansVC"
#define NAV_TO_MEMCENTERVC  @"NavToMemberCenterVC"
#define NAV_TO_REGISTERVC   @"NavToRegisterVC"
#define NAV_TO_FINDPSDVC    @"NavToFindPsdVC"

//消息通知
#define NOTI_PRINT_STATE_NOPAPER @"PRINTER_STATE_NoPaper"
#define NOTI_PRINT_STATE_LOWBATT @"PRINTER_STATE_LowBattery"
#define NOTI_PRINT_STATE_OVERHEAT @"PRINTER_STATE_OverHeat"
#define NOTI_PRINT_STATE_COVEROPEN @"PRINTER_STATE_CoverOpen"
#define NOTI_PRINT_STATE_ISPRINT @"PRINTER_STATE_IsPrint"

//网络请求的回调信息
typedef void (^SuccBlock)(id  _Nullable responseObject);
typedef void (^FailBlock)(id  _Nullable responseObject, NSError * _Nonnull error);

#endif /* WJSCommonDefine_h */
