"use client";

import { useState } from "react";
import api from "@/lib/api";

interface AssetPart {
  id: string;
  partNumber: string;
  partName: string;
  sapNumber?: string;
  componentClassification?: string;
  pmType?: string;
  smpNumber?: number;
  frequencyPM?: string;
  maintenanceTimeMinutes?: number;
  machineStopRequired?: string;
  inspectionStandard?: string;
  frequencyAM?: string;
  qaMatrixNo?: number;
  qmMatrixNo?: number;
  kaizenType?: string;
  kaizenNo?: string;
  storeroomLocation?: string;
  vendor?: string;
}

interface WCMLedgerGridProps {
  asset: {
    assetNumber: string;
    name: string;
  };
  parts: AssetPart[];
  year?: number;
  onDataChange?: () => void;
}

export default function WCMLedgerGrid({ asset, parts, year = new Date().getFullYear(), onDataChange }: WCMLedgerGridProps) {
  const weeks = Array.from({ length: 52 }, (_, i) => i + 1);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [editingCell, setEditingCell] = useState<{ partId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [saving, setSaving] = useState(false);
