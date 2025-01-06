import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
	name: string;
	price: number;
	category: string;
	stock: number;
}

const productSchema = new Schema<IProduct>({
	name: { type: String, required: true },
	price: { type: Number, required: true },
	category: { type: String, required: true },
	stock: { type: Number, default: 10 },
});

export default mongoose.model<IProduct>("Product", productSchema);
