//
//  UIViewController+HUD.h
//  SmartHouseNew
//
//  Created by yyh on 15/6/12.
//  Copyright (c) 2015年 一道科技. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "AppDelegate.h"
#import <objc/runtime.h>
#import "WJSCommonDefine.h"
#import "MBProgressHUD.h"
#import "DejalActivityView.h"

@interface UIViewController (HUD)
@property (nonatomic, strong) NSTimer *titleTimer;
- (void)showHud;
- (void)hideHud;

- (void)showHudWithTitle:(NSString *)title;
- (void)showAlertViewWithTitle:(NSString *)title;
- (void)showAlertViewWithTitle:(NSString *)title withOffset:(CGFloat)yOffset;
- (void)showHudProgressWithTitle:(NSString *)title;
//显示进度视图
- (void)showProgressViewWithTitle:(NSString *)strTitle;
//带超时提示
- (void)showProgressViewWithTitle:(NSString *)strTitle andTimeout:(NSInteger) nTime;
//隐藏进度视图
- (void)hideProgressView:(BOOL) bShow;
- (void)hideProgressViewN;
@end
