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
import type { TherapySession } from '../../../types/session.types'
import { useAuth0 } from '@auth0/auth0-react'
import { useDeleteSession } from '../hooks/useSessions'
import Modal from './Modal'

const fuzzyFilter: FilterFn<TherapySession> = (row, columnId, value, addMeta) => {
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
  return <input {...props} value={val} onChange={e => setVal(e.target.value)} />
}

export function SessionsTable({ sessions, loading }: { sessions: TherapySession[]; loading: boolean }) {
  const navigate = useNavigate()
  const { getAccessTokenSilently } = useAuth0()
  const deleteSession = useDeleteSession()
  const [globalFilter, setGlobalFilter] = useState('')
  const [pageIndex, setPageIndex] = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [toDelete, setToDelete] = useState<string | null>(null)
  const columns = useMemo<ColumnDef<TherapySession>[]>(() => [
    {
      accessorKey: 'name',
      header: '',
      cell: info => info.getValue() || 'Untitled',
      filterFn: fuzzyFilter,
    },
    {
      accessorKey: 'created_at',
      header: '',
      cell: info => <span style={{ marginRight: 8, display: 'inline-block' }}>{(info.getValue() as string)?.slice(0, 10) ?? ''}</span>,
    },
  ], [])
  const table = useReactTable({
    data: sessions,
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
  if (loading) return <div style={{ padding: 10, color: '#bbb', height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading sessions…</div>
  return (
    <div style={{ width: '100%', margin: '0 auto', height: 320, display: 'flex', flexDirection: 'column' }}>
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setToDelete(null) }}
        onConfirm={async () => {
          if (!toDelete) return
          const token = await getAccessTokenSilently()
          deleteSession.mutate({ token, sessionId: toDelete })
          setModalOpen(false)
          setToDelete(null)
        }}
        title="Delete session?"
      >
        Are you sure you want to delete this session?
      </Modal>
      <DebouncedInput
        value={globalFilter}
        onChange={setGlobalFilter}
        placeholder="Search sessions..."
        style={{ marginBottom: 12, padding: 6, width: '100%', background: 'none', border: '1px solid #444', color: '#eee', borderRadius: 4 }}
      />
      <style>
      {`
        @media (max-width: 600px) {
          .session-date {
            font-size: 12px !important;
            text-align: right !important;
            min-width: 70px;
            max-width: 90px;
            word-break: break-all;
          }
          .session-name {
            font-size: 14px !important;
          }
          th, td {
            padding: 4px 0 !important;
          }
        }
      `}
      </style>
      <div style={{ height: 220, overflowY: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {table.getRowModel().rows.length === 0 && (
              <tr><td style={{ padding: 8, color: '#555' }}>No sessions found</td></tr>
            )}
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} style={{ cursor: 'pointer' }}>
                {row.getVisibleCells().map((cell, idx) => (
                  <td
                    key={cell.id}
                    className={idx === 0 ? 'session-name' : idx === 1 ? 'session-date' : undefined}
                    style={{
                      padding: '6px 0',
                      color: '#eee',
                      border: 'none',
                      background: 'none',
                      width: idx === 0 ? '65%' : idx === 1 ? '25%' : undefined,
                      fontSize: idx === 1 ? 14 : undefined,
                    }}
                    onClick={() => navigate(`/chat?sessionId=${row.original.id}`)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                <td style={{ padding: '6px 0', border: 'none', background: 'none', width: 40 }}>
                  <button
                    style={{ background: 'none', outline: 'none', border: 'none', boxShadow: 'none', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 28, width: 28, transition: 'background 0.2s' }}
                    title="Delete session"
                    onClick={e => { e.stopPropagation(); setModalOpen(true); setToDelete(row.original.id) }}
                    disabled={deleteSession.isPending}
                  >
                    x
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 20, fontSize: 12, justifyContent: 'flex-end' }}>
        <button onClick={() => { setPageIndex(0); table.setPageIndex(0) }} disabled={!table.getCanPreviousPage()} style={{ background: 'none', border: 'none', color: '#666', padding: '1px 6px', borderRadius: 3, fontSize: 12, cursor: 'pointer' }}>{'<<'}</button>
        <button onClick={() => { setPageIndex(pageIndex - 1); table.previousPage() }} disabled={!table.getCanPreviousPage()} style={{ background: 'none', border: 'none', color: '#666', padding: '1px 6px', borderRadius: 3, fontSize: 12, cursor: 'pointer' }}>{'<'}</button>
        <span style={{ color: '#888', fontSize: 12 }}>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
        <button onClick={() => { setPageIndex(pageIndex + 1); table.nextPage() }} disabled={!table.getCanNextPage()} style={{ background: 'none', border: 'none', color: '#666', padding: '1px 6px', borderRadius: 3, fontSize: 12, cursor: 'pointer' }}>{'>'}</button>
        <button onClick={() => { setPageIndex(table.getPageCount() - 1); table.setPageIndex(table.getPageCount() - 1) }} disabled={!table.getCanNextPage()} style={{ background: 'none', border: 'none', color: '#666', padding: '1px 6px', borderRadius: 3, fontSize: 12, cursor: 'pointer' }}>{'>>'}</button>
      </div>
    </div>
  )
} 