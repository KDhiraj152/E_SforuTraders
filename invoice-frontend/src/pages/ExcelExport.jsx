import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PageHeader, PageContainer } from '@/components/layout'
import { Download, FileSpreadsheet, Loader2, CheckCircle, XCircle, CalendarDays } from 'lucide-react'
import API from '@/api/client'

export default function ExcelExport() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: null, message: '' })

  const handleExport = async () => {
    setLoading(true)
    setStatus({ type: null, message: '' })
    try {
      let url = '/api/invoices/export/excel'
      if (from && to) url += `?from=${from}&to=${to}`
      const res = await API.get(url, { responseType: 'blob' })
      const blobUrl = globalThis.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = blobUrl
      const dateSuffix = from ? `_${from}_to_${to}` : ''
      a.download = `SFourTraders_Invoices${dateSuffix}.xlsx`
      a.click()
      setStatus({ type: 'success', message: 'Excel file downloaded successfully!' })
    } catch {
      setStatus({ type: 'error', message: 'Could not download the file. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleQuickRange = (days) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    setFrom(start.toISOString().split('T')[0])
    setTo(end.toISOString().split('T')[0])
  }

  return (
    <PageContainer>
      <PageHeader
        title="Export Data"
        description="Download your invoice data in Excel format"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Export Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <FileSpreadsheet className="h-5 w-5 text-success" />
              </div>
              <div>
                <CardTitle>Export to Excel</CardTitle>
                <CardDescription>Download invoice data as .xlsx file</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quick Range Buttons */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">
                Quick Select
              </Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Last 7 days', days: 7 },
                  { label: 'Last 30 days', days: 30 },
                  { label: 'Last 90 days', days: 90 },
                  { label: 'This year', days: 365 },
                ].map((range) => (
                  <Button
                    key={range.days}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickRange(range.days)}
                  >
                    {range.label}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFrom('')
                    setTo('')
                  }}
                >
                  All time
                </Button>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="from-date" className="text-muted-foreground text-xs uppercase tracking-wider">
                  From Date
                </Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="from-date"
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="to-date" className="text-muted-foreground text-xs uppercase tracking-wider">
                  To Date
                </Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="to-date"
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              {from && to
                ? `Exporting invoices from ${from} to ${to}`
                : 'Leave dates empty to export all invoices'}
            </p>

            {/* Status Message */}
            {status.type && (
              <div
                className={`flex items-center gap-2 rounded-lg p-3 animate-slide-down ${
                  status.type === 'success'
                    ? 'bg-success/10 text-success'
                    : 'bg-destructive/10 text-destructive'
                }`}
              >
                {status.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">{status.message}</span>
              </div>
            )}

            {/* Download Button */}
            <Button
              className="w-full gap-2"
              variant="success"
              size="lg"
              onClick={handleExport}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparing download...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download Excel
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">Export Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-500 text-xs font-semibold">
                  1
                </div>
                <p className="text-muted-foreground">
                  The exported file will contain all invoice details including party information, items, taxes, and totals.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-500 text-xs font-semibold">
                  2
                </div>
                <p className="text-muted-foreground">
                  Data is formatted for easy import into accounting software or further analysis.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-500 text-xs font-semibold">
                  3
                </div>
                <p className="text-muted-foreground">
                  Use date filters to export specific periods for quarterly or annual reports.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}