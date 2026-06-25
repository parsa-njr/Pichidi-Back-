// import mongoose, { Document, Model, Schema, Types } from "mongoose";
// import bcrypt from "bcrypt";
// import { ConflictError } from "../errors/customErrors";
// // import { ConflictError } from "../errors/customError";

// export interface ICustomer extends Document {
//   name: string;
//   phone: string;
//   password: string;
//   profileImage?: string | null;
//   users: Types.ObjectId[];
//   loginVerificationCode?: string;
//   createdAt: Date;
//   refreshToken?: string | null;
// }

// export interface ICustomerModel extends Model<ICustomer> {
//   mobileLogin(phone: string, code: string): Promise<ICustomer>;
// }

// const customerSchema = new Schema<ICustomer, ICustomerModel>({
//   name: { type: String, required: true },
//   phone: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   profileImage: { type: String, default: null },
//   users: [{ type: Schema.Types.ObjectId, ref: "User" }],
//   createdAt: { type: Date, default: Date.now },
//   refreshToken: {
//     type: String,
//     default: null,
//   },
// });

// customerSchema.pre<ICustomer>("save", async function (this: ICustomer) {
//   const customer = this;

//   // Check for duplicate phone
//   if (customer.isNew) {
//     const existingUser = await mongoose.models.Customer.findOne({
//       phone: customer.phone,
//     });
//     if (existingUser) {
//       throw new ConflictError("چنین کاربری وجود دارد");
//     }
//   }

//   // Hash password if new or modified
//   if (customer.isModified("password") || customer.isNew) {
//     const salt = await bcrypt.genSalt(10);
//     customer.password = await bcrypt.hash(customer.password, salt);
//   }
// });

// customerSchema.statics.mobileLogin = async function (
//   phone: string,
//   code: string
// ): Promise<ICustomer> {
//   const user = await this.findOne({ phone });
//   if (!user) throw new Error("phone or password is wrong");

//   if (user.loginVerificationCode !== code) {
//     throw new Error("the code you have sent is not valid");
//   }

//   return user;
// };

// const Customer = mongoose.model<ICustomer, ICustomerModel>(
//   "Customer",
//   customerSchema
// );
// export default Customer;



import mongoose, {
  Document,
  Model,
  Schema,
  Types,
} from "mongoose";

import bcrypt from "bcrypt";

import { ConflictError } from "../errors/customErrors";

interface IOtp {
  code?: string;
  expiresIn?: Date;
}

export interface ICustomer extends Document {
  name: string;
  phone: string;
  password: string;
  profileImage?: string | null;
  users: Types.ObjectId[];
  createdAt: Date;
  refreshToken?: string | null;

  otp?: IOtp;
}

export interface ICustomerModel
  extends Model<ICustomer> {}

const customerSchema = new Schema<
  ICustomer,
  ICustomerModel
>({
  name: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  profileImage: {
    type: String,
    default: null,
  },

  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },

  refreshToken: {
    type: String,
    default: null,
  },

  otp: {
    code: {
      type: String,
      default: null,
    },

    expiresIn: {
      type: Date,
      default: null,
    },
  },
});

customerSchema.pre<ICustomer>(
  "save",
  async function () {
    const customer = this;

    if (customer.isNew) {
      const existingUser =
        await mongoose.models.Customer.findOne({
          phone: customer.phone,
        });

      if (existingUser) {
        throw new ConflictError(
          "چنین کاربری وجود دارد"
        );
      }
    }

    if (
      customer.isModified("password") ||
      customer.isNew
    ) {
      const salt = await bcrypt.genSalt(10);

      customer.password =
        await bcrypt.hash(
          customer.password,
          salt
        );
    }
  }
);

const Customer =
  mongoose.model<
    ICustomer,
    ICustomerModel
  >("Customer", customerSchema);

export default Customer;


