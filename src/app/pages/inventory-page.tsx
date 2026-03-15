import { useState } from "react";
import { useData } from "../context/data-context";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Plus, Pencil, History, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export function InventoryPage() {
  const { products, stockHistory, addProduct, updateProduct, addStockHistory } = useData();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    currentStock: 0,
    reorderLevel: 0,
    price: 0,
    sku: "",
  });

  const handleAddProduct = () => {
    if (!formData.name || !formData.category || !formData.sku) {
      toast.error("Please fill in all required fields");
      return;
    }

    addProduct(formData);
    toast.success("Product added successfully");
    setIsAddDialogOpen(false);
    setFormData({
      name: "",
      category: "",
      currentStock: 0,
      reorderLevel: 0,
      price: 0,
      sku: "",
    });
  };

  const handleEditProduct = () => {
    if (!editingProduct) return;

    updateProduct(editingProduct.id, {
      name: editingProduct.name,
      category: editingProduct.category,
      currentStock: editingProduct.currentStock,
      reorderLevel: editingProduct.reorderLevel,
      price: editingProduct.price,
      sku: editingProduct.sku,
    });

    toast.success("Product updated successfully");
    setIsEditDialogOpen(false);
    setEditingProduct(null);
  };

  const openEditDialog = (product: any) => {
    setEditingProduct({ ...product });
    setIsEditDialogOpen(true);
  };

  const openHistoryDialog = (productId: string) => {
    setSelectedProduct(productId);
    setIsHistoryDialogOpen(true);
  };

  const productHistory = selectedProduct
    ? stockHistory.filter((h) => h.productId === selectedProduct)
    : [];

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Product Inventory
          </h1>
          <p className="text-gray-600">Manage your products and stock levels</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  placeholder="Enter SKU"
                />
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g., Electronics, Furniture"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentStock">Current Stock</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        currentStock: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="reorderLevel">Reorder Level</Label>
                  <Input
                    id="reorderLevel"
                    type="number"
                    value={formData.reorderLevel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reorderLevel: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <Button onClick={handleAddProduct} className="w-full">
                Add Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Reorder Level</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const isLowStock = product.currentStock < product.reorderLevel;
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-sm">
                      {product.sku}
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {product.currentStock}
                    </TableCell>
                    <TableCell className="text-right">
                      {product.reorderLevel}
                    </TableCell>
                    <TableCell className="text-right">
                      ${product.price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {isLowStock ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-700 border-green-700">
                          In Stock
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(product)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openHistoryDialog(product.id)}
                        >
                          <History className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-name">Product Name</Label>
                <Input
                  id="edit-name"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-sku">SKU</Label>
                <Input
                  id="edit-sku"
                  value={editingProduct.sku}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, sku: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  value={editingProduct.category}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      category: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-stock">Current Stock</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={editingProduct.currentStock}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        currentStock: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-reorder">Reorder Level</Label>
                  <Input
                    id="edit-reorder"
                    type="number"
                    value={editingProduct.reorderLevel}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        reorderLevel: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-price">Price</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editingProduct.price}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <Button onClick={handleEditProduct} className="w-full">
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Stock History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Stock History</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {productHistory.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productHistory
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {new Date(entry.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              entry.type === "in"
                                ? "default"
                                : entry.type === "out"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {entry.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {entry.quantity}
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {entry.note}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No stock history available for this product
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
