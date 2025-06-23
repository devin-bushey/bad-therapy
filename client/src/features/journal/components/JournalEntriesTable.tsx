import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'
import type { JournalEntry } from '../../../types/journal-entries.types'
import { useAuth0 } from '@auth0/auth0-react'
import { useDeleteJournalEntry } from '../hooks/useJournalEntries'
import Modal from '../../dashboard/components/Modal'

const fuzzyFilter: FilterFn<JournalEntry> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

function DebouncedInput({ value, onChange, debounce = 300, ...props }: {
  value: string
  onChange: (value: string) => void
  debounce?: number
  [key: string]: unknown
}) {
  const [val, setVal] = useState(value)
  useEffect(() => { setVal(value) }, [value])
  useEffect(() => { const t = setTimeout(() => onChange(val), debounce); return () => clearTimeout(t) }, [val, debounce, onChange])
  return (
    <input 
      {...props} 
      value={val} 
      onChange={e => setVal(e.target.value)}
      className="mb-3 p-2 w-full bg-warm-50 border border-warm-200 text-warm-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-earth-500 focus:border-earth-500 placeholder-warm-500"
    />
  )
}

export function JournalEntriesTable({ entries, loading }: { entries: JournalEntry[]; loading: boolean }) {
  const navigate = useNavigate()
  const { getAccessTokenSilently } = useAuth0()
  const deleteJournalEntry = useDeleteJournalEntry()
  const [globalFilter, setGlobalFilter] = useState('')
  const [pageIndex, setPageIndex] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [toDelete, setToDelete] = useState<string | null>(null)
  
  const columns = useMemo<ColumnDef<JournalEntry>[]>(() => [
    {
      accessorKey: 'title',
      header: '',
      cell: info => info.getValue() || 'Untitled Entry',
      filterFn: fuzzyFilter,
    },
    {
      accessorKey: 'created_at',
      header: '',
      cell: info => <span style={{ marginRight: 8, display: 'inline-block' }}>{(info.getValue() as string)?.slice(0, 10) ?? ''}</span>,
    },
  ], [])
  
  const table = useReactTable({
    data: entries,
    columns,
    state: { globalFilter, pagination: { pageSize: 5, pageIndex } },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: updater => {
      if (typeof updater === 'function') {
        const next = updater({ pageIndex, pageSize: 5 })
        setPageIndex(next.pageIndex)
      } else if (typeof updater === 'object' && updater.pageIndex !== undefined) {
        setPageIndex(updater.pageIndex)
      }
    },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  })
  
  if (loading) return <div className="p-2.5 text-warm-600 h-80 flex items-center justify-center">Loading journal entries…</div>
  
  return (
    <div className="w-full mx-auto h-80 flex flex-col">
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setToDelete(null) }}
        onConfirm={async () => {
          if (!toDelete) return
          const token = await getAccessTokenSilently()
          deleteJournalEntry.mutate({ token, entryId: toDelete })
          setModalOpen(false)
          setToDelete(null)
        }}
        title="Delete journal entry?"
      >
        Are you sure you want to delete this journal entry?
      </Modal>
      <DebouncedInput
        value={globalFilter}
        onChange={setGlobalFilter}
        placeholder="Search journal entries..."
      />
      <div className="h-56 overflow-y-auto w-full">
        <table className="w-full border-collapse">
          <tbody>
            {table.getRowModel().rows.length === 0 && (
              <tr><td className="p-2 text-warm-600">No journal entries found</td></tr>
            )}
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="cursor-pointer hover:bg-warm-50 transition-colors">
                {row.getVisibleCells().map((cell, idx) => (
                  <td
                    key={cell.id}
                    className={`py-1.5 px-0 text-warm-800 border-none bg-transparent ${
                      idx === 0 ? 'w-[65%] max-sm:text-sm' : 
                      idx === 1 ? 'w-[25%] text-sm max-sm:text-xs text-right min-w-[70px] max-w-[90px] break-all' : 
                      ''
                    }`}
                    onClick={() => navigate(`/journal/${row.original.id}`)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                <td className="py-1.5 px-0 border-none bg-transparent w-10">
                  <button
                    className="bg-transparent outline-none border-none shadow-none text-lg cursor-pointer flex items-center justify-center h-7 w-7 text-warm-500 hover:text-error-500 hover:bg-warm-100 rounded transition-colors disabled:opacity-50"
                    title="Delete journal entry"
                    onClick={e => { e.stopPropagation(); setModalOpen(true); setToDelete(row.original.id) }}
                    disabled={deleteJournalEntry.isPending}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-1.5 mt-5 text-xs justify-end">
        <button 
          onClick={() => { setPageIndex(0); table.setPageIndex(0) }} 
          disabled={!table.getCanPreviousPage()} 
          className="bg-transparent border-none text-warm-600 px-1.5 py-0.5 rounded text-xs cursor-pointer hover:bg-warm-100 hover:text-warm-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {'<<'}
        </button>
        <button 
          onClick={() => { setPageIndex(pageIndex - 1); table.previousPage() }} 
          disabled={!table.getCanPreviousPage()} 
          className="bg-transparent border-none text-warm-600 px-1.5 py-0.5 rounded text-xs cursor-pointer hover:bg-warm-100 hover:text-warm-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {'<'}
        </button>
        <span className="text-warm-500 text-xs px-2">
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
        <button 
          onClick={() => { setPageIndex(pageIndex + 1); table.nextPage() }} 
          disabled={!table.getCanNextPage()} 
          className="bg-transparent border-none text-warm-600 px-1.5 py-0.5 rounded text-xs cursor-pointer hover:bg-warm-100 hover:text-warm-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {'>'}
        </button>
        <button 
          onClick={() => { setPageIndex(table.getPageCount() - 1); table.setPageIndex(table.getPageCount() - 1) }} 
          disabled={!table.getCanNextPage()} 
          className="bg-transparent border-none text-warm-600 px-1.5 py-0.5 rounded text-xs cursor-pointer hover:bg-warm-100 hover:text-warm-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {'>>'}
        </button>
      </div>
    </div>
  )
}