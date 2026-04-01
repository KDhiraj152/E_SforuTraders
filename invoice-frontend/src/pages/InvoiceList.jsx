import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageHeader, PageContainer } from '@/components/layout'
import {
  Plus,
  Search,
  Loader2,
  FileText,
  MoreHorizontal,
  Pencil,
  Printer,
  Trash2,
  Download,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import API from '@/api/client'

export default function InvoiceList({ onNew, onEdit }) {
  const [invoices, setInvoices] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, invoice: null })
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const res = await API.get('/api/invoices')
      const invoiceData = Array.isArray(res.data)
        ? res.data
        : res.data?.content || []
      setInvoices(invoiceData)
    } catch (err) {
      console.error('Error fetching invoices:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.invoice) return
    setDeleting(true)
    try {
      await API.delete(`/api/invoices/${deleteDialog.invoice.id}`)
      setInvoices(invoices.filter((i) => i.id !== deleteDialog.invoice.id))
      setDeleteDialog({ open: false, invoice: null })
    } catch {
      alert('Could not delete invoice')
    } finally {
      setDeleting(false)
    }
  }

  const handleDownloadPdf = async (inv) => {
    try {
      const res = await API.get(`/api/invoices/${inv.id}/pdf`, {
        responseType: 'blob',
      })
      const url = globalThis.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `${inv.invoiceNo}.pdf`
      a.click()
    } catch {
      alert('Could not download PDF')
    }
  }

  const filtered = invoices.filter(
    (i) =>
      (i.billedName || '').toLowerCase().includes(search.toLowerCase()) ||
      (i.invoiceNo || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageContainer>
      <PageHeader
        title="All Invoices"
        description={`${invoices.length} invoices in your records`}
        action={
          <Button onClick={onNew} className="gap-2">
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
        }
      />

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg">Invoice Records</CardTitle>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by party name or invoice no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No.</TableHead>
                  <TableHead>Party Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Place of Supply</TableHead>
                  <TableHead>Vehicle No.</TableHead>
                  <TableHead className="text-right">Grand Total</TableHead>
                  <TableHead>EWB No.</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <FileText className="h-12 w-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground">
                          {search ? 'No invoices match your search' : 'No invoices found'}
                        </p>
                        {!search && (
                          <Button variant="outline" size="sm" onClick={onNew}>
                            Create your first invoice
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono font-semibold text-brand-500">
                        {inv.invoiceNo}
                      </TableCell>
                      <TableCell className="font-medium">{inv.billedName || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(inv.invoiceDate)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {inv.placeOfSupply || '—'}
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        {inv.vehicleNo || '—'}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatCurrency(inv.grandTotal)}
                      </TableCell>
                      <TableCell>
                        {inv.ewbNo ? (
                          <span className="font-mono text-xs">{inv.ewbNo}</span>
                        ) : (
                          <Badge variant="warning">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(inv)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadPdf(inv)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setDeleteDialog({ open: true, invoice: inv })}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, invoice: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice{' '}
              <span className="font-mono font-semibold text-foreground">
                {deleteDialog.invoice?.invoiceNo}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, invoice: null })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  )
}