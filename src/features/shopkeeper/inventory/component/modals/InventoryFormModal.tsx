"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  useForm,
  type Control,
  type FieldErrors,
  type FieldError,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Upload,
  MoreVertical,
  X,
  Smartphone,
  Hash,
  DollarSign,
  Activity,
  Barcode,
  Camera,
  CheckCircle2,
  Search,
  FileUp,
  Tag,
  Package,
  Palette,
  HardDrive,
  Maximize2,
  Users,
  Store,
  Layers,
  AlertTriangle,
  FileText,
  Settings,
  Scan,
  Plus,
  User,
  Mail,
  MapPin,
  CreditCard,
  ShoppingCart,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pdf } from "@react-pdf/renderer";
import SalesInvoicePDF, { SalesInvoicePDFProps } from "./SalesInvoicePDF";
import NextImage from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Html5Qrcode } from "html5-qrcode";

import {
  CreateInventorySchema,
  type CreateInventoryInput,
  type InventoryItem,
  type ScanResultData,
  type BulkBarcodeItem,
} from "../../types";
import {
  useCreateInventory,
  useUpdateInventory,
  useCreateFromBarcode,
  useCreateFromBarcodeBulk,
} from "../../hooks/useInventory";
import { ScanResultModal } from "./ScanResultModal";

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: InventoryItem | null;
  forceType?: "inventory" | "sold";
}

export function InventoryFormModal({
  isOpen,
  onClose,
  item,
  forceType,
}: InventoryFormModalProps) {
  const isEditMode = !!item;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const barcodeImageInputRef = useRef<HTMLInputElement>(null);
  const fileUploadInputRef = useRef<HTMLInputElement>(null);
  const barcodeDeviceImageInputRef = useRef<HTMLInputElement>(null);
  const [barcodeImagePreview, setBarcodeImagePreview] = useState<string | null>(
    null,
  );
  const [manualBarcode, setManualBarcode] = useState("");
  const [barcodeImei, setBarcodeImei] = useState("");
  const [activeTab, setActiveTab] = useState("manual");
  const [barcodePurchasePrice, setBarcodePurchasePrice] = useState("");
  const [barcodeCondition, setBarcodeCondition] = useState("new");
  const [barcodeDeviceImage, setBarcodeDeviceImage] = useState<File | null>(
    null,
  );
  const [barcodeDeviceImagePreview, setBarcodeDeviceImagePreview] = useState<
    string | null
  >(null);
  const [scannedItemId, setScannedItemId] = useState<string | null>(null);
  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [isCustomCondition, setIsCustomCondition] = useState(false);
  const [isCustomStorage, setIsCustomStorage] = useState(false);
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [isCustomSaleMethod, setIsCustomSaleMethod] = useState(false);

  const BRANDS = [
    "Apple",
    "Samsung",
    "Google",
    "Huawei",
    "Xiaomi",
    "Oppo",
    "Vivo",
    "Sony",
    "LG",
    "Nokia",
    "OnePlus",
    "Other",
  ];

  const STORAGE_OPTIONS = [
    "16GB",
    "32GB",
    "64GB",
    "128GB",
    "256GB",
    "512GB",
    "1TB",
    "Other",
  ];

  const COLOR_OPTIONS = [
    "Black",
    "White",
    "Silver",
    "Gold",
    "Space Gray",
    "Blue",
    "Red",
    "Green",
    "Other",
  ];

  const SALE_METHODS = [
    "In-store",
    "eBay",
    "Amazon",
    "own website",
    "WhatsApp",
    "Facebook",
    "Other",
  ];

  // Bulk Upload States
  const [bulkItems, setBulkItems] = useState<BulkBarcodeItem[]>([
    {
      code: "",
      purchasePrice: 0,
      quantity: 1,
      currentState: "new",
      color: "",
      storage: "",
    },
  ]);

  const addBulkRow = () => {
    setBulkItems([
      ...bulkItems,
      {
        code: "",
        purchasePrice: 0,
        quantity: 1,
        currentState: "new",
        color: "",
        storage: "",
      },
    ]);
  };

  const removeBulkRow = (index: number) => {
    if (bulkItems.length > 1) {
      setBulkItems(bulkItems.filter((_, i) => i !== index));
    }
  };

  const updateBulkItem = <K extends keyof BulkBarcodeItem>(
    index: number,
    field: K,
    value: BulkBarcodeItem[K],
  ) => {
    const updated = [...bulkItems];
    updated[index] = { ...updated[index], [field]: value };
    setBulkItems(updated);
  };

  const handleBulkSubmit = () => {
    const validItems = bulkItems.filter((i) => i.code.trim());
    if (validItems.length === 0) {
      toast.error("Please add at least one item with a code");
      return;
    }

    if (!session?.user?.id) {
      toast.error("User session not found");
      return;
    }

    handleCreateFromBarcodeBulk(
      {
        userId: session.user.id,
        barcodes: validItems,
      },
      {
        onSuccess: () => {
          toast.success("Bulk inventory added successfully");
          onClose();
        },
        onError: (error: unknown) => {
          const apiError = error as {
            response?: { data?: { message?: string } };
          };
          toast.error(
            apiError?.response?.data?.message || "Bulk upload failed",
          );
        },
      },
    );
  };

  const { mutate: createItem, isPending: isCreating } = useCreateInventory();
  const {
    mutate: handleCreateFromBarcodeBulk,
    isPending: isCreatingFromBarcodeBulk,
  } = useCreateFromBarcodeBulk();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateInventory();
  const { mutate: handleCreateFromBarcode, isPending: isCreatingFromBarcode } =
    useCreateFromBarcode();
  const { data: session } = useSession();
  const [scanResultModalData, setScanResultModalData] =
    useState<ScanResultData | null>(null);
  const isPending = isCreating || isUpdating || isCreatingFromBarcode;

  const form = useForm<CreateInventoryInput>({
    resolver: zodResolver(CreateInventorySchema),
    defaultValues: {
      userId: "",
      customerName: "",
      customerEmail: "",
      customerAddress: "",
      salePrice: undefined,
      saleQuantity: 1,
      saleMethod: "In-store",
      image: undefined,
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        itemName: item.itemName,
        sku: item.sku ?? "",
        brand: item.brand ?? "",
        color: item.color ?? "",
        storage: item.storage ?? "",
        size: item.size ?? "",
        imeiNumber: item.imeiNumber ?? "",
        modelNumber: item.modelNumber ?? "",
        quantity: item.quantity ?? 1,
        purchasePrice: item.purchasePrice,
        expectedPrice: item.expectedPrice,
        productDetails: item.productDetails ?? "",
        aiDescription: item.aiDescription ?? "",
        supplierId:
          typeof item.supplierId === "object"
            ? (item.supplierId as unknown as { _id: string })?._id
            : (item.supplierId ?? ""),
        storeId:
          typeof item.storeId === "object"
            ? (item.storeId as unknown as { _id: string })?._id
            : (item.storeId ?? ""),
        groupKey: item.groupKey ?? "",
        minStockLevel: item.minStockLevel ?? 2,
        type: forceType ?? item.type ?? "inventory",
        status: forceType ?? item.status ?? "inventory",
        currentState: item.currentState,
        userId:
          typeof item.userId === "object"
            ? (item.userId as unknown as { _id: string })?._id
            : (item.userId ?? ""),
        customerName: item.customerName ?? "",
        customerEmail: item.customerEmail ?? "",
        customerAddress: item.customerAddress ?? "",
        salePrice: item.salePrice,
        saleQuantity: item.saleQuantity ?? 1,
        saleMethod: item.saleMethod ?? "In-store",
        image: undefined, // Reset image on edit
      });

      // Check if brand is custom
      if (item.brand && !BRANDS.includes(item.brand)) {
        setIsCustomBrand(true);
      } else {
        setIsCustomBrand(false);
      }

      // Check if condition is custom
      if (
        item.currentState &&
        item.currentState !== "new" &&
        item.currentState !== "good condition"
      ) {
        setIsCustomCondition(true);
      } else {
        setIsCustomCondition(false);
      }

      // Check if storage is custom
      if (item.storage && !STORAGE_OPTIONS.includes(item.storage)) {
        setIsCustomStorage(true);
      } else {
        setIsCustomStorage(false);
      }

      // Check if color is custom
      if (item.color && !COLOR_OPTIONS.includes(item.color)) {
        setIsCustomColor(true);
      } else {
        setIsCustomColor(false);
      }

      // Check if sale method is custom
      if (item.saleMethod && !SALE_METHODS.includes(item.saleMethod)) {
        setIsCustomSaleMethod(true);
      } else {
        setIsCustomSaleMethod(false);
      }
    } else {
      form.reset({
        itemName: "",
        sku: "",
        brand: "",
        color: "",
        storage: "",
        size: "",
        imeiNumber: "",
        modelNumber: "",
        quantity: 1,
        purchasePrice: undefined,
        expectedPrice: 0,
        productDetails: "",
        aiDescription: "",
        supplierId: "",
        storeId: "",
        groupKey: "",
        minStockLevel: 2,
        type: forceType || "inventory",
        status: forceType || "inventory",
        currentState: "good condition",
        userId: "",
        customerName: "",
        customerEmail: "",
        customerAddress: "",
        salePrice: undefined,
        saleQuantity: 1,
        saleMethod: "In-store",
        image: undefined,
      });
      setIsCustomBrand(false);
      setIsCustomCondition(false);
      setIsCustomStorage(false);
      setIsCustomColor(false);
      setIsCustomSaleMethod(false);
    }
  }, [item, form, isOpen, forceType]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (item) {
        setImagePreview(item.image?.url ?? null);
      } else {
        setImagePreview(null);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [item, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    form.setValue("image", file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleDownloadInvoice = async (values: CreateInventoryInput) => {
    try {
      const invoiceNumber = `#INV-${Math.floor(Math.random() * 100000)}`;
      const blob = await pdf(
        <SalesInvoicePDF
          data={
            {
              ...values,
              invoiceNumber,
            } as SalesInvoicePDFProps["data"]
          }
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${values.customerName || "Customer"}-${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate invoice PDF");
    }
  };

  const onSubmit = (values: CreateInventoryInput) => {
    if (forceType === "sold") {
      handleDownloadInvoice(values);
      onClose();
      return;
    }

    if (isEditMode && item) {
      updateItem(
        {
          id: item._id,
          input: {
            ...values,
          },
        },
        {
          onSuccess: () => {
            toast.success("Item updated successfully");
            onClose();
          },
          onError: () => toast.error("Update failed"),
        },
      );
    } else if (scannedItemId) {
      updateItem(
        { id: scannedItemId, input: values },
        {
          onSuccess: () => {
            toast.success("Item updated successfully");
            onClose();
          },
          onError: (error: unknown) => {
            const apiError = error as {
              response?: { data?: { message?: string } };
            };
            toast.error(apiError?.response?.data?.message || "Update failed");
          },
        },
      );
    } else {
      createItem(
        { ...values, userId: (session?.user as { id: string })?.id ?? "" },
        {
          onSuccess: () => {
            toast.success("Item created successfully");
            onClose();
          },
          onError: () => toast.error("Addition failed"),
        },
      );
    }
  };

  const onError = (errors: FieldErrors<CreateInventoryInput>) => {
    console.log("Validation Errors:", errors);
    const errorMessages = Object.values(errors)
      .map((err) => (err as FieldError)?.message)
      .filter(Boolean);

    if (errorMessages.length > 0) {
      toast.error(`Please fix: ${errorMessages[0]}`);
    } else {
      toast.error("Form validation failed. Please check all fields.");
    }
  };

  const startScanning = async () => {
    try {
      const html5QrCode = new Html5Qrcode("barcode-reader");
      html5QrCodeRef.current = html5QrCode;
      setIsCameraActive(true);

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 150 },
      };

      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          setManualBarcode(decodedText);
          toast.success("Barcode scanned successfully");
          stopScanning();
        },
        (errorMessage) => {
          // ignore scan errors
        },
      );
    } catch (err) {
      console.error("Camera access error:", err);
      toast.error("Could not access camera");
      setIsCameraActive(false);
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error("Failed to stop scanning", err);
      }
    }
    setIsCameraActive(false);
  };

  const resetBarcodeFields = () => {
    setManualBarcode("");
    setBarcodeImei("");
    setBarcodePurchasePrice("");
    setBarcodeCondition("new");
    setBarcodeDeviceImage(null);
    setBarcodeDeviceImagePreview(null);
  };

  const handleManualBarcodeSubmit = (codeOverride?: string) => {
    const code = codeOverride || manualBarcode;
    if (!code.trim()) {
      toast.error("Please enter a barcode or IMEI");
      return;
    }

    if ((session?.user as { id: string })?.id) {
      handleCreateFromBarcode(
        {
          code: code.trim(),
          userId: (session?.user as { id: string }).id,
          imeiNumber: barcodeImei || undefined,
          purchasePrice: barcodePurchasePrice
            ? Number(barcodePurchasePrice)
            : undefined,
          currentState: barcodeCondition,
          image: barcodeDeviceImage || undefined,
        },
        {
          onSuccess: (data: {
            data: {
              result?: Record<string, unknown>;
              productDetails?: string;
              aiDescription?: string;
            };
          }) => {
            // Auto-fill form fields from API response
            // Extract the actual item data from the response
            const deviceData = (data?.data?.result ||
              data?.data ||
              data) as Record<string, unknown> & { _id?: string };
            if (!deviceData) return;

            if (deviceData._id) setScannedItemId(deviceData._id);

            // Map all available fields to the form with UI update flags
            const options = { shouldValidate: true, shouldDirty: true };

            // Helper to set value with aliases
            const setVal = (key: string, value: unknown) => {
              if (value === undefined || value === null || value === "") return;

              // Direct mapping - use a safer cast than 'any'
              const fieldName = key as keyof CreateInventoryInput;
              if (key in form.getValues()) {
                form.setValue(fieldName, value as never, options);

                // Handle custom brand state
                if (key === "brand") {
                  if (typeof value === "string" && !BRANDS.includes(value)) {
                    setIsCustomBrand(true);
                  } else {
                    setIsCustomBrand(false);
                  }
                }

                // Handle custom condition state
                if (key === "currentState") {
                  if (
                    typeof value === "string" &&
                    value !== "new" &&
                    value !== "good condition"
                  ) {
                    setIsCustomCondition(true);
                  } else {
                    setIsCustomCondition(false);
                  }
                }

                // Handle custom storage state
                if (key === "storage") {
                  if (
                    typeof value === "string" &&
                    !STORAGE_OPTIONS.includes(value)
                  ) {
                    setIsCustomStorage(true);
                  } else {
                    setIsCustomStorage(false);
                  }
                }

                // Handle custom color state
                if (key === "color") {
                  if (
                    typeof value === "string" &&
                    !COLOR_OPTIONS.includes(value)
                  ) {
                    setIsCustomColor(true);
                  } else {
                    setIsCustomColor(false);
                  }
                }
              }

              // Aliases for common variations
              if (key === "name" || key === "itemName") {
                form.setValue("itemName", value as string, options);
              }
              if (key === "model" || key === "modelNumber") {
                form.setValue("modelNumber", value as string, options);
              }
              if (key === "price" || key === "expectedPrice") {
                form.setValue("expectedPrice", Number(value), options);
              }
              if (key === "imei" || key === "imeiNumber") {
                form.setValue("imeiNumber", value as string, options);
              }
            };

            // Map result fields
            Object.entries(deviceData).forEach(([key, value]) => {
              setVal(key, value);
            });

            // Map top-level productDetails and aiDescription if result ones are missing
            if (
              data?.data?.productDetails &&
              !form.getValues("productDetails")
            ) {
              form.setValue(
                "productDetails",
                data.data.productDetails,
                options,
              );
            }
            if (data?.data?.aiDescription && !form.getValues("aiDescription")) {
              form.setValue("aiDescription", data.data.aiDescription, options);
            }

            toast.success("Device details auto-populated! Please review.");
            setManualBarcode("");
          },
          onError: (error: unknown) => {
            const apiError = error as {
              response?: { data?: { message?: string } };
            };
            toast.error(
              apiError?.response?.data?.message || "Failed to process barcode",
            );
          },
        },
      );
    } else {
      toast.error("User not authenticated");
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopScanning();
      resetBarcodeFields();
      setScannedItemId(null);
    }
  }, [isOpen]);

  const handleBarcodeImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setBarcodeImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Use a temporary scanner instance for file scanning
    const html5QrCode = new Html5Qrcode("barcode-reader-hidden");
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      setManualBarcode(decodedText);
      toast.success("Barcode extracted successfully");
      handleManualBarcodeSubmit(decodedText);
      setTimeout(() => setBarcodeImagePreview(null), 2000);
    } catch (err) {
      console.error("Scan error", err);
      toast.error("No barcode found in image. Please try a clearer photo.");
      setBarcodeImagePreview(null);
    } finally {
      // Cleanup
      html5QrCode.clear();
    }
  };

  const renderFormContent = () => (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="space-y-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-10">
          {/* Left Column: Core Identity & Specs */}
          <div className="space-y-10">
            {/* Section: Device Identity */}
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 ">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-1 flex items-center gap-2 dark:text-white ">
                  <Smartphone className="w-3.5 h-3.5 text-[#84CC16]" />
                  Device Identity
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider dark:text-white ">
                  Primary identification details
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Item Name */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="itemName"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1 dark:text-white ">
                        Product Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                            <Smartphone className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                          </div>
                          <Input
                            placeholder="e.g. iPhone X"
                            className="pl-14 pr-32 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                            {...field}
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                barcodeImageInputRef.current?.click()
                              }
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#84CC16] hover:bg-[#84CC16]/10 transition-all"
                              title="Upload Barcode"
                            >
                              <Camera className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleManualBarcodeSubmit(field.value)
                              }
                              disabled={isCreatingFromBarcode}
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#84CC16] hover:bg-[#84CC16]/10 transition-all"
                              title="Scan/Fetch Device Info"
                            >
                              {isCreatingFromBarcode ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Scan className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          <input
                            type="file"
                            ref={barcodeImageInputRef}
                            onChange={handleBarcodeImageUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <div
                            id="barcode-reader-hidden"
                            className="hidden"
                          ></div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] uppercase tracking-wider font-bold" />
                    </FormItem>
                  )}
                />

                {/* SKU */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                        SKU
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                            <Tag className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                          </div>
                          <Input
                            placeholder="IPX-001"
                            className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Brand */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                        Brand
                      </FormLabel>
                      <div className="space-y-3">
                        {!isCustomBrand ? (
                          <Select
                            onValueChange={(val) => {
                              if (val === "Other") {
                                setIsCustomBrand(true);
                                field.onChange("");
                              } else {
                                field.onChange(val);
                              }
                            }}
                            value={
                              field.value && BRANDS.includes(field.value)
                                ? field.value
                                : field.value
                                  ? "Other"
                                  : ""
                            }
                          >
                            <FormControl>
                              <SelectTrigger className="group bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-[#84CC16]/15 focus:border-[#84CC16] transition-all shadow-sm px-2">
                                <div className="flex items-center gap-3 w-full">
                                  <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 group-focus:border-[#84CC16]/30 group-focus:bg-[#84CC16]/5 transition-all shrink-0">
                                    <Package className="w-4 h-4 text-slate-400 group-focus:text-[#84CC16] transition-colors" />
                                  </div>
                                  <SelectValue placeholder="Select Brand" />
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-1">
                              {BRANDS.map((brand) => (
                                <SelectItem
                                  key={brand}
                                  value={brand}
                                  className="font-bold rounded-xl focus:bg-[#84CC16]/10 focus:text-[#84CC16] cursor-pointer py-3 dark:text-white"
                                >
                                  {brand}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="relative group animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                              <Package className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                            </div>
                            <Input
                              placeholder="Enter custom brand..."
                              className="pl-14 pr-24 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomBrand(false);
                                field.onChange("Apple");
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#84CC16] hover:bg-[#84CC16]/10 rounded-xl transition-all"
                            >
                              Reset
                            </button>
                          </div>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section: Technical Specifications */}
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-1 flex items-center gap-2 dark:text-white ">
                  <Maximize2 className="w-3.5 h-3.5 text-[#84CC16]" />
                  Technical Specs
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider dark:text-white ">
                  Hardware and configuration
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Color */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                        Color
                      </FormLabel>
                      <div className="space-y-3">
                        {!isCustomColor ? (
                          <Select
                            onValueChange={(val) => {
                              if (val === "Other") {
                                setIsCustomColor(true);
                                field.onChange("");
                              } else {
                                field.onChange(val);
                              }
                            }}
                            value={
                              field.value && COLOR_OPTIONS.includes(field.value)
                                ? field.value
                                : field.value
                                  ? "Other"
                                  : ""
                            }
                          >
                            <FormControl>
                              <SelectTrigger className="group bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-[#84CC16]/15 focus:border-[#84CC16] transition-all shadow-sm px-2">
                                <div className="flex items-center gap-3 w-full">
                                  <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 group-focus:border-[#84CC16]/30 group-focus:bg-[#84CC16]/5 transition-all shrink-0">
                                    <Palette className="w-4 h-4 text-slate-400 group-focus:text-[#84CC16] transition-colors" />
                                  </div>
                                  <SelectValue placeholder="Select Color" />
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-1">
                              {COLOR_OPTIONS.map((color) => (
                                <SelectItem
                                  key={color}
                                  value={color}
                                  className="font-bold rounded-xl focus:bg-[#84CC16]/10 focus:text-[#84CC16] cursor-pointer py-3 dark:text-white"
                                >
                                  {color}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="relative group animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                              <Palette className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                            </div>
                            <Input
                              placeholder="Enter custom color..."
                              className="pl-14 pr-24 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomColor(false);
                                field.onChange("Black");
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#84CC16] hover:bg-[#84CC16]/10 rounded-xl transition-all"
                            >
                              Reset
                            </button>
                          </div>
                        )}
                      </div>
                    </FormItem>
                  )}
                />

                {/* Storage */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="storage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                        Storage
                      </FormLabel>
                      <div className="space-y-3">
                        {!isCustomStorage ? (
                          <Select
                            onValueChange={(val) => {
                              if (val === "Other") {
                                setIsCustomStorage(true);
                                field.onChange("");
                              } else {
                                field.onChange(val);
                              }
                            }}
                            value={
                              field.value &&
                              STORAGE_OPTIONS.includes(field.value)
                                ? field.value
                                : field.value
                                  ? "Other"
                                  : ""
                            }
                          >
                            <FormControl>
                              <SelectTrigger className="group bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-[#84CC16]/15 focus:border-[#84CC16] transition-all shadow-sm px-2">
                                <div className="flex items-center gap-3 w-full">
                                  <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 group-focus:border-[#84CC16]/30 group-focus:bg-[#84CC16]/5 transition-all shrink-0">
                                    <HardDrive className="w-4 h-4 text-slate-400 group-focus:text-[#84CC16] transition-colors" />
                                  </div>
                                  <SelectValue placeholder="Select Storage" />
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-1">
                              {STORAGE_OPTIONS.map((opt) => (
                                <SelectItem
                                  key={opt}
                                  value={opt}
                                  className="font-bold rounded-xl focus:bg-[#84CC16]/10 focus:text-[#84CC16] cursor-pointer py-3 dark:text-white"
                                >
                                  {opt}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="relative group animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                              <HardDrive className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                            </div>
                            <Input
                              placeholder="Enter custom storage..."
                              className="pl-14 pr-24 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomStorage(false);
                                field.onChange("128GB");
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#84CC16] hover:bg-[#84CC16]/10 rounded-xl transition-all"
                            >
                              Reset
                            </button>
                          </div>
                        )}
                      </div>
                    </FormItem>
                  )}
                />

                {/* Model Number */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="modelNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                        Model Number
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                            <Hash className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                          </div>
                          <Input
                            placeholder="A1901"
                            className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* IMEI Number */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="imeiNumber"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                        IMEI / Serial Number
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                            <Barcode className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                          </div>
                          <Input
                            placeholder="123456789012345"
                            className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Pricing, Inventory & Meta */}
          <div className="space-y-10">
            {/* Section: Pricing & Stock */}
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-1 flex items-center gap-2 dark:text-white ">
                  <DollarSign className="w-3.5 h-3.5 text-[#84CC16]" />
                  Pricing & Stock
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider dark:text-white ">
                  Financials and quantity levels
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Cost Price */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1 ">
                        Cost Price ($)
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                            <DollarSign className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                          </div>
                          <Input
                            type="number"
                            placeholder="200"
                            className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Selling Price */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="expectedPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                        Expected Price ($)
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                            <DollarSign className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                          </div>
                          <Input
                            type="number"
                            placeholder="300"
                            className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Quantity */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                        Quantity
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                            <Layers className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                          </div>
                          <Input
                            type="number"
                            placeholder="1"
                            className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Min Stock Level */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="minStockLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1 ">
                        Min Stock Level
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                            <AlertTriangle className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                          </div>
                          <Input
                            type="number"
                            placeholder="2"
                            className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section: Management Metadata */}
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-1 flex items-center gap-2 dark:text-white ">
                  <Settings className="w-3.5 h-3.5 text-[#84CC16]" />
                  Management & Status
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Organization and lifecycle
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Group Key */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="groupKey"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                        Batch / Group Key
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                            <Layers className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                          </div>
                          <Input
                            placeholder="e.g. iphone-x-batch-1"
                            className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Condition */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="currentState"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                        Condition
                      </FormLabel>
                      <div className="space-y-3">
                        {!isCustomCondition ? (
                          <Select
                            onValueChange={(val) => {
                              if (val === "Other") {
                                setIsCustomCondition(true);
                                field.onChange("");
                              } else {
                                field.onChange(val);
                              }
                            }}
                            value={
                              field.value === "new" ||
                              field.value === "good condition"
                                ? field.value
                                : "Other"
                            }
                          >
                            <FormControl>
                              <SelectTrigger className="group bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-[#84CC16]/15 focus:border-[#84CC16] transition-all shadow-sm px-2">
                                <div className="flex items-center gap-3 w-full">
                                  <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 group-focus:border-[#84CC16]/30 group-focus:bg-[#84CC16]/5 transition-all shrink-0">
                                    <Activity className="w-4 h-4 text-slate-400 group-focus:text-[#84CC16] transition-colors" />
                                  </div>
                                  <SelectValue placeholder="Condition" />
                                </div>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-1">
                              <SelectItem
                                value="new"
                                className="font-bold rounded-xl focus:bg-[#84CC16]/10 focus:text-[#84CC16] cursor-pointer py-3 dark:text-white "
                              >
                                Brand New
                              </SelectItem>
                              <SelectItem
                                value="good condition"
                                className="font-bold rounded-xl focus:bg-[#84CC16]/10 focus:text-[#84CC16] cursor-pointer py-3 dark:text-white "
                              >
                                Good Condition
                              </SelectItem>
                              <SelectItem
                                value="Other"
                                className="font-bold rounded-xl focus:bg-[#84CC16]/10 focus:text-[#84CC16] cursor-pointer py-3 dark:text-white "
                              >
                                Other (Custom)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="relative group animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                              <Activity className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                            </div>
                            <Input
                              placeholder="e.g. Excellent, Refurbished..."
                              className="pl-14 pr-24 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setIsCustomCondition(false);
                                field.onChange("new");
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#84CC16] hover:bg-[#84CC16]/10 rounded-xl transition-all"
                            >
                              Reset
                            </button>
                          </div>
                        )}
                      </div>
                    </FormItem>
                  )}
                />

                {/* Type - Hidden if forced */}
                {!forceType && (
                  <FormField
                    control={
                      form.control as unknown as Control<CreateInventoryInput>
                    }
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                          Item Type
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="group bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-[#84CC16]/15 focus:border-[#84CC16] transition-all shadow-sm px-2">
                              <div className="flex items-center gap-3 w-full">
                                <div className="w-10 h-10   rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 group-focus:border-[#84CC16]/30 group-focus:bg-[#84CC16]/5 transition-all shrink-0 dark:text-white ">
                                  <Tag className="w-4 h-4 text-slate-400 group-focus:text-[#84CC16] transition-colors" />
                                </div>
                                <SelectValue
                                  placeholder="Type"
                                  className="dark:text-white "
                                />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-1">
                            <SelectItem
                              value="inventory"
                              className="font-bold rounded-xl focus:bg-[#84CC16]/10 focus:text-[#84CC16] cursor-pointer py-3 dark:text-white"
                            >
                              Inventory
                            </SelectItem>
                            <SelectItem
                              value="sold"
                              className="font-bold rounded-xl focus:bg-[#84CC16]/10 focus:text-[#84CC16] cursor-pointer py-3 dark:text-white"
                            >
                              Sold
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            {/* Section: Sales Information (Conditional) */}
            {forceType === "sold" && (
              <div className="space-y-6 pt-10 border-t border-slate-100 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-1 flex items-center gap-2 dark:text-white">
                    <ShoppingCart className="w-3.5 h-3.5 text-[#84CC16]" />
                    Sales Information
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider dark:text-white">
                    Customer and transaction details
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Customer Name */}
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2 lg:col-span-1">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                          Customer Name
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                              <User className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                            </div>
                            <Input
                              placeholder="John Doe"
                              className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                              {...field}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Customer Email */}
                  <FormField
                    control={form.control}
                    name="customerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                          Customer Email
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                              <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                            </div>
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                              {...field}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Sale Method */}
                  <FormField
                    control={form.control}
                    name="saleMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                          Sales Method
                        </FormLabel>
                        <div className="space-y-3">
                          {!isCustomSaleMethod ? (
                            <Select
                              onValueChange={(val) => {
                                if (val === "Other") {
                                  setIsCustomSaleMethod(true);
                                  field.onChange("");
                                } else {
                                  field.onChange(val);
                                }
                              }}
                              value={
                                field.value &&
                                SALE_METHODS.includes(field.value)
                                  ? field.value
                                  : field.value
                                    ? "Other"
                                    : ""
                              }
                            >
                              <FormControl>
                                <SelectTrigger className="group bg-slate-50/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-[#84CC16]/15 focus:border-[#84CC16] transition-all shadow-sm px-2">
                                  <div className="flex items-center gap-3 w-full">
                                    <div className="w-10 h-10 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 group-focus:border-[#84CC16]/30 group-focus:bg-[#84CC16]/5 transition-all shrink-0">
                                      <CreditCard className="w-4 h-4 text-slate-400 group-focus:text-[#84CC16] transition-colors" />
                                    </div>
                                    <SelectValue placeholder="Method" />
                                  </div>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-1">
                                {SALE_METHODS.map((method) => (
                                  <SelectItem
                                    key={method}
                                    value={method}
                                    className="font-bold rounded-xl focus:bg-[#84CC16]/10 focus:text-[#84CC16] cursor-pointer py-3 dark:text-white"
                                  >
                                    {method}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="relative group animate-in fade-in slide-in-from-left-2 duration-300">
                              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                                <CreditCard className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                              </div>
                              <Input
                                placeholder="Enter custom method..."
                                className="pl-14 pr-24 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setIsCustomSaleMethod(false);
                                  field.onChange("In-store");
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#84CC16] hover:bg-[#84CC16]/10 rounded-xl transition-all"
                              >
                                Reset
                              </button>
                            </div>
                          )}
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Customer Address */}
                  <FormField
                    control={form.control}
                    name="customerAddress"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                          Customer Address
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                              <MapPin className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                            </div>
                            <Input
                              placeholder="123 Street, City, Country"
                              className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                              {...field}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Sale Price */}
                  <FormField
                    control={form.control}
                    name="salePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                          Actual Sale Price ($)
                        </FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                              <DollarSign className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                            </div>
                            <Input
                              type="number"
                              placeholder="0.00"
                              className="pl-14 pr-4 bg-[#84CC16]/5 dark:bg-[#84CC16]/10 border-[#84CC16]/20 dark:border-[#84CC16]/30 hover:border-[#84CC16] rounded-[20px] h-[56px] font-black text-[#84CC16] placeholder:text-[#84CC16]/40 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                              {...field}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section: Rich Details & Descriptions */}
        <div className="space-y-6 pt-6 border-t border-slate-100">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-1 dark:text-white  flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-[#84CC16]" />
              Descriptions & Details
            </h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Additional notes and AI-generated content
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <FormField
              control={form.control}
              name="productDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                    Product Details
                  </FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="e.g. Used phone, good condition..."
                      className="w-full min-h-[120px] p-4 bg-slate-50/80 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-[20px] font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-[#84CC16]/15 focus:border-[#84CC16] transition-all shadow-sm outline-none resize-none"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* <FormField
              control={form.control}
              name="aiDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                    AI Description
                  </FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="AI-generated description will appear here..."
                      className="w-full min-h-[120px] p-4 bg-[#84CC16]/5 border border-[#84CC16]/20 hover:border-[#84CC16]/40 hover:bg-[#84CC16]/10 rounded-[20px] font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-[#84CC16]/15 focus:border-[#84CC16] transition-all shadow-sm outline-none resize-none"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            /> */}
          </div>
        </div>

        {/* Section: Image Upload */}
        <div className="space-y-6 pt-6 border-t border-slate-100">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 mb-1 dark:text-white  flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-[#84CC16]" />
              Product Media
            </h4>
          </div>

          <div
            className="relative border-2 border-dashed border-slate-200 rounded-[32px] p-8 cursor-pointer hover:border-[#84CC16] hover:bg-[#84CC16]/5 transition-all flex flex-col items-center justify-center gap-4 min-h-[200px] group overflow-hidden bg-slate-50/50"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <div className="relative w-full max-w-md h-48 rounded-[24px] overflow-hidden shadow-2xl">
                <NextImage
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/20 transition-colors" />
                <button
                  type="button"
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-slate-900 rounded-full p-2 hover:bg-white hover:text-red-500 transition-all shadow-md transform hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagePreview(null);
                    form.setValue("image", undefined);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-[24px] bg-white shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-[#84CC16] group-hover:scale-110 transition-all duration-300">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <span className="block text-sm font-black text-slate-700 uppercase tracking-widest mb-1">
                    Click to Upload
                  </span>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    PNG, JPG or WEBP up to 5MB
                  </span>
                </div>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        <div className="flex items-center justify-between pt-10 border-t border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#84CC16]" />
            Required fields are marked with{" "}
            <span className="text-red-500">*</span>
          </p>
          <div className="flex justify-end gap-4 w-full sm:w-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-2xl px-10 h-14 font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-100 w-full sm:w-auto transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl px-12 h-14 font-black uppercase tracking-widest shadow-2xl shadow-slate-900/20 active:scale-[0.98] transition-all w-full sm:w-auto flex items-center gap-3"
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Smartphone className="w-4 h-4" />
              )}
              {isPending
                ? "Saving..."
                : isEditMode
                  ? forceType === "sold"
                    ? "Download PDF"
                    : "Save Details"
                  : "Add to Inventory"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] lg:max-w-[1400px] bg-white dark:bg-slate-950 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-2xl p-0 overflow-hidden max-h-[95vh] flex flex-col">
          <div className="relative bg-slate-900 p-8 text-white shrink-0 overflow-hidden">
            {/* Decorative shapes */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#84CC16] rounded-full mix-blend-multiply filter blur-[80px] opacity-20 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 translate-y-1/2 -translate-x-1/2" />

            <DialogHeader className="relative z-10">
              <DialogTitle className="flex items-center gap-3 text-2xl sm:text-3xl font-black uppercase tracking-tight">
                {isEditMode ? (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                      <Smartphone className="w-5 h-5 text-[#84CC16]" />
                    </div>
                    {forceType === "sold" ? "Sell Device" : "Edit Device"}
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                      <Upload className="w-5 h-5 text-[#84CC16]" />
                    </div>
                    Add New Device
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-slate-300 font-medium text-sm mt-2 ml-[52px]">
                {isEditMode
                  ? "Update your inventory record details below."
                  : "Enter device details to track it in your shop inventory."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 lg:p-12 bg-white dark:bg-slate-950 overflow-y-auto flex-1 custom-scrollbar">
            {!isEditMode ? (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100/50 dark:bg-slate-900/50 p-1 rounded-2xl h-14">
                  <TabsTrigger
                    value="manual"
                    className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-[#84CC16] data-[state=active]:shadow-sm transition-all"
                  >
                    Add Item
                  </TabsTrigger>
                  <TabsTrigger
                    value="upload"
                    className="rounded-xl font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-[#84CC16] data-[state=active]:shadow-sm transition-all"
                  >
                    Bulk Upload
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="manual"
                  className="mt-0 border-none p-0 outline-none focus-visible:ring-0"
                >
                  <div className="w-full">{renderFormContent()}</div>
                </TabsContent>

                {forceType !== "sold" && (
                  <TabsContent
                    value="upload"
                    className="mt-0 border-none p-0 outline-none focus-visible:ring-0"
                  >
                    <div className="flex flex-col py-6 px-4 sm:px-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] bg-slate-50/50 dark:bg-slate-900/30 min-h-[400px]">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                            Bulk Device Entry
                          </h3>
                          <p className="text-slate-500 text-sm font-medium dark:text-slate-400">
                            Add multiple devices at once by entering their
                            details below.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {bulkItems.map((item, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-12 gap-4 p-4 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm relative group animate-in fade-in slide-in-from-top-2 duration-300"
                          >
                            {/* Barcode */}
                            <div className="lg:col-span-3 space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 dark:text-slate-500">
                                Barcode / Code{" "}
                                <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                  <Barcode className="w-4 h-4 text-slate-400" />
                                </div>
                                <input
                                  type="text"
                                  placeholder="Scan/Type..."
                                  className="w-full pl-10 pr-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl h-[48px] font-bold text-sm outline-none focus:ring-2 focus:ring-[#84CC16]/20 transition-all dark:text-white"
                                  value={item.code}
                                  onChange={(e) =>
                                    updateBulkItem(
                                      index,
                                      "code",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>

                            {/* Color */}
                            <div className="lg:col-span-1 space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 dark:text-slate-500">
                                Color
                              </label>
                              <input
                                type="text"
                                placeholder="Color"
                                className="w-full px-3 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl h-[48px] font-bold text-sm outline-none focus:ring-2 focus:ring-[#84CC16]/20 transition-all dark:text-white"
                                value={item.color}
                                onChange={(e) =>
                                  updateBulkItem(index, "color", e.target.value)
                                }
                              />
                            </div>

                            {/* Storage */}
                            <div className="lg:col-span-1 space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 dark:text-slate-500">
                                Size
                              </label>
                              <input
                                type="text"
                                placeholder="Size"
                                className="w-full px-3 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl h-[48px] font-bold text-sm outline-none focus:ring-2 focus:ring-[#84CC16]/20 transition-all dark:text-white"
                                value={item.storage}
                                onChange={(e) =>
                                  updateBulkItem(
                                    index,
                                    "storage",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            {/* Supplier Condition */}
                            <div className="lg:col-span-3 space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 dark:text-slate-500">
                                Supplier Condition
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. New, Used, Mint"
                                className="w-full px-3 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl h-[48px] font-bold text-sm outline-none focus:ring-2 focus:ring-[#84CC16]/20 transition-all dark:text-white"
                                value={item.currentState}
                                onChange={(e) =>
                                  updateBulkItem(
                                    index,
                                    "currentState",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            {/* Price */}
                            <div className="lg:col-span-2 space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 dark:text-slate-500">
                                Price ($)
                              </label>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                  <DollarSign className="w-4 h-4 text-slate-400" />
                                </div>
                                <input
                                  type="number"
                                  placeholder="0.00"
                                  className="w-full pl-10 pr-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl h-[48px] font-bold text-sm outline-none focus:ring-2 focus:ring-[#84CC16]/20 transition-all dark:text-white"
                                  value={item.purchasePrice || ""}
                                  onChange={(e) =>
                                    updateBulkItem(
                                      index,
                                      "purchasePrice",
                                      Number(e.target.value),
                                    )
                                  }
                                />
                              </div>
                            </div>

                            {/* Quantity */}
                            <div className="lg:col-span-1 space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 dark:text-slate-500">
                                Qty
                              </label>
                              <input
                                type="number"
                                placeholder="1"
                                className="w-full px-3 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl h-[48px] font-bold text-sm outline-none focus:ring-2 focus:ring-[#84CC16]/20 transition-all dark:text-white"
                                value={item.quantity || ""}
                                onChange={(e) =>
                                  updateBulkItem(
                                    index,
                                    "quantity",
                                    Number(e.target.value),
                                  )
                                }
                              />
                            </div>

                            {/* Actions */}
                            <div className="lg:col-span-1 flex items-end justify-center gap-2 pb-1">
                              <button
                                type="button"
                                onClick={() => removeBulkRow(index)}
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                                title="Remove row"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={addBulkRow}
                                className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#84CC16]/10 text-[#84CC16] hover:bg-[#84CC16] hover:text-white transition-all shadow-sm"
                                title="Add another row"
                              >
                                <Plus className="w-4 h-4" strokeWidth={3} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-auto pt-8 flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/50">
                        <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <span className="text-sm font-black text-slate-600 dark:text-slate-300">
                              {bulkItems.filter((i) => i.code.trim()).length}
                            </span>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest">
                            Ready to import
                          </span>
                        </div>

                        <Button
                          onClick={handleBulkSubmit}
                          disabled={
                            isCreatingFromBarcodeBulk ||
                            bulkItems.filter((i) => i.code.trim()).length === 0
                          }
                          type="button"
                          className="h-14 px-12 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-white rounded-[20px] font-black text-[12px] uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] flex items-center gap-3"
                        >
                          {isCreatingFromBarcodeBulk ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <FileUp className="w-5 h-5" />
                          )}
                          <span>
                            {isCreatingFromBarcodeBulk
                              ? "Importing..."
                              : `Import ${bulkItems.filter((i) => i.code.trim()).length} Devices`}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                )}
              </Tabs>
            ) : (
              renderFormContent()
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ScanResultModal
        isOpen={!!scanResultModalData}
        onClose={() => {
          setScanResultModalData(null);
          onClose();
        }}
        data={scanResultModalData}
      />
    </>
  );
}
