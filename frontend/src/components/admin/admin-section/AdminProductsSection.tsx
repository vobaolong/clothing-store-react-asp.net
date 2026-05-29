import { useState } from 'react'
import { useAdmin } from '@/context/admin/AdminContext'
import { useAdminProducts } from '@/hooks/useAdminProducts'
import { useProductSelection } from '@/hooks/useProductSelection'
import { useProductActions } from '@/hooks/useProductActions'
import AdminProductsToolbar from '@/components/admin/admin-toolbar/AdminProductsToolbar'
import AdminProductsTable from '@/components/admin/admin-table/AdminProductsTable'
import ProductDrawer from '@/components/admin/ProductDrawer'
import AdminProductImportModal from '@/components/admin/admin-modal/AdminProductImportModal'
import AdminProductsSelectionActions from '@/components/admin/admin-selection-action/AdminProductsSelectionActions'
import { buildCategoryTreeSelectData } from '@/utils/category-tree'

export default function AdminProductsSection() {
  const { filters: adminFilters, refresh, editing, modals, editor } = useAdmin()
  const { productListMode: listMode, setProductListMode } = adminFilters
  const { clearDirty } = editor

  const { loading, refreshQuery, filters, setFilters, filteredData } =
    useAdminProducts(listMode)

  const {
    selectionState,
    setSelectionState,
    rowSelection,
    clearSelection,
    hasSelection
  } = useProductSelection()

  const {
    onCreate,
    onEdit,
    onDelete,
    onRestore,
    onToggleActive,
    openProductView,
    onExportExcel
  } = useProductActions({
    refresh,
    editing,
    modals,
    clearDirty,
    setSelectionState
  })

  const isTrash = listMode === 'deleted'
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  const categoryTreeData = buildCategoryTreeSelectData([])

  return (
    <div className="space-y-3!">
      <AdminProductsToolbar
        listMode={listMode}
        onListModeChange={setProductListMode}
        refreshQuery={refreshQuery}
        onImportExcel={() => setIsImportModalOpen(true)}
        onCreate={onCreate}
        selectedActions={
          hasSelection ? (
            <AdminProductsSelectionActions
              isTrash={isTrash}
              selectedRowKeys={selectionState.selectedRowKeys}
              onClearSelection={clearSelection}
              onRefresh={refresh}
              onExportExcel={() => {
                const selectedIds = selectionState.selectedRowKeys.map(String)
                const selectedProducts = filteredData.filter((p) =>
                  selectedIds.includes(p.id)
                )
                onExportExcel(selectedProducts)
              }}
            />
          ) : null
        }
        searchValue={filters.search}
        onSearchChange={(value) => setFilters((c) => ({ ...c, search: value }))}
        categoryId={filters.categoryId}
        categoryTreeData={categoryTreeData}
        onCategoryChange={(value) =>
          setFilters((c) => ({ ...c, categoryId: value ?? '' }))
        }
        activeValue={filters.active}
        onActiveChange={(value) => setFilters((c) => ({ ...c, active: value }))}
        dateRange={filters.dateRange}
        onDateRangeChange={(dates) =>
          setFilters((c) => ({
            ...c,
            dateRange: dates ? [dates[0], dates[1]] : [null, null]
          }))
        }
      />

      <AdminProductsTable
        dataSource={filteredData}
        loading={loading}
        isTrash={isTrash}
        rowSelection={rowSelection}
        onView={openProductView}
        onEdit={onEdit}
        onDelete={onDelete}
        onRestore={onRestore}
        onToggleActive={onToggleActive}
        onRefresh={refresh}
      />

      <ProductDrawer
        open={Boolean(selectionState.viewProduct)}
        product={selectionState.viewProduct}
        onClose={() =>
          setSelectionState((current) => ({ ...current, viewProduct: null }))
        }
      />

      <AdminProductImportModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImported={refresh}
      />
    </div>
  )
}
