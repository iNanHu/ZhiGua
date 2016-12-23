//
//  QYTableViewHeader.h
//  导航栏渐变效果与头部视图放大集合
//
//  Created by apple on 16/1/5.
//  Copyright © 2016年 apple. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
@interface QYTableViewHeader : NSObject
@property(nonatomic,strong)UITableView* tableView;
@property(nonatomic,strong)UIView* bigImageView;
@property(nonatomic,strong)UIView* touXiangImageView;
-(void)goodMenWithTableView:(UITableView*)tableView andBackGroundView:(UIView*)view andSubviews:(UIView*)subviews;

- (void)scrollViewDidScroll:(UIScrollView*)scrollView;
- (void)resizeView;
@end
