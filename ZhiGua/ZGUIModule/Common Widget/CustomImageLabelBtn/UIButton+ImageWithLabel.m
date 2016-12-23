//
//  UIButton+ImageWithLabel.m
//  SmartHouseNew
//
//  Created by shigaoyang on 15/2/6.
//  Copyright (c) 2015年 一道科技. All rights reserved.
//

#import "UIButton+ImageWithLabel.h"
#import "WJSCommonDefine.h"

@implementation UIButton (ImageWithLabel)

- (void) setImage:(UIImage *)image withTitle:(NSString *)title forState:(UIControlState)stateType {
    //UIEdgeInsetsMake(CGFloat top, CGFloat left, CGFloat bottom, CGFloat right)
    UIFont *font = [UIFont systemFontOfSize:14];
    [self.imageView setContentMode:UIViewContentModeCenter];
    [self setImageEdgeInsets:UIEdgeInsetsMake(0.0,
                                              -25.0,
                                              0.0,
                                              0.0)];
    [self setImage:image forState:stateType];
    
    [self.titleLabel setContentMode:UIViewContentModeCenter];
    [self.titleLabel setBackgroundColor:[UIColor clearColor]];
    [self.titleLabel setFont:font];
    [self.titleLabel setTextColor:RGB(0x99, 0x99, 0x99)];
    [self setTitleEdgeInsets:UIEdgeInsetsMake(0.0,
                                              0.0,
                                              0.0,
                                              10.0)];
    [self setTitle:title forState:stateType];
}

- (void) setImage:(UIImage *)image withTitleBottom:(NSString *)title forState:(UIControlState)stateType {
    //UIEdgeInsetsMake(CGFloat top, CGFloat left, CGFloat bottom, CGFloat right)
    CGSize titleSize = [self getLabelCGSize:title];
    [self.imageView setContentMode:UIViewContentModeCenter];
    [self setImageEdgeInsets:UIEdgeInsetsMake(-8.0,
                                              0.0,
                                              0.0,
                                              -titleSize.width)];

    [self setImage:image forState:stateType];
    
    [self.titleLabel setContentMode:UIViewContentModeCenter];
    [self.titleLabel setBackgroundColor:[UIColor clearColor]];
    [self.titleLabel setFont:[UIFont systemFontOfSize:12.f]];
    [self setTitleEdgeInsets:UIEdgeInsetsMake(30.0,
                                              -image.size.width,
                                              0.0,
                                              0.0)];

    [self setTitle:title forState:stateType];
}
     
- (CGSize)getLabelCGSize:(id)info
{
    UILabel *labele = [[UILabel alloc] init];
    labele.text = info;
    
    CGSize maximumLabel = CGSizeMake(UI_SCREEN_WIDTH, 9999);
    CGSize expectSize = [labele sizeThatFits:maximumLabel];
    
    return expectSize;
}


@end
