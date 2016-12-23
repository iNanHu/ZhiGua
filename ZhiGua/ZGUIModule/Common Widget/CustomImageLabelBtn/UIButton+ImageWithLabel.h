//
//  UIButton+ImageWithLabel.h
//  SmartHouseNew
//
//  Created by shigaoyang on 15/2/6.
//  Copyright (c) 2015年 一道科技. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface UIButton (ImageWithLabel)

/**
 *  图片在左边文字在右边
 *
 *  @param image     图片
 *  @param title     文字
 *  @param stateType 当前状态
 */
- (void) setImage:(UIImage *)image withTitle:(NSString *)title forState:(UIControlState)stateType;

/**
 *  图片在上文字在下
 *
 *  @param image     图片
 *  @param title     文字
 *  @param stateType 当前状态
 */
- (void) setImage:(UIImage *)image withTitleBottom:(NSString *)title forState:(UIControlState)stateType;

@end
