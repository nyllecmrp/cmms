import re

with open('frontend/components/WCMLedgerGrid.tsx', 'r', encoding='utf8') as f:
    content = f.read()

content = content.replace(
    "import { useState } from 'react';",
    "import { useState } from 'react';\nimport api from '@/lib/api';"
)

content = content.replace(
    "  year?: number;\n}",
    "  year?: number;\n  onDataChange?: () => void;\n}"
)

content = content.replace(
    "({ asset, parts, year = new Date().getFullYear() }: WCMLedgerGridProps) {",
    "({ asset, parts, year = new Date().getFullYear(), onDataChange }: WCMLedgerGridProps) {"
)

content = content.replace(
    "const [selectedWeek, setSelectedWeek] = useState<number | null>(null);",
    """const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [editingCell, setEditingCell] = useState<{ partId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [saving, setSaving] = useState(false);"""
)

with open('frontend/components/WCMLedgerGrid.tsx', 'w', encoding='utf8') as f:
    f.write(content)

print("Step 1/3 complete")
