#!/usr/bin/env python3
"""
元の写真から円形のロゴ全体を正確に切り抜くスクリプト
"""

from PIL import Image
import numpy as np

# 元の画像を読み込み
img = Image.open('/home/ubuntu/upload/IMG_1933.png')
img = img.convert('RGBA')

# 画像のサイズを取得
width, height = img.size
print(f"元の画像サイズ: {width}x{height}")

# ロゴの円形エンブレム全体を切り抜く（下の装飾まで含める）
logo_top = int(height * 0.155)  # 上から15.5%
logo_bottom = int(height * 0.43)  # 上から43%まで（下の装飾も含む）
logo_left = int(width * 0.16)  # 左から16%
logo_right = int(width * 0.84)  # 左から84%まで

# ロゴ部分を切り抜き
logo = img.crop((logo_left, logo_top, logo_right, logo_bottom))
logo_width, logo_height = logo.size
print(f"切り抜き後のサイズ: {logo_width}x{logo_height}")

# そのまま保存（正方形にしない）
logo.save('/home/ubuntu/six-oracle-deploy/client/public/brand-logo-v2.png', 'PNG')
print("ロゴを切り抜いて保存しました: brand-logo-v2.png")

# ウェブ表示用にリサイズ
small_logo = logo.resize((int(logo_width * 0.5), int(logo_height * 0.5)), Image.Resampling.LANCZOS)
small_logo.save('/home/ubuntu/six-oracle-deploy/client/public/brand-logo-web.png', 'PNG')
print("ウェブ用サイズも保存しました: brand-logo-web.png")
