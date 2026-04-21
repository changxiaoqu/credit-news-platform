#!/usr/bin/env python3
import re

bank_map = {
    '四川银行': '城商行', '宁波银行': '城商行', '江苏银行': '城商行',
    '广州银行': '城商行', '广西北部湾': '城商行', '天津银行': '城商行',
    '广州农商': '农商行', '湖南银行': '农商行', '河北农信': '农商行',
    '河南农商': '农商行', '浙江省农信': '省联社', '江苏省联社': '省联社',
    '湖南省农村信用社': '省联社', '中国银联': '其他', '光大证券': '其他',
    '工商银行': '国有大行', '农业银行': '国有大行', '中国银行': '国有大行',
    '建设银行': '国有大行', '交通银行': '国有大行', '邮储银行': '国有大行',
    '中国邮政': '国有大行', '进出口银行': '国有大行',
    '招商银行': '股份制', '浦发银行': '股份制', '中信银行': '股份制',
    '光大银行': '股份制', '华夏银行': '股份制', '民生银行': '股份制',
    '广发银行': '股份制', '兴业银行': '股份制', '平安银行': '股份制',
}

with open('scripts/init-data.js', 'r') as f:
    lines = f.readlines()

new_lines = []
count = 0

for line in lines:
    if "category: 'bid'" in line and "bank_type" not in line:
        title_match = re.search(r"title:\s*'([^']+)'", line)
        summary_match = re.search(r"summary:\s*'([^']+)'", line)
        
        if title_match and summary_match:
            title = title_match.group(1)
            summary = summary_match.group(1)
            
            bank_type = '其他'
            for bank, btype in bank_map.items():
                if bank in title:
                    bank_type = btype
                    break
            
            if '分行' in title or '信用卡中心' in title:
                procurement_level = '分行'
            elif '省联社' in title or '农村信用社' in title:
                procurement_level = '省联社'
            else:
                procurement_level = '总行'
            
            budget_match = re.search(r'预算[：:]*(\d+\.?\d*)[亿万元]', summary)
            budget = budget_match.group(1) + '万元' if budget_match else '待确认'
            
            # 替换 publish_date: 'date'} 为带新字段的版本
            new_line = re.sub(
                r"(publish_date: '[^']+')(\s*\})",
                r"\1, bank_type: '" + bank_type + "', procurement_level: '" + procurement_level + "', budget: '" + budget + "', bid_deadline: '待确认'\2",
                line
            )
            line = new_line
            count += 1
            print(f"Updated: {title[:30]}...")

    new_lines.append(line)

with open('scripts/init-data.js', 'w') as f:
    f.writelines(new_lines)

print(f"\nTotal: {count} lines updated")