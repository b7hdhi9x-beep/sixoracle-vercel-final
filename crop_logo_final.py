#!/usr/bin/env python3
"""
元の写真から円形のロゴ部分だけを正確に切り抜くスクリプト
"""

from PIL import Image
import numpy as np

# 元の画像を読み込み
img = Image.open('/home/ubuntu/upload/IMG_1933.png')
img = img.convert('RGBA')

# 画像のサイズを取得
width, height = img.size
print(f"元の画像サイズ: {width}x{height}")

# ロゴの円形エンブレム部分だけを切り抜く
# 円形ロゴは画像の上部中央にある（より正確な範囲）
logo_top = int(height * 0.165)  # 上から16.5%
logo_bottom = int(height * 0.405)  # 上から40.5%まで
logo_left = int(width * 0.185)  # 左から18.5%
logo_right = int(width * 0.815)  # 左から81.5%まで

# ロゴ部分を切り抜き
logo = img.crop((logo_left, logo_top, logo_right, logo_bottom))
logo_width, logo_height = logo.size
print(f"切り抜き後のサイズ: {logo_width}x{logo_height}")

# 正方形にする
size = max(logo_width, logo_height)
square_logo = Image.new('RGBA', (size, size), (0, 0, 0, 0))
offset = ((size - logo_width) // 2, (size - logo_height) // 2)
square_logo.paste(logo, offset)

# 結果を保存
square_logo.save('/home/ubuntu/six-oracle-deploy/client/public/brand-logo-final.png', 'PNG')
print("ロゴを切り抜いて保存しました: brand-logo-final.png")

# ウェブ表示用の小さいサイズも作成
small_logo = square_logo.resize((400, 400), Image.Resampling.LANCZOS)
small_logo.save('/home/ubuntu/six-oracle-deploy/client/public/brand-logo-400.png', 'PNG')
print("400x400サイズも保存しました: brand-logo-400.png")
