import { Pagination, Row, Col, Tag, Drawer, FloatButton } from 'antd'
import { FilterOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '@/components/product-card'
import ProductsFilter from '@/features/products/components/products-filter'
import ProductsSearchFilter from '@/features/products/components/products-search-filter'
import { getCategories, getProducts } from '@/api/products-api'
import {
  buildCategoryFilterTreeRows,
  categoryChipLabelFromQueryParam,
  getExpandedCategoryIdsForProductFilter,
  legacyProductCategoryParamMatch,
  resolvedCategoryIdsFromQueryParams
} from '@/utils/category-tree'
import { productMatchesSearch } from '@/utils/product-search'
import { compareSizes, normalizeSize } from '@/utils/size-utils'
import { QUERY_KEYS } from '@/constants/query-keys'
import { getEffectivePrice } from '@/utils/product-pricing'

const pageSize = 12

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: products = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.products,
    queryFn: getProducts
  })

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: getCategories
  })

  const selectedCategories = searchParams.getAll('category')
  const selectedSizes = searchParams.getAll('size').map(normalizeSize)
  const selectedColors = searchParams.getAll('color')
  const searchKeyword = searchParams.get('search') ?? ''
  const sortBy = searchParams.get('sort') ?? 'price-asc'
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000])
  const [page, setPage] = useState(1)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)

  const categoryOptions = useMemo(
    () => buildCategoryFilterTreeRows(categories),
    [categories]
  )

  const categoryLabelByValue = useMemo(
    () =>
      categoryOptions.reduce<Record<string, string>>((acc, option) => {
        acc[option.value] = option.label
        return acc
      }, {}),
    [categoryOptions]
  )

  const sizeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          products.flatMap((p) => p.variants.map((v) => normalizeSize(v.size)))
        )
      ).sort(compareSizes),
    [products]
  )

  const expandedCategoryIds = useMemo(
    () =>
      getExpandedCategoryIdsForProductFilter(selectedCategories, categories),
    [selectedCategories, categories]
  )

  const categoryCheckboxSelection = useMemo(
    () => resolvedCategoryIdsFromQueryParams(selectedCategories, categories),
    [selectedCategories, categories]
  )

  const colorOptions = useMemo(() => {
    const colorsMap = new Map<string, string>()
    products.forEach((p) => {
      p.variants.forEach((v) => {
        if (!colorsMap.has(v.color)) {
          colorsMap.set(v.color, v.hex)
        }
      })
    })
    return Array.from(colorsMap.entries()).map(([label, hex]) => ({
      label,
      hex
    }))
  }, [products])

  const filtered = useMemo(() => {
    const filteredProducts = products.filter((item) => {
      const matchCategory =
        expandedCategoryIds === null
          ? true
          : expandedCategoryIds === undefined
            ? legacyProductCategoryParamMatch(
                item.categoryId,
                item.categorySlug,
                item.category,
                item.categoryName,
                selectedCategories
              )
            : expandedCategoryIds.has(String(item.categoryId))

      const matchSearch = searchKeyword.trim()
        ? productMatchesSearch(item, searchKeyword)
        : true

      const matchPrice =
        getEffectivePrice(item) >= priceRange[0] &&
        getEffectivePrice(item) <= priceRange[1]

      const matchSize = selectedSizes.length
        ? item.variants.some((v) =>
            selectedSizes.includes(normalizeSize(v.size))
          )
        : true

      const matchColor = selectedColors.length
        ? item.variants.some((v) => selectedColors.includes(v.color))
        : true

      return (
        matchCategory && matchSearch && matchPrice && matchSize && matchColor
      )
    })

    if (sortBy === 'price-asc') {
      return filteredProducts.toSorted(
        (a, b) => getEffectivePrice(a) - getEffectivePrice(b)
      )
    }

    if (sortBy === 'price-desc') {
      return filteredProducts.toSorted(
        (a, b) => getEffectivePrice(b) - getEffectivePrice(a)
      )
    }

    if (sortBy === 'newest') {
      return filteredProducts.toSorted(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    }

    if (sortBy === 'best-selling') {
      return filteredProducts.toSorted((a, b) => b.soldCount - a.soldCount)
    }

    return filteredProducts
  }, [
    products,
    expandedCategoryIds,
    selectedCategories,
    searchKeyword,
    priceRange,
    sortBy,
    selectedSizes,
    selectedColors
  ])

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)
  if (isLoading || categoriesLoading) return <p>Đang tải &hellip;</p>

  const updateFilters = (key: string, values: string[]) => {
    const next = new URLSearchParams(searchParams)
    next.delete(key)
    values.forEach((v) => next.append(key, v))
    setSearchParams(next)
    setPage(1)
  }

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams())
    setPriceRange([0, 5000000])
    setPage(1)
  }

  const removeFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    const values = next.getAll(key).filter((v) => v !== value)
    next.delete(key)
    values.forEach((v) => next.append(key, v))
    setSearchParams(next)
    setPage(1)
  }

  const activeFilters = [
    ...selectedCategories.map((v) => ({
      key: 'category',
      value: v,
      label:
        categoryLabelByValue[v] ??
        categoryChipLabelFromQueryParam(v, categories)
    })),
    ...selectedSizes.map((v) => ({ key: 'size', value: v, label: v })),
    ...selectedColors.map((v) => ({
      key: 'color',
      value: v,
      label: v
    }))
  ]

  if (searchKeyword) {
    activeFilters.push({
      key: 'search',
      value: searchKeyword,
      label: searchKeyword
    })
  }

  return (
    <>
      <Row gutter={[24, 24]}>
        <Col xs={0} sm={0} md={7} lg={6} xl={5}>
          <div className='sticky top-24 h-fit'>
            <ProductsFilter
              selectedCategories={categoryCheckboxSelection}
              categoryOptions={categoryOptions}
              selectedSizes={selectedSizes}
              sizeOptions={sizeOptions}
              selectedColors={selectedColors}
              colorOptions={colorOptions}
              priceRange={priceRange}
              totalResults={filtered.length}
              onCategoryChange={(values) => updateFilters('category', values)}
              onSizeChange={(values) => updateFilters('size', values)}
              onColorChange={(values) => updateFilters('color', values)}
              onPriceRangeChange={(value) => {
                setPriceRange(value)
                setPage(1)
              }}
            />
          </div>
        </Col>

        <Col xs={24} sm={24} md={17} lg={18} xl={19}>
          <div className='space-y-6'>
            <ProductsSearchFilter
              value={searchKeyword}
              total={filtered.length}
              sortBy={sortBy}
              onChange={(value) => {
                const next = new URLSearchParams(searchParams)
                const keyword = value.trim()
                if (keyword) next.set('search', keyword)
                else next.delete('search')
                setSearchParams(next)
                setPage(1)
              }}
              onSortChange={(value) => {
                const next = new URLSearchParams(searchParams)
                next.set('sort', value)
                setSearchParams(next)
                setPage(1)
              }}
            />

            {activeFilters.length > 0 && (
              <div className='flex flex-wrap items-center gap-3'>
                <div className='flex flex-wrap items-center gap-2'>
                  {activeFilters.map((filter) => (
                    <Tag
                      key={`${filter.key}-${filter.value}`}
                      closable
                      onClose={() => {
                        if (filter.key === 'search') {
                          const next = new URLSearchParams(searchParams)
                          next.delete('search')
                          setSearchParams(next)
                        } else {
                          removeFilter(filter.key, filter.value)
                        }
                      }}
                      className='flex items-center h-6 px-3 m-0 text-sm font-medium bg-white rounded-md shadow-sm border-stone-200 text-stone-600'
                    >
                      {filter.label}
                    </Tag>
                  ))}
                </div>
                <button
                  onClick={clearAllFilters}
                  className='text-sm! font-semibold text-red-700! hover:text-red-800! transition-colors underline! cursor-pointer'
                >
                  Xoá lọc
                </button>
              </div>
            )}

            <Row gutter={[16, 16]}>
              {paged.map((item) => (
                <Col key={item.id} xs={12} sm={12} md={8} lg={6} xl={6}>
                  <ProductCard mode='featured' product={item} />
                </Col>
              ))}
            </Row>

            <div className='flex justify-end'>
              <Pagination
                current={page}
                total={filtered.length}
                pageSize={pageSize}
                onChange={setPage}
              />
            </div>
          </div>
        </Col>
      </Row>

      <FloatButton
        icon={<FilterOutlined />}
        type='primary'
        style={{ bottom: 24 }}
        onClick={() => setIsFilterDrawerOpen(true)}
        className='md:hidden!'
      />

      <Drawer
        title='Bộ lọc'
        placement='left'
        onClose={() => setIsFilterDrawerOpen(false)}
        open={isFilterDrawerOpen}
        size={400}
      >
        <ProductsFilter
          selectedCategories={categoryCheckboxSelection}
          categoryOptions={categoryOptions}
          selectedSizes={selectedSizes}
          sizeOptions={sizeOptions}
          selectedColors={selectedColors}
          colorOptions={colorOptions}
          priceRange={priceRange}
          totalResults={filtered.length}
          onCategoryChange={(values) => updateFilters('category', values)}
          onSizeChange={(values) => updateFilters('size', values)}
          onColorChange={(values) => updateFilters('color', values)}
          onPriceRangeChange={(value) => {
            setPriceRange(value)
            setPage(1)
          }}
        />
      </Drawer>
    </>
  )
}
