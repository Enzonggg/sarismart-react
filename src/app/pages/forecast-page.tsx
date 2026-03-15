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
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { Calendar, TrendingUp } from "lucide-react";

export function ForecastPage() {
  const { products, salesData, forecastData } = useData();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([
    products[0]?.id || "",
  ]);
  const [forecastDays, setForecastDays] = useState<"7" | "14" | "30">("14");

  const toggleProduct = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  // Combine historical and forecast data
  const getCombinedData = () => {
    const daysToShow = parseInt(forecastDays);
    const historicalDaysToShow = 30;

    const chartData: any[] = [];
    const today = new Date();

    // Historical data (last 30 days)
    for (let i = historicalDaysToShow; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const displayDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const dataPoint: any = { date: displayDate, type: "historical" };

      selectedProducts.forEach((productId) => {
        const product = products.find((p) => p.id === productId);
        const sales = salesData.find(
          (s) => s.productId === productId && s.date === dateStr
        );
        dataPoint[`${product?.name}_historical`] = sales?.quantity || 0;
      });

      chartData.push(dataPoint);
    }

    // Forecast data
    for (let i = 1; i <= daysToShow; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      const displayDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const dataPoint: any = { date: displayDate, type: "forecast" };

      selectedProducts.forEach((productId) => {
        const product = products.find((p) => p.id === productId);
        const forecast = forecastData.find((f) => f.productId === productId);
        const forecastIdx = forecast?.dates.findIndex((d) => d === dateStr);

        if (forecastIdx !== undefined && forecastIdx >= 0) {
          dataPoint[`${product?.name}_forecast`] =
            forecast?.values[forecastIdx] || 0;
        }
      });

      chartData.push(dataPoint);
    }

    return chartData;
  };

  const combinedData = getCombinedData();

  // Calculate forecast summary
  const getForecastSummary = () => {
    const daysToShow = parseInt(forecastDays);
    return selectedProducts.map((productId) => {
      const product = products.find((p) => p.id === productId);
      const forecast = forecastData.find((f) => f.productId === productId);

      const totalForecast = forecast?.values
        .slice(0, daysToShow)
        .reduce((sum, val) => sum + val, 0) || 0;

      const avgDaily = (totalForecast / daysToShow).toFixed(1);

      return {
        product,
        totalForecast: Math.round(totalForecast),
        avgDaily,
      };
    });
  };

  const forecastSummary = getForecastSummary();

  const colors = [
    "#3b82f6", // blue
    "#ef4444", // red
    "#10b981", // green
    "#f59e0b", // amber
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#14b8a6", // teal
    "#f97316", // orange
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">
          Demand Forecast
        </h1>
        <p className="text-gray-600">
          Predict future demand using ARIMA forecasting model
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {/* Product Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Select Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`product-${product.id}`}
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={() => toggleProduct(product.id)}
                  />
                  <Label
                    htmlFor={`product-${product.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {product.name}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Forecast Chart */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Historical Sales & Forecasted Demand</CardTitle>
              <Select
                value={forecastDays}
                onValueChange={(value: any) => setForecastDays(value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {selectedProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={combinedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {selectedProducts.map((productId, idx) => {
                    const product = products.find((p) => p.id === productId);
                    const color = colors[idx % colors.length];

                    return (
                      <React.Fragment key={productId}>
                        <Line
                          type="monotone"
                          dataKey={`${product?.name}_historical`}
                          stroke={color}
                          strokeWidth={2}
                          name={`${product?.name} (Historical)`}
                          connectNulls
                        />
                        <Line
                          type="monotone"
                          dataKey={`${product?.name}_forecast`}
                          stroke={color}
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name={`${product?.name} (Forecast)`}
                          connectNulls
                        />
                      </React.Fragment>
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-500">
                Select at least one product to view forecast
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Forecast Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forecastSummary.map((summary) => (
          <Card key={summary.product?.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">
                    {summary.product?.name}
                  </CardTitle>
                  <Badge variant="secondary" className="mt-1">
                    {summary.product?.category}
                  </Badge>
                </div>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Forecast Period:</span>
                  <span className="font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {forecastDays} days
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Demand:</span>
                  <span className="font-semibold text-lg">
                    {summary.totalForecast} units
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Avg Daily:</span>
                  <span className="font-medium">{summary.avgDaily} units</span>
                </div>
                <div className="pt-2 border-t mt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Current Stock:</span>
                    <span
                      className={`font-medium ${
                        (summary.product?.currentStock || 0) <
                        summary.totalForecast
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {summary.product?.currentStock} units
                    </span>
                  </div>
                  {(summary.product?.currentStock || 0) <
                    summary.totalForecast && (
                    <p className="text-xs text-red-600 mt-1">
                      ⚠️ Stock may not meet forecasted demand
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import React from "react";
