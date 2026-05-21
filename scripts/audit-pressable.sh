#!/bin/bash
# Pressable 위험 패턴 감지 스크립트
# 사용: bash scripts/audit-pressable.sh
# 출력: DANGEROUS(즉시 수정 필요) / SAFE(통과)
# 주의: inner View의 layout prop도 DANGEROUS로 잡힐 수 있음 (false positive).
# 출력 후 해당 파일에서 layout prop이 Pressable style 함수 안에 있는지 수동 확인 필수.

echo "=== DANGEROUS: layout prop이 Pressable style 함수 안에 있음 ==="
grep -rn -l "style={({ pressed" src/ app/ --include="*.tsx" | while read f; do
  if grep -A12 "style={({ pressed" "$f" | grep -qE "flexDirection|padding:|paddingHorizontal|paddingVertical|borderRadius|backgroundColor|borderColor|borderWidth|width:|height:|flex:"; then
    echo "  FIX: $f"
  fi
done

echo ""
echo "=== SAFE: opacity/transform only ==="
grep -rn -l "style={({ pressed" src/ app/ --include="*.tsx" | while read f; do
  if ! grep -A12 "style={({ pressed" "$f" | grep -qE "flexDirection|padding:|paddingHorizontal|paddingVertical|borderRadius|backgroundColor|borderColor|borderWidth|width:|height:|flex:"; then
    echo "  OK:  $f"
  fi
done
