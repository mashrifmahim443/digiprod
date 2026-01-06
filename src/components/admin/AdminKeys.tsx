import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2, Key, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductKey {
  id: string;
  product_id: string;
  key_or_link: string;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
  order_id: string | null;
}

interface Product {
  id: string;
  title: string;
}

interface KeysByProduct {
  product: Product;
  keys: ProductKey[];
  available: number;
  used: number;
}

export default function AdminKeys() {
  const { toast } = useToast();
  const [keysByProduct, setKeysByProduct] = useState<KeysByProduct[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [keysInput, setKeysInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, title")
        .eq("is_active", true)
        .order("title");

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Fetch all keys
      const { data: keysData, error: keysError } = await supabase
        .from("product_keys")
        .select("*")
        .order("created_at", { ascending: false });

      if (keysError) throw keysError;

      // Group keys by product
      const grouped: KeysByProduct[] = (productsData || []).map((product) => {
        const productKeys = (keysData || []).filter(k => k.product_id === product.id);
        return {
          product,
          keys: productKeys,
          available: productKeys.filter(k => !k.is_used).length,
          used: productKeys.filter(k => k.is_used).length,
        };
      });

      setKeysByProduct(grouped);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKeys = async () => {
    if (!selectedProductId || !keysInput.trim()) {
      toast({
        title: "Validation Error",
        description: "Select a product and enter at least one key",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const keys = keysInput
        .split("\n")
        .map(k => k.trim())
        .filter(k => k.length > 0);

      const keysToInsert = keys.map(key => ({
        product_id: selectedProductId,
        key_or_link: key,
        is_used: false,
      }));

      const { error } = await supabase
        .from("product_keys")
        .insert(keysToInsert);

      if (error) throw error;

      toast({ title: `${keys.length} key(s) added successfully` });
      setDialogOpen(false);
      setKeysInput("");
      setSelectedProductId("");
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      const { error } = await supabase
        .from("product_keys")
        .delete()
        .eq("id", keyId);

      if (error) throw error;
      toast({ title: "Key deleted" });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Product Keys</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Keys
        </Button>
      </div>

      <div className="grid gap-4">
        {keysByProduct.map(({ product, keys, available, used }) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Key className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{product.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {keys.length} total keys
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{available}</div>
                    <div className="text-xs text-muted-foreground">Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-muted-foreground">{used}</div>
                    <div className="text-xs text-muted-foreground">Used</div>
                  </div>
                </div>
              </div>

              {expandedProduct === product.id && keys.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {keys.map((key) => (
                      <div 
                        key={key.id} 
                        className={`flex items-center justify-between p-2 rounded ${
                          key.is_used ? 'bg-muted/50' : 'bg-green-50 dark:bg-green-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {key.is_used ? (
                            <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          ) : (
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                          )}
                          <code className="text-sm truncate">{key.key_or_link}</code>
                        </div>
                        <div className="flex items-center gap-2">
                          {key.is_used && (
                            <span className="text-xs text-muted-foreground">
                              Used {new Date(key.used_at!).toLocaleDateString()}
                            </span>
                          )}
                          {!key.is_used && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive h-7 w-7 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteKey(key.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {keysByProduct.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No products yet. Add products first, then add keys.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Keys Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product Keys</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Product</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Keys (one per line)</Label>
              <Textarea
                value={keysInput}
                onChange={(e) => setKeysInput(e.target.value)}
                placeholder="XXXXX-XXXXX-XXXXX&#10;YYYYY-YYYYY-YYYYY&#10;ZZZZZ-ZZZZZ-ZZZZZ"
                rows={8}
              />
              <p className="text-xs text-muted-foreground">
                Enter each key or license on a new line
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddKeys} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Keys
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
