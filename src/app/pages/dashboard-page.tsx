import { useState } from "react";
import { useData } from "../context/data-context";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Package, TrendingDown, AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";

export function DashboardPage() {
  const { products, salesData, forecastData } = useData();
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || "");

  // Calculate metrics
  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.currentStock, 0);
  const lowStockCount = products.filter(
    (p) => p.currentStock < p.reorderLevel
  ).length;

  // Historical sales data for selected product
  const historicalSales = salesData
    .filter((s) => s.productId === selectedProductId)
    .slice(-30)
    .map((s) => ({
      date: new Date(s.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      sales: s.quantity,
    }));

  // ARIMA forecast data for selected product
  const arimaData = forecastData
    .find((f) => f.productId === selectedProductId)
    ?.dates.slice(0, 14)
    .map((date, idx) => ({
      date: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      forecast: forecastData.find((f) => f.productId === selectedProductId)
        ?.values[idx],
    })) || [];

  // Fast and slow moving products
  const productSales = products.map((product) => {
    const last30DaysSales = salesData
      .filter((s) => s.productId === product.id)
      .slice(-30)
      .reduce((sum, s) => sum + s.quantity, 0);

    return {
      ...product,
      totalSales: last30DaysSales,
      avgDailySales: (last30DaysSales / 30).toFixed(1),
    };
  });

  const sortedByMovement = [...productSales].sort(
    (a, b) => b.totalSales - a.totalSales
  );
  const fastMoving = sortedByMovement.slice(0, 3);
  const slowMoving = sortedByMovement.slice(-3).reverse();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Overview of your inventory and sales performance
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Products
            </CardTitle>
            <Package className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Current Stock Level
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{totalStock}</div>
            <p className="text-xs text-gray-500 mt-1">units across all products</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Low Stock Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-orange-600">
              {lowStockCount}
            </div>
            <p className="text-xs text-gray-500 mt-1">products need reorder</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Historical Sales (Last 30 Days)</CardTitle>
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger className="w-64 mt-2">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalSales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Sales"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ARIMA Forecast (Next 14 Days)</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Predicted demand for {products.find(p => p.id === selectedProductId)?.name}
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={arimaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="forecast"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Forecast"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Fast and Slow Moving Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Product Movement Analysis</CardTitle>
          <p className="text-sm text-gray-500">
            Fast and slow moving products based on last 30 days
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fast Moving */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Fast Moving Products
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Total Sales</TableHead>
                    <TableHead className="text-right">Avg Daily</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fastMoving.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {product.totalSales}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.avgDailySales}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Slow Moving */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Slow Moving Products
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Total Sales</TableHead>
                    <TableHead className="text-right">Avg Daily</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slowMoving.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {product.totalSales}
                      </TableCell>
                      <TableCell className="text-right text-gray-500">
                        {product.avgDailySales}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
