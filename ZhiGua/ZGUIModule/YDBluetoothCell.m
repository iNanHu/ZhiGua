//
//  YDBluetoothCell.m
//  PrintDemo
//
//  Created by long1009 on 16/1/15.
//  Copyright © 2016年 long1009. All rights reserved.
//

#import "YDBluetoothCell.h"
#import "WJSCommonDefine.h"

@interface YDBluetoothCell ()

@property (weak, nonatomic) IBOutlet UILabel *titilLabel;

@end

@implementation YDBluetoothCell

+ (YDBluetoothCell *)bluetoothCellWithTableView:(UITableView *)tableView andIndexPath:(NSIndexPath *) indexPath
{
    static NSString *cellIdentifier = @"bluetoothCell";
    YDBluetoothCell *cell = [tableView dequeueReusableCellWithIdentifier:cellIdentifier forIndexPath:indexPath];
    if (cell == nil)
    {
        cell = [[[NSBundle mainBundle] loadNibNamed:@"YDBluetoothCell" owner:nil options:nil] lastObject];
    }
    [cell.conStateBtn.layer setCornerRadius:5.f];
    [cell.conStateBtn setBackgroundColor:RGB(0x1B, 0xC0, 0xFF)];
    
    return cell;
}


- (void)awakeFromNib
{
    // Initialization code
}

- (void)setSelected:(BOOL)selected animated:(BOOL)animated
{
    [super setSelected:selected animated:animated];

}

- (void)setTitilString:(NSString *)titilString
{
    _titilString = titilString;
    self.titilLabel.text = titilString;
}

- (void)setIsConnected:(BOOL)isConnected
{
    _isConnected = isConnected;
    if (YES == isConnected)
    {
        [self.conStateBtn setTitle:@"断开" forState:UIControlStateNormal];
    }
    else
    {
        [self.conStateBtn setTitle:@"连接" forState:UIControlStateNormal];
    }
    
}



@end
