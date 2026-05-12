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
  Plus,
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
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [manualBarcode, setManualBarcode] = useState("");
  const [barcodeImei, setBarcodeImei] = useState("");
  const [barcodePurchasePrice, setBarcodePurchasePrice] = useState("");
  const [barcodeCondition, setBarcodeCondition] = useState("new");
  const [barcodeDeviceImage, setBarcodeDeviceImage] = useState<File | null>(
    null,
  );
  const [barcodeDeviceImagePreview, setBarcodeDeviceImagePreview] = useState<
    string | null
  >(null);

  const { mutate: createItem, isPending: isCreating } = useCreateInventory();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateInventory();
  const { mutate: handleCreateFromBarcode, isPending: isCreatingFromBarcode } =
    useCreateFromBarcode();
  const {
    mutate: handleCreateFromBarcodeBulk,
    isPending: isCreatingFromBarcodeBulk,
  } = useCreateFromBarcodeBulk();
  const { data: session } = useSession();
  const [scanResultModalData, setScanResultModalData] =
    useState<ScanResultData | null>(null);

  const [bulkItems, setBulkItems] = useState<BulkBarcodeItem[]>([
    {
      code: "",
      imeiNumber: "",
      purchasePrice: 0,
      quantity: 1,
      currentState: "new",
    },
  ]);

  const addBulkRow = () => {
    setBulkItems([
      ...bulkItems,
      {
        code: "",
        imeiNumber: "",
        purchasePrice: 0,
        quantity: 1,
        currentState: "new",
      },
    ]);
  };

  const removeBulkRow = (index: number) => {
    if (bulkItems.length > 1) {
      const newItems = [...bulkItems];
      newItems.splice(index, 1);
      setBulkItems(newItems);
    } else {
      setBulkItems([
        {
          code: "",
          imeiNumber: "",
          purchasePrice: 0,
          quantity: 1,
          currentState: "new",
        },
      ]);
    }
  };

  const updateBulkItem = (
    index: number,
    field: keyof BulkBarcodeItem,
    value: string | number,
  ) => {
    const newItems = [...bulkItems];
    newItems[index] = { ...newItems[index], [field]: value } as BulkBarcodeItem;
    setBulkItems(newItems);
  };

  const handleBulkSubmit = () => {
    const validItems = bulkItems.filter((item) => item.code.trim() !== "");
    if (validItems.length === 0) {
      toast.error("Please enter at least one barcode");
      return;
    }

    if ((session?.user as { id: string })?.id) {
      handleCreateFromBarcodeBulk(
        {
          userId: (session?.user as { id: string }).id,
          barcodes: validItems.map((item) => ({
            ...item,
            purchasePrice: Number(item.purchasePrice),
            quantity: Number(item.quantity) || 1,
            currentState: "new",
          })),
        },
        {
          onSuccess: () => {
            toast.success(`${validItems.length} items added successfully`);
            setBulkItems([
              {
                code: "",
                imeiNumber: "",
                purchasePrice: 0,
                quantity: 1,
                currentState: "new",
              },
            ]);
            onClose();
          },
          // onError: (error: any) => {
          //   toast.error(
          //     error?.response?.data?.message || "Failed to add items in bulk",
          //   );
          // },
        },
      );
    } else {
      toast.error("User not authenticated");
    }
  };

  const isPending =
    isCreating ||
    isUpdating ||
    isCreatingFromBarcode ||
    isCreatingFromBarcodeBulk;

  const form = useForm<CreateInventoryInput>({
    resolver: zodResolver(CreateInventorySchema),
    defaultValues: {
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
        type: item.type ?? forceType ?? "inventory",
        status: item.status ?? forceType ?? "inventory",
        currentState: item.currentState,
        userId:
          typeof item.userId === "object"
            ? (item.userId as unknown as { _id: string })?._id
            : (item.userId ?? ""),
        image: undefined, // Reset image on edit
      });
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
        image: undefined,
      });
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

  const onSubmit = (values: CreateInventoryInput) => {
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
            toast.success("Inventory updated");
            onClose();
          },
          onError: () => toast.error("Update failed"),
        },
      );
    } else {
      console.log("Inventory add form values:", values);
      createItem(
        { ...values, userId: (session?.user as { id: string })?.id ?? "" },
        {
          onSuccess: () => {
            toast.success("Item added to inventory");
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

  const handleManualBarcodeSubmit = () => {
    if (!manualBarcode.trim()) {
      toast.error("Please enter a barcode or IMEI");
      return;
    }

    if ((session?.user as { id: string })?.id) {
      handleCreateFromBarcode(
        {
          code: manualBarcode.trim(),
          userId: (session?.user as { id: string }).id,
          imeiNumber: barcodeImei || undefined,
          purchasePrice: barcodePurchasePrice
            ? Number(barcodePurchasePrice)
            : undefined,
          currentState: barcodeCondition,
          image: barcodeDeviceImage || undefined,
        },
        {
          onSuccess: (data) => {
            setScanResultModalData(data);
            toast.success("Device found and added successfully");
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

  const handleBulkFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkFile(file);
  };

  const renderFormContent = () => (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="space-y-8"
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
                            className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                            {...field}
                          />
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
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                            <Package className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                          </div>
                          <Input
                            placeholder="Apple"
                            className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
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
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                            <Palette className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                          </div>
                          <Input
                            placeholder="Space Gray"
                            className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
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
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                            <HardDrive className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                          </div>
                          <Input
                            placeholder="64GB"
                            className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Size */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                        Screen Size
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                            <Maximize2 className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                          </div>
                          <Input
                            placeholder="5.8"
                            className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
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
                {/* Supplier ID */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                        Supplier ID
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                            <Users className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                          </div>
                          <Input
                            placeholder="Supplier..."
                            className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Store ID */}
                <FormField
                  control={
                    form.control as unknown as Control<CreateInventoryInput>
                  }
                  name="storeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-white mb-2 block ml-1">
                        Store ID
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                            <Store className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                          </div>
                          <Input
                            placeholder="Store..."
                            className="pl-14 pr-4 bg-slate-50/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
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
                        </SelectContent>
                      </Select>
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
                  ? "Save Details"
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
                    Edit Device
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
              <Tabs defaultValue="single" className="w-full">
                {forceType !== "sold" && (
                  <TabsList className="grid w-full max-w-lg grid-cols-3 bg-slate-100/70 dark:bg-slate-900/50 p-1.5 h-[56px] rounded-[20px] mb-8 mx-auto relative z-10">
                    <TabsTrigger
                      value="single"
                      className="rounded-[14px] font-bold uppercase tracking-wider text-[11px] h-full data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-[#84CC16] data-[state=active]:shadow-sm transition-all"
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Manual Entry</span>
                      <span className="sm:hidden">Manual</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="barcode"
                      className="rounded-[14px] font-bold uppercase tracking-wider text-[11px] h-full data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-[#84CC16] data-[state=active]:shadow-sm transition-all"
                    >
                      <Barcode className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Scan Barcode</span>
                      <span className="sm:hidden">Scan</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="upload"
                      className="rounded-[14px] font-bold uppercase tracking-wider text-[11px] h-full data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-[#84CC16] data-[state=active]:shadow-sm transition-all"
                    >
                      <FileUp className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">File Upload</span>
                      <span className="sm:hidden">Upload</span>
                    </TabsTrigger>
                  </TabsList>
                )}

                <TabsContent
                  value="single"
                  className="mt-0 border-none p-0 outline-none focus-visible:ring-0"
                >
                  {renderFormContent()}
                </TabsContent>

                {forceType !== "sold" && (
                  <TabsContent
                    value="barcode"
                    className="mt-0 border-none p-0 outline-none focus-visible:ring-0"
                  >
                    <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-200 rounded-[32px] bg-slate-50/50 relative overflow-hidden min-h-[400px]">
                      {/* ... rest of barcode content ... */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#84CC16]/5 rounded-full blur-[80px] pointer-events-none" />

                      {!isCameraActive ? (
                        <>
                          {barcodeImagePreview ? (
                            <div className="relative w-64 h-48 rounded-[24px] overflow-hidden shadow-2xl mb-8 z-10 border-4 border-white group">
                              <NextImage
                                src={barcodeImagePreview}
                                alt="Barcode Preview"
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors" />
                              <button
                                type="button"
                                onClick={() => setBarcodeImagePreview(null)}
                                className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-slate-900 rounded-full p-1.5 hover:bg-white hover:text-red-500 transition-all shadow-md z-20"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#84CC16] text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse z-20 whitespace-nowrap">
                                Scanning...
                              </div>
                            </div>
                          ) : (
                            <div className="relative w-24 h-24 rounded-[28px] bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center mb-8 border border-slate-100 z-10">
                              <Barcode className="w-10 h-10 text-[#84CC16]" />
                              <div className="absolute inset-0 border-2 border-[#84CC16] rounded-[28px] opacity-0 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                            </div>
                          )}

                          <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-3 z-10">
                            {barcodeImagePreview
                              ? "Analyzing Image"
                              : "Scan Barcode"}
                          </h3>
                          <p className="text-slate-500 font-medium text-center max-w-[320px] text-sm leading-relaxed mb-8 z-10 dark:text-white ">
                            {barcodeImagePreview
                              ? "Please wait while we extract the barcode data from your uploaded photo."
                              : "Choose to scan via live camera or upload a photo, or enter it manually below."}
                          </p>

                          {/* Manual Barcode Input */}
                          <div className="w-full max-w-sm mb-6 z-10 px-4">
                            <div className="relative group">
                              <div className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-[14px] flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 group-focus-within:border-[#84CC16]/30 group-focus-within:bg-[#84CC16]/5 transition-all z-10">
                                <Hash className="w-4 h-4 text-slate-400 group-focus-within:text-[#84CC16] transition-colors" />
                              </div>
                              <input
                                type="text"
                                placeholder="Type barcode or IMEI..."
                                className="w-full pl-14 pr-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-[20px] h-[56px] font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:bg-white dark:focus-visible:bg-slate-950 focus-visible:ring-4 focus-visible:ring-[#84CC16]/15 focus-visible:border-[#84CC16] outline-none transition-all shadow-sm"
                                value={manualBarcode}
                                onChange={(e) =>
                                  setManualBarcode(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleManualBarcodeSubmit();
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={handleManualBarcodeSubmit}
                                disabled={
                                  isCreatingFromBarcode || !manualBarcode.trim()
                                }
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-slate-900 text-white rounded-[14px] flex items-center justify-center hover:bg-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed transition-all z-10"
                              >
                                {isCreatingFromBarcode ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Plus className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Additional Barcode Data Fields */}
                          <div className="w-full max-w-sm grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 z-10 px-4">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 dark:text-white">
                                IMEI Number
                              </label>
                              <input
                                type="text"
                                placeholder="Optional..."
                                className="w-full px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-[44px] font-bold text-xs outline-none focus:ring-2 focus:ring-[#84CC16]/20 transition-all"
                                value={barcodeImei}
                                onChange={(e) => setBarcodeImei(e.target.value)}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                Cost Price ($)
                              </label>
                              <input
                                type="number"
                                placeholder="Optional..."
                                className="w-full px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-[44px] font-bold text-xs outline-none focus:ring-2 focus:ring-[#84CC16]/20 transition-all"
                                value={barcodePurchasePrice}
                                onChange={(e) =>
                                  setBarcodePurchasePrice(e.target.value)
                                }
                              />
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 dark:text-white">
                                Condition
                              </label>
                              <Select
                                onValueChange={setBarcodeCondition}
                                value={barcodeCondition}
                              >
                                <SelectTrigger className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-[44px] font-bold text-xs">
                                  <SelectValue placeholder="Select Condition" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                  <SelectItem value="new" className="font-bold">
                                    Brand New
                                  </SelectItem>
                                  <SelectItem
                                    value="good condition"
                                    className="font-bold"
                                  >
                                    Good Condition
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="sm:col-span-2 space-y-1.5">
                              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 dark:text-white">
                                Device Photo
                              </label>
                              <div
                                onClick={() =>
                                  barcodeDeviceImageInputRef.current?.click()
                                }
                                className="w-full aspect-[2/1] rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-all relative overflow-hidden group"
                              >
                                {barcodeDeviceImagePreview ? (
                                  <NextImage
                                    src={barcodeDeviceImagePreview}
                                    alt="Preview"
                                    fill
                                    className="object-cover transition-transform group-hover:scale-105"
                                  />
                                ) : (
                                  <>
                                    <Camera className="w-5 h-5 text-slate-300 mb-1 group-hover:text-[#84CC16] transition-colors" />
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                                      Upload Device Image
                                    </span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  ref={barcodeDeviceImageInputRef}
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setBarcodeDeviceImage(file);
                                      const reader = new FileReader();
                                      reader.onloadend = () =>
                                        setBarcodeDeviceImagePreview(
                                          reader.result as string,
                                        );
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4 z-10 w-full max-w-sm mt-4">
                            <div className="flex gap-2">
                              <Button
                                onClick={startScanning}
                                type="button"
                                size="icon"
                                variant="secondary"
                                className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-[#84CC16] hover:bg-[#84CC16]/10 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
                                title="Live Scan"
                              >
                                <Camera className="w-5 h-5" />
                              </Button>
                              <Button
                                onClick={() =>
                                  barcodeImageInputRef.current?.click()
                                }
                                type="button"
                                size="icon"
                                variant="secondary"
                                className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-[#84CC16] hover:bg-[#84CC16]/10 transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
                                title="Upload Barcode"
                              >
                                <Upload className="w-5 h-5" />
                                <input
                                  ref={barcodeImageInputRef}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleBarcodeImageUpload}
                                />
                              </Button>
                            </div>

                            <Button
                              onClick={handleManualBarcodeSubmit}
                              disabled={
                                isCreatingFromBarcode || !manualBarcode.trim()
                              }
                              type="button"
                              className="flex-1 h-14 bg-[#84CC16] hover:bg-[#76b813] text-white rounded-[20px] font-black text-[12px] uppercase tracking-widest shadow-lg shadow-lime-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                              {isCreatingFromBarcode ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <>
                                  <Plus size={18} strokeWidth={3} />
                                  <span>Add Device</span>
                                </>
                              )}
                            </Button>
                          </div>
                          {/* Hidden div for file scanning */}
                          <div id="barcode-reader-hidden" className="hidden" />
                        </>
                      ) : (
                        <div className="flex flex-col items-center w-full z-10 px-8">
                          <div className="relative w-full max-w-sm rounded-[24px] overflow-hidden shadow-2xl border-4 border-slate-900 mb-6 bg-black">
                            <div
                              id="barcode-reader"
                              className="w-full min-h-[300px]"
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-[80%] h-[100px] border-2 border-[#84CC16] rounded-xl relative opacity-50">
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-[#84CC16] shadow-[0_0_10px_#84CC16] animate-[scan_2s_ease-in-out_infinite]" />
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={stopScanning}
                            type="button"
                            variant="ghost"
                            className="font-black text-[12px] uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-50 rounded-2xl h-12 px-8"
                          >
                            Stop Scanning
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                )}

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
                        <Button
                          onClick={addBulkRow}
                          type="button"
                          className="bg-[#84CC16] hover:bg-[#76b813] text-white rounded-xl px-6 h-12 font-black uppercase tracking-widest shadow-lg shadow-lime-500/20 transition-all flex items-center gap-2"
                        >
                          <Plus size={18} strokeWidth={3} />
                          <span>Add Row</span>
                        </Button>
                      </div>

                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {bulkItems.map((item, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-12 gap-4 p-4 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm relative group animate-in fade-in slide-in-from-top-2 duration-300"
                          >
                            <div className="lg:col-span-4 space-y-1.5">
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
                                  placeholder="Scan or type..."
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

                            <div className="lg:col-span-3 space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 dark:text-slate-500">
                                IMEI Number
                              </label>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                  <Hash className="w-4 h-4 text-slate-400" />
                                </div>
                                <input
                                  type="text"
                                  placeholder="IMEI Number"
                                  className="w-full pl-10 pr-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl h-[48px] font-bold text-sm outline-none focus:ring-2 focus:ring-[#84CC16]/20 transition-all dark:text-white"
                                  value={item.imeiNumber}
                                  onChange={(e) =>
                                    updateBulkItem(
                                      index,
                                      "imeiNumber",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>

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
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div className="lg:col-span-2 space-y-1.5">
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 dark:text-slate-500">
                                Quantity
                              </label>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                  <Package className="w-4 h-4 text-slate-400" />
                                </div>
                                <input
                                  type="number"
                                  placeholder="1"
                                  className="w-full pl-10 pr-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl h-[48px] font-bold text-sm outline-none focus:ring-2 focus:ring-[#84CC16]/20 transition-all dark:text-white"
                                  value={item.quantity || ""}
                                  onChange={(e) =>
                                    updateBulkItem(
                                      index,
                                      "quantity",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div className="lg:col-span-1 flex items-end justify-center pb-1">
                              <button
                                type="button"
                                onClick={() => removeBulkRow(index)}
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                                title="Remove row"
                              >
                                <X className="w-5 h-5" />
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
