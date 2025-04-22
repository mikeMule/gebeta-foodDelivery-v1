import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { FoodItem } from "@shared/schema";
import { Icons } from "@/lib/icons";

// Form schema with validation
const foodItemSchema = z.object({
  id: z.number().optional(), // Include ID for updates
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  imageUrl: z.string().url("Please enter a valid URL"),
  restaurantId: z.number(),
  // Include categoryId mapping for the backend
  categoryId: z.number().optional()
});

type FoodItemFormValues = z.infer<typeof foodItemSchema>;

interface FoodItemFormProps {
  restaurantId: number;
  foodItem?: FoodItem;
  categories: string[];
  onSubmit: (data: FoodItemFormValues) => void;
  isPending: boolean;
  onCancel: () => void;
}

export function FoodItemForm({
  restaurantId,
  foodItem,
  categories,
  onSubmit,
  isPending,
  onCancel
}: FoodItemFormProps) {
  // Initialize form with existing food item or default values
  const form = useForm<FoodItemFormValues>({
    resolver: zodResolver(foodItemSchema),
    defaultValues: foodItem ? {
      ...foodItem,
      // Ensure number type for price since it might come as string from form inputs
      price: Number(foodItem.price)
    } : {
      name: "",
      description: "",
      category: "",
      price: 0,
      imageUrl: "",
      restaurantId
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#4F2D1F]">Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter food item name" 
                  {...field} 
                  className="border-[#E5A764] focus-visible:ring-[#8B572A]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#4F2D1F]">Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter a detailed description" 
                  {...field} 
                  className="min-h-[80px] border-[#E5A764] focus-visible:ring-[#8B572A]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#4F2D1F]">Category</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-[#E5A764]">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#4F2D1F]">Price (ETB)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter price" 
                    {...field} 
                    className="border-[#E5A764] focus-visible:ring-[#8B572A]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#4F2D1F]">Image URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/image.jpg" 
                  {...field} 
                  className="border-[#E5A764] focus-visible:ring-[#8B572A]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Hidden field for restaurantId */}
        <input type="hidden" {...form.register("restaurantId")} value={restaurantId} />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="border-[#8B572A] text-[#8B572A]"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isPending}
            className="bg-[#8B572A] hover:bg-[#4F2D1F]"
          >
            {isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                {foodItem ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                {foodItem ? (
                  <Icons.save className="mr-2 h-4 w-4" />
                ) : (
                  <Icons.plus className="mr-2 h-4 w-4" />
                )}
                {foodItem ? "Update Item" : "Add Item"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}