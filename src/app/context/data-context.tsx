import React, { createContext, useContext, useState, useEffect } from "react";

export interface Product {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  price: number;
  sku: string;
}

export interface SalesData {
  date: string;
  quantity: number;
  productId: string;
}

export interface StockHistoryEntry {
  id: string;
  productId: string;
  date: string;
  quantity: number;
  type: "in" | "out" | "adjustment";
  note: string;
}

export interface ForecastData {
  productId: string;
  dates: string[];
  values: number[];
}

interface DataContextType {
  products: Product[];
  salesData: SalesData[];
  stockHistory: StockHistoryEntry[];
  forecastData: ForecastData[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addStockHistory: (entry: Omit<StockHistoryEntry, "id">) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock data
const generateMockProducts = (): Product[] => [
  {
    id: "1",
    name: "Lucky Me Pancit Canton",
    category: "Instant Noodles",
    currentStock: 45,
    reorderLevel: 20,
    price: 10,
    sku: "L",
  },
  {
    id: "2",
    name: "Wireless Mouse",
    category: "Electronics",
    currentStock: 120,
    reorderLevel: 50,
    price: 29.99,
    sku: "MSE-WL-01",
  },
  {
    id: "3",
    name: "Office Chair Ergonomic",
    category: "Furniture",
    currentStock: 15,
    reorderLevel: 10,
    price: 249.99,
    sku: "CHR-ERG-01",
  },
  {
    id: "4",
    name: "USB-C Cable",
    category: "Accessories",
    currentStock: 8,
    reorderLevel: 30,
    price: 12.99,
    sku: "CBL-USC-01",
  },
  {
    id: "5",
    name: "Desk Lamp LED",
    category: "Furniture",
    currentStock: 35,
    reorderLevel: 15,
    price: 49.99,
    sku: "LMP-LED-01",
  },
  {
    id: "6",
    name: "Mechanical Keyboard",
    category: "Electronics",
    currentStock: 62,
    reorderLevel: 25,
    price: 129.99,
    sku: "KBD-MCH-01",
  },
  {
    id: "7",
    name: "Monitor 27 inch",
    category: "Electronics",
    currentStock: 28,
    reorderLevel: 15,
    price: 349.99,
    sku: "MON-27-01",
  },
  {
    id: "8",
    name: "Webcam HD",
    category: "Electronics",
    currentStock: 5,
    reorderLevel: 20,
    price: 79.99,
    sku: "WBC-HD-01",
  },
];

const generateMockSalesData = (): SalesData[] => {
  const salesData: SalesData[] = [];
  const productIds = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const today = new Date();

  for (let i = 90; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    productIds.forEach((productId) => {
      const baseQuantity = productId === "2" || productId === "4" ? 15 : 5;
      const randomFactor = Math.random() * 10;
      const quantity = Math.floor(baseQuantity + randomFactor);

      salesData.push({
        date: dateStr,
        quantity,
        productId,
      });
    });
  }

  return salesData;
};

const generateMockStockHistory = (): StockHistoryEntry[] => {
  const history: StockHistoryEntry[] = [];
  const productIds = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const today = new Date();

  productIds.forEach((productId, idx) => {
    for (let i = 30; i >= 0; i -= 7) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      history.push({
        id: `${productId}-${i}-in`,
        productId,
        date: dateStr,
        quantity: Math.floor(Math.random() * 50 + 20),
        type: "in",
        note: "Stock replenishment",
      });
    }
  });

  return history;
};

const generateMockForecastData = (): ForecastData[] => {
  const productIds = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const today = new Date();

  return productIds.map((productId) => {
    const dates: string[] = [];
    const values: number[] = [];

    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      dates.push(date.toISOString().split("T")[0]);

      const baseValue = productId === "2" || productId === "4" ? 12 : 4;
      const trend = i * 0.1;
      const seasonal = Math.sin(i / 7) * 2;
      const noise = Math.random() * 2 - 1;
      values.push(Math.max(0, Math.floor(baseValue + trend + seasonal + noise)));
    }

    return { productId, dates, values };
  });
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("products");
    return saved ? JSON.parse(saved) : generateMockProducts();
  });

  const [salesData, setSalesData] = useState<SalesData[]>(() => {
    const saved = localStorage.getItem("salesData");
    return saved ? JSON.parse(saved) : generateMockSalesData();
  });

  const [stockHistory, setStockHistory] = useState<StockHistoryEntry[]>(() => {
    const saved = localStorage.getItem("stockHistory");
    return saved ? JSON.parse(saved) : generateMockStockHistory();
  });

  const [forecastData] = useState<ForecastData[]>(() => {
    const saved = localStorage.getItem("forecastData");
    return saved ? JSON.parse(saved) : generateMockForecastData();
  });

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("salesData", JSON.stringify(salesData));
  }, [salesData]);

  useEffect(() => {
    localStorage.setItem("stockHistory", JSON.stringify(stockHistory));
  }, [stockHistory]);

  useEffect(() => {
    localStorage.setItem("forecastData", JSON.stringify(forecastData));
  }, [forecastData]);

  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const addStockHistory = (entry: Omit<StockHistoryEntry, "id">) => {
    const newEntry: StockHistoryEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    setStockHistory([...stockHistory, newEntry]);
  };

  return (
    <DataContext.Provider
      value={{
        products,
        salesData,
        stockHistory,
        forecastData,
        addProduct,
        updateProduct,
        deleteProduct,
        addStockHistory,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
