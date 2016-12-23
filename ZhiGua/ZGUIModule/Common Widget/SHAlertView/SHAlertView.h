//
//  SHAlertView.h
//  SmartHouseNew
//
//  Created by shigaoyang on 15/4/25.
//  Copyright (c) 2015年 一道科技. All rights reserved.
//
#import <UIKit/UIKit.h>
#import <UIKit/UIAlertView.h>
#import <ReactiveCocoa/ReactiveCocoa.h>
#import <Foundation/Foundation.h>

typedef void(^Handler)(UIAlertView *alertView, NSInteger buttonIndex);

@interface SHAlertView : NSObject

+ (id)shareInstance;

/**
 *  带图片提交浮层
 *
 *  @param error 错误文字描述
 */
- (void)showError:(NSString *)error;
/**
 *  提交浮层
 *
 *  @param success 文字描述
 */
- (void)showSuccess:(NSString *)success;
/**
 *  如果在使用了UIActionSheet和UIAlertView后使用
 *
 *  @param success 文字描述
 *  @param view    当前视图(默认是添加到 [UIApplication sharedApplication].keyWindow)
 */
- (void)showSuccess:(NSString *)success atInView:(UIView *)view;
/**
 *  AlertView弹出框
 *
 *  @param message  提示内容
 *  @param titleStr 取消按钮的文字
 *  @param otherStr 其他按钮文字
 *  @param handler  处理按钮的block
 */
- (void)showAlertView:(NSString *)message withCanceliTitle:(NSString *)canceliStr withOther:(NSString *)otherStr withHandler:(Handler)handler;

/**
 *  不带图片浮层
 *
 *  @param message 文字描述
 */
- (void)showMessag:(NSString *)message;
/**
 *  提交菊花图层
 */
- (void)submitView;

- (void)hidSubmitView;

/**
 *  带文字菊花图层
 */
- (void)submitViewMessage:(NSString *)message;

/*
 *  button上显示和隐藏菊花
 */

- (void)showActivityViewButton:(UIButton*)sender;
- (void)hideActivityViewOnButton:(UIButton *)sender;


@end
