#!/usr/bin/env python3
"""
元の写真から円形のロゴ全体を正確に切り抜くスクリプト（白い部分を除去）
"""

from PIL import Image
import numpy as np

# 元の画像を読み込み
img = Image.open('/home/ubuntu/upload/IMG_1933.png')
img = img.convert('RGBA')

# 画像のサイズを取得
width, height = img.size
print(f"元の画像サイズ: {width}x{height}")

# ロゴの円形エンブレム全体を切り抜く（白い部分を除外）
logo_top = int(height * 0.175)  # 上から17.5%（白い部分を除外）
logo_bottom = int(height * 0.425)  # 上から42.5%まで
logo_left = int(width * 0.17)  # 左から17%
logo_right = int(width * 0.83)  # 左から83%まで

# ロゴ部分を切り抜き
logo = img.crop((logo_left, logo_top, logo_right, logo_bottom))
logo_width, logo_height = logo.size
print(f"切り抜き後のサイズ: {logo_width}x{logo_height}")

# そのまま保存
logo.save('/home/ubuntu/six-oracle-deploy/client/public/brand-logo-v3.png', 'PNG')
print("ロゴを切り抜いて保存しました: brand-logo-v3.png")

# ウェブ表示用にリサイズ
small_logo = logo.resize((int(logo_width * 0.5), int(logo_height * 0.5)), Image.Resampling.LANCZOS)
small_logo.save('/home/ubuntu/six-oracle-deploy/client/public/brand-logo-final-web.png', 'PNG')
print("ウェブ用サイズも保存しました: brand-logo-final-web.png")
