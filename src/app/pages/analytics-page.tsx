import { useData } from "../context/data-context";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Badge } from "../components/ui/badge";
import { AlertCircle, TrendingUp, Package } from "lucide-react";

export function AnalyticsPage() {
  const { products, salesData, forecastData } = useData();

  // Calculate total sales per category
  const salesByCategory = products.reduce((acc, product) => {
    const productSales = salesData
      .filter((s) => s.productId === product.id)
      .reduce((sum, s) => sum + s.quantity, 0);

    if (!acc[product.category]) {
      acc[product.category] = 0;
    }
    acc[product.category] += productSales;

    return acc;
  }, {} as Record<string, number>);

  const categoryBarData = Object.entries(salesByCategory).map(
    ([category, sales]) => ({
      category,
      sales,
    })
  );

  // Calculate stock distribution by category
  const stockByCategory = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = 0;
    }
    acc[product.category] += product.currentStock;

    return acc;
  }, {} as Record<string, number>);

  const categoryPieData = Object.entries(stockByCategory).map(
    ([category, stock]) => ({
      name: category,
      value: stock,
    })
  );

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  // Generate insights
  const generateInsights = () => {
    const insights: Array<{
      type: "warning" | "info" | "success";
      message: string;
    }> = [];

    // Low stock insights
    const lowStockProducts = products.filter(
      (p) => p.currentStock < p.reorderLevel
    );
    lowStockProducts.forEach((product) => {
      const daysUntilStockout = Math.floor(
        product.currentStock /
          (salesData
            .filter((s) => s.productId === product.id)
            .slice(-30)
            .reduce((sum, s) => sum + s.quantity, 0) /
            30 || 1)
      );

      insights.push({
        type: "warning",
        message: `${product.name} is running low on stock. Estimated ${daysUntilStockout} days until stockout.`,
      });
    });

    // Forecast-based insights
    products.forEach((product) => {
      const forecast = forecastData.find((f) => f.productId === product.id);
      const next7DaysDemand =
        forecast?.values.slice(0, 7).reduce((sum, val) => sum + val, 0) || 0;

      if (product.currentStock < next7DaysDemand) {
        insights.push({
          type: "warning",
          message: `${product.name} may not meet forecasted demand for the next 7 days. Expected demand: ${Math.round(next7DaysDemand)} units.`,
        });
      }
    });

    // High performing products
    const productSales = products.map((product) => ({
      product,
      sales: salesData
        .filter((s) => s.productId === product.id)
        .slice(-30)
        .reduce((sum, s) => sum + s.quantity, 0),
    }));

    const topProduct = productSales.sort((a, b) => b.sales - a.sales)[0];
    if (topProduct) {
      insights.push({
        type: "success",
        message: `${topProduct.product.name} is your best-selling product with ${topProduct.sales} units sold in the last 30 days.`,
      });
    }

    // Category insights
    const topCategory = categoryBarData.sort((a, b) => b.sales - a.sales)[0];
    if (topCategory) {
      insights.push({
        type: "info",
        message: `${topCategory.category} category has the highest sales volume with ${topCategory.sales} total units sold.`,
      });
    }

    return insights;
  };

  const insights = generateInsights();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">
          Insights and trends across your inventory
        </p>
      </div>

      {/* Insights Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 p-4 rounded-lg border ${
                  insight.type === "warning"
                    ? "bg-orange-50 border-orange-200"
                    : insight.type === "success"
                    ? "bg-green-50 border-green-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                {insight.type === "warning" ? (
                  <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                ) : insight.type === "success" ? (
                  <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                )}
                <p
                  className={`text-sm ${
                    insight.type === "warning"
                      ? "text-orange-900"
                      : insight.type === "success"
                      ? "text-green-900"
                      : "text-blue-900"
                  }`}
                >
                  {insight.message}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar Chart: Total Sales per Category */}
        <Card>
          <CardHeader>
            <CardTitle>Total Sales by Category</CardTitle>
            <p className="text-sm text-gray-500">
              Sales volume across all product categories
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={categoryBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#3b82f6" name="Units Sold" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart: Stock Distribution by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Distribution by Category</CardTitle>
            <p className="text-sm text-gray-500">
              Current inventory levels across categories
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              {categoryPieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-700">
                    {entry.name}: {entry.value} units
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {Object.keys(salesByCategory).length}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {Object.keys(salesByCategory).map((category) => (
                <Badge key={category} variant="secondary">
                  {category}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Units Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {salesData.reduce((sum, s) => sum + s.quantity, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">All-time sales volume</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg. Daily Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">
              {Math.round(
                salesData.reduce((sum, s) => sum + s.quantity, 0) / 91
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Units per day (last 90 days)
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
