import { useState, useEffect, createElement } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageHeader, PageContainer } from '@/components/layout'
import {
  FileText,
  Truck,
  Calendar,
  IndianRupee,
  Plus,
  ArrowRight,
  TrendingUp,
  Loader2,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import API from '@/api/client'

const StatCard = ({ title, value, subtitle, icon, trend, color = 'brand' }) => (
  <Card className="relative overflow-hidden">
    <div className={`absolute inset-0 bg-gradient-to-br from-${color}-500/10 via-transparent to-transparent`} />
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className={`rounded-lg bg-${color}-500/10 p-2`}>
        {createElement(icon, { className: `h-4 w-4 text-${color}-500` })}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <div className="flex items-center gap-2 mt-1">
        <p className="text-xs text-muted-foreground">{subtitle}</p>
        {trend && (
          <Badge variant="success" className="text-[10px] px-1.5 py-0">
            <TrendingUp className="h-3 w-3 mr-0.5" />
            {trend}
          </Badge>
        )}
      </div>
    </CardContent>
  </Card>
)

export default function Dashboard({ onNew, onViewAll }) {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    API.get('/api/invoices')
      .then((res) => {
        const invoiceData = Array.isArray(res.data)
          ? res.data
          : res.data?.content || []
        setInvoices(invoiceData)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const totalAmt = invoices.reduce((s, i) => s + (i.grandTotal || 0), 0)
  const ewbCount = invoices.filter((i) => i.ewbNo).length
  const thisMonth = invoices.filter((i) => {
    if (!i.invoiceDate) return false
    const d = new Date(i.invoiceDate)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const stats = [
    {
      title: 'Total Invoices',
      value: invoices.length,
      subtitle: 'All time records',
      icon: FileText,
      color: 'brand',
    },
    {
      title: 'E-Way Bills',
      value: ewbCount,
      subtitle: 'Generated',
      icon: Truck,
      color: 'gold',
    },
    {
      title: 'This Month',
      value: thisMonth,
      subtitle: 'Invoices created',
      icon: Calendar,
      color: 'brand',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(totalAmt),
      subtitle: 'Grand total',
      icon: IndianRupee,
      color: 'gold',
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Overview of your invoice management"
        action={
          <Button onClick={onNew} className="gap-2">
            <Plus className="h-4 w-4" />
            New Invoice
          </Button>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat, idx) => (
          <div
            key={stat.title}
            className="animate-slide-up"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>Latest 5 invoices from your records</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onViewAll} className="gap-2">
            View All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice No.</TableHead>
                  <TableHead>Party Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>EWB Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.slice(0, 5).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-12 w-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground">No invoices yet</p>
                        <Button variant="outline" size="sm" onClick={onNew}>
                          Create your first invoice
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.slice(0, 5).map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="font-mono font-semibold text-brand-500">
                        {inv.invoiceNo}
                      </TableCell>
                      <TableCell>{inv.billedName || '—'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(inv.invoiceDate)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatCurrency(inv.grandTotal)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={inv.ewbNo ? 'success' : 'warning'}>
                          {inv.ewbNo ? 'Generated' : 'Pending'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  )
}