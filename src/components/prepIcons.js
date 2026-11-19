import { Backpack, Bed, Shirt, ShowerHead, Sparkle } from 'lucide-react-native'

// 준비 항목 아이콘 키(data/mock.js의 icon) → 아이콘 (웹 pages/alarm/prepIcons.js)
export const PREP_ICONS = { bed: Bed, shower: ShowerHead, shirt: Shirt, bag: Backpack, etc: Sparkle }

export const prepIcon = (key) => PREP_ICONS[key] ?? Sparkle
