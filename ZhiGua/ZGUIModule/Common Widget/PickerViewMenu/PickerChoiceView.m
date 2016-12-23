//
//  PickerChoiceView.m
//  TFPickerView
//
//  Created by TF_man on 16/5/11.
//  Copyright © 2016年 tituanwang. All rights reserved.
//
//屏幕宽和高
#define kScreenWidth ([UIScreen mainScreen].bounds.size.width)
#define kScreenHeight ([UIScreen mainScreen].bounds.size.height)

//RGB
#define RGBA(r, g, b, a) [UIColor colorWithRed:(r)/255.0f green:(g)/255.0f blue:(b)/255.0f alpha:(a)]

// 缩放比
#define kScale ([UIScreen mainScreen].bounds.size.width) / 375

#define hScale ([UIScreen mainScreen].bounds.size.height) / 667

//字体大小
#define kfont 15

#import "PickerChoiceView.h"
#import "Masonry.h"

@interface PickerChoiceView ()<UIPickerViewDelegate,UIPickerViewDataSource>

@property (nonatomic,strong)UIView *bgV;

@property (nonatomic,strong)UIButton *cancelBtn;

@property (nonatomic,strong)UIButton *conpleteBtn;

@property (nonatomic,strong)UIPickerView *pickerV;

@property (nonatomic,strong)NSMutableArray *array;
@end

@implementation PickerChoiceView

- (instancetype)initWithFrame:(CGRect)frame{
    
    if (self = [super initWithFrame:frame]) {
        
        self.array = [NSMutableArray array];
        
        [self creatUI];

    }
    return self;
}

- (void)creatUI{
    
    self.frame = CGRectMake(0, 0, kScreenWidth, kScreenHeight);
    self.backgroundColor = RGBA(51, 51, 51, 0.8);
    self.bgV = [[UIView alloc]initWithFrame:CGRectMake(0, kScreenHeight, kScreenWidth, 260*hScale)];
    self.bgV.backgroundColor = [UIColor whiteColor];
    [self addSubview:self.bgV];
    
    [self showAnimation];
    
    //取消
    self.cancelBtn = [UIButton buttonWithType:UIButtonTypeCustom];
    [self.bgV addSubview:self.cancelBtn];
    [self.cancelBtn mas_makeConstraints:^(MASConstraintMaker *make) {
        
        make.top.mas_equalTo(0);
        make.left.mas_equalTo(15);
        make.width.mas_equalTo(30);
        make.height.mas_equalTo(44);
        
    }];
    self.cancelBtn.titleLabel.font = [UIFont systemFontOfSize:kfont];
    [self.cancelBtn setTitle:@"取消" forState:UIControlStateNormal];
    [self.cancelBtn addTarget:self action:@selector(cancelBtnClick) forControlEvents:UIControlEventTouchUpInside];
    [self.cancelBtn setTitleColor:RGBA(0, 122, 255, 1) forState:UIControlStateNormal];
    //完成
    self.conpleteBtn = [UIButton buttonWithType:UIButtonTypeCustom];
    [self.bgV addSubview:self.conpleteBtn];
    [self.conpleteBtn mas_makeConstraints:^(MASConstraintMaker *make) {
        
        make.top.mas_equalTo(0);
        make.right.mas_equalTo(-15);
        make.width.mas_equalTo(30);
        make.height.mas_equalTo(44);
        
    }];
    self.conpleteBtn.titleLabel.font = [UIFont systemFontOfSize:kfont];
    [self.conpleteBtn setTitle:@"完成" forState:UIControlStateNormal];
    [self.conpleteBtn addTarget:self action:@selector(completeBtnClick) forControlEvents:UIControlEventTouchUpInside];
    [self.conpleteBtn setTitleColor:RGBA(0, 122, 255, 1) forState:UIControlStateNormal];
    
    //选择titi
    self.selectLb = [UILabel new];
    [self.bgV addSubview:self.selectLb];
    [self.selectLb mas_makeConstraints:^(MASConstraintMaker *make) {
        
        make.centerX.mas_equalTo(self.bgV.mas_centerX).offset(0);
        make.centerY.mas_equalTo(self.conpleteBtn.mas_centerY).offset(0);
        
    }];
    self.selectLb.font = [UIFont systemFontOfSize:kfont];
    self.selectLb.textAlignment = NSTextAlignmentCenter;
    
    //线
    UIView *line = [UIView new];
    [self.bgV addSubview:line];
    [line mas_makeConstraints:^(MASConstraintMaker *make) {
        
        make.top.mas_equalTo(self.cancelBtn.mas_bottom).offset(0);
        make.left.mas_equalTo(0);
        make.width.mas_equalTo(kScreenWidth);
        make.height.mas_equalTo(0.5);
        
    }];
    line.backgroundColor = RGBA(224, 224, 224, 1);
    
    //选择器
    self.pickerV = [UIPickerView new];
    [self.bgV addSubview:self.pickerV];
    [self.pickerV mas_makeConstraints:^(MASConstraintMaker *make) {
        
        make.top.mas_equalTo(line.mas_bottom).offset(0);
        make.bottom.mas_equalTo(0);
        make.left.mas_equalTo(0);
        make.right.mas_equalTo(0);
        
    }];
    self.pickerV.delegate = self;
    self.pickerV.dataSource = self;

}

- (void)setCustomArr:(NSArray *)customArr{
    
    _customArr = customArr;
    [self.array addObject:customArr];
    
}

- (void)setSelectStr:(NSString *)selectStr{
    
    if (selectStr.length == 0) return;
    _selectStr = selectStr;
    
    switch (self.arrayType) {
        case GenderArray:{
            NSArray *genderArr = [self.array objectAtIndex:0];
            
            [self.pickerV selectRow:[self indexOfNSArray:genderArr WithStr:selectStr] inComponent:0 animated:YES];
        }
            break;
        case HeightArray:{
            NSArray *heightArr = [self.array objectAtIndex:0];
            [self.pickerV selectRow:[self indexOfNSArray:heightArr WithStr:selectStr] inComponent:0 animated:YES];
        }
            break;
        case weightArray:{
            NSArray *weightArr = [self.array objectAtIndex:0];
            [self.pickerV selectRow:[self indexOfNSArray:weightArr WithStr:selectStr] inComponent:0 animated:YES];
        }
            break;
        case DeteArray:{
            NSArray *detes = [selectStr componentsSeparatedByString:@"-"];
            NSMutableArray *newDetes = [NSMutableArray array];
            for (int i = 0 ; i < detes.count; i++) {
                
                if (i == 0) {
                    NSString *year = [detes[0] stringByAppendingString:@"年"];
                    [newDetes addObject:year];
                }else if (i == 1){
                    NSString *month = [detes[1] stringByAppendingString:@"月"];
                    [newDetes addObject:month];
                } else{
                    
                    NSString *day = [detes[2] stringByAppendingString:@"日"];
                    [newDetes addObject:day];
                }
            }
            NSArray *yearArr = [self.array objectAtIndex:0];
            NSArray *monthArr = [self.array objectAtIndex:1];
            NSArray *dayArr = [self.array objectAtIndex:2];

            [self.pickerV selectRow:[self indexOfNSArray:yearArr WithStr:newDetes[0]]+81*50 inComponent:0 animated:YES];
            
            [self.pickerV selectRow:[self indexOfNSArray:monthArr WithStr:newDetes[1]]+12*50 inComponent:1 animated:YES];
            
            [self.pickerV selectRow:[self indexOfNSArray:dayArr WithStr:newDetes[2]]+31*50 inComponent:2 animated:YES];
        }
            break;
        default:
            break;
    }
    
    //自定义动画
    if (self.customArr) {
        NSArray *customArr = [self.array objectAtIndex:0];
        [self.pickerV selectRow:[self indexOfNSArray:customArr WithStr:selectStr] inComponent:0 animated:YES];
    }
    
    
}

- (void)setArrayType:(ARRAYTYPE)arrayType
{
    _arrayType = arrayType;
    switch (arrayType) {
        case GenderArray:{
            [self GenderArray];
        }
            break;
        case HeightArray:{
            [self HeightArray];
        }
            break;
        case weightArray:
        {
            [self weightArray];
        }
            break;
        case DeteArray:
        {
            self.selectLb.text = @"选择出生年月";
            [self creatDate];
        }
            break;
        default:
            break;
    }
}

- (void)GenderArray{
    self.selectLb.text = @"选择性别";
    [self.array addObject:@[@"男",@"女"]];
}

- (void)HeightArray{
    self.selectLb.text = @"选择身高";
    NSMutableArray *arr = [NSMutableArray array];
    for (int i = 100; i <= 250; i++) {
        
        NSString *str = [NSString stringWithFormat:@"%d",i];
        [arr addObject:str];
    }
    [self.array addObject:(NSArray *)arr];
}
- (void)weightArray{
    self.selectLb.text = @"选择体重";
    NSMutableArray *arr = [NSMutableArray array];
    for (int i = 30; i <= 200; i++) {
        
        NSString *str = [NSString stringWithFormat:@"%d",i];
        [arr addObject:str];
    }
    [self.array addObject:(NSArray *)arr];
}

- (void)creatDate{
    
    //年
    NSMutableArray *yearArray = [[NSMutableArray alloc] init];
    for (int i = 1970; i <= 2050 ; i++){
        [yearArray addObject:[NSString stringWithFormat:@"%d年",i]];
    }
    [self.array addObject:yearArray];
    //月
    NSMutableArray *monthArray = [[NSMutableArray alloc]init];
    for (int i = 1; i < 13; i ++) {
        if (i < 10) {
            [monthArray addObject:[NSString stringWithFormat:@"0%d月",i]];
        }else{
            [monthArray addObject:[NSString stringWithFormat:@"%d月",i]];
        }
    }
    [self.array addObject:monthArray];
    //日
    NSMutableArray *daysArray = [[NSMutableArray alloc]init];
    for (int i = 1; i < 32; i ++) {
        if (i < 10) {
            [daysArray addObject:[NSString stringWithFormat:@"0%d日",i]];
        }else{
            [daysArray addObject:[NSString stringWithFormat:@"%d日",i]];
        }
    }
    [self.array addObject:daysArray];
    
    //获取当前的时间
    NSDate *date = [NSDate date];
    NSDateFormatter *formatter = [[NSDateFormatter alloc]init];
    
    [formatter setDateFormat:@"yyyy"];
    NSString *currentYear = [NSString stringWithFormat:@"%@年",[formatter stringFromDate:date]];
    
    [formatter setDateFormat:@"MM"];
    NSString *currentMonth = [NSString stringWithFormat:@"%@月",[formatter stringFromDate:date]];
    
    [formatter setDateFormat:@"dd"];
    NSString *currentDay = [NSString stringWithFormat:@"%@日",[formatter stringFromDate:date]];
    
    //设置选中那一时间
    [self.pickerV selectRow:[self indexOfNSArray:yearArray WithStr:currentYear]+81*50 inComponent:0 animated:YES];
    
    [self.pickerV selectRow:[self indexOfNSArray:monthArray WithStr:currentMonth]+12*50 inComponent:1 animated:YES];
    [self.pickerV selectRow:[self indexOfNSArray:daysArray WithStr:currentDay]+31*50 inComponent:2 animated:YES];

    
}

#pragma mark-----UIPickerViewDataSource

- (NSInteger)numberOfComponentsInPickerView:(UIPickerView *)pickerVie{
    return self.array.count;
}

- (NSInteger)pickerView:(UIPickerView *)pickerView numberOfRowsInComponent:(NSInteger)component{
    
     NSArray * arr = (NSArray *)[self.array objectAtIndex:component];
    return self.arrayType == DeteArray ? arr.count*100 : arr.count;
}

- (UIView *)pickerView:(UIPickerView *)pickerView viewForRow:(NSInteger)row forComponent:(NSInteger)component reusingView:(UIView *)view{
    
    UILabel *label=[[UILabel alloc] init];
    label.textAlignment = NSTextAlignmentCenter;
    label.text=[self pickerView:pickerView titleForRow:row forComponent:component];
    return label;
  
}

- (NSString *)pickerView:(UIPickerView *)pickerView titleForRow:(NSInteger)row forComponent:(NSInteger)component{
    
    NSArray *arr = (NSArray *)[self.array objectAtIndex:component];
    return [arr objectAtIndex:row % arr.count];
    
}


- (CGFloat)pickerView:(UIPickerView *)pickerView widthForComponent:(NSInteger)component
{
    return self.arrayType == DeteArray ? 60 : 110;
}

//防止崩溃
- (NSUInteger)indexOfNSArray:(NSArray *)arr WithStr:(NSString *)str{
    
    NSUInteger chosenDxInt = 0;
    if (str && ![str isEqualToString:@""]) {
        chosenDxInt = [arr indexOfObject:str];
        if (chosenDxInt == NSNotFound)
            chosenDxInt = 0;
    }
    return chosenDxInt;
}

#pragma mark-----点击方法

- (void)cancelBtnClick{
    
    [self hideAnimation];
    
}

- (void)completeBtnClick{
    
    NSString *fullStr = [NSString string];
    for (int i = 0; i < self.array.count; i++) {
        
        NSArray *arr = [self.array objectAtIndex:i];
        if (self.arrayType == DeteArray) {
            
            NSString *str = [arr objectAtIndex:[self.pickerV selectedRowInComponent:i]% arr.count];
            NSString *newStr = [str substringToIndex:str.length - 1];
            fullStr = [fullStr stringByAppendingString:newStr];
            if (i != self.array.count -1) {
                fullStr = [fullStr stringByAppendingString:@"-"];
            }
            
        }else{
            
            NSString *str = [arr objectAtIndex:[self.pickerV selectedRowInComponent:i]];
            fullStr = [fullStr stringByAppendingString:str];
        }

    }
    [self.delegate PickerSelectorIndixString:fullStr];
    
    [self hideAnimation];

}

- (void)touchesBegan:(NSSet<UITouch *> *)touches withEvent:(UIEvent *)event{
    
    [self hideAnimation];
    
}

//隐藏动画
- (void)hideAnimation{
    
    [UIView animateWithDuration:0.5 animations:^{
        
        CGRect frame = self.bgV.frame;
        frame.origin.y = kScreenHeight;
        self.bgV.frame = frame;
        
    } completion:^(BOOL finished) {
        
        [self.bgV removeFromSuperview];
        [self removeFromSuperview];
    }];
}

//显示动画
- (void)showAnimation{
    
    [UIView animateWithDuration:0.5 animations:^{
        
        CGRect frame = self.bgV.frame;
        frame.origin.y = kScreenHeight-260*hScale;
        self.bgV.frame = frame;
    }];
    
}


@end
