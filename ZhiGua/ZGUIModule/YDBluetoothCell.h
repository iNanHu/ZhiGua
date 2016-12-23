//
//  YDBluetoothCell.h
//  PrintDemo
//
//  Created by long1009 on 16/1/15.
//  Copyright © 2016年 long1009. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface YDBluetoothCell : UITableViewCell

+ (YDBluetoothCell *)bluetoothCellWithTableView:(UITableView *)tableView andIndexPath:(NSIndexPath *) indexPath;

@property (weak, nonatomic) IBOutlet UIButton *conStateBtn;
@property (nonatomic, copy) NSString *titilString;
@property (nonatomic, assign) BOOL isConnected;

@end
