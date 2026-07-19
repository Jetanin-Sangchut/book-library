import type { Meta } from '@/types'

type UsePaginationReturn = {
  totalPages: number
  canPrev: boolean
  canNext: boolean
  goTo: (page: number) => void
  goNext: () => void
  goPrev: () => void
}

export function usePagination(meta: Meta, onChange: (page: number) => void): UsePaginationReturn {
  const totalPages = meta.perPage > 0 ? Math.ceil(meta.total / meta.perPage) : 0
  const canPrev = meta.page > 1
  const canNext = meta.page < totalPages

  return {
    totalPages,
    canPrev,
    canNext,
    goTo: (page: number) => {
      if (page >= 1 && page <= totalPages) onChange(page)
    },
    goNext: () => { if (canNext) onChange(meta.page + 1) },
    goPrev: () => { if (canPrev) onChange(meta.page - 1) },
  }
}
