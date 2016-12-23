//
//  SHBaseVC.h
//  SmartHouseNew
//
//  Created by shigaoyang on 15/2/6.
//  Copyright (c) 2015年 一道科技. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "DejalActivityView.h"
#import "WJSCommonDefine.h"
#import "UIViewController+Style.h"
#import "UIViewController+HUD.h"

@class SHRefreshControl;

@interface SHBaseVC : UIViewController<UIGestureRecognizerDelegate,UINavigationControllerDelegate>

@property (nonatomic, strong) UIView *topBgView;

@property (nonatomic, strong) SHRefreshControl *refreshCtrl;

@property (assign, nonatomic) BOOL isEditing; //是否正在写入数据

/**
 *  显示菊花指示器
 */
- (void)showActivityViewWithTitle:(NSString *)title;
/**
 *  隐藏菊花指示器
 */
- (void)hidActivityViewWithTitle:(NSString *)title;

/**
 *  隐藏导航栏右边按钮
 */
@property (nonatomic,assign) BOOL hidRightButton;
/**
 *  隐藏导航栏左边按钮
 */
@property (nonatomic,assign) BOOL hidLeftButton;

@property (nonatomic, assign) BOOL hidBgView;

/**
 *  点击导航栏右边按钮事件
 */
- (void)rightAction:(UIButton *)sender;

/**
 *  点击导航栏左边按钮
 */
- (void)leftAction:(UIButton *)sender;

/**
 *  设置导航栏左边按钮
 *
 *  @param leftButtonTitle 按钮名字
 *  @param leftButtonImage 按钮图片
 */
- (void)setLeftButtonTitle:(NSString *)leftButtonTitle andImage:(UIImage *)leftButtonImage;
/**
 *  设置导航栏右边按钮
 *
 *  @param rightButtonTitle 按钮名字
 *  @param rightImage       按钮图片
 */
- (void)setRightButtonTitle:(NSString *)rightButtonTitle andImage:(UIImage *)rightImage;

/*
 设置scrollview刷新控件
 */
-(void)setScrollRefreshView:(UIScrollView *)tableView;
/*
 *
 */
- (void)finishRefreshControl;

//网络状态变化
- (void)netStateChanged:(int)val;

//状态变化
- (void)connectResult:(int)index;
@end
