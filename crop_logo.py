#!/usr/bin/env python3
"""
元の写真からロゴ部分を切り抜いて背景を透過にするスクリプト
"""

from PIL import Image
import numpy as np

# 元の画像を読み込み
img = Image.open('/home/ubuntu/upload/IMG_1933.png')
img = img.convert('RGBA')

# 画像のサイズを取得
width, height = img.size
print(f"元の画像サイズ: {width}x{height}")

# ロゴは画像の上部中央にある円形のエンブレム
# スクリーンショットから見ると、ロゴは画像の上半分に位置している
# 切り抜き範囲を設定（ロゴ部分のみ）

# 画像の上部からロゴ部分を切り抜く
# ロゴは正方形に近い形で、画像の中央上部にある
logo_top = int(height * 0.12)  # 上から12%
logo_bottom = int(height * 0.58)  # 上から58%まで
logo_left = int(width * 0.18)  # 左から18%
logo_right = int(width * 0.82)  # 左から82%まで

# ロゴ部分を切り抜き
logo = img.crop((logo_left, logo_top, logo_right, logo_bottom))
logo_width, logo_height = logo.size
print(f"切り抜き後のサイズ: {logo_width}x{logo_height}")

# 背景を透過にする（黒に近い色を透過に）
logo_data = np.array(logo)

# 暗い背景（黒に近い色）を検出して透過にする
# RGB値が全て50以下の場合は背景とみなす
threshold = 30
mask = (logo_data[:, :, 0] < threshold) & (logo_data[:, :, 1] < threshold) & (logo_data[:, :, 2] < threshold)

# 透過処理
logo_data[mask, 3] = 0  # アルファチャンネルを0に

# 結果を保存
result = Image.fromarray(logo_data)
result.save('/home/ubuntu/six-oracle-deploy/client/public/brand-logo-cropped.png', 'PNG')
print("ロゴを切り抜いて保存しました: brand-logo-cropped.png")
