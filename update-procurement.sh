#!/bin/bash

cd "c:/Users/Lenovo/Documents/On Dev/CMMS/frontend/app/dashboard/procurement"

# 1. Add imports at top
sed -i '5a import ItemsModal from '"'"'@/components/ItemsModal'"'"';\nimport SupplierItemsGrouping from '"'"'@/components/SupplierItemsGrouping'"'"';' page.tsx

# 2. Add state variables after line 116 (after selectedPO state)
sed -i '116a\  const [showItemsModal, setShowItemsModal] = useState(false);\n  const [selectedItems, setSelectedItems] = useState<any[]>([]);\n  const [itemsModalTitle, setItemsModalTitle] = useState('"'"''"'"');\n  const [itemsModalAdditionalInfo, setItemsModalAdditionalInfo] = useState<any>(null);\n  const [showSupplierGrouping, setShowSupplierGrouping] = useState(false);' page.tsx

# 3. Replace handleGeneratePO function (lines 260-263)
sed -i '260,263d' page.tsx
sed -i '259a\  const handleGeneratePO = (pr: PurchaseRequest) => {\n    setSelectedPR(pr);\n    setShowSupplierGrouping(true);\n  };' page.tsx

# 4. Add handleGenerateGroupedPOs function after handleGeneratePO
sed -i '263a\\n  const handleGenerateGroupedPOs = async (groupedItems: { [supplier: string]: any[] }) => {\n    if (!user?.id || !user?.organizationId || !selectedPR) return;\n\n    try {\n      let successCount = 0;\n      const suppliers = Object.keys(groupedItems);\n\n      for (const supplier of suppliers) {\n        const items = groupedItems[supplier];\n        const subtotal = items.reduce((sum: number, item: any) =>\n          sum + ((item.estimatedCost || item.price || 0) * (item.quantity || 1)), 0);\n        const tax = subtotal * 0.12;\n        const totalCost = subtotal + tax;\n\n        await api.createPurchaseOrder({\n          organizationId: user.organizationId,\n          purchaseRequestId: selectedPR.id,\n          supplierName: supplier,\n          supplierContact: '"'"''"'"',\n          supplierEmail: '"'"''"'"',\n          supplierAddress: '"'"''"'"',\n          items: JSON.stringify(items),\n          subtotal: subtotal,\n          tax: tax,\n          shippingCost: 0,\n          totalCost: totalCost,\n          orderDate: new Date().toISOString().split('"'"'T'"'"')[0],\n          expectedDelivery: '"'"''"'"',\n          notes: `Auto-generated from PR ${selectedPR.requestNumber}`,\n          termsAndConditions: '"'"'Standard terms and conditions apply.'"'"',\n          paymentTerms: '"'"'30 days'"'"',\n          shippingMethod: '"'"'Standard'"'"',\n          createdById: user.id,\n        });\n\n        successCount++;\n      }\n\n      alert(`Successfully created ${successCount} Purchase Order(s) for ${successCount} supplier(s)`);\n      setShowSupplierGrouping(false);\n      setSelectedPR(null);\n      await fetchPurchaseOrders();\n    } catch (error: any) {\n      console.error('"'"'Failed to create POs:'"'"', error);\n      alert(`Failed to create POs: ${error.message}`);\n    }\n  };' page.tsx

echo "Procurement page updated successfully!"
